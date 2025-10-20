// Script da página de Logs
// Observação: este script pode ser injetado dinamicamente após a página já
// estar carregada. Portanto, não dependemos de DOMContentLoaded.
const list = document.getElementById('lista-logs');
const btnSearch = document.getElementById('buscar-logs');
const raw = document.getElementById('logs-raw');

if (list) {
  function renderLogItem(r) {
  const item = document.createElement('div');
  item.className = 'item-log';
    const when = new Date(r.created_at).toLocaleString();
    item.innerHTML = `
      <div class="meta-log"> <strong>${r.username || 'system'}</strong>  <span class="log-action">${r.action}</span>
      on <span class="log-resource">${r.resource || ''}</span> ${r.resource_id ? `#${r.resource_id}` : ''}
      <span class="log-time">${when}</span></div>
      <div class="detalhes-log">${r.details || ''}</div>
    `;
    return item;
  }

// Busca logs via preload e renderiza a lista
async function loadLogs() {
  list.innerHTML = '<p>Carregando logs...</p>';
  try {
  const res = await window.api.getLogs(200);
  if (raw) raw.textContent = JSON.stringify(res, null, 2);
    if (!res || !res.success) {
      list.innerHTML = `<p>Erro ao carregar logs: ${res?.error || res?.message || 'desconhecido'}</p>`;
      return;
    }

    const rows = res.data || [];
    if (rows.length === 0) {
      list.innerHTML = '<p>Nenhum log encontrado.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    rows.forEach(r => {
      const item = renderLogItem(r);
      fragment.appendChild(item);
    });
    list.innerHTML = '';
    list.appendChild(fragment);
  } catch (err) {
    list.innerHTML = `<p>Erro ao carregar logs: ${String(err)}</p>`;
  }
}

  if (btnSearch) {
    btnSearch.addEventListener('click', () => loadLogs());
  }

  window.addEventListener('beforeunload', () => {
    if (typeof unsubscribe === 'function') unsubscribe();
    if (typeof unsubNew === 'function') unsubNew();
  });
}
