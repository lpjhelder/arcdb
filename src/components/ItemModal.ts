import type { Item, DecisionReason } from '../types/Item';
import { dataLoader } from '../utils/dataLoader';
import { getMapRecommendations, getZoneInfo } from '../utils/zoneMapping';

export interface ItemModalConfig {
  item: Item;
  decisionData: DecisionReason;
  onClose: () => void;
}

export class ItemModal {
  private config: ItemModalConfig;
  private modalElement: HTMLElement | null = null;

  constructor(config: ItemModalConfig) {
    this.config = config;
  }

  show(): void {
    const modal = document.getElementById('item-modal');
    if (!modal) return;

    const content = modal.querySelector('.modal-content');
    if (!content) return;

    content.innerHTML = this.renderContent();

    // Event listeners
    const closeBtn = content.querySelector('[data-action="close"]');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn?.addEventListener('click', () => this.hide());
    overlay?.addEventListener('click', () => this.hide());

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    this.modalElement = modal;
  }

  hide(): void {
    if (this.modalElement) {
      this.modalElement.classList.remove('active');
      document.body.style.overflow = '';
      this.config.onClose();
    }
  }

  private renderContent(): string {
    const { item, decisionData } = this.config;
    const iconUrl = dataLoader.getIconUrl(item);
    const itemName = item.name?.['en'] || item.name?.[Object.keys(item.name || {})[0]] || '[Unknown Item]';
    const description = item.description?.['en'] || item.description?.[Object.keys(item.description || {})[0]] || 'No description available.';
    const itemValue = item.value ?? 0;
    const itemWeight = item.weightKg ?? 0;
    const itemStack = item.stackSize ?? 1;

    return `
      <div class="item-modal">
        <button class="modal-close" data-action="close">×</button>

        <div class="item-modal__header">
          <div class="item-modal__image-container">
            <img
              src="${iconUrl}"
              alt="${itemName}"
              class="item-modal__image"
              onerror="this.outerHTML='<div class=\\'item-modal__placeholder\\'>?</div>'"
            />
          </div>
          <div class="item-modal__header-info">
            <h2 class="item-modal__name">${itemName}</h2>
            <div class="item-modal__badges">
              ${item.rarity ? `<span class="rarity-badge rarity-badge--${item.rarity}">${item.rarity}</span>` : '<span class="rarity-badge rarity-badge--unknown">Unknown</span>'}
              <span class="decision-badge decision-badge--${decisionData.decision}">
                ${this.getDecisionLabel(decisionData.decision)}
              </span>
            </div>
          </div>
        </div>

        <div class="item-modal__body">
          <div class="item-modal__section">
            <h3>Description</h3>
            <p>${description}</p>
          </div>

          <div class="item-modal__section">
            <h3>Decision Analysis</h3>
            <div class="decision-analysis">
              <div class="decision-analysis__header">
                <span class="decision-analysis__decision decision-${decisionData.decision}">
                  ${this.getDecisionLabel(decisionData.decision)}
                </span>
              </div>
              <ul class="decision-analysis__reasons">
                ${decisionData.reasons.map(reason => `<li>${reason}</li>`).join('')}
              </ul>
              ${decisionData.dependencies && decisionData.dependencies.length > 0 ? `
                <div class="decision-analysis__dependencies">
                  <strong>Required for:</strong> ${decisionData.dependencies.join(', ')}
                </div>
              ` : ''}
            </div>
          </div>

          <div class="item-modal__grid">
            <div class="item-modal__section">
              <h3>Properties</h3>
              <dl class="property-list">
                <dt>Type</dt>
                <dd>${item.type || 'Unknown'}</dd>
                <dt>Value</dt>
                <dd>${itemValue} coins</dd>
                <dt>Weight</dt>
                <dd>${itemWeight} kg</dd>
                <dt>Stack Size</dt>
                <dd>${itemStack}</dd>
              </dl>
            </div>

            ${item.recyclesInto && item.recyclesInto.length > 0 ? `
              <div class="item-modal__section">
                <h3>Recycles Into</h3>
                <ul class="recycle-list">
                  ${item.recyclesInto.map(output => `
                    <li>${output.quantity}x ${output.itemId}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            ${item.recipe && item.recipe.length > 0 ? `
              <div class="item-modal__section">
                <h3>Crafting Recipe</h3>
                <ul class="recipe-list">
                  ${item.recipe.map(ingredient => `
                    <li>${ingredient.quantity}x ${ingredient.itemId}</li>
                  `).join('')}
                </ul>
                ${item.craftBench ? `<p class="craft-bench">Requires: ${item.craftBench}</p>` : ''}
              </div>
            ` : ''}

            ${Array.isArray(item.foundIn) && item.foundIn.length > 0 ? `
              <div class="item-modal__section">
                <h3>Location & Maps</h3>

                <div class="location-zones">
                  <h4>Found In:</h4>
                  <div class="zone-badges">
                    ${item.foundIn.map(location => {
                      const zoneInfo = getZoneInfo(location);
                      return `<span class="zone-badge" style="--zone-color: ${zoneInfo?.color || '#6b7280'}" title="${zoneInfo?.description || location}">${location}</span>`;
                    }).join('')}
                  </div>
                </div>

                ${this.renderMapRecommendations(item.foundIn)}
              </div>
            ` : ''}
          </div>

          ${item.tip?.['en'] ? `
            <div class="item-modal__section item-modal__tip">
              <h3>💡 Tip</h3>
              <p>${item.tip['en']}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderMapRecommendations(zones: string[]): string {
    const maps = getMapRecommendations(zones);

    if (maps.length === 0) {
      return '';
    }

    // Handle special cases
    if (maps.includes('Hideout')) {
      return `
        <div class="map-recommendations">
          <h4>Available At:</h4>
          <div class="map-badges">
            <span class="map-badge map-badge--vendor">Hideout Vendor</span>
          </div>
        </div>
      `;
    }

    if (maps.includes('All Maps')) {
      return `
        <div class="map-recommendations">
          <h4>Check Maps:</h4>
          <div class="map-badges">
            <span class="map-badge map-badge--all">All Raid Maps</span>
          </div>
          <p class="map-hint">Can be looted from enemies on any map</p>
        </div>
      `;
    }

    return `
      <div class="map-recommendations">
        <h4>Check Maps:</h4>
        <div class="map-badges">
          ${maps.map(map => `<span class="map-badge">${map}</span>`).join('')}
        </div>
        <p class="map-hint">Look for ${zones.join(', ')} zones on these maps</p>
      </div>
    `;
  }

  private getDecisionLabel(decision: string): string {
    const labels: Record<string, string> = {
      keep: 'KEEP',
      sell_or_recycle: 'SAFE TO SELL',
      situational: 'REVIEW'
    };
    return labels[decision] || decision.toUpperCase();
  }
}
