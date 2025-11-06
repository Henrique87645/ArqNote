// js/projeto.js (COMPLETO E CORRIGIDO - Funciona com .input-group)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se está logado
    checkAuth('app'); 

    // 2. Renderiza o conteúdo inicial
    if (currentProject) { 
        renderProjectDetail(); // Preenche a Ficha do Sítio
        renderLogList();       
        renderMediaList();     
    } else {
        showToast("Nenhum projeto selecionado. Redirecionando..."); 
        setTimeout(() => { window.location.href = 'projetosCriados.html'; }, 1000); 
        return; 
    }

    // 3. Adiciona listeners
    document.getElementById('back-to-projects-button')?.addEventListener('click', () => {
        window.location.href = 'projetosCriados.html'; 
    });
    document.getElementById('tab-log-button')?.addEventListener('click', () => openTab('log'));
    document.getElementById('tab-media-button')?.addEventListener('click', () => openTab('media'));
    
    // --- Listeners da Aba Registro ---
    document.getElementById('save-details-button')?.addEventListener('click', handleSaveDetails); 
    document.getElementById('save-log-button')?.addEventListener('click', handleSaveLog);
    document.getElementById('get-location-button')?.addEventListener('click', handleGetLocation);
    document.getElementById('export-pdf-button')?.addEventListener('click', handleExportPDF);
    
    // Listeners da Aba Mídia
    document.querySelectorAll('.media-actions-grid .media-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('media-file-input')?.click(); 
        });
    });
    document.getElementById('media-file-input')?.addEventListener('change', handleMediaFilesSelected);
    document.getElementById('media-gallery')?.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.delete-photo-btn');
        if (deleteButton) {
            event.stopPropagation(); 
            const photoId = deleteButton.dataset.id;
            if (photoId) handleDeletePhoto(photoId);
        }
    });

    // Inicialização da Data
    const logDateInput = document.getElementById('log-date');
    if (logDateInput) {
        try { logDateInput.value = new Date().toISOString().split('T')[0]; } 
        catch (e) { console.error("Erro ao definir data inicial:", e); }
    }
});


// --- NOVA FUNÇÃO: handleSaveDetails ---
function handleSaveDetails() {
    if (!currentProject) {
        showToast("Erro: Projeto não carregado.");
        return;
    }
    
    // 1. Coleta os dados do formulário
    const detailsData = {
        nomeDoSítio: document.getElementById('details-nome-sitio')?.value || "",
        instituicao: document.getElementById('details-instituicao')?.value || "",
        departamento: document.getElementById('details-departamento')?.value || "",
        responsavel: document.getElementById('details-responsavel')?.value || "",
        outrasDesignacoes: document.getElementById('details-outras-designacoes')?.value || "",
        autorizacao: document.getElementById('details-autorizacao')?.checked || false,
        instituicaoResponsavel: document.getElementById('details-instituicao-responsavel')?.value || "",
        anosIntervencao: document.getElementById('details-anos-intervencao')?.value || "",
        usoAtual: document.getElementById('details-uso-atual')?.value || ""
    };

    // 2. Salva no DB
    const success = db.updateProjectDetails(currentProject.id, detailsData);

    if (success) {
        // 3. Atualiza o estado global 'currentProject'
        currentProject = db.getProjectDetails(currentProject.id); 
        
        // 4. Atualiza o título no cabeçalho
        document.getElementById('project-title').textContent = detailsData.nomeDoSítio;
        
        showToast("Ficha do Sítio salva com sucesso!");
    } else {
        showToast("Erro ao salvar a Ficha do Sítio.");
    }
}


