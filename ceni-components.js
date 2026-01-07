/**
 * ============================================
 * CENI-RJ - Web Components
 * ============================================
 * Componentes reutilizáveis para Header e Footer
 */

// ============================================
// HEADER COMPONENT
// ============================================
class CeniHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="gov-header">
                <div class="header-grid">
                    <div class="header-brand">
                        <img src="https://raw.githubusercontent.com/GabrielFelizardo/almoxarifado-sistema/main/logo.png" alt="SEDEICS" class="gov-logo-img" loading="lazy">
                        
                        <div class="header-ceni-mark">
                            <div class="header-ceni-title">CENI-RJ</div>
                            <div class="header-ceni-subtitle">Comitê Estadual de Impacto</div>
                        </div>
                    </div>
                    
                    <button class="mobile-menu-toggle" id="menuToggle" aria-label="Abrir menu de navegação" aria-expanded="false">
                        <i class="fas fa-bars"></i>
                    </button>

                    <nav class="main-nav" id="mainNav" role="navigation" aria-label="Navegação principal">
                        <a href="ceni-index.html">Início</a>
                        <a href="ceni-sobre.html">Sobre</a>
                        <a href="ceni-gts.html">GTs</a>
                        <a href="ceni-eventos.html">Eventos</a>
                        <a href="ceni-canais.html">Canais</a>
                        <a href="ceni-repositorio.html">Repositório</a>
                    </nav>
                </div>
            </header>
        `;

        this.initScripts();
        this.highlightActiveLink();
    }

    initScripts() {
        // Sticky Header Logic
        const header = this.querySelector('.gov-header');
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 100);
        });

        // Mobile Menu Logic
        const menuToggle = this.querySelector('#menuToggle');
        const mainNav = this.querySelector('#mainNav');
        
        // Procura ou cria o overlay
        let mobileOverlay = document.getElementById('mobileOverlay');
        if (!mobileOverlay) {
            mobileOverlay = document.createElement('div');
            mobileOverlay.id = 'mobileOverlay';
            mobileOverlay.className = 'mobile-overlay';
            document.body.appendChild(mobileOverlay);
        }

        const toggleMenu = () => {
            const isOpen = mainNav.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isOpen);
            menuToggle.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        };

        menuToggle.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) toggleMenu();
        });
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname.split('/').pop() || 'ceni-index.html';
        const links = this.querySelectorAll('.main-nav a');
        
        links.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (currentPath === linkHref) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }
}

// ============================================
// FOOTER COMPONENT
// ============================================
class CeniFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="page-footer-enhanced" data-animate>
                <div class="swiss-grid">
                    <div class="footer-grid-enhanced" style="grid-column: 1 / -1;">
                        
                        <div class="footer-brand">
                            <div class="footer-logo-text">CENI-RJ</div>
                            <p class="footer-tagline">
                                Comitê Estadual de Investimentos e Negócios de Impacto do Rio de Janeiro
                            </p>
                        </div>
                        
                        <div class="footer-section-enhanced gt-accent-1">
                            <h4>Navegação</h4>
                            <div class="footer-section-content">
                                <a href="ceni-index.html"><i class="fas fa-home"></i><span>Início</span></a>
                                <a href="ceni-sobre.html"><i class="fas fa-info-circle"></i><span>Sobre o Comitê</span></a>
                                <a href="ceni-gts.html"><i class="fas fa-users"></i><span>Grupos de Trabalho</span></a>
                                <a href="ceni-eventos.html"><i class="fas fa-calendar-alt"></i><span>Eventos</span></a>
                                <a href="ceni-canais.html"><i class="fas fa-comments"></i><span>Canais</span></a>
                                <a href="ceni-repositorio.html"><i class="fas fa-folder-open"></i><span>Repositório</span></a>
                            </div>
                        </div>
                        
                        <div class="footer-section-enhanced gt-accent-2">
                            <h4>Contato</h4>
                            <div class="footer-section-content">
                                <a href="mailto:nucleo.acompanhamento@desenvolvimento.rj.gov.br" class="footer-contact-link">
                                    <i class="fas fa-envelope"></i>
                                    <span>nucleo.acompanhamento@desenvolvimento.rj.gov.br</span>
                                </a>
                                <a href="mailto:gabinete@desenvolvimento.rj.gov.br" class="footer-contact-link">
                                    <i class="fas fa-envelope"></i>
                                    <span>gabinete@desenvolvimento.rj.gov.br</span>
                                </a>
                                <a href="tel:+552133987000">
                                    <i class="fas fa-phone"></i>
                                    <span>(21) 3398-7000</span>
                                </a>
                                <div style="margin-top: 1rem; color: rgba(255,255,255,0.75); font-size: 0.875rem;">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span style="margin-left: 0.75rem;">Palácio Guanabara - Laranjeiras, Rio de Janeiro - RJ</span>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    
                    <div class="footer-bottom-enhanced" style="grid-column: 1 / -1;">
                        <p>© <span id="current-year">${new Date().getFullYear()}</span> CENI-RJ - Comitê Estadual de Investimentos e Negócios de Impacto</p>
                        <p>SEDEICS - Secretaria de Desenvolvimento Econômico, Indústria, Comércio e Serviços</p>
                        <p>Desenvolvido por Gabriel Felizardo da Silva</p>
                    </div>
                </div>
            </footer>
        `;
        
        // Se existir o script de footer enhanced, tenta reinicializar
        if (window.CENIFooter && window.CENIFooter.refresh) {
            window.CENIFooter.refresh();
        }
    }
}

// Registrar os componentes
customElements.define('ceni-header', CeniHeader);
customElements.define('ceni-footer', CeniFooter);
