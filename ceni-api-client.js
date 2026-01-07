// ============================================
// CONFIGURAÇÃO
// ============================================

const CENI_API = {
  // ⚠️ URL DO APPS SCRIPT
  URL: 'https://script.google.com/macros/s/AKfycbwsvOjSDjDINcjOz2O8qCXQIebL8XzWmKrbMHT7rmJDUjov2razcVPIGT3v7ne1jEw0jg/exec',
  
  // Versão do Cache. Mude para '1.2', '1.3' etc. para forçar atualização em todos os usuários.
  VERSION: '1.1', 

  // Tempo de Cache (5 minutos)
  CACHE_DURATION: 5 * 60 * 1000,
  
  // Chaves de Armazenamento
  CACHE_KEYS: {
    DOCUMENTOS: 'ceni_documentos_cache',
    EVENTOS: 'ceni_eventos_cache',
    TIMELINE: 'ceni_timeline_cache',
    TIMESTAMP: 'ceni_cache_timestamp',
    APP_VERSION: 'ceni_app_version'
  }
};

// ============================================
// CORE: BUSCA E GERENCIAMENTO DE DADOS
// ============================================

async function fetchCENIData(tipo = 'all') {
  try {
    // 1. Verifica se a versão do código mudou
    verificarVersaoCache();

    // 2. Tenta pegar do cache
    const cached = getCachedData(tipo);
    if (cached) {
      // console.log('✅ Dados do cache local'); // Comentado para produção
      return cached;
    }
    
    // 3. Se não tem cache, busca da API
    console.log(`📥 Buscando dados: ${tipo}`);
    
    const url = `${CENI_API.URL}?tipo=${tipo}&t=${Date.now()}`; // Anti-cache do navegador
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Erro desconhecido');
    }
    
    // 4. Salva no cache
    saveCacheData(tipo, result.data);
    
    return result.data;
    
  } catch (error) {
    console.error('❌ Erro na API:', error);
    
    // Fallback: Tenta usar cache antigo mesmo expirado se a API falhar
    const oldCache = getCachedData(tipo, true);
    if (oldCache) {
      console.warn('⚠️ Usando cache antigo (fallback)');
      return oldCache;
    }
    
    throw error;
  }
}

// ============================================
// SISTEMA DE CACHE
// ============================================

function verificarVersaoCache() {
  const cachedVersion = localStorage.getItem(CENI_API.CACHE_KEYS.APP_VERSION);
  
  if (cachedVersion !== CENI_API.VERSION) {
    console.warn(`📦 Nova versão detectada (v${CENI_API.VERSION}). Limpando cache antigo...`);
    limparCacheLocal();
    localStorage.setItem(CENI_API.CACHE_KEYS.APP_VERSION, CENI_API.VERSION);
  }
}

function getCachedData(tipo, ignoreExpiration = false) {
  try {
    const timestamp = localStorage.getItem(CENI_API.CACHE_KEYS.TIMESTAMP);
    const now = Date.now();
    
    // Verifica expiração (se não estivermos no modo fallback)
    if (!ignoreExpiration && timestamp && (now - parseInt(timestamp)) > CENI_API.CACHE_DURATION) {
      return null;
    }
    
    // Mapeia o tipo para a chave correta
    let cacheKey;
    if (tipo === 'all') {
      const docs = localStorage.getItem(CENI_API.CACHE_KEYS.DOCUMENTOS);
      const eventos = localStorage.getItem(CENI_API.CACHE_KEYS.EVENTOS);
      const timeline = localStorage.getItem(CENI_API.CACHE_KEYS.TIMELINE);
      
      if (docs && eventos && timeline) {
        return {
          documentos: JSON.parse(docs),
          eventos: JSON.parse(eventos),
          timeline: JSON.parse(timeline)
        };
      }
      return null;
    }
    
    if (tipo === 'documentos') cacheKey = CENI_API.CACHE_KEYS.DOCUMENTOS;
    else if (tipo === 'eventos') cacheKey = CENI_API.CACHE_KEYS.EVENTOS;
    else if (tipo === 'timeline') cacheKey = CENI_API.CACHE_KEYS.TIMELINE;
    
    if (cacheKey) {
      const data = localStorage.getItem(cacheKey);
      return data ? JSON.parse(data) : null;
    }
    
    return null;
  } catch (error) {
    console.warn('Erro leitura cache:', error);
    return null;
  }
}