// --- FUNÇÃO ATUALIZADA: renderProjectDetail ---
function renderProjectDetail() {
    if (!currentProject) return;

    // 1. Atualiza o título no cabeçalho
    const projectTitleElement = document.getElementById('project-title');
    if (projectTitleElement) {
        projectTitleElement.textContent = currentProject.nomeDoSítio || 'Detalhes do Projeto';
    }

    // 2. Popula o formulário "Ficha do Sítio"
    document.getElementById('details-nome-sitio').value = currentProject.nomeDoSítio || "";
    document.getElementById('details-instituicao').value = currentProject.instituicao || "";
    document.getElementById('details-departamento').value = currentProject.departamento || "";
    document.getElementById('details-responsavel').value = currentProject.responsavel || "";
    document.getElementById('details-outras-designacoes').value = currentProject.outrasDesignacoes || "";
    document.getElementById('details-autorizacao').checked = currentProject.autorizacao || false;
    document.getElementById('details-instituicao-responsavel').value = currentProject.instituicaoResponsavel || "";
    document.getElementById('details-anos-intervencao').value = currentProject.anosIntervencao || "";
    document.getElementById('details-uso-atual').value = currentProject.usoAtual || "";

    // 3. Popula os dropdowns de vocabulário
    const vocab = db.getVocabulary(); 
    const artifactSelect = document.getElementById('log-artifact');
    const layerSelect = document.getElementById('log-layer');
    if (artifactSelect) {
        artifactSelect.innerHTML = '<option value="">Selecione o tipo</option>'; 
        if (vocab.artifacts && vocab.artifacts.length > 0) {
            vocab.artifacts.forEach(term => {
                artifactSelect.innerHTML += `<option value="${term}">${term}</option>`;
            });
        }
    }
    if (layerSelect) {
        layerSelect.innerHTML = '<option value="">Selecione a camada</option>'; 
        if (vocab.layers && vocab.layers.length > 0) {
            vocab.layers.forEach(term => {
                layerSelect.innerHTML += `<option value="${term}">${term}</option>`;
            });
        }
    }
}

/**
 * Controla a visibilidade das abas 'Registro' (log) e 'Mídia' (media).
 */
function openTab(tabName) {
    const logContent = document.getElementById('tab-log-content');
    const mediaContent = document.getElementById('tab-media-content');
    const logButton = document.getElementById('tab-log-button');
    const mediaButton = document.getElementById('tab-media-button');
    if (!logContent || !mediaContent || !logButton || !mediaButton) {
        console.error("Elementos das abas não encontrados.");
        return;
    }
    if (tabName === 'log') {
        logContent.classList.remove('hidden');   
        mediaContent.classList.add('hidden');    
        logButton.classList.add('active');       
        mediaButton.classList.remove('active');  
    } else { // media
        logContent.classList.add('hidden');      
        mediaContent.classList.remove('hidden'); 
        mediaButton.classList.add('active');     
        logButton.classList.remove('active');    
    }
}

/**
 * Tenta obter a geolocalização (latitude e longitude) do navegador.
 */
