// js/perfil.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se está logado
    checkAuth('app');
    
    // 2. Renderiza o conteúdo da página
    renderProfileData(); // Carrega dados do usuário
    renderVocabulary();  // Carrega vocabulário
    
    // 3. Listeners da página
    
    // --- Listeners do Vocabulário ---
    document.getElementById('add-artifact-btn')?.addEventListener('click', () => {
        const input = document.getElementById('new-artifact-input');
        handleAddVocabularyTerm(input?.value, 'artifacts', input); // Adicionado '?' para segurança
    });
    
    document.getElementById('add-layer-btn')?.addEventListener('click', () => {
        const input = document.getElementById('new-layer-input');
        handleAddVocabularyTerm(input?.value, 'layers', input); // Adicionado '?' para segurança
    });
    
    const profileScreen = document.getElementById('profile-screen');
    if (profileScreen) {
        profileScreen.addEventListener('click', (e) => {
            // Listener para remover termo do vocabulário
            const removeButton = e.target.closest('.remove-term-btn');
            if (removeButton) {
                const term = removeButton.dataset.term;
                const type = removeButton.dataset.type;
                if (term && type) {
                    handleRemoveVocabularyTerm(term, type);
                }
            }
        });
    }

    // --- Listeners do Perfil ---
    
    // Listener para CLICAR no input de ficheiro escondido ao clicar na foto
    document.getElementById('profile-pic-container')?.addEventListener('click', () => {
        document.getElementById('profile-pic-input')?.click(); // Dispara o input file
    });

    // Listener para quando um FICHEIRO É SELECIONADO no input escondido
    document.getElementById('profile-pic-input')?.addEventListener('change', handleFileSelected);
    
    // Listener para salvar dados (username/email)
    document.getElementById('save-profile-btn')?.addEventListener('click', handleUpdateProfile);

    // Listener para salvar nova senha
    document.getElementById('save-password-btn')?.addEventListener('click', handleUpdatePassword);

    // Listeners para botões de "ver senha" (usa a função de components.js)
    document.getElementById('toggle-old-pass')?.addEventListener('click', () => {
        togglePasswordVisibility('profile-old-pass', 'toggle-old-pass-icon', 'toggle-old-pass-icon-off');
    });
    document.getElementById('toggle-new-pass')?.addEventListener('click', () => {
        togglePasswordVisibility('profile-new-pass', 'toggle-new-pass-icon', 'toggle-new-pass-icon-off');
    });
    document.getElementById('toggle-confirm-pass')?.addEventListener('click', () => {
        togglePasswordVisibility('profile-confirm-pass', 'toggle-confirm-pass-icon', 'toggle-confirm-pass-icon-off');
    });
});

// --- Funções de Perfil ---

/**
 * Carrega os dados do 'currentUser' e preenche os campos do perfil.
 */
function renderProfileData() {
    if (!currentUser) return;
    const profilePicImg = document.getElementById('profile-pic-img');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    const profileUsernameInput = document.getElementById('profile-username-input');
    const profileEmailInput = document.getElementById('profile-email-input');

    if (profilePicImg) {
        profilePicImg.src = currentUser.profilePic || 'https://i.pravatar.cc/150?u=' + currentUser.email; 
    }
    if (profileUsername) {
        profileUsername.textContent = currentUser.username;
    }
    if (profileEmail) {
        profileEmail.textContent = currentUser.email;
    }
    if (profileUsernameInput) {
        profileUsernameInput.value = currentUser.username;
    }
    if (profileEmailInput) {
        profileEmailInput.value = currentUser.email;
    }
}

/**
 * Lida com a seleção de um ficheiro de imagem.
 * Lê o ficheiro como Data URL e o salva.
 */
function handleFileSelected(event) {
    const input = event.target;
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validação simples de tipo
        if (!file.type.startsWith('image/')){
            showToast("Por favor, selecione um ficheiro de imagem (jpeg, png, gif).");
            input.value = ''; // Limpa o input se o ficheiro for inválido
            return;
        }
        
        // Limita o tamanho do ficheiro (ex: 2MB) - Opcional
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSizeInBytes) {
            showToast(`A imagem é muito grande. O tamanho máximo é ${maxSizeInBytes / 1024 / 1024}MB.`);
            input.value = ''; // Limpa o input
            return;
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            const imageDataUrl = e.target.result; // O Data URL da imagem

            // 1. Atualiza a pré-visualização imediatamente
            const profilePicImg = document.getElementById('profile-pic-img');
            if (profilePicImg) profilePicImg.src = imageDataUrl;

            // 2. Salva o Data URL no banco de dados (e localStorage)
            const result = db.updateProfilePic(currentUser.id, imageDataUrl);
            
            if (result.success) {
                // 3. Atualiza o currentUser global e o localStorage
                currentUser = result.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showToast("Foto de perfil atualizada!");
            } else {
                showToast(result.message);
                // Reverte a imagem se a gravação falhar
                if (profilePicImg) profilePicImg.src = currentUser.profilePic || 'https://i.pravatar.cc/150?u=' + currentUser.email;
            }
            input.value = ''; // Limpa o input após o processamento
        }
        
        reader.onerror = function(e) {
            console.error("Erro ao ler o ficheiro:", e);
            showToast("Erro ao carregar a imagem.");
            input.value = ''; // Limpa o input em caso de erro
        }

        // Inicia a leitura do ficheiro como Data URL
        reader.readAsDataURL(file);
    }
}