function saveCacheData(tipo, data) {
  try {
    if (tipo === 'all') {
      localStorage.setItem(CENI_API.CACHE_KEYS.DOCUMENTOS, JSON.stringify(data.documentos));
      localStorage.setItem(CENI_API.CACHE_KEYS.EVENTOS, JSON.stringify(data.eventos));
      localStorage.setItem(CENI_API.CACHE_KEYS.TIMELINE, JSON.stringify(data.timeline));
    } else if (tipo === 'documentos') {
      localStorage.setItem(CENI_API.CACHE_KEYS.DOCUMENTOS, JSON.stringify(data));
    } else if (tipo === 'eventos') {
      localStorage.setItem(CENI_API.CACHE_KEYS.EVENTOS, JSON.stringify(data));
    } else if (tipo === 'timeline') {
      localStorage.setItem(CENI_API.CACHE_KEYS.TIMELINE, JSON.stringify(data));
    }
    
    localStorage.setItem(CENI_API.CACHE_KEYS.TIMESTAMP, Date.now().toString());
    localStorage.setItem(CENI_API.CACHE_KEYS.APP_VERSION, CENI_API.VERSION);
    
  } catch (error) {
    console.warn('Erro escrita cache:', error);
  }
}

function limparCacheLocal() {
  localStorage.removeItem(CENI_API.CACHE_KEYS.DOCUMENTOS);
  localStorage.removeItem(CENI_API.CACHE_KEYS.EVENTOS);
  localStorage.removeItem(CENI_API.CACHE_KEYS.TIMELINE);
  localStorage.removeItem(CENI_API.CACHE_KEYS.TIMESTAMP);
  localStorage.removeItem(CENI_API.CACHE_KEYS.APP_VERSION);
  console.log('🧹 Cache limpo com sucesso.');
}

// ============================================
// RENDERIZAÇÃO: DOCUMENTOS
// ============================================

async function renderizarDocumentos() {
  const container = document.getElementById('documentos-container');
  if (!container) return;
  
  // 1. Renderizar Skeleton (Swiss Style)
  // Cria blocos geométricos que imitam o layout final para evitar Layout Shift
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
    // 2. Buscar Dados
    const data = await fetchCENIData('documentos');
    const documentosData = data.documentos || data;
    
    if (!documentosData || documentosData.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum documento disponível</div>';
      return;
    }
    
    // 3. Processar Dados
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
      
      // Adicionamos a classe 'filter-group' para ajudar na busca
      html += `
        <section class="categoria-section filter-group">
          <div class="categoria-header">
            <h2>${nome}</h2>
          </div>
          <ul class="documento-list">
      `;
      
      docs.forEach((doc, index) => {
        html += criarCardDocumento(doc, index + 1);
      });
      
      html += `
          </ul>
        </section>
      `;
    }
    
    container.innerHTML = html || '<div class="empty-state">Nenhum documento disponível</div>';
    
    // 4. Inicializar Busca (agora que o DOM existe)
    initSearch();
    
  } catch (error) {
    console.error('Render Docs Error:', error);
    container.innerHTML = `
      <div class="error-state">
        <p>Não foi possível carregar os documentos.</p>
        <button onclick="renderizarDocumentos()" class="btn-doc">Tentar Novamente</button>
      </div>
    `;
  }
}

// Funções Auxiliares de Documentos
function agruparPorCategoria(documentos) {
  const grupos = { 'institucionais': [], 'atas': [], 'relatorios': [], 'materiais': [] };
  documentos.forEach(doc => {
    const cat = doc.categoria || 'materiais';
    if (grupos[cat]) grupos[cat].push(doc);
  });
  return grupos;
}