function handleGetLocation() {
    const latInput = document.getElementById('log-lat');
    const lonInput = document.getElementById('log-lon');
    const locationTextElement = document.getElementById('get-location-text');
    if (!latInput || !lonInput || !locationTextElement) {
        console.error("Inputs de localização ou texto do botão não encontrados.");
        return;
    }
    if (!navigator.geolocation) {
        showToast("Geolocalização não é suportada.");
        return;
    }
    locationTextElement.textContent = "Obtendo localização..."; 
    latInput.value = ""; 
    lonInput.value = "";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6); 
            const lon = position.coords.longitude.toFixed(6);
            latInput.value = lat;
            lonInput.value = lon;
            locationTextElement.textContent = "Localização Capturada!"; 
            showToast("Localização obtida com sucesso.");
        },
        (error) => {
            console.error("Erro ao obter geolocalização:", error);
            let errorMessage = "Não foi possível obter a localização.";
            switch(error.code) {
                case error.PERMISSION_DENIED: errorMessage = "Permissão de localização negada."; break;
                case error.POSITION_UNAVAILABLE: errorMessage = "Informação de localização indisponível."; break;
                case error.TIMEOUT: errorMessage = "Tempo esgotado ao obter localização."; break;
            }
            showToast(errorMessage);
            locationTextElement.textContent = "Obter Localização Atual"; 
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

/**
 * Coleta os dados do formulário de log, valida e salva no banco de dados.
 */
function handleSaveLog() {
    if (!currentProject) {
        showToast("Erro: Nenhum projeto selecionado para salvar o log.");
        return;
    }
    const logData = {
        date: document.getElementById('log-date')?.value,
        artifact: document.getElementById('log-artifact')?.value,
        depth: document.getElementById('log-depth')?.value,
        layer: document.getElementById('log-layer')?.value,
        lat: document.getElementById('log-lat')?.value,
        lon: document.getElementById('log-lon')?.value,
        notes: document.getElementById('log-notes')?.value.trim(), 
    };
    if (!logData.date || !logData.artifact) {
        showToast("Por favor, preencha pelo menos a Data e o Artefato/Tipo.");
        return;
    }
    const savedLog = db.saveLog(currentProject.id, logData);
    if (savedLog) {
        showToast("Registro salvo com sucesso!");
        document.getElementById('log-artifact').value = ""; 
        document.getElementById('log-depth').value = "";
        document.getElementById('log-layer').value = "";   
        document.getElementById('log-lat').value = "";
        document.getElementById('log-lon').value = "";
        document.getElementById('log-notes').value = "";
        const locationTextElement = document.getElementById('get-location-text');
        if (locationTextElement) locationTextElement.textContent = "Obter Localização Atual"; 
        const logDateInput = document.getElementById('log-date');
         if (logDateInput) logDateInput.value = new Date().toISOString().split('T')[0];
        renderLogList(); 
    } else {
        showToast("Erro ao salvar o registro.");
    }
}

/**
 * Busca os logs do projeto atual e os exibe na lista.
 */
function renderLogList() {
    if (!currentProject) return; 
    const logs = db.getLogs(currentProject.id); 
    const listElement = document.getElementById('log-list');
    const emptyMessage = document.getElementById('no-logs-message');
    if (!listElement || !emptyMessage) {
        console.error("Elementos da lista de logs ou mensagem de vazio não encontrados.");
        return;
    }
    listElement.innerHTML = ''; 
    if (!logs || logs.length === 0) {
        emptyMessage.classList.remove('hidden'); 
    } else {
        emptyMessage.classList.add('hidden'); 
        logs.sort((a, b) => new Date(b.date) - new Date(a.date)); 
        logs.forEach(log => {
            const formattedDate = log.date ? new Date(log.date).toLocaleDateString() : 'Data inválida';
            listElement.innerHTML += `
                <div class="log-card p-3 bg-brand-beige-light border-2 border-brand-brown-medium/30 rounded-lg shadow-inner-dark">
                    <p class="font-bold text-brand-brown-dark">${log.artifact || 'Sem tipo'} (${formattedDate})</p>
                    <p class="text-brand-brown-medium text-sm">
                        Prof: ${log.depth ? log.depth + 'cm' : 'N/A'} / Camada: ${log.layer || 'N/A'}
                    </p>
                    ${log.notes ? `<p class="log-notes text-brand-brown-medium/90 text-sm mt-1">${log.notes}</p>` : ''}
                    ${(log.lat && log.lon) ? `<p class="log-gps text-xs text-brand-brown-medium/60 mt-1">GPS: ${log.lat}, ${log.lon}</p>` : ''}
                </div>`;
        });
    }
}

// --- Funções da Mídia ---
function handleMediaFilesSelected(event) {
    const input = event.target;
    if (!input.files || input.files.length === 0 || !currentProject) {
        return;
    }
    const files = Array.from(input.files); 
    const projectName = db.getProjectNameById(currentProject.id); 
    let imageFilesProcessedCount = 0;
    let imageFilesFound = 0;

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    imageFilesFound = imageFiles.length;

    if (imageFilesFound === 0) {
        showToast("Nenhuma imagem válida selecionada.");
        input.value = ''; 
        return;
    }
    showToast(`Processando ${imageFilesFound} imagem(ns)...`);

    imageFiles.forEach((file) => {
        const maxSizeInBytes = 5 * 1024 * 1024; 
        if (file.size > maxSizeInBytes) {
            showToast(`Erro: ${file.name} excede o limite de ${maxSizeInBytes / 1024 / 1024}MB.`);
            imageFilesProcessedCount++; 
            if (imageFilesProcessedCount === imageFilesFound) {
                renderMediaList(); 
                input.value = ''; 
            }
            return; 
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageDataUrl = e.target.result; 
            const caption = file.name;             
            const date = new Date().toISOString(); 
            db.addPhoto(currentProject.id, projectName, imageDataUrl, caption, date);
            imageFilesProcessedCount++; 
            if (imageFilesProcessedCount === imageFilesFound) {
                renderMediaList(); 
                showToast(`${imageFilesFound} imagem(ns) salva(s)!`);
                input.value = ''; 
            }
        }
        reader.onerror = function(e) {
            console.error(`Erro ao ler o ficheiro ${file.name}:`, e);
            showToast(`Erro ao carregar ${file.name}.`);
            imageFilesProcessedCount++;
             if (imageFilesProcessedCount === imageFilesFound) {
                renderMediaList(); 
                input.value = ''; 
             }
        }
        reader.readAsDataURL(file); 
    });
    if (files.length > imageFilesFound) {
        showToast(`(${files.length - imageFilesFound}) ficheiro(s) ignorado(s) por não serem imagens.`);
    }
}

function renderMediaList() {
    if (!currentProject) return; 

    const photos = db.getPhotos(currentProject.id); 
    const galleryElement = document.getElementById('media-gallery');
    const emptyMessage = document.getElementById('no-media-message');

    if (!galleryElement || !emptyMessage) {
        console.error("Elementos da galeria de mídia ou mensagem de vazio não encontrados.");
        return;
    }
    galleryElement.innerHTML = ''; 

    if (!photos || photos.length === 0) {
        emptyMessage.classList.remove('hidden'); 
    } else {
        emptyMessage.classList.add('hidden'); 
        photos.sort((a, b) => new Date(b.date) - new Date(a.date)); 
        
        photos.forEach(photo => {
            galleryElement.innerHTML += `
                <div class="media-card">
                    <img src="${photo.url}" alt="${photo.caption || 'Mídia do projeto'}">
                    
                    <button class="delete-photo-btn" data-id="${photo.id}" title="Apagar foto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
        });
    }
}

function handleDeletePhoto(photoId) {
    if (!photoId) return;
    
    if (confirm("Tem certeza que deseja apagar esta imagem?")) {
        const success = db.deletePhoto(photoId); 
        
        if (success) {
            showToast("Imagem apagada com sucesso.");
            renderMediaList(); 
        } else {
            showToast("Erro ao apagar a imagem.");
        }
    }
}


// --- FUNÇÃO PARA EXPORTAR PDF ---
async function handleExportPDF() {
    if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
        showToast("Erro: Bibliotecas de PDF não carregaram. Tente recarregar.");
        console.error("jsPDF ou html2canvas não encontrados. Verifique os links no <head>.");
        return;
    }

    const button = document.getElementById('export-pdf-button');
    const originalButtonText = button.innerHTML;
    button.innerHTML = '<span class="loader"></span> Exportando...'; 
    button.disabled = true;
    
    const exportArea = document.getElementById('pdf-export-area'); 
    const elementsToHide = exportArea.querySelectorAll('.log-form-container, #export-pdf-button, #get-location-button, #save-log-button, .site-details-container #save-details-button'); // Esconde salvar ficha
    const elementsToShow = exportArea.querySelectorAll('.pdf-only-export');
    const elementsToClean = exportArea.querySelectorAll('.log-list-container, .log-card, .site-details-container'); // Limpa ficha

    const projectTitle = document.getElementById('project-title')?.textContent || 'Projeto ArqNote';
    document.getElementById('pdf-project-title').textContent = projectTitle;

    elementsToHide.forEach(el => el.classList.add('pdf-hide-on-export'));
    elementsToShow.forEach(el => el.classList.add('pdf-show-on-export'));
    elementsToClean.forEach(el => el.classList.add('pdf-prepare-export'));
    exportArea.classList.add('pdf-prepare-export');

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        await new Promise(resolve => setTimeout(resolve, 100));

        await pdf.html(exportArea, {
            callback: function(doc) {
                const filename = `ArqNote_Registros_${projectTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
                doc.save(filename);
                
                elementsToHide.forEach(el => el.classList.remove('pdf-hide-on-export'));
                elementsToShow.forEach(el => el.classList.remove('pdf-show-on-export'));
                elementsToClean.forEach(el => el.classList.remove('pdf-prepare-export'));
                exportArea.classList.remove('pdf-prepare-export');
                
                button.innerHTML = originalButtonText;
                button.disabled = false;
                showToast("PDF exportado com sucesso!");
            },
            x: 15, y: 15,
            width: 180, 
            windowWidth: exportArea.scrollWidth, 
            autoPaging: 'text', 
            margin: [15, 15, 15, 15] 
        });

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        showToast("Erro ao gerar o PDF.");
        
        elementsToHide.forEach(el => el.classList.remove('pdf-hide-on-export'));
        elementsToShow.forEach(el => el.classList.remove('pdf-show-on-export'));
        elementsToClean.forEach(el => el.classList.remove('pdf-prepare-export'));
        exportArea.classList.remove('pdf-prepare-export');

        button.innerHTML = originalButtonText;
        button.disabled = false;
    }
}