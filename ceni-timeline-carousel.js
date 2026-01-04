/**
 * ============================================
 * CARROSSEL DE TIMELINE - CONTROLE
 * ============================================
 * Navegação, swipe, keyboard e indicadores
 */

class TimelineCarousel {
    constructor(container) {
        this.container = container;
        this.carousel = container.querySelector('.timeline-carousel');
        this.items = Array.from(this.carousel.querySelectorAll('.timeline-item'));
        this.currentIndex = 0;
        this.itemsPerView = this.getItemsPerView();
        this.maxIndex = Math.max(0, this.items.length - this.itemsPerView);
        
        // Touch/Swipe
        this.startX = 0;
        this.currentX = 0;
        this.isDragging = false;
        this.startTransform = 0;
        
        this.init();
    }
    
    init() {
        this.createControls();
        this.attachEventListeners();
        this.updateView();
        
        // Responsividade
        window.addEventListener('resize', () => {
            this.itemsPerView = this.getItemsPerView();
            this.maxIndex = Math.max(0, this.items.length - this.itemsPerView);
            this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
            this.updateView();
        });
    }
    
    getItemsPerView() {
        return window.innerWidth <= 968 ? 1 : 2;
    }
    
    createControls() {
        // Wrapper para navegação
        const nav = document.createElement('div');
        nav.className = 'carousel-navigation';
        
        // Botão Anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-nav prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.setAttribute('aria-label', 'Anterior');
        prevBtn.onclick = () => this.prev();
        
        // Botão Próximo
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-nav next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.setAttribute('aria-label', 'Próximo');
        nextBtn.onclick = () => this.next();
        
        this.prevBtn = prevBtn;
        this.nextBtn = nextBtn;
        
        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);
        
        // Indicadores (dots)
        this.createIndicators();
        
        // Contador
        this.createCounter();
    }
    
    createIndicators() {
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';
        
        const numDots = this.maxIndex + 1;
        
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
            dot.onclick = () => this.goTo(i);
            indicators.appendChild(dot);
        }
        
        this.indicators = indicators;
        this.container.appendChild(indicators);
    }
    
    createCounter() {
        const counter = document.createElement('div');
        counter.className = 'carousel-counter';
        counter.innerHTML = `
            <span class="current">1</span>
            <span class="separator"> / </span>
            <span class="total">${this.maxIndex + 1}</span>
        `;
        this.counter = counter;
        this.container.appendChild(counter);
    }
    
    attachEventListeners() {
        // Touch events
        this.carousel.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.carousel.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.carousel.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Mouse events (para desktop)
        this.carousel.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.carousel.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.carousel.addEventListener('mouseup', (e) => this.handleMouseEnd(e));
        this.carousel.addEventListener('mouseleave', (e) => this.handleMouseEnd(e));
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isInViewport()) {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            }
        });
    }
    
    // Touch/Swipe handlers
    handleTouchStart(e) {
        this.startX = e.touches[0].clientX;
        this.isDragging = true;
        this.startTransform = this.getCurrentTransform();
        this.container.classList.add('dragging');
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.touches[0].clientX;
        const diff = this.currentX - this.startX;
        const newTransform = this.startTransform + diff;
        
        this.carousel.style.transform = `translateX(${newTransform}px)`;
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        const diff = this.currentX - this.startX;
        const threshold = 50; // pixels
        
        if (diff > threshold) {
            this.prev();
        } else if (diff < -threshold) {
            this.next();
        } else {
            this.updateView(); // Voltar para posição original
        }
        
        this.isDragging = false;
        this.container.classList.remove('dragging');
    }
    
    // Mouse handlers (desktop drag)
    handleMouseDown(e) {
        this.startX = e.clientX;
        this.isDragging = true;
        this.startTransform = this.getCurrentTransform();
        this.container.classList.add('dragging');
        e.preventDefault();
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.clientX;
        const diff = this.currentX - this.startX;
        const newTransform = this.startTransform + diff;
        
        this.carousel.style.transform = `translateX(${newTransform}px)`;
    }
    
    handleMouseEnd(e) {
        if (!this.isDragging) return;
        
        const diff = this.currentX - this.startX;
        const threshold = 50;
        
        if (diff > threshold) {
            this.prev();
        } else if (diff < -threshold) {
            this.next();
        } else {
            this.updateView();
        }
        
        this.isDragging = false;
        this.container.classList.remove('dragging');
    }
    
    getCurrentTransform() {
        const style = window.getComputedStyle(this.carousel);
        const matrix = style.transform || style.webkitTransform;
        
        if (matrix === 'none') return 0;
        
        const values = matrix.match(/matrix.*\((.+)\)/)[1].split(', ');
        return parseFloat(values[4]);
    }
    
    // Navegação
    next() {
        if (this.currentIndex < this.maxIndex) {
            this.currentIndex++;
            this.updateView();
        }
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateView();
        }
    }
    
    goTo(index) {
        if (index >= 0 && index <= this.maxIndex) {
            this.currentIndex = index;
            this.updateView();
        }
    }
    
    updateView() {
        // Calcular offset
        const itemWidth = this.items[0].offsetWidth;
        const gap = 32; // 2rem em pixels
        const offset = -(this.currentIndex * (itemWidth + gap));
        
        // Aplicar transformação
        this.carousel.style.transform = `translateX(${offset}px)`;
        
        // Atualizar botões
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.maxIndex;
        
        // Atualizar indicadores
        const dots = this.indicators.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
        
        // Atualizar contador
        const currentNum = this.counter.querySelector('.current');
        currentNum.textContent = this.currentIndex + 1;
    }
    
    isInViewport() {
        const rect = this.container.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );
    }
    
    // Auto-play (opcional)
    startAutoPlay(interval = 5000) {
        this.autoPlayInterval = setInterval(() => {
            if (this.currentIndex === this.maxIndex) {
                this.goTo(0);
            } else {
                this.next();
            }
        }, interval);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }
}

// Expor globalmente
window.TimelineCarousel = TimelineCarousel;

console.log('✅ Carrossel de Timeline carregado');
