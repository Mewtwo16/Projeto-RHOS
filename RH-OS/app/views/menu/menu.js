
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

})(); // <-- PARÊNTESES DE EXECUÇÃO ADICIONADOS