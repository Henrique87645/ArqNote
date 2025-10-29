// js/mapa.js

let mapInstance = null; // Instância global do mapa para esta página

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se está logado
    checkAuth('app');

    // 2. Inicializa o menu lateral
    initMenuListeners();

    // 3. Renderiza o conteúdo da página
    initMap();
    populateMapFilter();
    renderMapPoints('all'); // Mostra todos os pontos inicialmente

    // 4. Adiciona listeners da página
    document.getElementById('map-project-filter')?.addEventListener('change', (e) => {
        renderMapPoints(e.target.value);
    });
});

/**
 * Inicializa a instância do mapa Leaflet.
 */
function initMap() {
    if (mapInstance) return; // Não inicializa duas vezes
    
    try {
        mapInstance = L.map('map-container').setView([-15.7801, -47.9292], 4); // Centro do Brasil

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contribuidores'
        }).addTo(mapInstance);
    } catch (error) {
        console.error("Erro ao inicializar o mapa Leaflet:", error);
        document.getElementById('map-container').innerHTML = 
            '<p class="p-4 text-red-700">Erro ao carregar o mapa. Verifique sua conexão com a internet.</p>';
    }
}

/**
 * Popula o dropdown de filtro de projetos no mapa.
 */
function populateMapFilter() {
    const filterSelect = document.getElementById('map-project-filter');
    if (!filterSelect) return;

    filterSelect.innerHTML = '<option value="all">Todos os Projetos</option>'; // Limpa
    const projects = db.getProjects(currentUser.id);
    
    projects.forEach(project => {
        filterSelect.innerHTML += `<option value="${project.id}">${project.name}</option>`;
    });
}

/**
 * Renderiza os pontos no mapa, opcionalmente filtrados por ID do projeto.
 */
function renderMapPoints(projectId = 'all') {
    if (!mapInstance) {
        console.error("Instância do mapa não encontrada para renderizar pontos.");
        return;
    }

    // Limpa todos os marcadores existentes
    mapInstance.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            mapInstance.removeLayer(layer);
        }
    });

    const points = db.getMapPoints(projectId === 'all' ? null : projectId);
    const emptyMessage = document.getElementById('no-map-points-message');
    const bounds = [];

    if (!emptyMessage) return;

    if (points.length === 0) {
        emptyMessage.classList.remove('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        
        points.forEach(point => {
            if (point.lat && point.lon) {
                const latLng = [point.lat, point.lon];
                const marker = L.marker(latLng).addTo(mapInstance);
                marker.bindPopup(`
                    <b>${point.artifact || 'Registro'}</b><br>
                    ${point.notes || 'Sem anotações.'}<br>
                    <span style="color: #8c6d4f;">Projeto: ${point.projectName}</span>
                `);
                bounds.push(latLng);
            }
        });
        
        // Ajusta o zoom para caber todos os marcadores
        if (bounds.length > 0) {
            mapInstance.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}