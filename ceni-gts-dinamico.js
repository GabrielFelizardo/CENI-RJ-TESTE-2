/**
 * ============================================
 * CENI-GTS-DINAMICO.JS
 * ============================================
 * Renderiza membros dos GTs dinamicamente
 * com accordion para mostrar/ocultar
 */

async function renderizarGTsMembros() {
    try {
        console.log('📋 Carregando membros dos GTs...');
        
        // Buscar dados da API
        const data = await fetchCENIData('gts');
        const gtsData = data.gts || [];
        
        if (!gtsData || gtsData.length === 0) {
            console.log('⚠️ Nenhum dado de GT encontrado');
            return;
        }
        
        console.log(`✅ ${gtsData.length} GTs carregados`);
        
        // Para cada GT (1 a 5), renderizar accordion
        gtsData.forEach(gt => {
            const gtSection = document.querySelector(`.gt-section.gt${gt.gt_numero}`);
            
            if (!gtSection) {
                console.warn(`⚠️ Seção do GT ${gt.gt_numero} não encontrada`);
                return;
            }
            
            // Criar accordion
            const accordionHTML = criarAccordionGT(gt);
            
            // Inserir no final da seção (depois do gt-header)
            const swissGrid = gtSection.querySelector('.swiss-grid');
            if (swissGrid) {
                const accordionContainer = document.createElement('div');
                accordionContainer.className = 'col-full';
                accordionContainer.innerHTML = accordionHTML;
                swissGrid.appendChild(accordionContainer);
            }
        });
        
        // Inicializar funcionalidade dos accordions
        inicializarAccordions();
        
        console.log('✅ Accordions dos GTs renderizados com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao renderizar GTs:', error);
    }
}

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
        // GT ativo - mostrar membros
        html += `<div class="membros-grid">`;
        
        gt.membros.forEach((membro, index) => {
            html += `
                <div class="membro-card" data-animate="fade-up" data-delay="${index * 50}">
                    <div class="membro-organizacao">
                        <i class="fas fa-building"></i>
                        <strong>${membro.organizacao}</strong>
                    </div>
                    ${membro.tipo_organizacao ? `
                        <div class="membro-tipo">${membro.tipo_organizacao}</div>
                    ` : ''}
                    ${membro.titular ? `
                        <div class="membro-representante">
                            <span class="representante-label">Titular:</span>
                            <span class="representante-nome">${membro.titular}</span>
                        </div>
                    ` : ''}
                    ${membro.suplente ? `
                        <div class="membro-representante">
                            <span class="representante-label">Suplente:</span>
                            <span class="representante-nome">${membro.suplente}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `</div>`; // fim membros-grid
        
    } else {
        // GT desativado - mensagem "em breve"
        html += `
            <div class="membros-placeholder">
                <i class="fas fa-hourglass-half"></i>
                <p><strong>Em breve</strong></p>
                <p>Representantes em definição</p>
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
    const toggles = document.querySelectorAll('.accordion-toggle');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const accordion = this.parentElement;
            const content = accordion.querySelector('.accordion-content');
            const icon = this.querySelector('.accordion-icon');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle estado
            if (isExpanded) {
                // Fechar
                this.setAttribute('aria-expanded', 'false');
                accordion.classList.remove('expanded');
                content.style.maxHeight = '0';
                icon.style.transform = 'rotate(0deg)';
            } else {
                // Abrir
                this.setAttribute('aria-expanded', 'true');
                accordion.classList.add('expanded');
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
        
        // Acessibilidade: permitir Enter e Space
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que ceni-api-client.js foi carregado
    if (document.querySelector('.gt-section')) {
        console.log('🚀 Detectada página de GTs');
        setTimeout(renderizarGTsMembros, 500);
    }
});

// Expor função globalmente
if (window.CENI) {
    window.CENI.renderizarGTsMembros = renderizarGTsMembros;
}

console.log('✅ ceni-gts-dinamico.js carregado');
