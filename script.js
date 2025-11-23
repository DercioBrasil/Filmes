// =========================
// ELEMENTOS DO DOM
// =========================
const loadButton = document.getElementById("loadButton");
const searchInput = document.getElementById("searchInput");
const moviesContainer = document.getElementById("moviesContainer");
const noResultsMessage = document.getElementById("noResultsMessage");

const pagination = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

const themeToggle = document.getElementById("themeToggle");

// imagens iniciais da página (caso existam)
const homeImages = document.getElementById("homeImages");

// Modal
const modal = document.getElementById("movieModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalYear = document.getElementById("modalYear");
const modalDescription = document.getElementById("modalDescription");
const modalLink = document.getElementById("modalLink");
const closeModalBtn = document.getElementById("closeModal");
const modalBackdrop = document.querySelector(".modal-backdrop");

// =========================
// ESTADO
// =========================
let allItems = [];        // todos os itens carregados do JSON (já normalizados)
let filteredItems = [];   // itens depois do filtro de busca
let currentPage = 1;
const itemsPerPage = 4;

// =========================
// FUNÇÕES AUXILIARES
// =========================

// Normaliza um item vindo do JSON para um formato único
function normalizarItem(raw) {
  // se tiver "titulo", assumimos que é filme; se tiver "nome", assumimos tecnologia
  const titulo = raw.titulo || raw.nome || "Sem título";
  const anoOuData = raw.ano || raw.data_criacao || "N/A";

  return {
    tipo: raw.titulo ? "filme" : "tecnologia",
    titulo: titulo,
    ano: anoOuData,
    descricao: raw.descricao || "",
    link: raw.link || "#",
    imagem: raw.imagem || "imagens/placeholder.jpg",
    tags: raw.tags || []
  };
}

// Atualiza ícone do botão de tema
function updateThemeIcon() {
  if (document.body.classList.contains("light-theme")) {
    themeToggle.textContent = "🌙"; // modo claro → mostrar lua
  } else {
    themeToggle.textContent = "☀️"; // modo escuro → mostrar sol
  }
}

// =========================
// FETCH E PREPARAÇÃO DOS DADOS
// =========================

// Carrega os dados do ficheiro JSON e normaliza
async function fetchItems() {
  try {
    const response = await fetch("movies.json");

    if (!response.ok) {
      throw new Error("Não foi possível carregar o ficheiro movies.json");
    }

    const data = await response.json();

    // data é um array de objetos -> normalizar todos
    allItems = data.map(normalizarItem);
    filteredItems = [...allItems]; // por padrão, tudo filtrado
  } catch (error) {
    console.error(error);
    noResultsMessage.textContent = "Erro ao carregar dados. Verifique o ficheiro movies.json.";
    noResultsMessage.classList.remove("hidden");
  }
}

// =========================
// RENDERIZAÇÃO
// =========================

// Renderiza os cards na página
function renderItems(items) {
  moviesContainer.innerHTML = "";

  if (!items || items.length === 0) {
    noResultsMessage.classList.remove("hidden");
    pagination.classList.add("hidden");
    return;
  }

  noResultsMessage.classList.add("hidden");

  items.forEach((item) => {
    const card = document.createElement("article");
    card.classList.add("movie-card");

    card.innerHTML = `
      <img
        src="${item.imagem}"
        alt="Imagem de ${item.titulo}"
        class="movie-image"
        onerror="this.src='imagens/placeholder.jpg'"
      />
      <div class="movie-content">
        <h3>${item.titulo}</h3>
        <p class="movie-year">Ano: ${item.ano}</p>
        <p class="movie-type">${item.tipo === "filme" ? "🎬 Filme" : "💻 Tecnologia"}</p>
        <p class="movie-description">${item.descricao}</p>
        <a
          href="${item.link}"
          target="_blank"
          rel="noopener noreferrer"
          class="movie-link"
        >
          Ver mais detalhes
        </a>
      </div>
    `;

    // Abrir modal ao clicar no card (exceto no link)
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      openModal(item);
    });

    moviesContainer.appendChild(card);
  });
}

// Renderiza a página atual com paginação
function renderCurrentPage() {
  if (!filteredItems || filteredItems.length === 0) {
    renderItems([]);
    return;
  }

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  renderItems(pageItems);

  pagination.classList.remove("hidden");
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

// =========================
// FILTRO / BUSCA
// =========================

function applyFilterAndRender() {
  const term = searchInput.value.trim().toLowerCase();

  // filtra por título/nome, descrição ou tags
  filteredItems = allItems.filter((item) => {
    const tituloMatch = item.titulo.toLowerCase().includes(term);
    const descricaoMatch = item.descricao.toLowerCase().includes(term);
    const tagsText = (item.tags || []).join(" ").toLowerCase();
    const tagsMatch = tagsText.includes(term);

    // se campo de busca estiver vazio, devolve todos
    if (term === "") return true;

    return tituloMatch || descricaoMatch || tagsMatch;
  });

  currentPage = 1;
  renderCurrentPage();
}

// =========================
// MODAL
// =========================

function openModal(item) {
  modalImage.src = item.imagem;
  modalImage.alt = `Imagem de ${item.titulo}`;
  modalTitle.textContent = item.titulo;
  modalYear.textContent = `Ano: ${item.ano}`;
  modalDescription.textContent = item.descricao;
  modalLink.href = item.link;

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

// =========================
// EVENTOS
// =========================

// Botão "Buscar Filmes"
loadButton.addEventListener("click", async () => {
  // esconder imagens iniciais (se existirem)
  if (homeImages) {
    homeImages.style.display = "none";
  }

  // se ainda não carregou os dados, faz fetch
  if (allItems.length === 0) {
    await fetchItems();
  }

  applyFilterAndRender();
});

// Busca em tempo real
searchInput.addEventListener("input", () => {
  if (allItems.length === 0) return;

  if (homeImages) {
    homeImages.style.display = "none";
  }

  applyFilterAndRender();
});

// Paginação
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderCurrentPage();
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderCurrentPage();
  }
});

// Tema claro/escuro
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  updateThemeIcon();
});

// Fechar modal
closeModalBtn.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Estado inicial do ícone de tema
updateThemeIcon();
