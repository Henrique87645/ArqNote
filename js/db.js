// js/db.js (COMPLETO E ATUALIZADO)

class FakeDB {
    constructor() {
        console.log("FakeDB inicializado.");
        this.data = {
            users: JSON.parse(localStorage.getItem('db_users')) || [],
            projects: JSON.parse(localStorage.getItem('db_projects')) || [],
            logs: JSON.parse(localStorage.getItem('db_logs')) || [],
            vocabulary: JSON.parse(localStorage.getItem('db_vocabulary')) || { artifacts: [], layers: [] },
            photos: JSON.parse(localStorage.getItem('db_photos')) || [],
            mapPoints: JSON.parse(localStorage.getItem('db_mapPoints')) || [],
        };
        if (!this.data.vocabulary.artifacts) this.data.vocabulary.artifacts = [];
        if (!this.data.vocabulary.layers) this.data.vocabulary.layers = [];

        // --- INÍCIO DA MIGRAÇÃO AUTOMÁTICA DE PROJETOS ---
        let migrationNeeded = false;
        (this.data.projects || []).forEach(p => {
            // 1. Migra 'name' para 'nomeDoSítio'
            if (p.name && p.nomeDoSítio === undefined) {
                p.nomeDoSítio = p.name;
                delete p.name;
                migrationNeeded = true;
            }
            // 2. Adiciona novos campos se não existirem (para projetos antigos)
            if (p.instituicao === undefined) p.instituicao = "";
            if (p.departamento === undefined) p.departamento = "";
            if (p.responsavel === undefined) p.responsavel = "";
            if (p.outrasDesignacoes === undefined) p.outrasDesignacoes = "";
            if (p.autorizacao === undefined) p.autorizacao = false; // Checkbox (boolean)
            if (p.instituicaoResponsavel === undefined) p.instituicaoResponsavel = "";
            if (p.anosIntervencao === undefined) p.anosIntervencao = "";
            if (p.usoAtual === undefined) p.usoAtual = "";
        });

        if (migrationNeeded) {
            console.log("DB: Migração de projetos (name -> nomeDoSítio) e adição de novos campos concluída.");
            this._save(); // Salva os projetos migrados
        }
        // --- FIM DA MIGRAÇÃO ---
    }

    _save() {
        localStorage.setItem('db_users', JSON.stringify(this.data.users));
        localStorage.setItem('db_projects', JSON.stringify(this.data.projects));
        localStorage.setItem('db_logs', JSON.stringify(this.data.logs));
        localStorage.setItem('db_vocabulary', JSON.stringify(this.data.vocabulary));
        localStorage.setItem('db_photos', JSON.stringify(this.data.photos));
        localStorage.setItem('db_mapPoints', JSON.stringify(this.data.mapPoints));
    }
    // --- USER ---
    register(username, email, password) {
        if (this.data.users.some(u => u.email === email)) {
            return { success: false, message: "E-mail já cadastrado." };
        }
        const newUser = { 
            id: `u${Date.now()}`, 
            username, 
            email, 
            password,
            profilePic: 'https://i.pravatar.cc/150?u=' + email // Foto de avatar padrão
        };
        this.data.users.push(newUser);
        this._save();
        return { success: true, user: newUser };
    }

    login(email, password) {
        const user = this.data.users.find(u => u.email === email && u.password === password);
        if (user) {
            // Garante que o usuário logado tem o campo profilePic
             if (!user.profilePic) {
                 user.profilePic = 'https://i.pravatar.cc/150?u=' + user.email;
                 this._save(); // Salva a adição da foto padrão
             }
            return { success: true, user: user };
        }
        return { success: false, message: "E-mail ou senha inválidos." };
    }

    updateUser(userId, data) {
        const user = this.data.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, message: "Usuário não encontrado." };
        }
        if (data.email && data.email !== user.email) {
            if (this.data.users.some(u => u.email === data.email && u.id !== userId)) {
                return { success: false, message: "Este e-mail já está em uso." };
            }
        }
        user.username = data.username || user.username;
        user.email = data.email || user.email;
        this._save();
        // Retorna uma cópia do usuário atualizado para evitar mutações inesperadas
        return { success: true, user: { ...user } };
    }

    updatePassword(userId, oldPassword, newPassword) {
        const user = this.data.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, message: "Usuário não encontrado." };
        }
        if (user.password !== oldPassword) {
            return { success: false, message: "Senha antiga incorreta." };
        }
        user.password = newPassword;
        this._save();
        return { success: true };
    }

    updateProfilePic(userId, newPicUrl) {
        const user = this.data.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, message: "Usuário não encontrado." };
        }
        user.profilePic = newPicUrl; // Agora pode ser uma Data URL
        this._save();
        // Retorna uma cópia do usuário atualizado
        return { success: true, user: { ...user } };
    }

