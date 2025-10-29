// js/fotos.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se está logado
    checkAuth('app');

    // 2. Inicializa o menu lateral
    initMenuListeners();

    // 3. Renderiza o conteúdo da página
    populatePhotoFilter();
    renderPhotoGallery('all'); // Mostra todas as fotos inicialmente

    // 4. Adiciona listeners da página
    document.getElementById('photo-project-filter')?.addEventListener('change', (e) => {
        renderPhotoGallery(e.target.value);
    });
});

/**
 * Popula o dropdown de filtro de projetos na galeria.
 */
function populatePhotoFilter() {
    const filterSelect = document.getElementById('photo-project-filter');
    if (!filterSelect) return;

    filterSelect.innerHTML = '<option value="all">Todos os Projetos</option>'; // Limpa
    const projects = db.getProjects(currentUser.id);
    
    projects.forEach(project => {
        filterSelect.innerHTML += `<option value="${project.id}">${project.name}</option>`;
    });
}

/**
 * Renderiza a galeria de fotos, opcionalmente filtrada por ID do projeto.
 */
function renderPhotoGallery(projectId = 'all') {
    const photos = db.getPhotos(projectId === 'all' ? null : projectId);
    const galleryElement = document.getElementById('photo-gallery');
    const emptyMessage = document.getElementById('no-photos-message');

    if (!galleryElement || !emptyMessage) return;

    galleryElement.innerHTML = ''; // Limpa
    
    if (photos.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        photos.forEach(photo => {
            const card = `
                <div class="photo-card">
                    <img src="${photo.url}" alt="${photo.caption}">
                    <div class="photo-caption-overlay">
                        <p>${photo.caption}</p>
                        <p class="photo-date">${new Date(photo.date).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
            galleryElement.innerHTML += card;
        });
    }
}