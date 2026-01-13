/**
 * ============================================
 * CENI-GTS-DINAMICO V2 - COM OFFLINE SUPPORT
 * ============================================
 * Busca dados offline primeiro (rápido)
 * Se falhar, busca da API (backup)
 */

async function renderizarGTsMembros() {
    try {
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
            // Remover loadings
            document.querySelectorAll('.gt-loading').forEach(el => el.remove());
            return;
        }
        
        // ✨ ESTRATÉGIA: Tentar OFFLINE primeiro, API como backup
        let data;
        let fonte = 'offline';
        
        try {
            console.log('⚡ Tentando buscar dados OFFLINE...');
            data = await fetchCENIData('membros-offline');
            console.log('✅ Dados OFFLINE carregados!');
        } catch (offlineError) {
            console.warn('⚠️ Dados offline não disponíveis, tentando API...', offlineError);
            try {
                data = await fetchCENIData('gts');
                fonte = 'api';
                console.log('✅ Dados da API carregados!');
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
        
        console.log(`✅ ${gtsData.length} GTs carregados (${fonte}):`, gtsData);
        
        // Verificar quantas seções GT existem no HTML
        const totalSecoes = document.querySelectorAll('.gt-section').length;
        console.log(`🔍 Seções GT encontradas no HTML: ${totalSecoes}`);
        
        // Para cada GT (1 a 5), renderizar accordion
        gtsData.forEach(gt => {
            const gtSection = document.querySelector(`.gt-section.gt${gt.gt_numero}`);
            
            if (!gtSection) {
                console.warn(`⚠️ Seção do GT ${gt.gt_numero} não encontrada`);
                return;
            }
            
            // Criar accordion
            const accordionHTML = criarAccordionGT(gt);
            
            // Inserir DENTRO do gt-header usando insertAdjacentHTML
            const gtHeader = gtSection.querySelector('.gt-header');
            if (gtHeader) {
                gtHeader.insertAdjacentHTML('beforeend', accordionHTML);
                console.log(`✅ Accordion inserido no GT ${gt.gt_numero}`);
            } else {
                console.warn(`⚠️ gt-header não encontrado para GT ${gt.gt_numero}`);
            }
        });
        
        // Inicializar funcionalidade dos accordions
        inicializarAccordions();
        
        console.log(`✅ Accordions dos GTs renderizados com sucesso (fonte: ${fonte})`);
        
        // ✨ MOSTRAR BADGE DE FONTE (OPCIONAL - APENAS PARA DEBUG)
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
        // Remover loadings em caso de erro
        document.querySelectorAll('.gt-loading').forEach(el => el.remove());
        
        // Mostrar mensagem de erro ao usuário
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
            console.log(`   🖱️ Click no accordion ${index}`);
            
            const isExpanded = accordion.classList.contains('expanded');
            
            // Fechar todos os outros accordions
            accordions.forEach(other => {
                if (other !== accordion && other.classList.contains('expanded')) {
                    other.classList.remove('expanded');
                    const otherContent = other.querySelector('.accordion-content');
                    const otherToggle = other.querySelector('.accordion-toggle');
                    if (otherContent) otherContent.style.maxHeight = null;
                    if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Toggle do accordion atual
            if (isExpanded) {
                accordion.classList.remove('expanded');
                content.style.maxHeight = null;
                toggle.setAttribute('aria-expanded', 'false');
                console.log(`   📦 Accordion ${index} fechado`);
            } else {
                accordion.classList.add('expanded');
                content.style.maxHeight = content.scrollHeight + 'px';
                toggle.setAttribute('aria-expanded', 'true');
                console.log(`   📂 Accordion ${index} aberto (altura: ${content.scrollHeight}px)`);
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
