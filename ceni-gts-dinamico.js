/**
 * ============================================
 * CENI-GTS-DINAMICO - VERSÃO ULTRA DEFINITIVA
 * ============================================
 * DATA: 13 DE JANEIRO DE 2026
 * VERSÃO: 3.0.0 ULTRA
 * 
 * ATENÇÃO: Este é o arquivo CORRETO E DEFINITIVO!
 * Baixe e substitua completamente o antigo!
 */

// ============================================
// IDENTIFICAÇÃO IMEDIATA DA VERSÃO
// ============================================
const VERSAO_SCRIPT = '3.0.0-ULTRA-DEFINITIVO';
const DATA_ATUALIZACAO = '2026-01-13T20:00:00Z';

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 VERSÃO ULTRA DEFINITIVA CARREGADA!');
console.log(`📅 Data: ${DATA_ATUALIZACAO}`);
console.log(`🔢 Versão: ${VERSAO_SCRIPT}`);
console.log('═══════════════════════════════════════════════════════════════');

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================
async function renderizarGTsMembros() {
    try {
        console.log('');
        console.log('🎬 INICIANDO RENDERIZAÇÃO DOS GTS');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        
        // ✨ ADICIONAR LOADING EM TODOS OS GT-HEADERS
        console.log('⏳ Adicionando indicadores de loading...');
        const gtHeaders = document.querySelectorAll('.gt-header');
        console.log(`   Encontrados ${gtHeaders.length} headers de GT`);
        
        gtHeaders.forEach((header, index) => {
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
            console.log(`   ✓ Loading adicionado ao GT ${index + 1}`);
        });
        
        console.log('');
        console.log('🔍 VERIFICANDO DEPENDÊNCIAS');
        console.log('───────────────────────────────────────────────────────────────');
        
        // Verificar se função fetchCENIData existe
        if (typeof fetchCENIData !== 'function') {
            console.error('');
            console.error('❌❌❌ ERRO CRÍTICO ❌❌❌');
            console.error('A função fetchCENIData NÃO ESTÁ DISPONÍVEL!');
            console.error('');
            console.error('POSSÍVEIS CAUSAS:');
            console.error('1. O arquivo ceni-api-client.js não foi carregado');
            console.error('2. O arquivo ceni-api-client.js foi carregado DEPOIS deste script');
            console.error('3. Há um erro no ceni-api-client.js que impede sua execução');
            console.error('');
            console.error('SOLUÇÃO:');
            console.error('Verifique se o ceni-api-client.js está sendo carregado ANTES');
            console.error('do ceni-gts-dinamico.js no HTML');
            console.error('');
            
            document.querySelectorAll('.gt-loading').forEach(el => el.remove());
            return;
        }
        
        console.log('✅ Função fetchCENIData encontrada!');
        console.log('');
        
        // ✨✨✨ ESTRATÉGIA OFFLINE FIRST ✨✨✨
        console.log('🎯 ESTRATÉGIA: OFFLINE FIRST');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        
        let data;
        let fonte = 'offline';
        
        console.log('⚡ TENTATIVA 1: Buscando dados OFFLINE...');
        console.log('   Endpoint: membros-offline');
        console.log('');
        
        try {
            // TENTAR BUSCAR DADOS OFFLINE
            const startTime = Date.now();
            data = await fetchCENIData('membros-offline');
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log('');
            console.log('✅✅✅ SUCESSO! DADOS OFFLINE CARREGADOS! ✅✅✅');
            console.log('═══════════════════════════════════════════════════════════════');
            console.log(`⚡ Tempo de carregamento: ${duration}ms`);
            console.log(`🚀 Fonte: MODO OFFLINE (INSTANTÂNEO)`);
            console.log('');
            console.log('📊 DADOS RECEBIDOS:');
            console.log('───────────────────────────────────────────────────────────────');
            console.log(data);
            console.log('');
            
        } catch (offlineError) {
            console.log('');
            console.log('⚠️ MODO OFFLINE NÃO DISPONÍVEL');
            console.log('───────────────────────────────────────────────────────────────');
            console.log('Erro:', offlineError.message);
            console.log('');
            console.log('💡 ISSO SIGNIFICA QUE:');
            console.log('   1. O endpoint membros-offline não foi publicado, OU');
            console.log('   2. Não há dados disponíveis no endpoint, OU');
            console.log('   3. Há um erro na API do Google Sheets');
            console.log('');
            console.log('🔄 TENTATIVA 2: Buscando da API como backup...');
            console.log('   Endpoint: gts');
            console.log('');
            
            try {
                // FALLBACK: BUSCAR DA API
                const startTime = Date.now();
                data = await fetchCENIData('gts');
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                fonte = 'api';
                
                console.log('');
                console.log('✅ DADOS DA API CARREGADOS (FALLBACK)');
                console.log('═══════════════════════════════════════════════════════════════');
                console.log(`⏱️ Tempo de carregamento: ${duration}ms`);
                console.log(`🔌 Fonte: API TRADICIONAL (MAIS LENTO)`);
                console.log('');
                console.log('⚠️ ATENÇÃO IMPORTANTE:');
                console.log('   Para habilitar o modo OFFLINE RÁPIDO, você precisa:');
                console.log('   1. Abrir o Google Sheets da planilha CENI-RJ');
                console.log('   2. Clicar no menu: 🔄 CENI-RJ > ⚡ Publicar Membros Atualizados');
                console.log('   3. Aguardar a confirmação de publicação');
                console.log('   4. Recarregar esta página');
                console.log('');
                console.log('📊 DADOS RECEBIDOS:');
                console.log('───────────────────────────────────────────────────────────────');
                console.log(data);
                console.log('');
                
            } catch (apiError) {
                console.log('');
                console.error('❌❌❌ FALHA TOTAL ❌❌❌');
                console.error('═══════════════════════════════════════════════════════════════');
                console.error('Não foi possível carregar dados OFFLINE nem da API!');
                console.error('');
                console.error('ERRO OFFLINE:', offlineError.message);
                console.error('ERRO API:', apiError.message);
                console.error('');
                console.error('POSSÍVEIS CAUSAS:');
                console.error('1. A API do Google Sheets está fora do ar');
                console.error('2. A URL da API está incorreta');
                console.error('3. Há um problema de permissões na planilha');
                console.error('4. A conexão com a internet está instável');
                console.error('');
                
                throw new Error('Falha ao carregar dados de ambas as fontes');
            }
        }
        
        // ✨ REMOVER LOADINGS
        console.log('🧹 Removendo indicadores de loading...');
        document.querySelectorAll('.gt-loading').forEach(el => el.remove());
        console.log('   ✓ Loadings removidos');
        console.log('');
        
        // PROCESSAR DADOS
        console.log('🔄 PROCESSANDO DADOS RECEBIDOS');
        console.log('═══════════════════════════════════════════════════════════════');
        
        const gtsData = data.gts || [];
        console.log(`   Total de GTs nos dados: ${gtsData.length}`);
        
        if (!gtsData || gtsData.length === 0) {
            console.log('');
            console.warn('⚠️ AVISO: Nenhum dado de GT encontrado nos dados retornados');
            console.log('   Isso pode significar que a planilha está vazia');
            console.log('');
            return;
        }
        
        // Mostrar resumo dos dados
        console.log('');
        console.log('📋 RESUMO DOS GTS:');
        console.log('───────────────────────────────────────────────────────────────');
        gtsData.forEach(gt => {
            const numMembros = gt.membros ? gt.membros.length : 0;
            console.log(`   GT ${gt.gt_numero}: ${gt.status} - ${numMembros} membros`);
        });
        console.log('');
        
        const totalSecoes = document.querySelectorAll('.gt-section').length;
        console.log(`🎯 Seções GT encontradas no HTML: ${totalSecoes}`);
        console.log('');
        
        // RENDERIZAR ACCORDIONS
        console.log('🎨 RENDERIZANDO ACCORDIONS');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        
        let accordionsInseridos = 0;
        
        gtsData.forEach(gt => {
            const gtSection = document.querySelector(`.gt-section.gt${gt.gt_numero}`);
            
            if (!gtSection) {
                console.warn(`   ⚠️ Seção do GT ${gt.gt_numero} NÃO ENCONTRADA no HTML`);
                return;
            }
            
            const accordionHTML = criarAccordionGT(gt);
            const gtHeader = gtSection.querySelector('.gt-header');
            
            if (gtHeader) {
                gtHeader.insertAdjacentHTML('beforeend', accordionHTML);
                accordionsInseridos++;
                console.log(`   ✅ Accordion inserido no GT ${gt.gt_numero}`);
            } else {
                console.warn(`   ⚠️ gt-header não encontrado para GT ${gt.gt_numero}`);
            }
        });
        
        console.log('');
        console.log(`✅ Total de accordions inseridos: ${accordionsInseridos}/${gtsData.length}`);
        console.log('');
        
        // INICIALIZAR INTERATIVIDADE
        console.log('🎯 INICIALIZANDO INTERATIVIDADE DOS ACCORDIONS');
        console.log('═══════════════════════════════════════════════════════════════');
        inicializarAccordions();
        
        console.log('');
        console.log('🎉🎉🎉 RENDERIZAÇÃO CONCLUÍDA COM SUCESSO! 🎉🎉🎉');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`📊 Fonte dos dados: ${fonte.toUpperCase()}`);
        console.log(`📋 GTs renderizados: ${accordionsInseridos}`);
        console.log(`⚡ Status: Sistema funcionando perfeitamente!`);
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        
        // ✨ MOSTRAR BADGE DE SUCESSO
        if (fonte === 'offline') {
            const badge = document.createElement('div');
            badge.textContent = '⚡ Modo Offline Ativo - Carregamento Instantâneo!';
            badge.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: bold;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                animation: slideInRight 0.4s ease;
            `;
            document.body.appendChild(badge);
            setTimeout(() => {
                badge.style.animation = 'slideOutRight 0.4s ease forwards';
                setTimeout(() => badge.remove(), 400);
            }, 4000);
        }
        
    } catch (error) {
        console.log('');
        console.error('❌❌❌ ERRO FATAL NA RENDERIZAÇÃO ❌❌❌');
        console.error('═══════════════════════════════════════════════════════════════');
        console.error('Tipo:', error.name);
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        console.error('═══════════════════════════════════════════════════════════════');
        console.log('');
        
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
                    ${error.message}<br>
                    <small>Por favor, recarregue a página ou consulte o console (F12)</small>
                </div>
            `;
            header.insertAdjacentHTML('beforeend', errorHTML);
        });
    }
}

