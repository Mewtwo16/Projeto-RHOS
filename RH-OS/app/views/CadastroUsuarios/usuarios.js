/*
        Renderer de usuários
        - Responsável por validar o formulário de cadastro e, em caso de sucesso,
            enviar os dados ao backend via preload (window.api.addUser).
*/

(function () {

    async function carregarCargos() {
        try {
            const res = await window.api.getAllRoles();
            if (!res || !res.success) return;
            const select = document.getElementById('cargo');
            if (!select) return;
            const placeholder = select.querySelector('option[value=""]');
            select.innerHTML = '';
            if (placeholder) select.appendChild(placeholder);

            (res.data || []).forEach(role => {
                const opt = document.createElement('option');
                opt.value = role.role_name;
                opt.textContent = role.role_name;
                select.appendChild(opt);
            });
        } catch (err) {
            console.error('Falha ao carregar cargos:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', carregarCargos);
    } else {
        carregarCargos();
    }

    const form = document.getElementById('form_usuario');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formulario = Formulario.criar();

            if (formulario) {
                console.log('FORMULÁRIO VÁLIDO! Objeto criado:', formulario.getDados());
                const dados = formulario.getDados();
                const resposta = await window.api.addUser(dados);

                if(resposta.success){
                    console.log(resposta.message);
                }else{
                    console.log(resposta.message);
                }

            } else {
                console.error('FORMULÁRIO INVÁLIDO! Corrija os erros indicados.');
            }
        });
    }

    class Formulario {
        #nome_completo
        #email
        #cpf
        #dataNascimento
        #usuario
        #senha
        #cargo


        constructor(dadosUsuario) {
            this.#nome_completo = dadosUsuario.nome;
            this.#email = dadosUsuario.email;
            this.#cpf = dadosUsuario.cpf;
            this.#dataNascimento = dadosUsuario.dataNascimento;
            this.#usuario = dadosUsuario.usuario;
            this.#senha = dadosUsuario.senha;
            this.#cargo = dadosUsuario.cargo;
        }

    static criar() {
            const formInputs = {
                nomeInput: document.getElementById('nome'),
                emailInput: document.getElementById('email'),
                cpfInput: document.getElementById('cpf'),
                dataNascimentoInput: document.getElementById('dataNascimento'),
                usuarioInput: document.getElementById('usuario'),
                senhaInput: document.getElementById('senha'),
                senha_confirmaInput: document.getElementById('senha_confirma'),
                cargoInput: document.getElementById('cargo')
            }

            for (const input of Object.values(formInputs)) {
                this.#limpaErro(input);
            }

            const inputOK = this.#validaVazio(formInputs);
            const senhaOK = this.#validaSenha(formInputs.senhaInput, formInputs.senha_confirmaInput);
            const cpfOK = this.#validaCPF(formInputs.cpfInput);

            if (inputOK && senhaOK && cpfOK) {
                const dadosUsuario = {
                    nome: formInputs.nomeInput.value,
                    email: formInputs.emailInput.value,
                    cpf: formInputs.cpfInput.value.replace(/\D+/g, ''),
                    dataNascimento: formInputs.dataNascimentoInput.value,
                    cargo: formInputs.cargoInput.value,
                    usuario: formInputs.usuarioInput.value,
                    senha: formInputs.senhaInput.value
                };
                console.log('Formulario validado com suscesso')
                return new Formulario(dadosUsuario);
            }


        }

        // Remove marcação de erro visual do campo
        static #limpaErro(inputElement) {
            inputElement.classList.remove('bad');
        }

        // Aplica marcação de erro e loga mensagem no console (poderia exibir na UI)
        static #mostraErro(campo, msg) {
            campo.classList.add('bad');
            console.error(msg);
        }

        // Garante que nenhum campo obrigatório está vazio
        static #validaVazio(formInputs) {
            let eValido = true;
            const inputs = Object.values(formInputs);
            for (const input of inputs) {
                if (input.value.trim() === '') {
                    this.#mostraErro(input, `O campo ${input.id} não pode estar vazio.`);
                    eValido = false;
                }
            }
            return eValido;
        }

        // Verifica se senha e confirmação são iguais
        static #validaSenha(senhaInput, senha_confirmaInput) {
            if (senhaInput.value !== senha_confirmaInput.value) {
                this.#mostraErro(senhaInput, 'Senhas não concidem');
                this.#mostraErro(senha_confirmaInput, 'Senhas não concidem');
                return false
            }
            return true;
        }

        // Validação básica de CPF:
        //  - Remove caracteres não numéricos; verifica tamanho 11 e repetição;
        //  - Calcula os dois dígitos verificadores e compara com o informado.
        static #validaCPF(cpf) {
            let eValido = true;
            const cpfLimpo = String(cpf.value).replace(/\D+/g, '');
            if (cpfLimpo.length !== 11) {
                this.#mostraErro(cpf, `O campo ${cpf.id} deve ser preenchido corretamente`);
                eValido = false;
            };
            const primeiroDigito = cpfLimpo[0];
            if (cpfLimpo.split('').every(digito => digito === primeiroDigito)) {
                this.#mostraErro(cpf, `O campo ${cpf.id} deve ser preenchido corretamente`);
                eValido = false;
            }
            const cpfParcial = Array.from(cpfLimpo.slice(0, 9))
            const digito1 = this.#calculaDigitoVerificador(cpfParcial);
            cpfParcial.push(digito1)
            const digito2 = this.#calculaDigitoVerificador(cpfParcial);
            if (digito1 !== Number(cpfLimpo[9]) || digito2 !== Number(cpfLimpo[10])) {
                eValido = false;
            }

            return eValido;
        }

        // Cálculo do dígito verificador conforme regra do CPF
        static #calculaDigitoVerificador(cpfParcial) {
            const cpfArray = Array.from(cpfParcial).map(Number);
            let regressivo = cpfArray.length + 1;

            const soma = cpfArray.reduce((ac, val) => {
                ac += (regressivo * val);
                regressivo--;
                return ac;
            }, 0);

            const resultado = 11 - (soma % 11);

            return resultado > 9 ? 0 : resultado;
        }

        getDados() {
            return {
                nome_completo: this.#nome_completo,
                email: this.#email,
                cpf: this.#cpf,
                dataNascimento: this.#dataNascimento,
                usuario: this.#usuario,
                senha: this.#senha,
                cargo: this.#cargo,
            };
        }

    }; 


})();