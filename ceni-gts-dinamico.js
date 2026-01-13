/**
 * ============================================
 * CENI-GTS-DINAMICO - VERSÃO OFFLINE FINAL
 * ============================================
 * ATENÇÃO: Este arquivo substitui completamente o antigo!
 * Baixe e renomeie para: ceni-gts-dinamico.js
 */

async function renderizarGTsMembros() {
    try {
        console.log('🚀🚀🚀 VERSÃO OFFLINE CARREGADA - JANEIRO 2026 🚀🚀🚀');
        console.log('📋 Carregando membros dos GTs...');
        
        // ✨ ADICIONAR LOADING EM TODOS OS GT-HEADERS
        const gtHeaders = document.querySelectorAll('.gt-header');
        gtHeaders.forEach(header => {
            const loadingHTML = `
                <div class="gt-loading" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px;
                    margin-top: 15px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 14px;
                ">
                    <div class="spinner" style="
                        width: 20px;
                        height: 20px;
                        border: 3px solid rgba(255, 255, 255, 0.1);
                        border-top-color: #fff;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    "></div>
                    <span>Carregando membros participantes...</span>
                </div>
            `;
            header.insertAdjacentHTML('beforeend', loadingHTML);
        });
        
        // Verificar se função fetchCENIData existe
        if (typeof fetchCENIData !== 'function') {
            console.error('❌ fetchCENIData não está disponível! Verifique se ceni-api-client.js foi carregado.');
            document.querySelectorAll('.gt-loading').forEach(el => el.remove());
            return;
        }
        
        // ✨✨✨ ESTRATÉGIA OFFLINE FIRST ✨✨✨
        let data;
        let fonte = 'offline';
        
        console.log('⚡⚡⚡ TENTANDO MODO OFFLINE PRIMEIRO... ⚡⚡⚡');
        
        try {
            // TENTAR BUSCAR DADOS OFFLINE
            data = await fetchCENIData('membros-offline');
            console.log('✅✅✅ DADOS OFFLINE CARREGADOS COM SUCESSO! ✅✅✅');
            console.log('🚀 Fonte dos dados: OFFLINE (RÁPIDO)');
        } catch (offlineError) {
            console.warn('⚠️ Dados offline não disponíveis:', offlineError);
            console.log('🔄 Tentando buscar da API como backup...');
            
            try {
                // FALLBACK: BUSCAR DA API
                data = await fetchCENIData('gts');
                fonte = 'api';
                console.log('✅ Dados da API carregados (fallback)');
                console.log('⚠️ ATENÇÃO: Usando API - publicar membros para modo offline!');
            } catch (apiError) {
                console.error('❌ Erro ao buscar da API também:', apiError);
                throw new Error('Não foi possível carregar dados offline nem da API');
            }
        }
        
        console.log(`📊 Dados recebidos (fonte: ${fonte}):`, data);
        
        // ✨ REMOVER LOADINGS
        document.querySelectorAll('.gt-loading').forEach(el => el.remove());
        
        const gtsData = data.gts || [];
        
        if (!gtsData || gtsData.length === 0) {
            console.log('⚠️ Nenhum dado de GT encontrado');
            return;
        }
        
        console.log(`✅ ${gtsData.length} GTs carregados (fonte: ${fonte}):`, gtsData);
        
        const totalSecoes = document.querySelectorAll('.gt-section').length;
        console.log(`🔍 Seções GT encontradas no HTML: ${totalSecoes}`);
        
        // Para cada GT, renderizar accordion
        gtsData.forEach(gt => {
            const gtSection = document.querySelector(`.gt-section.gt${gt.gt_numero}`);
            
            if (!gtSection) {
                console.warn(`⚠️ Seção do GT ${gt.gt_numero} não encontrada`);
                return;
            }
            
            const accordionHTML = criarAccordionGT(gt);
            const gtHeader = gtSection.querySelector('.gt-header');
            
            if (gtHeader) {
                gtHeader.insertAdjacentHTML('beforeend', accordionHTML);
                console.log(`✅ Accordion inserido no GT ${gt.gt_numero}`);
            } else {
                console.warn(`⚠️ gt-header não encontrado para GT ${gt.gt_numero}`);
            }
        });
        
        inicializarAccordions();
        
        console.log(`✅ Accordions dos GTs renderizados com sucesso (fonte: ${fonte})`);
        
        // ✨ MOSTRAR BADGE DE FONTE SE MODO DEBUG
        if (fonte === 'offline' && window.location.search.includes('debug=1')) {
            const badge = document.createElement('div');
            badge.textContent = '⚡ Modo Offline Ativo';
            badge.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: bold;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(badge);
            setTimeout(() => badge.remove(), 3000);
        }
        
    } catch (error) {
        console.error('❌ Erro ao renderizar GTs:', error);
        document.querySelectorAll('.gt-loading').forEach(el => el.remove());
        
        const gtHeaders = document.querySelectorAll('.gt-header');
        gtHeaders.forEach(header => {
            const errorHTML = `
                <div style="
                    padding: 20px;
                    margin-top: 15px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 2px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #991b1b;
                    font-size: 14px;
                ">
                    <strong>⚠️ Erro ao carregar membros</strong><br>
                    Por favor, tente recarregar a página.
                </div>
            `;
            header.insertAdjacentHTML('beforeend', errorHTML);
        });
    }
}

