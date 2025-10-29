// js/home.js (COMPLETO E CORRIGIDO)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Verificação de Autenticação para a Home ---
    // CORREÇÃO CRÍTICA: Diz ao checkAuth que esta é a página 'home'.
    checkAuth('home'); 

    // --- Scroll Suave para Links Âncora ---
    // Seleciona todos os links DENTRO DO MAIN que começam com #
    document.querySelectorAll('main a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Impede o salto padrão
            const targetId = this.getAttribute('href');
            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Calcula a posição do header (se for fixo) para descontar no scroll
                    const headerOffset = document.querySelector('.home-header')?.offsetHeight || 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 20; // -20 para margem extra

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth" // Animação de scroll
                    });

                } else {
                    console.warn(`Elemento alvo para scroll não encontrado: ${targetId}`);
                }
            } catch (error) {
                 console.error(`Erro ao tentar fazer scroll para ${targetId}:`, error);
            }
        });
    });

}); // Fim do DOMContentLoaded