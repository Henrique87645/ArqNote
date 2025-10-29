document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se está logado
    checkAuth('app');

    // 2. Renderiza conteúdo inicial
    if (currentProject) { 
        renderProjectDetail(); 
        renderLogList();       
        renderMediaList();     
    } else {
        showToast("Nenhum projeto selecionado. Redirecionando..."); 
        // CORRIGIDO: Volta para a nova página de projetos se não houver currentProject
        setTimeout(() => { window.location.href = 'projetosCriados.html'; }, 1000); 
        return; 
    }

    // 3. Adiciona listeners
    
    // Botão para voltar (CORRIGIDO)
    document.getElementById('back-to-projects-button')?.addEventListener('click', () => {
        window.location.href = 'projetosCriados.html'; // CORRIGIDO: Volta para a nova página de projetos
    });

    // Abas
    document.getElementById('tab-log-button')?.addEventListener('click', () => openTab('log'));
    document.getElementById('tab-media-button')?.addEventListener('click', () => openTab('media'));
    
    // Formulário de Log
    document.getElementById('save-log-button')?.addEventListener('click', handleSaveLog);
    document.getElementById('get-location-button')?.addEventListener('click', handleGetLocation);
    
    // Mídia
    document.querySelectorAll('.media-actions-grid .media-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('media-file-input')?.click(); 
        });
    });
    document.getElementById('media-file-input')?.addEventListener('change', handleMediaFilesSelected);
    
    // Inicialização da Data
    const logDateInput = document.getElementById('log-date');
    if (logDateInput) {
        try { logDateInput.value = new Date().toISOString().split('T')[0]; } 
        catch (e) { console.error("Erro ao definir data inicial:", e); }
    }
});

/**
 * Renderiza os detalhes básicos do projeto (título) e popula os dropdowns
 * de vocabulário no formulário de log.
 */
function renderProjectDetail() {
    const projectTitleElement = document.getElementById('project-title');
    if (projectTitleElement && currentProject) {
        projectTitleElement.textContent = currentProject.name || 'Detalhes do Projeto';
    }
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
 * @param {string} tabName - O nome da aba a ser aberta ('log' ou 'media').
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
                <div class="p-3 bg-brand-beige-light border-2 border-brand-brown-medium/30 rounded-lg shadow-inner-dark">
                    <p class="font-bold text-brand-brown-dark">${log.artifact || 'Sem tipo'} (${formattedDate})</p>
                    <p class="text-brand-brown-medium text-sm">
                        Prof: ${log.depth ? log.depth + 'cm' : 'N/A'} / Camada: ${log.layer || 'N/A'}
                    </p>
                    ${log.notes ? `<p class="text-brand-brown-medium/90 text-sm mt-1">${log.notes}</p>` : ''}
                    ${(log.lat && log.lon) ? `<p class="text-xs text-brand-brown-medium/60 mt-1">GPS: ${log.lat}, ${log.lon}</p>` : ''}
                </div>`;
        });
    }
}

// --- FUNÇÕES DA MÍDIA (ATUALIZADAS) ---

/**
 * Chamada quando ficheiros são selecionados no input#media-file-input.
 * Processa APENAS ficheiros de imagem, ignorando outros tipos.
 * @param {Event} event - O evento 'change' do input file.
 */
function handleMediaFilesSelected(event) {
    const input = event.target;
    if (!input.files || input.files.length === 0 || !currentProject) {
        return;
    }

    const files = Array.from(input.files); 
    const projectName = db.getProjectNameById(currentProject.id); 
    let imageFilesProcessedCount = 0;
    let imageFilesFound = 0;

    // Filtra apenas os ficheiros de imagem para processar
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    imageFilesFound = imageFiles.length;

    if (imageFilesFound === 0) {
        showToast("Nenhuma imagem válida selecionada.");
        input.value = ''; // Limpa o input
        return;
    }

    showToast(`Processando ${imageFilesFound} imagem(ns)...`);

    imageFiles.forEach((file) => {
        // Validação de tamanho (ex: 5MB)
        const maxSizeInBytes = 5 * 1024 * 1024; 
        if (file.size > maxSizeInBytes) {
            showToast(`Erro: ${file.name} excede o limite de ${maxSizeInBytes / 1024 / 1024}MB.`);
            imageFilesProcessedCount++; // Conta como processado mesmo que falhe
            if (imageFilesProcessedCount === imageFilesFound) {
                renderMediaList(); // Atualiza a galeria no final
                input.value = ''; 
            }
            return; // Pula para o próximo ficheiro
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            const imageDataUrl = e.target.result; 
            const caption = file.name;             
            const date = new Date().toISOString(); 

            // Salva a foto no banco de dados
            db.addPhoto(currentProject.id, projectName, imageDataUrl, caption, date);
            
            imageFilesProcessedCount++; 
            
            // QUANDO o último ficheiro de IMAGEM terminar, atualiza a galeria
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

    // Se foram selecionados ficheiros que não eram imagens
    if (files.length > imageFilesFound) {
        showToast(`(${files.length - imageFilesFound}) ficheiro(s) ignorado(s) por não serem imagens.`);
    }
}

/**
 * Busca as fotos do projeto atual e as exibe na galeria da aba "Mídia".
 */
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
                </div>
            `;
        });
    }
}