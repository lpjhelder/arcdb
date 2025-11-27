import { GameEvent, EventWindow } from '../data/events';

interface EventStatus {
  event: GameEvent;
  window: EventWindow;
  status: 'active' | 'upcoming';
  timeUntilStart?: number; // ms
  timeUntilEnd?: number; // ms
}

export class EventTimers {
  private container: HTMLElement;
  private updateInterval?: number;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(events: GameEvent[]): void {
    this.events = events;
    this.container.innerHTML = `
      <div class="event-timers">
        <div class="event-timers__header">
          <h1 class="event-timers__title">Event Timers</h1>
          <p class="event-timers__subtitle">Todos os horários em UTC</p>
        </div>
        <div class="event-timers__grid" id="event-timers-grid">
          ${events.map(event => this.renderEventCard(event)).join('')}
        </div>
      </div>
    `;

    // Atualiza a cada segundo
    this.startUpdating();
  }

  private renderEventCard(event: GameEvent): string {
    const status = this.getEventStatus(event);
    
    return `
      <div class="event-card" data-event-id="${event.id}">
        <div class="event-card__header">
          <img class="event-card__image" src="${event.imageUrl}" alt="${event.name}">
          <div class="event-card__info">
            <h3 class="event-card__name">${event.name}</h3>
            <p class="event-card__description">${event.description}</p>
          </div>
        </div>
        <div class="event-card__schedule">
          ${this.renderEventSchedule(status)}
        </div>
      </div>
    `;
  }

  private renderEventSchedule(status: EventStatus[]): string {
    if (status.length === 0) {
      return '<p class="event-card__no-events">Nenhum evento próximo</p>';
    }

    const active = status.find(s => s.status === 'active');
    const upcoming = status.filter(s => s.status === 'upcoming').slice(0, 3);

    let html = '';

    if (active) {
      html += `
        <div class="event-window event-window--active">
          <div class="event-window__status">
            <span class="event-window__badge event-window__badge--active">ATIVO AGORA</span>
            <span class="event-window__countdown" data-countdown="${active.timeUntilEnd}">
              ${this.formatCountdown(active.timeUntilEnd!)}
            </span>
          </div>
          <div class="event-window__maps">
            ${active.window.maps.map(map => `<span class="event-window__map">${map}</span>`).join('')}
          </div>
          <div class="event-window__time">
            ${this.formatHour(active.window.startHour)}:00 - ${this.formatHour(active.window.endHour)}:00 UTC
          </div>
        </div>
      `;
    }

    if (upcoming.length > 0) {
      html += `
        <div class="event-window__upcoming-label">PRÓXIMOS</div>
        ${upcoming.map(u => `
          <div class="event-window">
            <div class="event-window__status">
              <span class="event-window__countdown" data-countdown="${u.timeUntilStart}">
                Começa em ${this.formatCountdown(u.timeUntilStart!)}
              </span>
            </div>
            <div class="event-window__maps">
              ${u.window.maps.map(map => `<span class="event-window__map">${map}</span>`).join('')}
            </div>
            <div class="event-window__time">
              ${this.formatHour(u.window.startHour)}:00 - ${this.formatHour(u.window.endHour)}:00 UTC
            </div>
          </div>
        `).join('')}
      `;
    }

    return html;
  }

  private getEventStatus(event: GameEvent): EventStatus[] {
    const now = new Date();
    const currentHourUTC = now.getUTCHours();
    const currentMinutes = now.getUTCMinutes();
    const currentSeconds = now.getUTCSeconds();
    const currentTimeInMs = (currentHourUTC * 3600 + currentMinutes * 60 + currentSeconds) * 1000;

    const statuses: EventStatus[] = [];

    // Ordena as janelas por horário
    const sortedWindows = [...event.schedule].sort((a, b) => a.startHour - b.startHour);

    for (const window of sortedWindows) {
      const startTimeInMs = window.startHour * 3600 * 1000;
      const endTimeInMs = window.endHour * 3600 * 1000;

      // Evento está ativo agora
      if (currentHourUTC >= window.startHour && currentHourUTC < window.endHour) {
        statuses.push({
          event,
          window,
          status: 'active',
          timeUntilEnd: endTimeInMs - currentTimeInMs,
        });
      }
      // Evento é futuro hoje
      else if (currentHourUTC < window.startHour) {
        statuses.push({
          event,
          window,
          status: 'upcoming',
          timeUntilStart: startTimeInMs - currentTimeInMs,
        });
      }
      // Evento é amanhã (passou hoje)
      else {
        const timeUntilStart = (24 * 3600 * 1000) - currentTimeInMs + startTimeInMs;
        statuses.push({
          event,
          window,
          status: 'upcoming',
          timeUntilStart,
        });
      }
    }

    // Ordena: ativos primeiro, depois próximos por tempo
    return statuses.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      
      const timeA = a.timeUntilStart ?? a.timeUntilEnd ?? 0;
      const timeB = b.timeUntilStart ?? b.timeUntilEnd ?? 0;
      return timeA - timeB;
    });
  }

  private formatCountdown(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private formatHour(hour: number): string {
    return hour.toString().padStart(2, '0');
  }

  private startUpdating(): void {
    // Limpa interval anterior se existir
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Atualiza contadores a cada segundo
    this.updateInterval = window.setInterval(() => {
      this.updateCountdowns();
    }, 1000);
  }

  private updateCountdowns(): void {
    const countdownElements = this.container.querySelectorAll('[data-countdown]');
    
    countdownElements.forEach(element => {
      const currentMs = parseInt(element.getAttribute('data-countdown') || '0');
      const newMs = currentMs - 1000;

      if (newMs <= 0) {
        // Evento terminou ou começou, re-render tudo
        this.forceUpdate();
        return;
      }

      element.setAttribute('data-countdown', newMs.toString());
      
      const text = element.textContent || '';
      if (text.includes('Começa em')) {
        element.textContent = `Começa em ${this.formatCountdown(newMs)}`;
      } else {
        element.textContent = this.formatCountdown(newMs);
      }
    });
  }

  private forceUpdate(): void {
    // Re-renderiza apenas os cards que mudaram
    const grid = this.container.querySelector('#event-timers-grid');
    if (!grid) return;

    const eventCards = grid.querySelectorAll('.event-card');
    eventCards.forEach(card => {
      const eventId = card.getAttribute('data-event-id');
      if (!eventId) return;

      const event = this.getEventById(eventId);
      if (!event) return;

      const status = this.getEventStatus(event);
      const scheduleContainer = card.querySelector('.event-card__schedule');
      if (scheduleContainer) {
        scheduleContainer.innerHTML = this.renderEventSchedule(status);
      }
    });
  }

  private events: GameEvent[] = [];

  public setEvents(events: GameEvent[]): void {
    this.events = events;
  }

  private getEventById(id: string): GameEvent | undefined {
    return this.events.find(e => e.id === id);
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
