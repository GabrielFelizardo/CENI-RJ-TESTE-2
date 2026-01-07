/**
 * ============================================
 * CENI-RJ - Frontend API Client v1.2 (Search Fix)
 * ============================================
 */

// ============================================
// CONFIGURAÇÃO
// ============================================

const CENI_API = {
  // ⚠️ URL DO APPS SCRIPT
  URL: 'https://script.google.com/macros/s/AKfycbwsvOjSDjDINcjOz2O8qCXQIebL8XzWmKrbMHT7rmJDUjov2razcVPIGT3v7ne1jEw0jg/exec',
  
  // Mude para 1.2 para forçar a atualização no navegador dos usuários
  VERSION: '1.2', 

  CACHE_DURATION: 5 * 60 * 1000,
  
  CACHE_KEYS: {
    DOCUMENTOS: 'ceni_documentos_cache',
    EVENTOS: 'ceni_eventos_cache',
    TIMELINE: 'ceni_timeline_cache',
    TIMESTAMP: 'ceni_cache_timestamp',
    APP_VERSION: 'ceni_app_version'
  }
};

// ============================================
// CORE: BUSCA E CACHE
// ============================================

async function fetchCENIData(tipo = 'all') {
  try {
    verificarVersaoCache();
    const cached = getCachedData(tipo);
    if (cached) {
      console.log('✅ Dados do cache local');
      return cached;
    }
    
    console.log(`📥 Buscando dados: ${tipo}`);
    const url = `${CENI_API.URL}?tipo=${tipo}&t=${Date.now()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Erro desconhecido');
    
    saveCacheData(tipo, result.data);
    return result.data;
  } catch (error) {
    console.error('❌ Erro:', error);
    const oldCache = getCachedData(tipo, true);
    if (oldCache) return oldCache;
    throw error;
  }
}

function verificarVersaoCache() {
  const cachedVersion = localStorage.getItem(CENI_API.CACHE_KEYS.APP_VERSION);
  if (cachedVersion !== CENI_API.VERSION) {
    console.warn(`📦 Nova versão v${CENI_API.VERSION}. Limpando cache.`);
    limparCacheLocal();
    localStorage.setItem(CENI_API.CACHE_KEYS.APP_VERSION, CENI_API.VERSION);
  }
}

function getCachedData(tipo, ignoreExpiration = false) {
  try {
    const timestamp = localStorage.getItem(CENI_API.CACHE_KEYS.TIMESTAMP);
    if (!ignoreExpiration && timestamp && (Date.now() - parseInt(timestamp)) > CENI_API.CACHE_DURATION) {
      return null;
    }
    
    let key;
    if (tipo === 'documentos') key = CENI_API.CACHE_KEYS.DOCUMENTOS;
    else if (tipo === 'eventos') key = CENI_API.CACHE_KEYS.EVENTOS;
    else if (tipo === 'timeline') key = CENI_API.CACHE_KEYS.TIMELINE;
    
    if (key) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
    return null;
  } catch (e) { return null; }
}

function saveCacheData(tipo, data) {
  try {
    if (tipo === 'documentos') localStorage.setItem(CENI_API.CACHE_KEYS.DOCUMENTOS, JSON.stringify(data));
    else if (tipo === 'eventos') localStorage.setItem(CENI_API.CACHE_KEYS.EVENTOS, JSON.stringify(data));
    else if (tipo === 'timeline') localStorage.setItem(CENI_API.CACHE_KEYS.TIMELINE, JSON.stringify(data));
    
    localStorage.setItem(CENI_API.CACHE_KEYS.TIMESTAMP, Date.now().toString());
    localStorage.setItem(CENI_API.CACHE_KEYS.APP_VERSION, CENI_API.VERSION);
  } catch (e) { console.warn('Erro ao salvar cache', e); }
}

// ============================================
// RENDERIZAR DOCUMENTOS (COM SKELETONS & BUSCA)
// ============================================

async function renderizarDocumentos() {
  const container = document.getElementById('documentos-container');
  if (!container) return;
  
  // 1. Renderizar Skeleton Swiss Style
  const skeletonItem = `
    <li class="documento-item skeleton-loading">
      <div class="doc-number skeleton-box" style="width: 40px; height: 30px;"></div>
      <div class="doc-info" style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
         <div class="skeleton-box" style="width: 60%; height: 20px;"></div>
         <div class="skeleton-box" style="width: 30%; height: 14px;"></div>
      </div>
      <div class="skeleton-box" style="width: 140px; height: 45px;"></div>
    </li>
  `;
  
  const skeletonHTML = `
    <section class="categoria-section">
      <div class="categoria-header" style="border-color: #f0f0f0;">
         <div class="skeleton-box" style="width: 250px; height: 32px; margin-bottom: 1rem;"></div>
      </div>
      <ul class="documento-list">
         ${skeletonItem.repeat(3)}
      </ul>
    </section>
  `;
  
  container.innerHTML = skeletonHTML;
  
  try {
    const data = await fetchCENIData('documentos');
    const documentosData = data.documentos || data;
    
    if (!documentosData || documentosData.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum documento disponível</div>';
      return;
    }
    
    const porCategoria = data.porCategoria || agruparPorCategoria(documentosData);
    const categorias = {
      'institucionais': 'Documentos Institucionais',
      'atas': 'Atas de Reunião',
      'relatorios': 'Relatórios e Estudos',
      'materiais': 'Materiais de Apoio'
    };
    
    let html = '';
    
    for (const [key, nome] of Object.entries(categorias)) {
      const docs = porCategoria[key] || [];
      if (docs.length === 0) continue;
      
      // 'filter-group' é essencial para a busca esconder a seção inteira se necessário
      html += `
        <section class="categoria-section filter-group">
          <div class="categoria-header"><h2>${nome}</h2></div>
          <ul class="documento-list">
            ${docs.map((doc, i) => criarCardDocumento(doc, i + 1)).join('')}
          </ul>
        </section>
      `;
    }
    
    container.innerHTML = html || '<div class="empty-state">Nenhum documento disponível</div>';
    
    // 4. Inicializar a Busca
    console.log('🔍 Iniciando sistema de busca...');
    initSearch();
    
  } catch (error) {
    console.error('Erro:', error);
    container.innerHTML = `<div class="error-state"><p>Erro ao carregar documentos.</p><button onclick="renderizarDocumentos()" class="btn-doc">Tentar Novamente</button></div>`;
  }
}

// LÓGICA DE BUSCA
function initSearch() {
    const searchInput = document.getElementById('doc-search');
    if (!searchInput) {
        console.warn('⚠️ Barra de pesquisa não encontrada no HTML');
        return;
    }

    // Remover listeners antigos (caso existam) clonando o nó
    const newStoredInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newStoredInput, searchInput);
    
    // Re-focar se necessário (opcional) e adicionar evento
    newStoredInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const items = document.querySelectorAll('.documento-item');
        let totalVisible = 0;
        
        items.forEach(item => {
            const title = item.querySelector('h4')?.textContent.toLowerCase() || '';
            const date = item.querySelector('p')?.textContent.toLowerCase() || '';
            
            if (title.includes(term) || date.includes(term)) {
                item.style.display = ''; // Mostra (respeita CSS grid)
                item.classList.remove('hidden-by-search');
                totalVisible++;
            } else {
                item.style.display = 'none'; // Esconde
                item.classList.add('hidden-by-search');
            }
        });

        // Esconder títulos de categorias vazias
        document.querySelectorAll('.filter-group').forEach(group => {
            const visibleItems = group.querySelectorAll('.documento-item:not(.hidden-by-search)');
            group.style.display = visibleItems.length > 0 ? '' : 'none';
        });

        // Mensagem "Sem Resultados"
        const container = document.getElementById('documentos-container');
        let noMsg = document.getElementById('no-results-msg');
        
        if (totalVisible === 0 && term !== '') {
            if (!noMsg) {
                noMsg = document.createElement('div');
                noMsg.id = 'no-results-msg';
                noMsg.className = 'no-results-box';
                noMsg.style.cssText = 'padding: 2rem; text-align: center; color: #666; font-style: italic;';
                noMsg.innerHTML = `<i class="fas fa-search" style="margin-bottom:0.5rem"></i><p>Nenhum documento encontrado.</p>`;
                container.appendChild(noMsg);
            }
        } else if (noMsg) {
            noMsg.remove();
        }
    });
    
    console.log('✅ Busca ativada com sucesso!');
}

function agruparPorCategoria(docs) {
  const grupos = { 'institucionais': [], 'atas': [], 'relatorios': [], 'materiais': [] };
  docs.forEach(d => { const c = d.categoria || 'materiais'; if (grupos[c]) grupos[c].push(d); });
  return grupos;
}

function criarCardDocumento(doc, num) {
  const status = doc.status || 'em_breve';
  const isOk = status === 'disponivel';
  const btnClass = isOk ? 'btn-doc' : 'btn-doc disabled';
  const icon = isOk ? 'fa-download' : 'fa-clock';
  const label = isOk ? 'Baixar' : 'Em Breve';
  const link = isOk ? `href="${doc.link_arquivo}" target="_blank"` : 'disabled';
  const tag = isOk ? 'a' : 'button';
  
  return `
    <li class="documento-item" data-animate="fade-up">
      <div class="doc-number">${String(num).padStart(2, '0')}</div>
      <div class="doc-info">
        <h4>${doc.titulo}</h4>
        <p><i class="fas fa-calendar-alt"></i> ${doc.descricao || formatarData(doc.data_publicacao)}</p>
      </div>
      <${tag} ${link} class="${btnClass}">
        <i class="fas ${icon}"></i> ${label}
      </${tag}>
    </li>
  `;
}

// ============================================
// RENDERIZAR EVENTOS
// ============================================

async function renderizarEventos() {
  const container = document.getElementById('eventos-container');
  if (!container) return;
  
  // Skeleton para Eventos
  const skeletonEvent = `
    <article class="evento-card skeleton-loading" style="border: 2px solid #e0e0e0; padding:0;">
      <div class="evento-date-box" style="border-right: 2px solid #e0e0e0;">
         <div class="skeleton-box" style="width: 60px; height: 50px; margin-bottom: 0.5rem;"></div>
      </div>
      <div class="evento-content" style="padding: 1.5rem;">
         <div class="skeleton-box" style="width: 100px; height: 20px; margin-bottom: 1rem;"></div>
         <div class="skeleton-box" style="width: 80%; height: 28px; margin-bottom: 1rem;"></div>
         <div class="skeleton-box" style="width: 60%; height: 16px;"></div>
      </div>
    </article>
  `;
  container.innerHTML = skeletonEvent.repeat(2);
  
  try {
    const data = await fetchCENIData('eventos');
    const eventos = data.eventos || data;
    
    if (!eventos || eventos.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum evento disponível</div>';
      return;
    }
    
    container.innerHTML = eventos.map(criarCardEvento).join('');
    setTimeout(updateEventCounts, 100);
    
  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="error-state"><p>Erro ao carregar eventos.</p><button onclick="renderizarEventos()" class="btn-doc">Tentar Novamente</button></div>`;
  }
}

