// js/cadastro.js (COMPLETO E CORRIGIDO para nova estrutura)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verifica autenticação (redireciona para projetosCriados.html se já logado)
    checkAuth('cadastro'); // Função de js/auth.js

    // 2. Adiciona listeners específicos da página
    const registerButton = document.getElementById('register-button');
    const backToLoginButton = document.getElementById('back-to-login-button');
    const togglePasswordButton = document.getElementById('toggle-register-password');
    const toggleConfirmPasswordButton = document.getElementById('toggle-register-confirm-password');

    if (registerButton) {
        registerButton.addEventListener('click', handleRegister);
    } else {
        console.error("Botão de registro não encontrado.");
    }
    
    if (backToLoginButton) {
        backToLoginButton.addEventListener('click', () => {
            window.location.href = 'login.html'; // CORRIGIDO: Ainda dentro de html/, não precisa ../
        });
    } else {
        console.error("Botão 'Voltar para login' não encontrado.");
    }
    
    // Listener para o olho da senha principal
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', () => {
            // togglePasswordVisibility é definido em js/components.js
            togglePasswordVisibility(
                'register-password-input', 
                'toggle-register-password-icon', 
                'toggle-register-password-icon-off'
            );
        });
    } else {
        console.error("Botão de visualização de senha do registro não encontrado.");
    }
    
    // Listener para o olho da confirmação de senha
    if (toggleConfirmPasswordButton) {
        toggleConfirmPasswordButton.addEventListener('click', () => {
            // togglePasswordVisibility é definido em js/components.js
            togglePasswordVisibility(
                'register-confirm-password', 
                'toggle-register-confirm-password-icon', 
                'toggle-register-confirm-password-icon-off'
            );
        });
    } else {
         console.error("Botão de visualização de confirmação de senha não encontrado.");
    }
});

/**
 * Lida com a tentativa de registro.
 */
function handleRegister() {
    const usernameInput = document.getElementById('register-username');
    const emailInput = document.getElementById('register-email-input');
    const passwordInput = document.getElementById('register-password-input');
    const confirmPasswordInput = document.getElementById('register-confirm-password');

    if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
         console.error("Inputs de registro não encontrados.");
         showToast("Erro ao tentar registrar. Tente recarregar a página.");
         return;
    }

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // --- VALIDAÇÃO ---
    if (!username || !email || !password || !confirmPassword) {
        showToast("Por favor, preencha todos os campos.");
        return; 
    }
    if (password !== confirmPassword) {
        showToast("As senhas não coincidem.");
        return; 
    }
    if (password.length < 3) { 
        showToast("A senha deve ter pelo menos 3 caracteres.");
        return;
    }

    // Chama a função de registro do db.js
    const result = db.register(username, email, password);

    if (result.success) {
        showToast("Cadastro realizado com sucesso! Redirecionando para login...");
        setTimeout(() => {
            window.location.href = 'login.html'; // CORRIGIDO: Redireciona para login.html dentro da pasta html/
        }, 1000); 
    } else {
        showToast(result.message || "Erro ao registrar. Tente novamente."); 
    }
}