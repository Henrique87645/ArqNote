// js/arqueologia.js

document.addEventListener('DOMContentLoaded', () => {
    // Não chamamos checkAuth() aqui, pois esta é uma página pública.
    // O auth.js só redireciona de páginas públicas se o usuário ESTIVER logado
    // E a página for login/cadastro. Acessar home/arqueologia logado é permitido.

    // Seleciona todos os elementos necessários do DOM
    const discoveryGrid = document.getElementById('discovery-grid');
    const modal = document.getElementById('discovery-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalDescription = document.getElementById('modal-full-description');

    // Verifica se todos os elementos essenciais existem
    if (!discoveryGrid || !modal || !closeModalButton || !modalImage || !modalTitle || !modalMeta || !modalDescription) {
        console.error("Erro: Elementos essenciais da página ou do modal não foram encontrados.");
        return; // Aborta se algo estiver faltando
    }

    // --- Lógica para Abrir o Modal ---
    discoveryGrid.addEventListener('click', (event) => {
        // Encontra o card pai mais próximo que foi clicado (event delegation)
        const card = event.target.closest('.discovery-card'); 
        
        if (card) {
            // Pega os dados armazenados nos atributos data-* do card
            const title = card.dataset.title || "Sem Título";
            const image = card.dataset.image || "https://via.placeholder.com/400x200?text=Imagem+Indisponível";
            const meta = card.dataset.meta || "";
            const description = card.dataset.description || "Mais informações indisponíveis.";

            // Preenche o modal com os dados do card clicado
            modalImage.src = image;
            modalImage.alt = title; // Define o alt da imagem
            modalTitle.textContent = title;
            modalMeta.textContent = meta;
            modalDescription.textContent = description;

            // Mostra o modal
            modal.classList.remove('hidden');
        }
    });

    // --- Lógica para Fechar o Modal ---

    // 1. Fechar pelo botão 'X'
    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // 2. Fechar clicando fora do conteúdo do modal (no overlay escuro)
    modal.addEventListener('click', (event) => {
        // Se o clique foi diretamente no overlay (modal) e não em seus filhos (modal-content)
        if (event.target === modal) { 
            modal.classList.add('hidden');
        }
    });

    // 3. Fechar pressionando a tecla 'Escape' (opcional, boa usabilidade)
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape" && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });

});