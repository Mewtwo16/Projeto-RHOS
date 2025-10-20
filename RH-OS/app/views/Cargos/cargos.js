const form = document.getElementById('form_cargo');

if(form){
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cargo = Cargo.criar();

        if(cargo){
            console.log('Cargo criado com sucesso')
            const dados = cargo.getDados();
            const resposta = await window.api.addRole(dados);
            if(resposta.success){
                console.log(resposta.message);
            } else{
                console.log(resposta.message);
            }
        }else {
                console.error('FORMULÁRIO INVÁLIDO!');
            }

    })
}

class Cargo{
    #cargo
    #descricao

    constructor(dadosCargo){
        this.#cargo = dadosCargo.cargo;
        this.#descricao = dadosCargo.descricao;
    }

    static criar(){
        const formInputs = {
            cargo: document.getElementById('cargo'),
            descricao: document.getElementById('descricao')
        }

        console.log('Recebido objeto cargo', formInputs)

        for (const input of Object.values(formInputs)) {
                this.#limpaErro(input);
            }

        const inputOK = this.#validaVazio(formInputs);

        if(inputOK){
            const dadosCargo = {
                cargo: formInputs.cargo.value,
                descricao: formInputs.descricao.value
            }
            return new Cargo(dadosCargo);
        }
    }

    static #limpaErro(inputElement) {
            inputElement.classList.remove('bad');
        }

    static #mostraErro(campo, msg) {
            campo.classList.add('bad');
            console.error(msg);
        }

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

    getDados() {
            return {
                cargo: this.#cargo,
                descricao: this.#descricao
            };
        }

}