function criarCardEvento(evento) {
  const [ano, mes, dia] = evento.data_evento.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  
  const cats = { 'reuniao': 'Reunião', 'prazo': 'Prazo', 'marco': 'Marco', 'ecossistema': 'Evento' };
  const stats = { 'futuro': 'Aguardando', 'hoje': 'Hoje', 'concluido': 'Concluído' };
  
  return `
    <article class="evento-card" data-category="${evento.categoria}" data-animate="fade-up">
      <div class="evento-date-box">
        <div class="evento-day">${data.getDate()}</div>
        <div class="evento-month">${data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</div>
        <div class="evento-year">${data.getFullYear()}</div>
      </div>
      <div class="evento-content">
        <div class="evento-header">
          <span class="evento-category ${evento.categoria}">${cats[evento.categoria] || evento.categoria}</span>
          <h3 class="evento-title">${evento.titulo}</h3>
          <p class="evento-description">${evento.descricao}</p>
          <div class="evento-meta">
             ${evento.horario ? `<div class="evento-meta-item"><i class="fas fa-clock"></i><span>${evento.horario}</span></div>` : ''}
             ${evento.local ? `<div class="evento-meta-item"><i class="fas fa-map-marker-alt"></i><span>${evento.local}</span></div>` : ''}
          </div>
        </div>
        <div class="evento-footer">
           <span class="evento-status ${evento.status}"><span class="evento-status-dot"></span>${stats[evento.status] || evento.status}</span>
           ${evento.link_materiais ? `<a href="${evento.link_materiais}" class="evento-action" target="_blank">Material</a>` : `<button class="evento-action disabled" disabled>Aguardando</button>`}
        </div>
      </div>
    </article>
  `;
}