function criarCardDocumento(doc, numero) {
  const statusLabels = { 'disponivel': 'Baixar', 'em_breve': 'Em Breve', 'em_elaboracao': 'Em Elaboração' };
  const statusIcons = { 'disponivel': 'fa-download', 'em_breve': 'fa-clock', 'em_elaboracao': 'fa-hourglass-half' };
  
  const status = doc.status || 'em_breve';
  const label = statusLabels[status] || 'Indisponível';
  const icon = statusIcons[status] || 'fa-clock';
  const isAvailable = status === 'disponivel';
  
  const dataFormatada = doc.data_publicacao ? formatarData(doc.data_publicacao) : '';
  const desc = doc.descricao || dataFormatada;

  return `
    <li class="documento-item" data-animate="fade-up">
      <div class="doc-number">${String(numero).padStart(2, '0')}</div>
      <div class="doc-info">
        <h4>${doc.titulo}</h4>
        <p><i class="fas fa-calendar-alt"></i> ${desc}</p>
      </div>
      ${doc.link_arquivo && isAvailable ? `
        <a href="${doc.link_arquivo}" target="_blank" class="btn-doc" aria-label="Baixar ${doc.titulo}">
          <i class="fas ${icon}"></i> ${label}
        </a>
      ` : `
        <button class="btn-doc disabled" disabled aria-label="${label}">
          <i class="fas ${icon}"></i> ${label}
        </button>
      `}
    </li>
  `;
}

// Lógica de Busca em Tempo Real
function initSearch() {
  const searchInput = document.getElementById('doc-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll('.documento-item');
      let totalVisible = 0;
      
      items.forEach(item => {
          const title = item.querySelector('h4')?.textContent.toLowerCase() || '';
          const desc = item.querySelector('p')?.textContent.toLowerCase() || '';
          
          if (title.includes(term) || desc.includes(term)) {
              item.style.display = ''; // Mostra (respeita o grid)
              item.classList.remove('hidden-by-search');
              totalVisible++;
          } else {
              item.style.display = 'none';
              item.classList.add('hidden-by-search');
          }
      });

      // Esconde seções (categorias) inteiras se todos os itens sumirem
      document.querySelectorAll('.filter-group').forEach(group => {
          const visibleItems = group.querySelectorAll('.documento-item:not(.hidden-by-search)');
          group.style.display = visibleItems.length > 0 ? '' : 'none';
      });

      // Feedback "Sem Resultados"
      const container = document.getElementById('documentos-container');
      let noMsg = document.getElementById('no-results-msg');
      
      if (totalVisible === 0 && term !== '') {
          if (!noMsg) {
              noMsg = document.createElement('div');
              noMsg.id = 'no-results-msg';
              noMsg.className = 'no-results-box'; // Usar classe do CSS novo
              noMsg.style.textAlign = 'center';
              noMsg.style.padding = '3rem';
              noMsg.style.color = 'var(--text-secondary)';
              noMsg.style.border = '2px dashed var(--grid-line)';
              noMsg.innerHTML = `<i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity:0.5;"></i><p>Nenhum documento encontrado.</p>`;
              container.appendChild(noMsg);
          }
      } else if (noMsg) {
          noMsg.remove();
      }
  });
}

// ============================================
// RENDERIZAÇÃO: EVENTOS
// ============================================