function criarAccordionGT(gt) {
    console.log(`🎨 Criando accordion para GT ${gt.gt_numero}:`, gt);
    
    const isAtivo = gt.status === 'ativo';
    const temMembros = gt.membros && gt.membros.length > 0;
    
    console.log(`   Status: ${gt.status}, Ativo: ${isAtivo}, Tem membros: ${temMembros}`);
    
    let html = `
        <div class="gt-membros-accordion" data-gt="${gt.gt_numero}" data-animate="fade-up" data-delay="200">
            <button class="accordion-toggle" aria-expanded="false">
                <span>Membros Participantes</span>
                <i class="fas fa-chevron-down accordion-icon"></i>
            </button>
            <div class="accordion-content">
    `;
    
    if (isAtivo && temMembros) {
        html += '<div class="membros-grid">';
        
        gt.membros.forEach(membro => {
            html += `
                <div class="membro-card" data-animate="fade-up" data-delay="300">
                    <div class="membro-organizacao">
                        <i class="fas fa-building"></i>
                        <span>${membro.organizacao}</span>
                    </div>
                    <div class="membro-tipo">${membro.tipo_organizacao}</div>
                    <div class="membro-representante">
                        <span class="representante-label">Titular</span>
                        <span class="representante-nome">${membro.titular || 'Não informado'}</span>
                    </div>
                    <div class="membro-representante">
                        <span class="representante-label">Suplente</span>
                        <span class="representante-nome">${membro.suplente || 'Não informado'}</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    } else {
        html += `
            <div class="membros-placeholder">
                <i class="fas fa-clock"></i>
                <p>Grupo de Trabalho em Formação</p>
                <p>Os membros participantes serão divulgados em breve.</p>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function inicializarAccordions() {
    console.log('🎯 Inicializando accordions...');
    
    const accordions = document.querySelectorAll('.gt-membros-accordion');
    console.log(`   Total de accordions encontrados: ${accordions.length}`);
    
    accordions.forEach((accordion, index) => {
        const toggle = accordion.querySelector('.accordion-toggle');
        const content = accordion.querySelector('.accordion-content');
        
        if (!toggle || !content) {
            console.warn(`   ⚠️ Accordion ${index} está incompleto`);
            return;
        }
        
        toggle.addEventListener('click', () => {
            const isExpanded = accordion.classList.contains('expanded');
            
            // Fechar todos os outros
            accordions.forEach(other => {
                if (other !== accordion && other.classList.contains('expanded')) {
                    other.classList.remove('expanded');
                    const otherContent = other.querySelector('.accordion-content');
                    const otherToggle = other.querySelector('.accordion-toggle');
                    if (otherContent) otherContent.style.maxHeight = null;
                    if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Toggle atual
            if (isExpanded) {
                accordion.classList.remove('expanded');
                content.style.maxHeight = null;
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                accordion.classList.add('expanded');
                content.style.maxHeight = content.scrollHeight + 'px';
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
        
        console.log(`   ✅ Accordion ${index} inicializado`);
    });
    
    console.log('✅ Todos os accordions inicializados!');
}

// ============================================
// INICIALIZAÇÃO
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarGTsMembros);
} else {
    renderizarGTsMembros();
}

console.log('✅ ceni-gts-dinamico.js carregado');