function updateEventCounts() {
  const cards = document.querySelectorAll('.evento-card');
  const counts = { todos: cards.length, reuniao: 0, prazo: 0, marco: 0, ecossistema: 0 };
  cards.forEach(c => { const cat = c.dataset.category; if (counts[cat] !== undefined) counts[cat]++; });
  Object.keys(counts).forEach(k => { const el = document.getElementById(`count-${k}`); if(el) el.textContent = counts[k]; });
}

function formatarData(d) {
  if(!d) return '';
  const [a,m,dia] = d.split('-').map(Number);
  return new Date(a,m-1,dia).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
}

function limparCacheLocal() {
  localStorage.removeItem(CENI_API.CACHE_KEYS.DOCUMENTOS);
  localStorage.removeItem(CENI_API.CACHE_KEYS.EVENTOS);
  localStorage.removeItem(CENI_API.CACHE_KEYS.TIMELINE);
  localStorage.removeItem(CENI_API.CACHE_KEYS.TIMESTAMP);
  localStorage.removeItem(CENI_API.CACHE_KEYS.APP_VERSION);
  console.log('🧹 Cache limpo!');
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('documentos-container')) renderizarDocumentos();
  if (document.getElementById('eventos-container')) renderizarEventos();
});

window.CENI = { 
  renderizarDocumentos, 
  renderizarEventos, 
  limparCache: limparCacheLocal, 
  fetchData: fetchCENIData, 
  updateEventCounts 
};
