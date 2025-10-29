// js/login.js (COMPLETO E CORRIGIDO)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica autenticação (redireciona para projetosCriados.html se já logado)
    checkAuth('login'); // Informa que é a página de login

    // 2. Adiciona listeners
    const loginButton = document.getElementById('login-button');
    const goToRegisterButton = document.getElementById('go-to-register-button');
    const togglePasswordButton = document.getElementById('toggle-login-password');

    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    } else {
        console.error("Botão de login não encontrado.");
    }
    
    if (goToRegisterButton) {
        goToRegisterButton.addEventListener('click', () => {
            window.location.href = 'cadastro.html'; // Navega para cadastro (na mesma pasta html/)
        });
    } else {
        console.error("Botão 'Criar conta' não encontrado.");
    }

    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', () => {
            togglePasswordVisibility(
                'login-password-input', 
                'toggle-login-password-icon', 
                'toggle-login-password-icon-off'
            );
        });
    } else {
        console.error("Botão de visualização de senha do login não encontrado.");
    }
});

/**
 * Lida com a tentativa de login.
 */
function handleLogin() {
    const emailInput = document.getElementById('login-email-input');
    const passwordInput = document.getElementById('login-password-input');
    
    if (!emailInput || !passwordInput) {
        console.error("Inputs de email ou senha não encontrados.");
        showToast("Erro ao tentar fazer login. Tente recarregar a página.");
        return;
    }

    const email = emailInput.value.trim(); 
    const password = passwordInput.value; 

    if (!email || !password) {
        showToast("Por favor, preencha e-mail e senha.");
        return;
    }
    
    const result = db.login(email, password);

    if (result.success) {
        currentUser = result.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showToast("Login bem-sucedido! Redirecionando...");
        
        setTimeout(() => {
            // CORRIGIDO: Redireciona para a página de projetos (na mesma pasta html/)
            window.location.href = 'projetosCriados.html'; 
        }, 500); 

    } else {
        showToast(result.message || "E-mail ou senha inválidos."); 
    }
}