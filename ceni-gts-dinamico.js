/**
 * ============================================
 * CENI-GTS-DINAMICO - VERSÃO ESTÁVEL
 * ============================================
 * Sistema de renderização de GTs e membros
 * com accordion interativo
 */

console.log('✅ ceni-gts-dinamico.js carregado');

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================
async function renderizarGTsMembros() {
    try {
        console.log('📋 Carregando membros dos GTs...');
        
        // Verificar se função fetchCENIData existe
        if (typeof fetchCENIData !== 'function') {
            console.error('❌ fetchCENIData não está disponível! Verifique se ceni-api-client.js foi carregado.');
            return;
        }
        
        // Buscar dados da API
        const data = await fetchCENIData('gts');
        console.log('📊 Dados recebidos da API:', data);
        
        const gtsData = data.gts || [];
        
        if (!gtsData || gtsData.length === 0) {
            console.log('⚠️ Nenhum dado de GT encontrado');
            return;
        }
        
        console.log(`✅ ${gtsData.length} GTs carregados:`, gtsData);
        
        // Renderizar cada GT
        gtsData.forEach(gt => {
            const gtSection = document.querySelector(`.gt-section.gt${gt.gt_numero}`);
            
            if (!gtSection) {
                console.warn(`⚠️ Seção do GT ${gt.gt_numero} não encontrada`);
                return;
            }
            
            // Criar accordion
            const accordionHTML = criarAccordionGT(gt);
            
            // Inserir DENTRO do gt-header
            const gtHeader = gtSection.querySelector('.gt-header');
            if (gtHeader) {
                gtHeader.insertAdjacentHTML('beforeend', accordionHTML);
                console.log(`✅ Accordion inserido no GT ${gt.gt_numero}`);
            }
        });
        
        // Inicializar interatividade dos accordions
        inicializarAccordions();
        
        console.log('🎉 Renderização concluída!');
        
    } catch (error) {
        console.error('❌ Erro ao renderizar GTs:', error);
    }
}

// ============================================
// CRIAR ACCORDION DO GT
// ============================================
function criarAccordionGT(gt) {
    const isAtivo = gt.status === 'ativo';
    const temMembros = gt.membros && gt.membros.length > 0;
    
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

// ============================================
// INICIALIZAR ACCORDIONS
// ============================================
function inicializarAccordions() {
    const accordions = document.querySelectorAll('.gt-membros-accordion');
    
    accordions.forEach(accordion => {
        const toggle = accordion.querySelector('.accordion-toggle');
        const content = accordion.querySelector('.accordion-content');
        
        if (!toggle || !content) return;
        
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
    });
    
    console.log(`✅ ${accordions.length} accordions inicializados`);
}

// ============================================
// INICIALIZAÇÃO
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarGTsMembros);
} else {
    renderizarGTsMembros();
}
