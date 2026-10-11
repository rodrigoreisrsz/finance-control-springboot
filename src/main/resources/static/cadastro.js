const API_URL = "https://controle-financeiro-pessoal-wpzz.onrender.com";
const TAMANHO_MINIMO_SENHA = 8;

const form = document.getElementById("formCadastro");
const campoNome = document.getElementById("cadastroNome");
const campoEmail = document.getElementById("cadastroEmail");
const campoSenha = document.getElementById("cadastroSenha");
const campoConfirma = document.getElementById("cadastroConfirma");
const erro = document.getElementById("cadastroErro");
const botao = document.getElementById("btnCadastro");
const toggleSenha = document.getElementById("toggleCadastroSenha");

let avisoLento;

function mostrarErro(mensagem, campoComProblema) {
    erro.textContent = mensagem;
    erro.classList.add("modal__erro--visivel");
    if (campoComProblema) {
        campoComProblema.setAttribute("aria-invalid", "true");
        campoComProblema.focus();
    }
}

function esconderErro() {
    erro.textContent = "";
    erro.classList.remove("modal__erro--visivel");
    form.querySelectorAll("[aria-invalid]").forEach((campo) => campo.removeAttribute("aria-invalid"));
}

function definirCarregando(ativo) {
    botao.disabled = ativo;
    botao.textContent = ativo ? "Criando conta..." : "Criar conta";
    clearTimeout(avisoLento);
    if (ativo) {
        // o Render pode levar até ~1 min para "acordar" na primeira requisição
        avisoLento = setTimeout(() => {
            botao.textContent = "Conectando ao servidor...";
        }, 4000);
    }
}

function validarFormulario() {
    if (campoSenha.value.length < TAMANHO_MINIMO_SENHA) {
        mostrarErro(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`, campoSenha);
        return false;
    }
    if (campoSenha.value !== campoConfirma.value) {
        mostrarErro("As senhas não coincidem.", campoConfirma);
        return false;
    }
    return true;
}

function mensagemParaStatus(status) {
    if (status === 400) return "Dados inválidos. Confira nome, e-mail e senha.";
    if (status === 409) return "Este e-mail já está cadastrado.";
    return "Não foi possível criar a conta. Se você já se cadastrou com este e-mail, tente entrar.";
}

async function fazerCadastro(event) {
    event.preventDefault();
    esconderErro();
    if (!validarFormulario()) return;

    definirCarregando(true);
    const email = campoEmail.value.trim();

    try {
        const resposta = await fetch(`${API_URL}/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: campoNome.value.trim(),
                email,
                password: campoSenha.value,
            }),
        });

        if (!resposta.ok) {
            console.error("[Cadastro] status:", resposta.status);
            throw new Error(mensagemParaStatus(resposta.status));
        }

        sessionStorage.setItem("emailRecemCadastrado", email);
        window.location.href = "login.html";
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

form.addEventListener("submit", fazerCadastro);
form.addEventListener("input", () => {
    // ao digitar de novo, tira a marcação de erro dos campos
    form.querySelectorAll("[aria-invalid]").forEach((campo) => campo.removeAttribute("aria-invalid"));
});
configurarToggleSenha();