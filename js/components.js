// js/components.js (COMPLETO E CORRIGIDO)

// --- 1. HTML DOS COMPONENTES (COMO STRINGS) ---
// .. será substituído por '.' (na raiz) ou '..' (na pasta /html/)
const menuHTML = `
<div id="close-menu-button" class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>

<div class="relative z-10 w-64 h-full bg-brand-parchment p-6 space-y-4">
    <a class="flex items-center space-x-2 pb-4 border-b border-brand-brown-medium/20">
        <img src="../Images/logo.png" alt="Logo ArqNote" class="h-10 w-10 rounded-lg object-cover border-2 border-brand-brown-dark/50">
        <h2 class="text-2xl font-bold text-brand-brown-dark">ArqNote</h2>
    </a>
    
    <nav class="flex flex-col space-y-2 pt-2">
    <a href="../index.html" id="menu-link-home" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-brand-parchment-darker text-brand-brown-medium"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Home</span>
        </a>
        <a href="../html/projetosCriados.html" id="menu-link-projects" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-brand-parchment-darker text-brand-brown-medium"> 
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            <span>Meus Projetos</span>
        </a>
        <a href="../html/fotos.html" id="menu-link-photos" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-brand-parchment-darker text-brand-brown-medium"> 
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-camera"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>Fotos</span>
        </a>
        <a href="../html/mapa.html" id="menu-link-map" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-brand-parchment-darker text-brand-brown-medium"> 
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>Mapa</span>
        </a>
        <a href="../html/perfil.html" id="menu-link-profile" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-brand-parchment-darker text-brand-brown-medium"> 
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Perfil</span>
        </a>
    </nav>
    <div class="absolute bottom-6 left-6 right-6">
        <a href="#" id="menu-link-logout" class="flex items-center space-x-3 p-2 rounded-lg hover:bg-brand-parchment-darker text-brand-brown-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Sair</span>
        </a>
    </div>
</div>
`;

const toastHTML = `
<div class="flex items-center">
    <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-brand-beige-light bg-brand-brown-dark rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    </div>
    <div id="toast-message" class="ms-3 text-sm font-bold">Mensagem aqui.</div>
</div>
`;


// --- 2. LÓGICA DOS COMPONENTES ---

function showToast(message) {
    const toast = document.getElementById('toast-placeholder'); 
    const toastMessage = document.getElementById('toast-message'); 
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.remove('hidden', 'opacity-0', 'translate-y-4');
        toast.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-4');
            toast.classList.remove('opacity-100', 'translate-y-0');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
    } else {
        console.warn("Elemento Toast ou span de mensagem não encontrado. Mensagem:", message);
        alert(message);
    }
}

function togglePasswordVisibility(inputId, iconId, iconOffId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId); 
    const iconOff = document.getElementById(iconOffId); 
    if (input && icon && iconOff) {
        if (input.type === "password") {
            input.type = "text";
            icon.classList.add('hidden'); 
            iconOff.classList.remove('hidden'); 
        } else {
            input.type = "password";
            icon.classList.remove('hidden'); 
            iconOff.classList.add('hidden'); 
        }
    } else {
        console.error(`Elementos de toggle de senha não encontrados: input=${inputId}, icon=${iconId}, iconOff=${iconOffId}`);
    }
}

function initMenuListeners() {
    const menuModal = document.getElementById('menu-placeholder'); 
    const closeMenuButton = document.getElementById('close-menu-button'); 
    const openMenuButtons = document.querySelectorAll('.open-menu-btn'); 

    if (!menuModal || !closeMenuButton || openMenuButtons.length === 0) {
        if (!document.getElementById('login-screen') && !document.getElementById('register-screen')) {
             if (!document.querySelector('body[data-page="home"]')) { 
                 console.error("Elementos do menu não encontrados. O menu não funcionará.");
             }
        }
        return; 
    }

    openMenuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            menuModal.classList.remove('hidden'); 
        });
    });

    closeMenuButton.addEventListener('click', () => {
        menuModal.classList.add('hidden'); 
    });

    document.getElementById('menu-link-logout')?.addEventListener('click', (e) => {
        e.preventDefault(); 
        if (typeof handleLogout === 'function') {
            handleLogout(); 
        } else {
            console.error("Função handleLogout não definida.");
        }
    });
}

/**
 * Destaca o link ativo no menu INTERNO.
 */
function highlightActiveMenu() {
    const pageMap = {
        'projetosCriados.html': 'menu-link-projects', 
        'projeto.html': 'menu-link-projects', 
        'perfil.html': 'menu-link-profile',     
        'fotos.html': 'menu-link-photos',      
        'mapa.html': 'menu-link-map',         
    };
    const currentPageFilename = window.location.pathname.split('/').pop(); 
    const currentPageOrDefault = currentPageFilename || 'projetosCriados.html'; 
    const activeLinkId = pageMap[currentPageOrDefault]; 

    if (activeLinkId) {
        const activeLink = document.getElementById(activeLinkId);
        if (activeLink) {
            activeLink.classList.remove('hover:bg-brand-parchment-darker', 'text-brand-brown-medium');
            activeLink.classList.add('bg-brand-parchment-darker', 'text-brand-brown-dark', 'font-bold');
        } else {
             console.warn(`Link de menu ativo interno não encontrado para ID: ${activeLinkId}`);
        }
    }
}

// --- 3. EXECUÇÃO ---

function loadComponents() {
    const menuPlaceholder = document.getElementById('menu-placeholder');
    const toastPlaceholder = document.getElementById('toast-placeholder');

    if (menuPlaceholder) {
        const currentPath = window.location.pathname;
        let rootPath = "."; 
        if (currentPath.includes('/html/')) {
            rootPath = ".."; 
        }
        
        const adjustedHTML = menuHTML.replace(/\{\{ROOT\}\}/g, rootPath);
        
        menuPlaceholder.innerHTML = adjustedHTML;
        
        initMenuListeners(); 
        highlightActiveMenu();
    }
    
    if (toastPlaceholder) {
        toastPlaceholder.innerHTML = toastHTML;
    }
}

document.addEventListener('DOMContentLoaded', loadComponents);