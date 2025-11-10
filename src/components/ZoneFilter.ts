import type { Item } from '../types/Item';
import { getZonesByCategory, countItemsByZone, type ZoneInfo } from '../utils/zoneMapping';

export interface ZoneFilterConfig {
  items: Item[];
  onZoneSelect: (zones: string[]) => void;
  selectedZones: string[];
}

export class ZoneFilter {
  private config: ZoneFilterConfig;
  private container: HTMLElement;
  private isVisible: boolean = false;

  constructor(config: ZoneFilterConfig) {
    this.config = config;
    this.container = this.createContainer();
    this.render();
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'zone-filter';
    container.style.display = 'none';
    return container;
  }

  public mount(parent: HTMLElement): void {
    parent.appendChild(this.container);
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
  }

  public show(): void {
    this.isVisible = true;
    this.container.style.display = 'block';
  }

  public hide(): void {
    this.isVisible = false;
    this.container.style.display = 'none';
  }

  public updateItems(items: Item[]): void {
    this.config.items = items;
    this.render();
  }

  private handleZoneClick(zone: string): void {
    const currentZones = [...this.config.selectedZones];
    const index = currentZones.indexOf(zone);

    if (index > -1) {
      // Remove zone
      currentZones.splice(index, 1);
    } else {
      // Add zone
      currentZones.push(zone);
    }

    this.config.onZoneSelect(currentZones);
    this.render();
  }

  private handleClearAll(): void {
    this.config.onZoneSelect([]);
    this.render();
  }

  private render(): void {
    const zoneCounts = countItemsByZone(this.config.items);
    const zonesByCategory = getZonesByCategory();

    this.container.innerHTML = `
      <div class="zone-filter__content">
        <div class="zone-filter__header">
          <h2>Filter by Location</h2>
          ${this.config.selectedZones.length > 0 ? `
            <button class="zone-filter__clear" id="clear-zones">
              Clear All (${this.config.selectedZones.length})
            </button>
          ` : ''}
        </div>

        <div class="zone-filter__categories">
          ${this.renderCategory('Vendors', zonesByCategory.vendor, zoneCounts)}
          ${this.renderCategory('Buildings', zonesByCategory.building, zoneCounts)}
          ${this.renderCategory('Environment', zonesByCategory.environment, zoneCounts)}
          ${this.renderCategory('Enemies', zonesByCategory.enemy, zoneCounts)}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderCategory(title: string, zones: ZoneInfo[], counts: Record<string, number>): string {
    if (zones.length === 0) return '';

    return `
      <div class="zone-filter__category">
        <h3 class="zone-filter__category-title">${title}</h3>
        <div class="zone-filter__grid">
          ${zones.map(zone => this.renderZoneCard(zone, counts[zone.name] || 0)).join('')}
        </div>
      </div>
    `;
  }

  private renderZoneCard(zone: ZoneInfo, count: number): string {
    const isSelected = this.config.selectedZones.includes(zone.name);
    const hasItems = count > 0;

    return `
      <button
        class="zone-card ${isSelected ? 'zone-card--selected' : ''} ${!hasItems ? 'zone-card--empty' : ''}"
        data-zone="${zone.name}"
        ${!hasItems ? 'disabled' : ''}
        style="--zone-color: ${zone.color}"
      >
        <div class="zone-card__header">
          <span class="zone-card__name">${zone.displayName}</span>
          <span class="zone-card__count">${count}</span>
        </div>
        <div class="zone-card__description">${zone.description}</div>
        <div class="zone-card__maps">${this.renderMaps(zone.maps)}</div>
      </button>
    `;
  }

  private renderMaps(maps: string[]): string {
    if (maps.length === 1 && maps[0] === 'All Maps') {
      return '<span class="zone-card__map-badge zone-card__map-badge--all">All Maps</span>';
    }

    if (maps.length > 3) {
      return `<span class="zone-card__map-badge">All Raid Maps</span>`;
    }

    return maps
      .map(map => `<span class="zone-card__map-badge">${map}</span>`)
      .join('');
  }

  private attachEventListeners(): void {
    // Zone card clicks
    this.container.querySelectorAll('.zone-card').forEach(card => {
      card.addEventListener('click', () => {
        const zone = (card as HTMLElement).dataset.zone;
        if (zone) {
          this.handleZoneClick(zone);
        }
      });
    });

    // Clear button
    const clearBtn = this.container.querySelector('#clear-zones');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.handleClearAll());
    }
  }

  public destroy(): void {
    this.container.remove();
  }
}
