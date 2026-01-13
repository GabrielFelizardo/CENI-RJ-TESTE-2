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
        
        // Buscar dados da API
        const data = await fetchCENIData('gts');
        console.log('📊 Dados recebidos da API:', data);
        
        // ✨ REMOVER LOADINGS
        document.querySelectorAll('.gt-loading').forEach(el => el.remove());
        
        const gtsData = data.gts || [];
        
        if (!gtsData || gtsData.length === 0) {
            console.log('⚠️ Nenhum dado de GT encontrado');
            return;
        }
        
        console.log(`✅ ${gtsData.length} GTs carregados:`, gtsData);
        
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
        
        console.log('✅ Accordions dos GTs renderizados com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao renderizar GTs:', error);
        // Remover loadings em caso de erro
        document.querySelectorAll('.gt-loading').forEach(el => el.remove());
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
    
    console.log(`✅ HTML do accordion GT ${gt.gt_numero} criado (${html.length} caracteres)`);
    
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
        
        // Verificar se ceni-api-client.js foi carregado
        if (typeof fetchCENIData === 'undefined') {
            console.error('❌ ERRO: ceni-api-client.js não foi carregado ainda!');
            console.log('⏳ Tentando novamente em 1 segundo...');
            setTimeout(renderizarGTsMembros, 1000);
        } else {
            console.log('✅ ceni-api-client.js detectado, iniciando renderização...');
            setTimeout(renderizarGTsMembros, 100);
        }
    } else {
        console.log('ℹ️ Página não contém seções de GT, pulando renderização');
    }
});

// Expor função globalmente
if (window.CENI) {
    window.CENI.renderizarGTsMembros = renderizarGTsMembros;
}

console.log('✅ ceni-gts-dinamico.js carregado');
