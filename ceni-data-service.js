/**
 * CENI-RJ Data Service
 * Serviço de comunicação com Google Sheets via Apps Script
 */

const CENI_API = {
  // CONFIGURAÇÃO
  BASE_URL: 'https://script.google.com/macros/s/AKfycbzrWGvrjmuMaCxcLGewlRdcNqjPaPmn9y8x7Nn63GuFSI3f1211fW7l6NgkqlI0YVjGjQ/exec',
  CACHE_TIME: 5 * 60 * 1000, // 5 minutos
  
  // Cache local
  cache: new Map(),
  
  /**
   * Busca dados da API com cache
   */
  async fetch(action, params = {}) {
    const cacheKey = `${action}_${JSON.stringify(params)}`;
    
    // Verificar cache local
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TIME) {
      console.log(`📦 Cache hit: ${action}`);
      return cached.data;
    }
    
    // Fazer requisição
    const url = new URL(this.BASE_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    try {
      console.log(`🌐 Buscando: ${action}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Verificar se há erro
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Salvar no cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      console.log(`✅ Sucesso: ${action}`, data);
      return data;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar ${action}:`, error);
      
      // Tentar retornar cache antigo se houver
      const oldCache = this.cache.get(cacheKey);
      if (oldCache) {
        console.log(`⚠️ Usando cache antigo para ${action}`);
        return oldCache.data;
      }
      
      throw error;
    }
  },
  
  // ========================================
  // MÉTODOS ESPECÍFICOS
  // ========================================
  
  /**
   * Busca eventos (todos ou filtrados por categoria)
   * @param {string} categoria - 'todos', 'reuniao', 'prazo', 'marco', 'ecossistema'
   */
  async getEventos(categoria = 'todos') {
    return this.fetch('eventos', { categoria });
  },
  
  /**
   * Busca membros/organizações
   */
  async getMembros() {
    return this.fetch('membros');
  },
  
  /**
   * Busca documentos (todos ou filtrados por categoria)
   * @param {string} categoria - 'todos', 'institucionais', 'atas', 'relatorios', 'materiais'
   */
  async getDocumentos(categoria = 'todos') {
    return this.fetch('documentos', { categoria });
  },
  
  /**
   * Busca perguntas frequentes
   */
  async getFAQ() {
    return this.fetch('faq');
  },
  
  /**
   * Busca estatísticas do comitê
   */
  async getStats() {
    return this.fetch('stats');
  },
  
  /**
   * Busca notícias em destaque
   */
  async getDestaques() {
    return this.fetch('destaques');
  },
  
  /**
   * Busca configurações de categorias
   */
  async getCategorias() {
    return this.fetch('categorias');
  },
  
  /**
   * Limpa todo o cache local
   */
  clearLocalCache() {
    this.cache.clear();
    console.log('🗑️ Cache local limpo');
  },
  
  /**
   * Força atualização (limpa cache e busca novamente)
   */
  async forceRefresh(action, params = {}) {
    const cacheKey = `${action}_${JSON.stringify(params)}`;
    this.cache.delete(cacheKey);
    return this.fetch(action, params);
  }
};

// Expor globalmente
window.CENI_API = CENI_API;
