// js/auth.js (COMPLETO E CORRIGIDO PARA O LOOP DA HOME)

// Estado global de autenticação, lido do localStorage
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentProject = JSON.parse(localStorage.getItem('currentProject')) || null; 

/**
 * Faz o logout do usuário, limpa o localStorage e redireciona para a home (index.html).
 */
function handleLogout() {
    currentUser = null;
    currentProject = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentProject');
    console.log("Logout successful. Redirecting to index.html..."); 
    window.location.href = '../index.html'; // CORRIGIDO: Volta para a raiz (index.html)
}

/**
 * Verifica se o usuário está autenticado e redireciona conforme necessário.
 * @param {string} pageType - O tipo da página atual ('login', 'cadastro', 'home', 'app').
 */
function checkAuth(pageType = 'app') {
    const loginAndRegisterPages = ['login', 'cadastro'];
    const isLoginOrRegister = loginAndRegisterPages.includes(pageType);
    const isHomePage = (pageType === 'home'); // Identifica a index.html (nova home)
    const isAppPage = !isLoginOrRegister && !isHomePage; // Páginas que exigem login (projetosCriados.html, etc.)

    // Logs para depuração
    // console.log(`checkAuth running: pageType=${pageType}, currentUser=${!!currentUser}, isAppPage=${isAppPage}, isHomePage=${isHomePage}`);

    if (currentUser) { 
        // --- CENÁRIO: USUÁRIO LOGADO ---
        if (isLoginOrRegister) {
            // Se logado e tentando acessar login/cadastro -> vai para o app
            // console.log("Auth: Logged in, on login/register, redirecting to projetosCriados.html.");
            window.location.href = 'projetosCriados.html'; 
        }
        // Se logado na home (index.html) ou app (projetosCriados.html), permite ficar.

    } else { 
        // --- CENÁRIO: USUÁRIO NÃO LOGADO ---

        // Se NÃO está logado E está na PÁGINA HOME (index.html) -> PERMITE FICAR
        if (isHomePage) {
            // console.log("Auth: Not logged in, on home page (index.html), allowing access.");
            return; // <<< PONTO CRÍTICO: SAI DA FUNÇÃO, EVITA O LOOP
        }
        
        // Se NÃO está logado E está numa PÁGINA DO APP -> REDIRECIONA PARA HOME
        if (isAppPage) {
            // console.log("Auth: Not logged in, on app page, redirecting to index.html.");
            // Estamos DENTRO da pasta html/, então precisamos voltar um nível (../)
            window.location.href = '../index.html'; // CORRIGIDO: Caminho para a raiz
        }
        // Se NÃO está logado e está em login/cadastro -> PERMITE FICAR (não faz nada).
    }
}