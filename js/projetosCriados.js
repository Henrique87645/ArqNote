// js/projetosCriados.js (COMPLETO E ATUALIZADO)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica se está logado
    checkAuth('app'); 
    
    // 2. Renderiza a lista de projetos
    renderProjectList();

    // 3. Adiciona listeners
    const newProjectButton = document.getElementById('new-project-button');
    const projectListDiv = document.getElementById('project-list');

    if (newProjectButton) {
        newProjectButton.addEventListener('click', handleNewProject);
    } else {
        console.error("Botão 'Novo projeto' não encontrado.");
    }
    
    // Listener de clique (delegação de evento)
    if (projectListDiv) {
        projectListDiv.addEventListener('click', (e) => {
            // Verifica se o clique foi no botão de excluir
            const deleteButton = e.target.closest('.delete-project-btn'); 
            if (deleteButton) {
                e.stopPropagation(); 
                const projectId = deleteButton.dataset.id;
                if (projectId) {
                    handleDeleteProject(projectId); 
                } else {
                     console.error("ID do projeto não encontrado no botão de exclusão.");
                }
                return; 
            }

            // Se não foi no botão de excluir, abre o projeto
            const projectCard = e.target.closest('.project-card');
            if (projectCard) {
                const projectId = projectCard.dataset.id; 
                if (projectId) {
                    openProject(projectId); 
                } else {
                    console.error("ID do projeto não encontrado no card clicado.");
                }
            }
        });
    } else {
         console.error("Elemento '#project-list' não encontrado.");
    }
});

/**
 * Renderiza a lista de projetos, agora com botão de excluir.
 */
function renderProjectList() {
    if (!currentUser) {
        console.error("Usuário não logado ao tentar renderizar projetos.");
        window.location.href = '../index.html'; 
        return; 
    }
    
    const projects = db.getProjects(currentUser.id); 
    const listElement = document.getElementById('project-list');
    const emptyElement = document.getElementById('project-list-empty');

    if (!listElement || !emptyElement) {
        console.error("Elementos da lista de projeto ou mensagem de vazio não encontrados.");
        return;
    }
    
    listElement.innerHTML = ''; 

    if (!projects || projects.length === 0) {
        emptyElement.classList.remove('hidden'); 
        listElement.classList.add('hidden'); 
    } else {
        emptyElement.classList.add('hidden'); 
        listElement.classList.remove('hidden'); 
        
        projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        projects.forEach(project => {
            const creationDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Data desconhecida';
            
            // MODIFICADO: Usa project.nomeDoSítio ou project.name (fallback)
            const siteName = project.nomeDoSítio || project.name || 'Projeto sem nome'; 
            
            const card = `
                <div data-id="${project.id}" class="project-card relative group"> 
                    <div class="pr-10"> 
                       <h3>${siteName}</h3>
                       <p>Criado em: ${creationDate}</p>
                    </div>

                    <button 
                        data-id="${project.id}" 
                        class="delete-project-btn absolute top-2 right-2 p-1.5 text-red-700/50 hover:text-red-700 hover:bg-red-100/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        aria-label="Remover projeto ${siteName}"
                        title="Remover projeto"> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            `;
            listElement.innerHTML += card;
        });
    }
}

/**
 * Abre a página de detalhes de um projeto específico.
 */
function openProject(projectId) {
    const project = db.getProjectDetails(projectId);
    if (project) {
        currentProject = project;
        localStorage.setItem('currentProject', JSON.stringify(currentProject));
        window.location.href = 'projeto.html'; 
    } else {
        showToast("Erro: Projeto não encontrado.");
    }
}

/**
 * MODIFICADO: Lida com a criação de um novo projeto (pede Nome do Sítio).
 */
function handleNewProject() {
     if (!currentUser) {
        showToast("Erro: Usuário não logado.");
        return;
    }
    // MODIFICADO: Pergunta o "Nome do Sítio"
    const nomeDoSítio = prompt("Qual o Nome do Sítio?");
    
    if (nomeDoSítio && nomeDoSítio.trim() !== "") {
        // MODIFICADO: Passa o nomeDoSítio para a função createProject
        const newProject = db.createProject(currentUser.id, nomeDoSítio.trim());
        if (newProject) {
            renderProjectList(); 
            showToast("Projeto criado com sucesso!");
        } else {
             showToast("Erro ao criar o projeto.");
        }
    } else if (nomeDoSítio !== null) { 
        showToast("O Nome do Sítio não pode estar vazio.");
    }
}

/**
 * Lida com a exclusão de um projeto.
 */
function handleDeleteProject(projectId) {
    const project = db.getProjectDetails(projectId);
    const projectName = project ? (project.nomeDoSítio || project.name) : 'este projeto';

    if (confirm(`Tem certeza que deseja remover "${projectName}" e TODOS os seus dados associados (registros, fotos)?\n\nESTA AÇÃO NÃO PODE SER DESFEITA.`)) {
        
        const success = db.deleteProject(projectId); 

        if (success) {
            showToast(`Projeto "${projectName}" removido com sucesso.`);
            renderProjectList(); 
        } else {
            showToast(`Erro ao tentar remover o projeto.`);
        }
    } else {
        console.log("Exclusão cancelada pelo usuário.");
    }
}