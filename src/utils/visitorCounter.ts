export class VisitorCounter {
  private static readonly STORAGE_KEY = 'arc-raiders-visitor-data';
  // API Proxy simples e gratuita para contador
  private static readonly COUNT_API = 'https://api.counterapi.dev/v1/arc-raiders-loot/visitors';

  static async initCounter(): Promise<void> {
    const visitorData = this.getVisitorData();
    const now = Date.now();

    // Marcar como visitante único se for a primeira vez
    if (!visitorData.hasVisited) {
      visitorData.hasVisited = true;
      visitorData.firstVisit = now;
      this.saveVisitorData(visitorData);
      
      // Incrementar contador global apenas na primeira visita
      await this.incrementAndDisplay();
    } else {
      // Apenas buscar o contador atual
      await this.fetchAndDisplay();
    }
    
    visitorData.lastVisit = now;
    this.saveVisitorData(visitorData);
  }

  private static async incrementAndDisplay(): Promise<void> {
    try {
      const response = await fetch(`${this.COUNT_API}/up`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        this.updateCounterDisplay(data.count || 1);
      } else {
        this.updateCounterDisplay(1);
      }
    } catch (error) {
      console.warn('Could not increment visitor counter:', error);
      this.updateCounterDisplay(1);
    }
  }

  private static async fetchAndDisplay(): Promise<void> {
    try {
      const response = await fetch(this.COUNT_API, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        this.updateCounterDisplay(data.count || 1);
      } else {
        this.updateCounterDisplay(1);
      }
    } catch (error) {
      console.warn('Could not fetch visitor count:', error);
      this.updateCounterDisplay(1);
    }
  }

  private static updateCounterDisplay(count: number): void {
    const counterElement = document.querySelector('.visitor-counter');
    if (counterElement) {
      counterElement.textContent = `👥 ${count.toLocaleString()} ${count === 1 ? 'visitor' : 'visitors'}`;
    }
  }

  private static getVisitorData(): VisitorData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return this.getDefaultVisitorData();
      }
    }
    return this.getDefaultVisitorData();
  }

  private static getDefaultVisitorData(): VisitorData {
    return {
      hasVisited: false,
      firstVisit: 0,
      lastVisit: 0,
      visitCount: 0
    };
  }

  private static saveVisitorData(data: VisitorData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
}

interface VisitorData {
  hasVisited: boolean;
  firstVisit: number;
  lastVisit: number;
  visitCount: number;
}
