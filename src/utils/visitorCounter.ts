export class VisitorCounter {
  private static readonly STORAGE_KEY = 'arc-raiders-visitor-data';
  private static readonly API_URL = 'https://api.countapi.xyz/hit/arc-raiders-loot-list/visits';

  static async initCounter(): Promise<void> {
    const visitorData = this.getVisitorData();
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Marcar como visitante único se for a primeira vez
    if (!visitorData.hasVisited) {
      visitorData.hasVisited = true;
      visitorData.firstVisit = now;
      visitorData.lastVisit = now;
      visitorData.visitCount = 1;
      this.saveVisitorData(visitorData);
      
      // Incrementar contador global
      await this.incrementGlobalCounter();
    } else {
      // Atualizar última visita
      if (now - visitorData.lastVisit > oneDayMs) {
        visitorData.visitCount++;
      }
      visitorData.lastVisit = now;
      this.saveVisitorData(visitorData);
    }

    // Buscar e exibir total de visitantes
    this.displayVisitorCount();
  }

  private static async incrementGlobalCounter(): Promise<void> {
    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) throw new Error('Failed to increment counter');
    } catch (error) {
      console.warn('Could not increment visitor counter:', error);
    }
  }

  private static async displayVisitorCount(): Promise<void> {
    try {
      const response = await fetch('https://api.countapi.xyz/get/arc-raiders-loot-list/visits');
      if (!response.ok) throw new Error('Failed to fetch counter');
      
      const data = await response.json();
      const count = data.value || 0;
      
      this.updateCounterDisplay(count);
    } catch (error) {
      console.warn('Could not fetch visitor count:', error);
    }
  }

  private static updateCounterDisplay(count: number): void {
    const counterElement = document.querySelector('.visitor-counter');
    if (counterElement) {
      counterElement.textContent = `👥 ${count.toLocaleString()} visitors`;
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
