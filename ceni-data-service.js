/**
 * CENI-RJ Data Service
 * Serviço de integração com Google Sheets API
 * Versão: 1.0
 */

const CENI_API = {
  BASE_URL: 'https://script.google.com/macros/s/AKfycbzrWGvrjmuMaCxcLGewlRdcNqjPaPmn9y8x7Nn63GuFSI3f1211fW7l6NgkqlI0YVjGjQ/exec',
  
  // Cache local (5 minutos)
  CACHE_TIME: 5 * 60 * 1000,
  cache: {},

  /**
   * Faz requisição à API com cache
   */
  async _fetch(action, params = {}) {
    const cacheKey = `${action}_${JSON.stringify(params)}`;
    const now = Date.now();

    // Verifica cache
    if (this.cache[cacheKey] && (now - this.cache[cacheKey].timestamp) < this.CACHE_TIME) {
      console.log(`[CENI API] Cache hit: ${action}`);
      return this.cache[cacheKey].data;
    }

    try {
      // Monta URL com parâmetros
      const url = new URL(this.BASE_URL);
      url.searchParams.append('action', action);
      
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      console.log(`[CENI API] Fetching: ${action}`, params);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Salva no cache
      this.cache[cacheKey] = {
        data: data,
        timestamp: now
      };

      console.log(`[CENI API] Success: ${action}`, data);
      return data;

    } catch (error) {
      console.error(`[CENI API] Error: ${action}`, error);
      
      // Tenta usar cache antigo em caso de erro
      if (this.cache[cacheKey]) {
        console.warn(`[CENI API] Using stale cache for: ${action}`);
        return this.cache[cacheKey].data;
      }
      
      throw error;
    }
  },

  /**
   * Busca eventos
   * @param {string} categoria - 'todos', 'reuniao', 'prazo', 'marco', 'ecossistema'
   */
  async getEventos(categoria = 'todos') {
    return await this._fetch('eventos', { categoria });
  },

  /**
   * Busca membros e organizações
   */
  async getMembros() {
    return await this._fetch('membros');
  },

  /**
   * Busca documentos
   * @param {string} categoria - 'todos', 'institucionais', 'atas', 'relatorios', 'materiais'
   */
  async getDocumentos(categoria = 'todos') {
    return await this._fetch('documentos', { categoria });
  },

  /**
   * Busca FAQ
   */
  async getFAQ() {
    return await this._fetch('faq');
  },

  /**
   * Busca estatísticas
   */
  async getStats() {
    return await this._fetch('stats');
  },

  /**
   * Busca notícias em destaque
   */
  async getDestaques() {
    return await this._fetch('destaques');
  },

  /**
   * Busca configurações de categorias
   */
  async getCategorias() {
    return await this._fetch('categorias');
  },

  /**
   * Limpa cache local
   */
  clearLocalCache() {
    this.cache = {};
    console.log('[CENI API] Cache local limpo');
  },

  /**
   * Força atualização (ignora cache)
   */
  async forceRefresh(action, params = {}) {
    const cacheKey = `${action}_${JSON.stringify(params)}`;
    delete this.cache[cacheKey];
    return await this._fetch(action, params);
  }
};

/**
 * Utilitários de formatação
 */
const CENI_Utils = {
  /**
   * Formata data para exibição
   */
  formatarData(dataString) {
    if (!dataString) return '';
    
    const [ano, mes, dia] = dataString.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                   'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return {
      dia: dia,
      mes: meses[parseInt(mes) - 1],
      ano: ano,
      completo: `${dia}/${mes}/${ano}`
    };
  },

  /**
   * Gera ícone Font Awesome
   */
  gerarIcone(nomeIcone) {
    return `<i class="fa-solid fa-${nomeIcone}"></i>`;
  },

  /**
   * Gera badge colorido
   */
  gerarBadge(texto, cor) {
    return `<span class="badge" style="background-color: ${cor}">${texto}</span>`;
  },

  /**
   * Verifica se string está vazia
   */
  isEmpty(str) {
    return !str || str.trim() === '' || str === '-';
  }
};

// Log de inicialização
console.log('[CENI API] Data Service carregado - v1.0');
console.log('[CENI API] Base URL:', CENI_API.BASE_URL);
console.log('[CENI API] Cache time:', CENI_API.CACHE_TIME / 1000, 'segundos');
