const API_URL = "https://controle-financeiro-pessoal-wpzz.onrender.com";

// Exige login: sem usuário salvo, manda pra tela de login
const userId = localStorage.getItem("usuarioId");
if (!userId) {
  window.location.href = "login.html";
}

// Dados de exemplo — usados como fallback caso a API não esteja no ar
let transacoes = [
  { nome: "Dividendos", categoria: "Investimentos", data: "2026-09-14", valor: 340, tipo: "entrada" },
  { nome: "Uber", categoria: "Transporte", data: "2026-09-12", valor: 87, tipo: "saida" },
  { nome: "Netflix + Spotify", categoria: "Assinaturas", data: "2026-09-10", valor: 65, tipo: "saida" },
  { nome: "Supermercado", categoria: "Alimentação", data: "2026-09-08", valor: 430, tipo: "saida" },
  { nome: "Freelance design", categoria: "Freelance", data: "2026-09-05", valor: 1200, tipo: "entrada" },
];

let filtroAtual = "todos";

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

function calcularTotais(lista) {
  const entradas = lista
      .filter(t => t.tipo === "entrada")
      .reduce((soma, t) => soma + t.valor, 0);

  const saidas = lista
      .filter(t => t.tipo === "saida")
      .reduce((soma, t) => soma + t.valor, 0);

  return { entradas, saidas, saldo: entradas - saidas };
}

function renderResumo() {
  const { entradas, saidas, saldo } = calcularTotais(transacoes);
  const total = entradas + saidas;

  document.getElementById("saldoTotal").textContent = formatarMoeda(saldo);
  document.getElementById("totalEntradas").textContent = formatarMoeda(entradas);
  document.getElementById("totalSaidas").textContent = formatarMoeda(saidas);

  const percentEntradas = total > 0 ? Math.round((entradas / total) * 100) : 0;
  const percentSaidas = 100 - percentEntradas;

  document.getElementById("progressoBarra").style.width = `${percentEntradas}%`;
  document.getElementById("percentEntradas").textContent = `${percentEntradas}%`;
  document.getElementById("percentSaidas").textContent = `${percentSaidas}%`;

  // Anel (donut) — preenchimento proporcional ao saldo sobre o total movimentado
  const circunferencia = 314; // 2 * π * raio(50), arredondado
  const percentSaldo = total > 0 ? Math.max(0, Math.min(1, saldo / total)) : 0;
  const offset = circunferencia - percentSaldo * circunferencia;
  document.getElementById("anelPreenchido").style.strokeDashoffset = offset;
  document.getElementById("anelSaldo").textContent = formatarMoeda(saldo);
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = String(texto ?? "");
  return div.innerHTML;
}

function renderLista() {
  const container = document.getElementById("listaTransacoes");
  container.innerHTML = "";

  const listaFiltrada = transacoes.filter(t =>
      filtroAtual === "todos" ? true : t.tipo === filtroAtual
  );

  listaFiltrada.forEach(t => {
    const item = document.createElement("li");
    item.className = "transacao";

    const sinal = t.tipo === "entrada" ? "+" : "-";
    const classeValor = t.tipo === "entrada" ? "valor--entrada" : "valor--saida";
    const classeMarcador = t.tipo === "entrada"
        ? "transacao__marcador--entrada"
        : "transacao__marcador--saida";

    item.innerHTML = `
      <span class="transacao__marcador ${classeMarcador}"></span>
      <div class="transacao__info">
        <p class="transacao__nome">${escapeHtml(t.nome)}</p>
        <p class="transacao__meta">${escapeHtml(t.categoria)} · ${formatarData(t.data)}</p>
      </div>
      <p class="transacao__valor ${classeValor}">${sinal}${formatarMoeda(t.valor)}</p>
    `;

    container.appendChild(item);
  });
}

function configurarTabs() {
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("tab--ativa"));
      tab.classList.add("tab--ativa");
      filtroAtual = tab.dataset.filtro;
      renderLista();
    });
  });
}

// Converte o formato do backend (tipoRegistro: "GANHO"/"GASTO") pro formato usado na tela ("entrada"/"saida")
function mapearRegistroBackend(registro) {
  return {
    nome: registro.nome,
    categoria: registro.descricao || "Sem categoria",
    data: registro.data,
    valor: registro.valor,
    tipo: registro.tipoRegistro === "GANHO" ? "entrada" : "saida",
  };
}

async function carregarRegistros() {
  try {
    const resposta = await fetch(`${API_URL}/registros?userId=${userId}`);
    if (!resposta.ok) throw new Error("Falha ao buscar registros");
    const dados = await resposta.json();
    transacoes = dados.map(mapearRegistroBackend);
  } catch (erro) {
    console.warn("Não foi possível carregar da API, usando dados de exemplo.", erro);
  }
  renderResumo();
  renderLista();
}

function abrirModal() {
  document.getElementById("modalOverlay").classList.add("modal-overlay--aberto");
}

function fecharModal() {
  document.getElementById("modalOverlay").classList.remove("modal-overlay--aberto");
  document.getElementById("formRegistro").reset();
  esconderErro();
}

function mostrarErro(mensagem) {
  const erro = document.getElementById("modalErro");
  erro.textContent = mensagem;
  erro.classList.add("modal__erro--visivel");
}

function esconderErro() {
  const erro = document.getElementById("modalErro");
  erro.classList.remove("modal__erro--visivel");
}

async function enviarNovoRegistro(event) {
  event.preventDefault();
  esconderErro();

  const novoRegistro = {
    userId: Number(userId),
    nome: document.getElementById("campoNome").value,
    valor: parseFloat(document.getElementById("campoValor").value),
    data: document.getElementById("campoData").value,
    descricao: document.getElementById("campoDescricao").value,
    tipoRegistro: document.getElementById("campoTipo").value,
  };

  try {
    const resposta = await fetch(`${API_URL}/registros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoRegistro),
    });

    if (!resposta.ok) {
      throw new Error("A API recusou o registro (verifique os dados enviados).");
    }

    fecharModal();
    await carregarRegistros();
  } catch (erro) {
    mostrarErro(erro.message);
  }
}

function configurarModal() {
  document.getElementById("btnNovoRegistro").addEventListener("click", abrirModal);
  document.getElementById("btnFecharModal").addEventListener("click", fecharModal);
  document.getElementById("modalOverlay").addEventListener("click", (event) => {
    if (event.target.id === "modalOverlay") fecharModal();
  });
  document.getElementById("formRegistro").addEventListener("submit", enviarNovoRegistro);
}

function renderUsuario() {
  const nome = localStorage.getItem("usuarioNome") || "Usuário";
  document.getElementById("nomeUsuario").textContent = nome;

  const iniciais = nome
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? "")
      .join("");
  document.getElementById("avatarIniciais").textContent = iniciais || "?";
}

function configurarLogout() {
  document.getElementById("btnSair").addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("usuarioNome");
    window.location.href = "login.html";
  });
}

function init() {
  renderUsuario();
  carregarRegistros();
  configurarTabs();
  configurarModal();
  configurarLogout();
}

init();