// js/paleontologia.js

document.addEventListener('DOMContentLoaded', () => {
    // Esta é uma página pública, não precisa de checkAuth() para bloquear acesso.

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
        // Encontra o card pai mais próximo que foi clicado
        const card = event.target.closest('.discovery-card'); 
        
        if (card) {
            // Pega os dados armazenados nos atributos data-* do card
            const title = card.dataset.title || "Sem Título";
            const image = card.dataset.image || ""; // Pega a URL da imagem (placeholder)
            const meta = card.dataset.meta || "";
            const description = card.dataset.description || "Mais informações indisponíveis.";

            // Preenche o modal com os dados do card clicado
            modalTitle.textContent = title;
            modalMeta.textContent = meta;
            modalDescription.textContent = description;

            // Lógica da Imagem: Mostra se houver URL válida, esconde senão
            if (image && !image.includes('placeholder.com')) { // Verifica se tem URL e não é placeholder genérico
                modalImage.src = image;
                modalImage.alt = title; 
                modalImage.classList.remove('hidden'); 
            } else {
                modalImage.src = ""; 
                modalImage.alt = ""; 
                modalImage.classList.add('hidden'); // Esconde o elemento <img>
            }

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
        if (event.target === modal) { 
            modal.classList.add('hidden');
        }
    });

    // 3. Fechar pressionando a tecla 'Escape'
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape" && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });

});