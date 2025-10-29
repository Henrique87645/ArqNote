// js/public-layout.js (COMPLETO E CORRIGIDO)

// --- 1. HTML DO CABEÇALHO PÚBLICO (COMO STRING com Placeholders) ---
// .. será substituído por '.' (na raiz) ou '..' (na pasta /html/)
const publicHeaderHTML = `
<header class="home-header sticky top-0 z-40 w-full bg-brand-parchment/80 backdrop-blur-sm shadow-sm">
    <div class="header-content max-w-5xl mx-auto flex items-center justify-between p-4 text-brand-brown-dark">
        <a href="../index.html" class="flex items-center space-x-3 flex-shrink-0"> <img src="../images/logo.png" alt="ArqNote Logo" class="h-10 w-10 rounded-lg object-cover border-2 border-brand-brown-dark/50"> <span class="text-xl font-bold text-brand-brown-dark">ArqNote</span>
        </a>

        <nav class="hidden md:flex items-center space-x-6 mx-auto"> 
            <a href="../index.html#apresentacao" class="nav-link" data-page="home">Apresentação</a> 
            <a href="../index.html#pesquisas" class="nav-link" data-page="home">Pesquisas</a>     
            <a href="../html/arqueologia.html" class="nav-link" data-page="arqueologia">Arqueologia</a> 
            <a href="../html/paleontologia.html" class="nav-link" data-page="paleontologia">Paleontologia</a> 
            <a href="../index.html#quem-somos" class="nav-link" data-page="home">Quem Somos</a>     
        </nav>

        <div class="hidden md:flex items-center space-x-3 flex-shrink-0"> 
            <a href="../html/login.html" class="btn btn-secondary">Login</a> 
            <a href="../html/cadastro.html" class="btn btn-primary">Cadastre-se</a> 
        </div>

        <button id="mobile-menu-button" class="md:hidden p-2 rounded-md hover:bg-brand-brown-dark/10 ml-auto"> 
            <svg id="menu-icon-open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <svg id="menu-icon-close" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hidden"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    </div>

    <div id="mobile-menu" class="hidden md:hidden bg-brand-parchment border-t border-brand-brown-medium/20">
        <nav class="flex flex-col p-4 space-y-3">
            <a href="../index.html#apresentacao" class="nav-link-mobile" data-page="home">Apresentação</a> 
            <a href="../index.html#pesquisas" class="nav-link-mobile" data-page="home">Pesquisas</a>     
            <a href="../html/arqueologia.html" class="nav-link-mobile" data-page="arqueologia">Arqueologia</a> 
            <a href="../html/paleontologia.html" class="nav-link-mobile" data-page="paleontologia">Paleontologia</a> 
            <a href="../html/quem-somos" class="nav-link-mobile" data-page="home">Quem Somos</a>     
            <hr class="border-brand-brown-medium/20 my-2"> 
            <a href="../html/login.html" class="btn btn-secondary w-full text-center">Login</a> 
            <a href="../html/cadastro.html" class="btn btn-primary w-full text-center">Cadastre-se</a> 
        </nav>
    </div>
</header>
`;


// --- 2. LÓGICA DO CABEÇALHO PÚBLICO ---

function initPublicMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const openIcon = document.getElementById('menu-icon-open');
    const closeIcon = document.getElementById('menu-icon-close');
    if (menuButton && mobileMenu && openIcon && closeIcon) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            openIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    mobileMenu.classList.add('hidden'); 
                    openIcon.classList.remove('hidden'); 
                    closeIcon.classList.add('hidden'); 
                }, 50); 
            });
        });
    } else {
        console.warn("Elementos do menu mobile público não encontrados.");
    }
}

function highlightPublicMenuActiveLink() {
    const bodyPage = document.body.dataset.page; 
    const currentPageFilename = window.location.pathname.split('/').pop(); 
    const currentPageName = bodyPage || currentPageFilename.replace('.html', '') || 'home'; 

    document.querySelectorAll('#header-placeholder nav.hidden.md\\:flex a.nav-link').forEach(link => {
        const linkPage = link.dataset.page; 
        const linkHrefFilename = (link.getAttribute('href') || '').split('/').pop().split('#')[0]; 
        if ((linkPage === 'home' && (currentPageName === 'home' || currentPageFilename === 'index.html')) || (linkPage !== 'home' && linkPage === currentPageName)) {
            link.classList.add('active'); 
        } else {
            link.classList.remove('active');
        }
    });

    document.querySelectorAll('#mobile-menu nav a.nav-link-mobile').forEach(link => {
        const linkPage = link.dataset.page;
        const linkHrefFilename = (link.getAttribute('href') || '').split('/').pop().split('#')[0];
         if ((linkPage === 'home' && (currentPageName === 'home' || currentPageFilename === 'index.html')) || (linkPage !== 'home' && linkPage === currentPageName)) {
             link.classList.add('active-mobile'); 
        } else {
             link.classList.remove('active-mobile');
        }
    });
}


// --- 3. EXECUÇÃO ---

function loadPublicLayout() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        
        // Determina o caminho raiz
        const currentPath = window.location.pathname;
        let rootPath = "."; // Assume que está na raiz (ex: index.html)
        if (currentPath.includes('/html/')) {
            rootPath = ".."; // Está numa subpasta (ex: html/arqueologia.html)
        }
        
        // Substitui TODOS os placeholders .. pelo caminho correto
        let adjustedHTML = publicHeaderHTML.replace(/\{\{ROOT\}\}/g, rootPath);
        
        // Ajuste fino para os links que estão na raiz (index.html)
        if(rootPath === ".") {
             adjustedHTML = adjustedHTML
                .replace(/href=".\/html\//g, 'href="html/')
                .replace(/href=".\/index.html/g, 'href="index.html')
                .replace(/src=".\/images\//g, 'src="images/');
        }

        headerPlaceholder.innerHTML = adjustedHTML; // Injeta o HTML AJUSTADO
        
        initPublicMobileMenu();
        highlightPublicMenuActiveLink();

    } else {
        console.error("Placeholder do cabeçalho público ('header-placeholder') não encontrado.");
    }
}

document.addEventListener('DOMContentLoaded', loadPublicLayout);