/**
 * Lida com a atualização do username e email.
 */
function handleUpdateProfile() {
    const usernameInput = document.getElementById('profile-username-input');
    const emailInput = document.getElementById('profile-email-input');

    if (!usernameInput || !emailInput) return; // Segurança

    const newUsername = usernameInput.value.trim();
    const newEmail = emailInput.value.trim();

    if (!newUsername || !newEmail) {
        showToast("Nome de usuário e e-mail não podem estar vazios.");
        return;
    }
    
    // Verifica se houve realmente mudança para evitar chamadas desnecessárias
    if (newUsername === currentUser.username && newEmail === currentUser.email) {
        showToast("Nenhuma alteração detectada.");
        return;
    }

    const result = db.updateUser(currentUser.id, { username: newUsername, email: newEmail });

    if (result.success) {
        // Atualiza o currentUser global e o localStorage
        currentUser = result.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Re-renderiza os dados na página
        renderProfileData();
        showToast("Dados do perfil atualizados com sucesso!");
    } else {
        showToast(result.message);
        // Reverte os inputs para os valores antigos se a gravação falhar
        usernameInput.value = currentUser.username;
        emailInput.value = currentUser.email;
    }
}

/**
 * Lida com a tentativa de alterar a senha.
 */
function handleUpdatePassword() {
    const oldPassInput = document.getElementById('profile-old-pass');
    const newPassInput = document.getElementById('profile-new-pass');
    const confirmPassInput = document.getElementById('profile-confirm-pass');

    if (!oldPassInput || !newPassInput || !confirmPassInput) return; // Segurança

    const oldPassword = oldPassInput.value;
    const newPassword = newPassInput.value;
    const confirmPassword = confirmPassInput.value;

    if (!oldPassword || !newPassword || !confirmPassword) {
        showToast("Por favor, preencha todos os campos de senha.");
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast("A nova senha e a confirmação não coincidem.");
        return;
    }
    
    // Adicionar validação de força da senha (opcional)
    if (newPassword.length < 3) { // Exemplo: mínimo 3 caracteres
        showToast("A nova senha deve ter pelo menos 3 caracteres.");
        return;
    }

    const result = db.updatePassword(currentUser.id, oldPassword, newPassword);

    if (result.success) {
        showToast("Senha alterada com sucesso!");
        // Limpa os campos
        oldPassInput.value = '';
        newPassInput.value = '';
        confirmPassInput.value = '';
    } else {
        showToast(result.message);
        // Limpa apenas os campos de nova senha se a antiga estiver errada
        if (result.message.includes("antiga incorreta")) {
             oldPassInput.value = ''; // Limpa a senha antiga também para forçar redigitar
             newPassInput.value = '';
             confirmPassInput.value = '';
        }
    }
}


// --- Funções de Vocabulário (Completas) ---

/**
 * Renderiza as listas de vocabulário (artefatos e camadas).
 */
function renderVocabulary() {
    const vocab = db.getVocabulary();
    const artifactList = document.getElementById('artifact-list');
    const layerList = document.getElementById('layer-list');

    // Renderiza Artefatos
    if (artifactList) {
        artifactList.innerHTML = ''; // Limpa antes de adicionar
        if (vocab.artifacts && vocab.artifacts.length > 0) {
            vocab.artifacts.forEach(term => {
                artifactList.innerHTML += `
                    <li class="flex justify-between items-center p-2 bg-brand-beige-light rounded-lg">
                        <span>${term}</span>
                        <button data-term="${term}" data-type="artifacts" class="remove-term-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </li>`;
            });
        } else {
            artifactList.innerHTML = '<li class="text-brand-brown-medium/70 italic">Nenhum termo adicionado.</li>';
        }
    }
    
    // Renderiza Camadas
    if (layerList) {
        layerList.innerHTML = ''; // Limpa antes de adicionar
        if (vocab.layers && vocab.layers.length > 0) {
            vocab.layers.forEach(term => {
                layerList.innerHTML += `
                    <li class="flex justify-between items-center p-2 bg-brand-beige-light rounded-lg">
                        <span>${term}</span>
                        <button data-term="${term}" data-type="layers" class="remove-term-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </li>`;
            });
        } else {
            layerList.innerHTML = '<li class="text-brand-brown-medium/70 italic">Nenhum termo adicionado.</li>';
        }
    }
}

/**
 * Adiciona um novo termo ao vocabulário.
 */
function handleAddVocabularyTerm(term, type, inputElement) {
    if (!term || term.trim() === '') {
        showToast("O termo não pode estar vazio.");
        return;
    }
    const result = db.addVocabularyTerm(term.trim(), type); // Usa trim() para remover espaços extras
    if (result.success) {
        renderVocabulary(); // Atualiza a lista
        if (inputElement) inputElement.value = ''; // Limpa o input
        showToast("Termo adicionado!"); // Feedback positivo
    } else {
        showToast(result.message);
    }
}

/**
 * Remove um termo do vocabulário.
 */
function handleRemoveVocabularyTerm(term, type) {
    // Confirmação antes de remover (opcional mas recomendado)
    if (confirm(`Tem certeza que deseja remover o termo "${term}"?`)) {
        db.removeVocabularyTerm(term, type);
        renderVocabulary(); // Atualiza a lista
        showToast("Termo removido."); // Feedback
    }
}