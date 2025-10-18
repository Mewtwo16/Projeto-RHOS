/*
    Renderer do Menu
        Funções do Menu
 */

(function() {
    const dropdowns = document.querySelectorAll('.dropdown');

    function fecharTodosOsDropdowns() {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('menu-aberto');
            const link = dropdown.querySelector('a[aria-haspopup="true"]');
            if (link) { 
                link.setAttribute('aria-expanded', 'false');
            }
        });
    }

    dropdowns.forEach(dropdown => {
        const linkPrincipal = dropdown.querySelector('a'); 

        linkPrincipal.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const estaAberto = dropdown.classList.contains('menu-aberto');
            
            fecharTodosOsDropdowns();

            if (!estaAberto) {
                dropdown.classList.add('menu-aberto');
                linkPrincipal.setAttribute('aria-expanded', 'true');
            }
        });
    });

    window.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown')) {
            fecharTodosOsDropdowns();
        }
    });


})();

document.addEventListener('DOMContentLoaded', () => {
    const linkCadastro = document.getElementById('link-cadastro-usuarios');
    const linkLogs = document.getElementById('link-logs');

    if (linkCadastro) {
        linkCadastro.addEventListener('click', (event) => {
            event.preventDefault(); 
            abrirOuAtivarAba('CadastroUsuarios/usuarios', 'Cadastro de Usuários');
        });
    }

    if (linkLogs) {
        linkLogs.addEventListener('click', (event) => {
            event.preventDefault();
            abrirOuAtivarAba('Logs/logs', 'Logs de Ações');
        });
    }
});

const abasAbertas = new Map();

async function abrirOuAtivarAba(caminho, titulo) {
    const barraAbas = document.getElementById('barra-abas');
    const areaConteudo = document.getElementById('area-conteudo');
    
    const logoFundo = document.querySelector('.logo-fundo');
    if (logoFundo) logoFundo.style.display = 'none';

    document.querySelectorAll('.tab-button.ativo').forEach(btn => btn.classList.remove('ativo'));
    document.querySelectorAll('.tab-content.visivel').forEach(div => div.classList.remove('visivel'));

    if (abasAbertas.has(caminho)) {
        const { aba, conteudo } = abasAbertas.get(caminho);
        aba.classList.add('ativo');
        conteudo.classList.add('visivel');
        return;
    }

    const aba = document.createElement('button');
    aba.className = 'tab-button ativo';
    const tituloSpan = document.createElement('span');
    tituloSpan.textContent = titulo;
    tituloSpan.className = 'tab-title';
    aba.appendChild(tituloSpan);

    const fechar = document.createElement('button');
    fechar.className = 'fechar-aba';
    fechar.setAttribute('aria-label', `Fechar aba ${titulo}`);
    fechar.innerHTML = '&times;';
    fechar.onclick = (e) => {
        e.stopPropagation();
        fecharAba(caminho);
    };
    aba.appendChild(fechar);

    const conteudo = document.createElement('div');
    conteudo.className = 'tab-content visivel';

    barraAbas.appendChild(aba);
    areaConteudo.appendChild(conteudo);
    
    abasAbertas.set(caminho, { aba, conteudo });

    aba.addEventListener('click', () => abrirOuAtivarAba(caminho, titulo));

    setTimeout(() => aba.scrollIntoView({ inline: 'start', behavior: 'smooth' }), 50);

    try {
        const response = await window.api.getPage(caminho);
        if (response.success) {
            conteudo.innerHTML = '';
            const pageBody = document.createElement('div');
            pageBody.className = 'tab-page-body';
            pageBody.innerHTML = response.content;
            conteudo.appendChild(pageBody);

            const scriptSrc = `../${caminho}.js`;
            if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
                const script = document.createElement('script');
                script.src = scriptSrc;
                script.defer = true;
                document.body.appendChild(script);
            }
        } else {
            conteudo.innerHTML = `<p>Erro ao carregar conteúdo.</p>`;
        }
    } catch (err) {
        console.error('Erro ao buscar página:', err);
        conteudo.innerHTML = `<p>Erro ao carregar conteúdo.</p>`;
    }
}

function fecharAba(caminho) {
    if (!abasAbertas.has(caminho)) return;

    const { aba, conteudo } = abasAbertas.get(caminho);
    aba.remove();
    conteudo.remove();
    abasAbertas.delete(caminho);

    const chaves = Array.from(abasAbertas.keys());
    if (chaves.length > 0) {
        abrirOuAtivarAba(chaves[chaves.length - 1], abasAbertas.get(chaves[chaves.length - 1]).aba.textContent.replace(' 🗙', ''));
    } else {
        const logoFundo = document.querySelector('.logo-fundo');
        if (logoFundo) logoFundo.style.display = 'block';
    }
}