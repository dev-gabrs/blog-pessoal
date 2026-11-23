const THEME_KEY = "theme";
const FONT_KEY = "font-size";

const FONT_DEFAULT = 100;
const FONT_MIN = 90;
const FONT_MAX = 150;
const FONT_STEP = 10;

const MESSAGE_MIN_LENGTH = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- Memória do navegador ---------- */

// Alguns navegadores bloqueiam o localStorage. O try/catch evita que o site pare.
function readSetting(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sem localStorage, a escolha vale só até a página ser fechada.
  }
}

/* ---------- Modo noturno ---------- */

function getInitialTheme() {
  const savedTheme = readSetting(THEME_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return systemPrefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function updateThemeButton(button) {
  const isDark = document.documentElement.dataset.theme === "dark";
  button.textContent = isDark ? "Modo claro" : "Modo noturno";
}

function setupThemeButton() {
  const button = document.getElementById("theme-toggle");
  updateThemeButton(button);

  button.addEventListener("click", function () {
    const isDark = document.documentElement.dataset.theme === "dark";
    const newTheme = isDark ? "light" : "dark";

    applyTheme(newTheme);
    saveSetting(THEME_KEY, newTheme);
    updateThemeButton(button);
  });
}

/* ---------- Tamanho da fonte ---------- */

function getInitialFontSize() {
  const savedSize = Number(readSetting(FONT_KEY));

  if (savedSize >= FONT_MIN && savedSize <= FONT_MAX) {
    return savedSize;
  }

  return FONT_DEFAULT;
}

function applyFontSize(size) {
  document.documentElement.style.fontSize = size + "%";
}

function setupFontButtons() {
  const decreaseButton = document.getElementById("font-decrease");
  const increaseButton = document.getElementById("font-increase");
  let currentSize = getInitialFontSize();

  function updateButtons() {
    decreaseButton.disabled = currentSize <= FONT_MIN;
    increaseButton.disabled = currentSize >= FONT_MAX;
  }

  function changeFontSize(amount) {
    currentSize = Math.min(FONT_MAX, Math.max(FONT_MIN, currentSize + amount));

    applyFontSize(currentSize);
    saveSetting(FONT_KEY, currentSize);
    updateButtons();
  }

  decreaseButton.addEventListener("click", function () {
    changeFontSize(-FONT_STEP);
  });

  increaseButton.addEventListener("click", function () {
    changeFontSize(FONT_STEP);
  });

  updateButtons();
}

/* ---------- Validação do formulário ---------- */

function getNameError(value) {
  return value === "" ? "Preencha o seu nome." : "";
}

function getEmailError(value) {
  if (value === "") {
    return "Preencha o seu e-mail.";
  }

  return EMAIL_PATTERN.test(value) ? "" : "Digite um e-mail válido, como nome@exemplo.com.";
}

function getMessageError(value) {
  if (value.length < MESSAGE_MIN_LENGTH) {
    return "Escreva uma mensagem com pelo menos " + MESSAGE_MIN_LENGTH + " caracteres.";
  }

  return "";
}

function validateField(fieldId, getError) {
  const field = document.getElementById(fieldId);
  const errorText = getError(field.value.trim());

  document.getElementById(fieldId + "-error").textContent = errorText;
  field.setAttribute("aria-invalid", errorText !== "");

  return errorText === "";
}

function setupContactForm() {
  const form = document.getElementById("contact-form");

  if (form === null) {
    return;
  }

  const successMessage = document.getElementById("form-success");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    successMessage.textContent = "";

    const isNameValid = validateField("name", getNameError);
    const isEmailValid = validateField("email", getEmailError);
    const isMessageValid = validateField("message", getMessageError);

    if (isNameValid && isEmailValid && isMessageValid) {
      successMessage.textContent = "Tudo certo com a sua mensagem! Como este formulário é uma demonstração, nada foi enviado.";
      form.reset();
    } else {
      form.querySelector("[aria-invalid='true']").focus();
    }
  });
}

/* ---------- Início ---------- */

// Roda antes de a página aparecer, para ela já surgir com o tema e a fonte certos.
applyTheme(getInitialTheme());
applyFontSize(getInitialFontSize());

// Os botões e o formulário só existem depois que o HTML termina de carregar.
document.addEventListener("DOMContentLoaded", function () {
  setupThemeButton();
  setupFontButtons();
  setupContactForm();
});