async function renderizarEventos() {
  const container = document.getElementById('eventos-container');
  if (!container) return;
  
  // Skeleton Eventos (Swiss Style)
  const skeletonEvent = `
    <article class="evento-card skeleton-item" style="border: 2px solid var(--grid-line);">
      <div class="evento-date-box" style="border-right: 2px solid var(--grid-line);">
         <div class="skeleton-box" style="width: 60px; height: 50px; margin-bottom: 0.5rem;"></div>
         <div class="skeleton-box" style="width: 40px; height: 16px;"></div>
      </div>
      <div class="evento-content">
         <div class="skeleton-box" style="width: 100px; height: 20px; margin-bottom: 1rem;"></div>
         <div class="skeleton-box" style="width: 80%; height: 28px; margin-bottom: 1rem;"></div>
         <div class="skeleton-box" style="width: 100%; height: 16px; margin-bottom: 0.5rem;"></div>
         <div class="skeleton-box" style="width: 60%; height: 16px;"></div>
      </div>
    </article>
  `;
  container.innerHTML = skeletonEvent.repeat(2);
  
  try {
    const data = await fetchCENIData('eventos');
    const eventosData = data.eventos || data;
    
    if (!eventosData || eventosData.length === 0) {
      container.innerHTML = '<div class="empty-state">Nenhum evento disponível</div>';
      return;
    }
    
    let html = '';
    eventosData.forEach(evento => { html += criarCardEvento(evento); });
    container.innerHTML = html;
    
    setTimeout(() => updateEventCounts(), 100);
    
  } catch (error) {
    console.error('Render Events Error:', error);
    container.innerHTML = `
      <div class="error-state">
        <p>Não foi possível carregar os eventos.</p>
        <button onclick="renderizarEventos()" class="btn-doc">Tentar Novamente</button>
      </div>
    `;
  }
}

function criarCardEvento(evento) {
  const [ano, mes, dia] = evento.data_evento.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  
  const diaFormatado = data.getDate();
  const mesFormatado = data.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
  const anoFormatado = data.getFullYear();
  
  const cats = { 'reuniao': 'Reunião', 'prazo': 'Prazo', 'marco': 'Marco', 'ecossistema': 'Evento' };
  const labels = { 'futuro': 'Aguardando', 'hoje': 'Hoje', 'concluido': 'Concluído' };
  
  return `
    <article class="evento-card" data-category="${evento.categoria}" data-animate="fade-up">
      <div class="evento-date-box">
        <div class="evento-day">${diaFormatado}</div>
        <div class="evento-month">${mesFormatado}</div>
        <div class="evento-year">${anoFormatado}</div>
      </div>
      <div class="evento-content">
        <div class="evento-header">
          <span class="evento-category ${evento.categoria}">${cats[evento.categoria] || evento.categoria}</span>
          <h3 class="evento-title">${evento.titulo}</h3>
          <p class="evento-description">${evento.descricao}</p>
          <div class="evento-meta">
            ${evento.horario && evento.horario !== '-' ? `<div class="evento-meta-item"><i class="fas fa-clock"></i><span>${evento.horario}</span></div>` : ''}
            ${evento.local ? `<div class="evento-meta-item"><i class="fas fa-map-marker-alt"></i><span>${evento.local}</span></div>` : ''}
          </div>
        </div>
        <div class="evento-footer">
          <span class="evento-status ${evento.status}"><span class="evento-status-dot"></span>${labels[evento.status] || evento.status}</span>
          ${evento.link_materiais ? `<a href="${evento.link_materiais}" class="evento-action" target="_blank">Acessar Material</a>` : `<button class="evento-action disabled" disabled>Aguardando</button>`}
        </div>
      </div>
    </article>
  `;
}

function updateEventCounts() {
  const cards = document.querySelectorAll('.evento-card');
  const counts = { todos: cards.length, reuniao: 0, prazo: 0, marco: 0, ecossistema: 0 };
  
  cards.forEach(card => {
    const cat = card.getAttribute('data-category');
    if (counts[cat] !== undefined) counts[cat]++;
  });
  
  Object.keys(counts).forEach(key => {
    const badge = document.getElementById(`count-${key}`);
    if (badge) badge.textContent = counts[key];
  });
}

// ============================================
// UTILITÁRIOS
// ============================================

function formatarData(dataStr) {
  if (!dataStr) return '';
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // console.log(`🚀 CENI Client v${CENI_API.VERSION} started`);
  
  if (document.getElementById('documentos-container')) renderizarDocumentos();
  if (document.getElementById('eventos-container')) renderizarEventos();
});

// Expor para Debug/Console
window.CENI = {
  renderizarDocumentos,
  renderizarEventos,
  limparCache: limparCacheLocal,
  fetchData: fetchCENIData
};
