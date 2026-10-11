const API_URL = "https://controle-financeiro-pessoal-wpzz.onrender.com";

const form = document.getElementById("formLogin");
const campoEmail = document.getElementById("loginEmail");
const campoSenha = document.getElementById("loginSenha");
const erro = document.getElementById("loginErro");
const sucesso = document.getElementById("loginSucesso");
const botao = document.getElementById("btnLogin");
const toggleSenha = document.getElementById("toggleLoginSenha");

let avisoLento;

function mostrarErro(mensagem) {
    erro.textContent = mensagem;
    erro.classList.add("modal__erro--visivel");
}

function esconderErro() {
    erro.textContent = "";
    erro.classList.remove("modal__erro--visivel");
}

function definirCarregando(ativo) {
    botao.disabled = ativo;
    botao.textContent = ativo ? "Entrando..." : "Entrar";
    clearTimeout(avisoLento);
    if (ativo) {
        // o Render pode levar até ~1 min para "acordar" na primeira requisição
        avisoLento = setTimeout(() => {
            botao.textContent = "Conectando ao servidor...";
        }, 4000);
    }
}

async function fazerLogin(event) {
    event.preventDefault();
    esconderErro();
    definirCarregando(true);

    try {
        const resposta = await fetch(`${API_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: campoEmail.value.trim(),
                password: campoSenha.value,
            }),
        });

        if (!resposta.ok) {
            console.error("[Login] status:", resposta.status);
            throw new Error(
                resposta.status === 400
                    ? "Confira o e-mail e a senha digitados."
                    : "E-mail ou senha inválidos."
            );
        }

        const usuario = await resposta.json();
        localStorage.setItem("usuarioId", usuario.id);
        localStorage.setItem("usuarioNome", usuario.name);

        // preparado para o JWT: guarda o token assim que o backend passar a enviá-lo
        localStorage.removeItem("token");
        if (usuario.token) {
            localStorage.setItem("token", usuario.token);
        }

        window.location.href = "index.html";
    } catch (e) {
        mostrarErro(
            e instanceof TypeError
                ? "Não foi possível conectar ao servidor. Tente novamente em instantes."
                : e.message
        );
        definirCarregando(false);
    }
}

function configurarToggleSenha() {
    toggleSenha.addEventListener("click", () => {
        const estavaVisivel = campoSenha.type === "text";
        campoSenha.type = estavaVisivel ? "password" : "text";
        toggleSenha.textContent = estavaVisivel ? "Mostrar" : "Ocultar";
        toggleSenha.setAttribute("aria-pressed", String(!estavaVisivel));
        toggleSenha.setAttribute("aria-label", estavaVisivel ? "Mostrar senha" : "Ocultar senha");
    });
}

function mostrarBoasVindasDoCadastro() {
    const emailRecente = sessionStorage.getItem("emailRecemCadastrado");
    if (!emailRecente) return;

    sessionStorage.removeItem("emailRecemCadastrado");
    campoEmail.value = emailRecente;
    sucesso.textContent = "Conta criada! Entre com seu e-mail e senha.";
    sucesso.classList.add("login-card__sucesso--visivel");
    campoSenha.focus();
}

form.addEventListener("submit", fazerLogin);
configurarToggleSenha();
mostrarBoasVindasDoCadastro();