/*
    Renderer do login
        - Funções da tela de login
*/

(function () {

    document.addEventListener('DOMContentLoaded', () => {

        const usuarioInput = document.getElementById('usuario');
        const senhaInput = document.getElementById('senha');
        const loginButton = document.getElementById('btn-login');
        const mensagemErro = document.getElementById('mensagem-erro');

        if (loginButton) {
            loginButton.addEventListener('click', async (event) => {
                event.preventDefault();

                const usuario = usuarioInput.value;
                const senha = senhaInput.value;

                mensagemErro.textContent = '';

                if (!usuario || !senha) {
                    mensagemErro.textContent = 'Preencha todos os campos.';
                    return;
                }

                try {
                    const resposta = await window.api.submitLogin(usuario, senha);

                    if (!resposta.success) {
                        mensagemErro.textContent = resposta.message;
                    }
                } catch (error) {
                    console.error('Erro de comunicação IPC:', error);
                    mensagemErro.textContent = 'Erro fatal na comunicação.';
                }
            });
        }
    });
})();