// ============================================
// CRIAR ACCORDION DO GT
// ============================================
function criarAccordionGT(gt) {
    console.log(`   🎨 Criando accordion para GT ${gt.gt_numero}`);
    console.log(`      Status: ${gt.status}`);
    console.log(`      Membros: ${gt.membros ? gt.membros.length : 0}`);
    
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
    
    console.log(`      ✓ HTML gerado (${html.length} caracteres)`);
    
    return html;
}

// ============================================
// INICIALIZAR ACCORDIONS
// ============================================
function inicializarAccordions() {
    console.log('');
    console.log('   Procurando accordions no DOM...');
    
    const accordions = document.querySelectorAll('.gt-membros-accordion');
    console.log(`   ✓ ${accordions.length} accordions encontrados`);
    
    if (accordions.length === 0) {
        console.warn('   ⚠️ Nenhum accordion encontrado! Verifique se criarAccordionGT() foi executado');
        return;
    }
    
    let sucessos = 0;
    let falhas = 0;
    
    accordions.forEach((accordion, index) => {
        const toggle = accordion.querySelector('.accordion-toggle');
        const content = accordion.querySelector('.accordion-content');
        
        if (!toggle || !content) {
            console.warn(`   ⚠️ Accordion ${index + 1} está incompleto (faltam elementos internos)`);
            falhas++;
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
        
        sucessos++;
    });
    
    console.log(`   ✓ Inicialização concluída: ${sucessos} sucessos, ${falhas} falhas`);
}

// ============================================
// ANIMAÇÕES CSS
// ============================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// INICIALIZAÇÃO
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderizarGTsMembros);
} else {
    renderizarGTsMembros();
}

console.log('');
console.log('✅ Script ceni-gts-dinamico.js carregado e pronto');
console.log(`🔢 Versão: ${VERSAO_SCRIPT}`);
console.log('');
