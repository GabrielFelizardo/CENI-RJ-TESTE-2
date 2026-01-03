/**
 * ============================================
 * RENDERIZAÇÃO DINÂMICA DA TIMELINE
 * ============================================
 * 
 * Busca dados da aba 'timeline' e renderiza
 * a seção "Próximos Passos" dinamicamente
 */

async function renderizarTimeline() {
    const container = document.querySelector('.timeline');
    if (!container) return;
    
    try {
        console.log('📋 Carregando timeline...');
        
        // Buscar dados da timeline
        const data = await fetchCENIData('timeline');
        const timelineData = data.marcos || data;
        
        if (!timelineData || timelineData.length === 0) {
            console.log('⚠️ Nenhum marco encontrado, mantendo conteúdo estático');
            return;
        }
        
        // ✅ FILTRAR: Apenas itens com status "ativo" ou "concluido"
        const marcosAtivos = timelineData.filter(marco => {
            const status = (marco.status || '').toLowerCase().trim();
            return status === 'ativo' || status === 'concluido';
        });
        
        if (marcosAtivos.length === 0) {
            console.log('⚠️ Nenhum marco ativo/concluído encontrado');
            return;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        // Renderizar apenas marcos ativos/concluídos
        marcosAtivos.forEach((marco, index) => {
            const card = criarCardTimeline(marco, index);
            container.appendChild(card);
        });
        
        // Aplicar animações
        setTimeout(() => {
            if (window.CENIScroll && window.CENIScroll.refresh) {
                window.CENIScroll.refresh();
            }
        }, 100);
        
        console.log(`✅ Timeline renderizada: ${marcosAtivos.length} marcos ativos (${timelineData.length - marcosAtivos.length} ocultos)`);
        
    } catch (error) {
        console.error('❌ Erro ao renderizar timeline:', error);
        // Em caso de erro, manter conteúdo estático (não fazer nada)
    }
}

function criarCardTimeline(marco, index) {
    const card = document.createElement('div');
    card.className = 'timeline-item';
    
    // Alternar animações
    const animacao = index % 2 === 0 ? 'fade-right' : 'fade-left';
    card.setAttribute('data-animate', animacao);
    card.setAttribute('data-delay', (index * 200).toString());
    
    // Status badge (opcional)
    let statusBadge = '';
    if (marco.status === 'concluido') {
        statusBadge = '<span class="badge-concluido" style="display: inline-block; background: #10b981; color: white; padding: 0.25rem 0.75rem; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-left: 0.5rem; border-radius: 2px;">✓ Concluído</span>';
    }
    
    // Montar HTML
    let html = `
        <div class="timeline-month">${marco.periodo}${statusBadge}</div>
    `;
    
    // Adicionar título se existir
    if (marco.titulo && marco.titulo !== '-') {
        html += `<div style="font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; opacity: 0.9;">${marco.titulo}</div>`;
    }
    
    // Adicionar lista de itens
    if (marco.itens && marco.itens.length > 0) {
        html += '<ul>';
        marco.itens.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += '</ul>';
    }
    
    card.innerHTML = html;
    
    return card;
}

// ============================================
// ATUALIZAR ceni-api-client.js
// ============================================

// Adicionar ao objeto CENI_API
const CENI_API_TIMELINE = {
    ...CENI_API,
    CACHE_KEYS: {
        ...CENI_API.CACHE_KEYS,
        TIMELINE: 'ceni_timeline_cache'
    }
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.timeline')) {
        console.log('🚀 Detectada página com timeline');
        setTimeout(renderizarTimeline, 500);
    }
});

// Expor função globalmente
if (window.CENI) {
    window.CENI.renderizarTimeline = renderizarTimeline;
}

console.log('✅ Timeline script carregado');
