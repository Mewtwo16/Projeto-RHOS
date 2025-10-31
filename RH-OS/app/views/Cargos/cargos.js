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

// --- Pesquisa integrada no campo "Cargo" ---
(function(){
    // Escopar os seletores ao formulário para evitar conflito de IDs entre abas
    const root = document.getElementById('form_cargo');
    if (!root) return;
    const cargoInput = root.querySelector('#cargo');
    const descInput = root.querySelector('#descricao');
    const lista = root.querySelector('#lista_cargo_sugestoes');
    const btnPesquisarCargo = root.querySelector('#btn_pesquisar_cargo');
    const btnLimparCargo = root.querySelector('#btn_limpar_cargo');

    function hide(){ if (lista) lista.style.display='none'; }
    function clear(){ if (lista) lista.innerHTML=''; }
    function render(rows){
        clear();
        if(!rows || rows.length===0) { hide(); return; }
        rows.forEach(r=>{
            const li = document.createElement('li');
            li.style.padding='8px 10px';
            li.style.cursor='pointer';
            li.style.borderBottom='1px solid #eee';
            li.textContent = `${r.role_name ?? ''} — ${r.description ?? ''}`;
            li.addEventListener('click', ()=>{
                cargoInput.value = r.role_name || '';
                descInput.value = r.description || '';
                hide();
            });
            li.addEventListener('mouseenter', ()=> li.style.background='#f7f7f7');
            li.addEventListener('mouseleave', ()=> li.style.background='#fff');
            lista.appendChild(li);
        });
        lista.style.display='block';
    }

    async function executarPesquisaCargo(){
        const term = (cargoInput?.value||'').trim();
        if(!term || term.length<1){ hide(); return; }
        const res = await window.api.searchRoles({ field: 'role_name', value: term });
        if(!res || !res.success){ hide(); return; }
        const rows = res.data || [];
        // Se houver apenas um resultado, preenche direto mesmo que parcial
        if (rows.length === 1) {
            cargoInput.value = rows[0].role_name || '';
            descInput.value = rows[0].description || '';
            hide();
            return;
        }
        // Caso contrário, mostra lista
        render(rows.slice(0,20));
    }

    if(cargoInput && lista){
        if (btnPesquisarCargo) btnPesquisarCargo.addEventListener('click', executarPesquisaCargo);
        if (btnLimparCargo) btnLimparCargo.addEventListener('click', ()=>{
            const idInput = root.querySelector('#id');
            if (idInput) idInput.value = '';
            cargoInput.value='';
            descInput.value='';
            clear(); hide();
        });
        cargoInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); executarPesquisaCargo(); }});
        document.addEventListener('click', (e)=>{
            // Fecha lista se clicar fora do container de sugestões ou do input do cargo dentro deste formulário
            if(!e.target.closest('#lista_cargo_sugestoes') && !e.target.closest('#cargo')) hide();
        });
    }
})();