// --- PROJECTS ---
    getProjects(userId) {
        if (!userId) return [];
        return this.data.projects.filter(p => p.userId === userId);
    }

    // MODIFICADO: createProject agora aceita 'nomeDoSítio' e inicializa os outros campos
    createProject(userId, nomeDoSítio) {
        if (!userId || !nomeDoSítio) return null;
        const user = this.data.users.find(u => u.id === userId);
        if (!user) return null;

        const newProject = {
            id: `p${Date.now()}`,
            userId: userId, 
            createdAt: new Date().toISOString(),
            
            // --- CAMPOS DA FICHA DO SÍTIO (INICIALIZADOS) ---
            nomeDoSítio: nomeDoSítio,
            instituicao: "",
            departamento: "",
            responsavel: "",
            outrasDesignacoes: "",
            autorizacao: false, // Default para o checkbox
            instituicaoResponsavel: "",
            anosIntervencao: "",
            usoAtual: ""
            // --- FIM DOS NOVOS CAMPOS ---
        };
        this.data.projects.push(newProject);
        this._save();
        return newProject;
    }

    getProjectDetails(projectId) {
        return this.data.projects.find(p => p.id === projectId) || null;
    }

    // MODIFICADO: getProjectNameById agora usa 'nomeDoSítio'
    getProjectNameById(projectId) {
        const project = this.data.projects.find(p => p.id === projectId);
        // Fallback para 'name' caso a migração falhe, mas 'nomeDoSítio' é o principal
        return project ? (project.nomeDoSítio || project.name || 'Projeto Desconhecido') : 'Projeto Desconhecido';
    }

    deleteProject(projectId) {
        const initialProjectCount = this.data.projects.length;
        
        // Remove o projeto da lista de projetos
        this.data.projects = this.data.projects.filter(p => p.id !== projectId);
        
        // Verifica se algum projeto foi removido (segurança)
        if (this.data.projects.length === initialProjectCount) {
            console.warn(`Projeto com ID ${projectId} não encontrado para exclusão.`);
            return false; // Projeto não encontrado
        }

        // Remove logs associados
        this.data.logs = this.data.logs.filter(log => log.projectId !== projectId);
        
        // Remove fotos associadas
        this.data.photos = this.data.photos.filter(photo => photo.projectId !== projectId);
        
        // Remove pontos de mapa associados
        this.data.mapPoints = this.data.mapPoints.filter(point => point.projectId !== projectId);

        this._save(); // Salva todas as alterações
        console.log(`Projeto ${projectId} e dados associados removidos.`);
        return true; // Exclusão bem-sucedida
    }

    // --- NOVA FUNÇÃO: updateProjectDetails ---
    /**
     * Atualiza os campos de metadados (Ficha do Sítio) de um projeto.
     * @param {string} projectId O ID do projeto.
     * @param {object} details Um objeto contendo os 10 campos (nomeDoSítio, instituicao, etc.)
     * @returns {boolean} True se foi salvo com sucesso.
     */
    updateProjectDetails(projectId, details) {
        const project = this.data.projects.find(p => p.id === projectId);
        if (!project) {
            console.error(`Projeto ${projectId} não encontrado para atualizar.`);
            return false;
        }
        
        // Atualiza todos os 10 campos
        project.nomeDoSítio = details.nomeDoSítio || project.nomeDoSítio; // Garante que não salve undefined
        project.instituicao = details.instituicao || "";
        project.departamento = details.departamento || "";
        project.responsavel = details.responsavel || "";
        project.outrasDesignacoes = details.outrasDesignacoes || "";
        project.autorizacao = details.autorizacao || false; // boolean
        project.instituicaoResponsavel = details.instituicaoResponsavel || "";
        project.anosIntervencao = details.anosIntervencao || "";
        project.usoAtual = details.usoAtual || "";
        
        this._save();
        
        // Atualiza o currentProject no localStorage se for o mesmo projeto
        const currentProjectLS = JSON.parse(localStorage.getItem('currentProject'));
        if (currentProjectLS && currentProjectLS.id === projectId) {
             localStorage.setItem('currentProject', JSON.stringify(project));
             // Atualiza a variável global (se usada, embora auth.js a defina)
             if (typeof currentProject !== 'undefined') {
                 currentProject = project;
             }
        }
        
        return true;
    }
    // --- FIM DA NOVA FUNÇÃO ---

    // --- LOGS ---
    saveLog(projectId, logData) {
        if (!projectId) return null;
        const newLog = { 
            id: `l${Date.now()}`, 
            projectId, 
            ...logData 
        };
        this.data.logs.push(newLog);
        
        // Se o log tiver lat/lon, salva também no mapa
        if (logData.lat && logData.lon) {
            const projectName = this.getProjectNameById(projectId);
            this.addMapPoint(projectId, projectName, logData);
        }
        this._save();
        return newLog;
    }

    getLogs(projectId) {
        if (!projectId) return [];
        return this.data.logs.filter(log => log.projectId === projectId);
    }

    // --- VOCABULARY ---
    getVocabulary() {
        // Garante que retorna arrays mesmo se estiverem vazios ou nulos
        return {
            artifacts: this.data.vocabulary?.artifacts || [],
            layers: this.data.vocabulary?.layers || []
        };
    }

    addVocabularyTerm(term, type) {
        // Garante que as listas existem
        if (!this.data.vocabulary.artifacts) this.data.vocabulary.artifacts = [];
        if (!this.data.vocabulary.layers) this.data.vocabulary.layers = [];

        const list = this.data.vocabulary[type]; // 'artifacts' or 'layers'
        if (list && !list.includes(term)) {
            list.push(term);
            this._save();
            return { success: true };
        }
        return { success: false, message: "Termo já existe ou tipo é inválido." };
    }

    removeVocabularyTerm(term, type) {
        const list = this.data.vocabulary[type];
        if (list) {
            this.data.vocabulary[type] = list.filter(t => t !== term);
            this._save();
        }
    }
    
    // --- PHOTOS ---
    // Modificado para aceitar nome do projeto e URL como Data URL
    addPhoto(projectId, projectName, url, caption, date) {
        if (!projectId || !url) return null;
        const newPhoto = { 
            id: `ph${Date.now()}`, 
            projectId, 
            projectName: projectName || 'Projeto Desconhecido', // Nome do projeto adicionado
            url, // Será o Data URL
            caption: caption || 'Sem legenda', 
            date: date || new Date().toISOString()
        };
        this.data.photos.push(newPhoto);
        this._save();
        return newPhoto; // Retorna a foto adicionada
    }
    
    getPhotos(projectId = null) {
        // Se um projectId for fornecido, retorna fotos apenas desse projeto
        if (projectId) {
            return this.data.photos.filter(p => p.projectId === projectId);
        }
        // Se nenhum projectId for fornecido, retorna fotos de TODOS os projetos do usuário logado
        const userProjectIds = this.getProjects(currentUser?.id).map(p => p.id);
        if (!userProjectIds || userProjectIds.length === 0) return [];
        return this.data.photos.filter(p => userProjectIds.includes(p.projectId));
    }
    
    // --- MAP POINTS ---
    addMapPoint(projectId, projectName, logData) {
        if (!projectId || !logData.lat || !logData.lon) return;
        const newPoint = {
            id: `mp${Date.now()}`,
            projectId,
            projectName: projectName || 'Projeto Desconhecido',
            lat: logData.lat,
            lon: logData.lon,
            artifact: logData.artifact || 'Ponto',
            notes: logData.notes || ''
        };
        this.data.mapPoints.push(newPoint);
        this._save();
    }
    
    getMapPoints(projectId = null) {
        // Se um projectId for fornecido, retorna pontos apenas desse projeto
        if (projectId) {
            return this.data.mapPoints.filter(p => p.projectId === projectId);
        }
        // Se nenhum projectId for fornecido, retorna pontos de TODOS os projetos do usuário logado
        const userProjectIds = this.getProjects(currentUser?.id).map(p => p.id);
        if (!userProjectIds || userProjectIds.length === 0) return [];
        return this.data.mapPoints.filter(p => userProjectIds.includes(p.projectId));
    }
    
   // --- DEFAULT DATA ---
    initDefaultData() {
        if (this.data.users.length === 0) {
            console.log("DB: Inicializando dados padrão (usuário teste@teste.com)...");
            this.register("Usuário Teste", "teste@teste.com", "123");
        }
        if (this.data.vocabulary.artifacts.length === 0) {
            this.addVocabularyTerm("Cerâmica", "artifacts");
            this.addVocabularyTerm("Lítico", "artifacts");
        }
        if (this.data.vocabulary.layers.length === 0) {
            this.addVocabularyTerm("Camada 1 - Superficial", "layers");
            this.addVocabularyTerm("Camada 2 - Escura", "layers");
        }
    }
}

// Instancia o DB globalmente
const db = new FakeDB();
// Opcional: Garante dados iniciais se o localStorage estiver vazio
db.initDefaultData();