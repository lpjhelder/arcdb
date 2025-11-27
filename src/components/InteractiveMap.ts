import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  id: string;
  category: string;
  subcategory: string;
  lat: number;
  lng: number;
  map: string;
  instance_name?: string | null;
}

interface MapData {
  map: string;
  markers: MapMarker[];
}

interface MapExtent {
  worldExtent: [number, number, number, number];
  tileSize: number;
  center: [number, number];
  tilesWide: number;
  tilesHigh: number;
}

interface MapExtents {
  [mapName: string]: MapExtent;
}

export class InteractiveMap {
  private container: HTMLElement;
  private mapInstance?: L.Map;
  private currentMapName: string = 'dam';
  private markerLayers: Map<string, L.LayerGroup> = new Map();
  private allMapData: MapData[] = [];
  private mapExtents?: MapExtents;

  // Categorias e subcategorias com ícones
  private categoryConfig = {
    containers: {
      label: 'Containers',
      color: '#ffc107',
      subcategories: {
        raider_cache: { label: 'Raider Cache', icon: '💰' },
        base_container: { label: 'Base Container', icon: '📦' },
        basket: { label: 'Basket', icon: '🧺' },
        weapon_case: { label: 'Weapon Case', icon: '🔫' },
        breachable_container: { label: 'Breachable', icon: '🔨' },
        security_breach: { label: 'Security Breach', icon: '🚨' },
        ammo_crate: { label: 'Ammo Crate', icon: '🎯' },
        med_crate: { label: 'Med Crate', icon: '💊' },
        locker: { label: 'Locker', icon: '🚪' },
        arc_husk: { label: 'ARC Husk', icon: '🤖' },
        bag: { label: 'Bag', icon: '🎒' },
        car: { label: 'Car', icon: '🚗' },
        arc_courier: { label: 'ARC Courier', icon: '📮' },
        arc_probe: { label: 'ARC Probe', icon: '🛸' },
        box: { label: 'Box', icon: '📦' },
        baron_husk: { label: 'Baron Husk', icon: '💀' },
        utility_crate: { label: 'Utility Crate', icon: '🧰' },
      }
    },
    locations: {
      label: 'Locations',
      color: '#2196f3',
      subcategories: {
        player_spawn: { label: 'Player Spawn', icon: '🏁' },
        button: { label: 'Button', icon: '🔘' },
        'fuel-cell': { label: 'Fuel Cell', icon: '⚡' },
        supply_station: { label: 'Supply Station', icon: '🏪' },
        locked_room: { label: 'Locked Room', icon: '🔐' },
        extraction: { label: 'Extraction', icon: '🚁' },
        hatch: { label: 'Hatch', icon: '🚪' },
        field_depot: { label: 'Field Depot', icon: '🏭' },
        antenna: { label: 'Antenna', icon: '📡' },
      }
    },
    arc: {
      label: 'ARCs',
      color: '#f44336',
      subcategories: {
        'hornet ': { label: 'Hornet', icon: '🐝' },
        wasp: { label: 'Wasp', icon: '🐝' },
        bombardier: { label: 'Bombardier', icon: '💣' },
        snitch: { label: 'Snitch', icon: '👁️' },
        bastion: { label: 'Bastion', icon: '🛡️' },
        rocketeer: { label: 'Rocketeer', icon: '🚀' },
        sentinel: { label: 'Sentinel', icon: '🗼' },
        rollbot: { label: 'Rollbot', icon: '⚙️' },
        bison: { label: 'Bison', icon: '🦬' },
        turret: { label: 'Turret', icon: '🔫' },
        fireball: { label: 'Fireball', icon: '🔥' },
        queen: { label: 'Queen', icon: '👑' },
      }
    },
    nature: {
      label: 'Nature',
      color: '#4caf50',
      subcategories: {
        lemons: { label: 'Lemons', icon: '🍋' },
        olive: { label: 'Olive', icon: '🫒' },
        apricot: { label: 'Apricot', icon: '🍑' },
        'great-mullein': { label: 'Great Mullein', icon: '🌿' },
        mushroom: { label: 'Mushroom', icon: '🍄' },
      }
    },
    events: {
      label: 'Events',
      color: '#9c27b0',
      subcategories: {
        harvester: { label: 'Harvester', icon: '🌾' },
      }
    },
    quests: {
      label: 'Quests',
      color: '#ff9800',
      subcategories: {
        'reduced-to-rubble': { label: 'Reduced to Rubble', icon: '📜' },
        'a-first-foothold': { label: 'A First Foothold', icon: '📜' },
        'armored-transports': { label: 'Armored Transports', icon: '📜' },
        'with-a-trace': { label: 'With a Trace', icon: '📜' },
        bees: { label: 'Bees', icon: '📜' },
        'back-on-top': { label: 'Back on Top', icon: '📜' },
      }
    }
  };

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public async init(mapData: MapData[]) {
    this.allMapData = mapData;
    
    // Load map extents
    try {
      const response = await fetch('/data/map-extents.json');
      this.mapExtents = await response.json();
    } catch (error) {
      console.error('Failed to load map extents:', error);
    }
    
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <div class="interactive-map">
        <div class="interactive-map__header">
          <h1 class="interactive-map__title">Mapas Interativos</h1>
          <div class="interactive-map__map-selector">
            <button class="map-selector-btn active" data-map="dam">
              <img src="/assets/maps/dam.webp" alt="Dam">
              <span>Dam</span>
            </button>
            <button class="map-selector-btn" data-map="spaceport">
              <img src="/assets/maps/spaceport.webp" alt="Spaceport">
              <span>Spaceport</span>
            </button>
            <button class="map-selector-btn" data-map="buried-city">
              <img src="/assets/maps/buried-city.webp" alt="Buried City">
              <span>Buried City</span>
            </button>
            <button class="map-selector-btn" data-map="blue-gate">
              <img src="/assets/maps/blue-gate.webp" alt="Blue Gate">
              <span>Blue Gate</span>
            </button>
          </div>
        </div>
        
        <div class="interactive-map__content">
          <div class="interactive-map__sidebar">
            <div class="map-controls">
              <h3 class="map-controls__title">Filtros</h3>
              <div class="map-controls__actions">
                <button class="map-control-btn" id="show-all">Mostrar Todos</button>
                <button class="map-control-btn" id="hide-all">Ocultar Todos</button>
              </div>
              <div class="map-controls__categories" id="category-filters">
                <!-- Será preenchido via JS -->
              </div>
            </div>
          </div>
          
          <div class="interactive-map__viewer">
            <div id="leaflet-map" class="leaflet-container"></div>
          </div>
        </div>
      </div>
    `;

    this.initializeMapSelector();
    this.initializeCategoryFilters();
    this.loadMap(this.currentMapName);
  }

  private initializeMapSelector() {
    const buttons = this.container.querySelectorAll('.map-selector-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mapName = btn.getAttribute('data-map');
        if (!mapName) return;

        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.currentMapName = mapName;
        this.loadMap(mapName);
      });
    });
  }

  private initializeCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    let html = '';
    Object.entries(this.categoryConfig).forEach(([category, config]) => {
      html += `
        <div class="category-filter">
          <div class="category-filter__header">
            <label class="category-filter__label">
              <input type="checkbox" class="category-checkbox" data-category="${category}" checked>
              <span class="category-filter__name">${config.label}</span>
            </label>
          </div>
          <div class="category-filter__subcategories">
            ${Object.entries(config.subcategories).map(([subcat, subConfig]) => `
              <label class="subcategory-filter__label">
                <input type="checkbox" class="subcategory-checkbox" 
                       data-category="${category}" 
                       data-subcategory="${subcat}" checked>
                <span class="subcategory-icon">${subConfig.icon}</span>
                <span class="subcategory-name">${subConfig.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll('.category-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const category = target.getAttribute('data-category');
        if (!category) return;

        // Toggle all subcategories
        const subcatCheckboxes = container.querySelectorAll(
          `.subcategory-checkbox[data-category="${category}"]`
        );
        subcatCheckboxes.forEach((cb: any) => {
          cb.checked = target.checked;
        });

        this.updateMarkerVisibility();
      });
    });

    container.querySelectorAll('.subcategory-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateMarkerVisibility();
      });
    });

    // Show/Hide All buttons
    document.getElementById('show-all')?.addEventListener('click', () => {
      container.querySelectorAll('input[type="checkbox"]').forEach((cb: any) => {
        cb.checked = true;
      });
      this.updateMarkerVisibility();
    });

    document.getElementById('hide-all')?.addEventListener('click', () => {
      container.querySelectorAll('input[type="checkbox"]').forEach((cb: any) => {
        cb.checked = false;
      });
      this.updateMarkerVisibility();
    });
  }

  private loadMap(mapName: string) {
    const mapContainer = document.getElementById('leaflet-map');
    if (!mapContainer || !this.mapExtents) return;

    // Destroy existing map
    if (this.mapInstance) {
      this.mapInstance.remove();
    }

    // Clear marker layers
    this.markerLayers.clear();

    // Get map extent
    const extent = this.mapExtents[mapName];
    if (!extent) {
      console.error('Map extent not found for:', mapName);
      return;
    }

    // Get map dimensions from extent
    const [, , maxX, maxY] = extent.worldExtent;
    const tileSize = extent.tileSize; // 512px per tile
    
    // Map-specific configurations based on actual tile structure
    // dam: 8192×8192 → 16×16 tiles (square)
    // buried-city: 15360×10240 → 15×10 tiles (vertical)
    // blue-gate: 10240×8192 → 10×8 tiles (horizontal)
    // spaceport: 9216×6144 → 9×6 tiles (horizontal)
    
    let scaleX: number, scaleY: number, pixelWidth: number, pixelHeight: number;
    
    if (mapName === 'dam') {
      // Dam is perfectly square: 8192×8192 world = 16×16 tiles at zoom 4
      const scale = tileSize / maxX; // 512 / 8192 = 0.0625
      scaleX = scale;
      scaleY = scale;
      pixelWidth = tileSize;
      pixelHeight = tileSize;
    } else if (mapName === 'buried-city') {
      // Buried City: 15360×10240 world = 15×10 tiles at zoom 4
      // Use max dimension like before when it worked
      const maxDim = Math.max(maxX, maxY); // 15360
      const scale = tileSize / maxDim; // 512 / 15360 = 0.0333
      scaleX = scale;
      scaleY = scale;
      pixelWidth = tileSize;
      pixelHeight = tileSize;
    } else if (mapName === 'blue-gate') {
      // Blue Gate: 10240×8192 world = 10×8 tiles at zoom 4
      // Max dimension is 10240, so scale = 512/10240
      const maxDim = Math.max(maxX, maxY);
      const scale = tileSize / maxDim;
      scaleX = scale;
      scaleY = scale;
      pixelWidth = tileSize;
      pixelHeight = tileSize;
    } else if (mapName === 'spaceport') {
      // Spaceport: 9216×6144 world = 9×6 tiles at zoom 4
      // Max dimension is 9216, so scale = 512/9216
      const maxDim = Math.max(maxX, maxY);
      const scale = tileSize / maxDim;
      scaleX = scale;
      scaleY = scale;
      pixelWidth = tileSize;
      pixelHeight = tileSize;
    } else {
      // Fallback
      const maxDim = Math.max(maxX, maxY);
      const scale = tileSize / maxDim;
      scaleX = scale;
      scaleY = scale;
      pixelWidth = tileSize;
      pixelHeight = tileSize;
    }

    console.log(`[${mapName}] Map Setup:`, {
      worldSize: [maxX, maxY],
      tileSize,
      pixelDimensions: [pixelWidth, pixelHeight],
      scale: { x: scaleX, y: scaleY },
      'MapConfig': {
        minZoom: 0,
        maxZoom: 3,
        center: [pixelHeight / 2, pixelWidth / 2],
        zoom: 0
      }
    });

    // CRS.Simple with Y-axis flipped
    // transformation: (1, 0, -1, height) flips Y axis
    const customCRS = L.extend({}, L.CRS.Simple, {
      transformation: new L.Transformation(1, 0, -1, pixelHeight)
    });

    // Map bounds in CRS coordinates (using actual proportions)
    const bounds = L.latLngBounds(
      [0, 0],
      [pixelHeight, pixelWidth]
    );

    // Initialize Leaflet map
    this.mapInstance = L.map('leaflet-map', {
      crs: customCRS,
      minZoom: -1, // Allow one level of zoom out from initial
      maxZoom: 5, // Allow zooming beyond zoom 4 (will scale zoom 4 tiles)
      zoomControl: true,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      center: [pixelHeight / 2, pixelWidth / 2],
      zoom: 1 // Start at zoom 1 (closer than before)
    });

    console.log(`Loading map: ${mapName}`, {
      bounds: [[0, 0], [pixelHeight, pixelWidth]],
      initialView: this.mapInstance.getCenter(),
      initialZoom: this.mapInstance.getZoom(),
      tileSize,
      tiles: [extent.tilesWide, extent.tilesHigh],
      scale: { x: scaleX, y: scaleY }
    });

    // Custom tile layer that uses the x_y.webp format
    // Pyramid structure: z0=1 tile (full map), z1=4 tiles (2×2), z2=16 tiles (4×4)
    const CustomTileLayer: any = L.TileLayer.extend({
      getTileUrl: function(coords: any) {
        console.log('🔍 Tile requested:', {
          z: coords.z,
          x: coords.x,
          y: coords.y
        });
        
        // Use minNativeZoom (0) if current zoom is negative
        const z = Math.max(0, coords.z);
        const maxTiles = Math.pow(2, z); // zoom 0 = 1, zoom 1 = 2, zoom 2 = 4, zoom 3 = 8
        
        // Validate coordinates
        if (coords.x < 0 || coords.y < 0 || coords.x >= maxTiles || coords.y >= maxTiles) {
          console.warn(`⚠️ Tile (${z}, ${coords.x}, ${coords.y}) out of range [0-${maxTiles - 1}]`);
          return ''; // Return empty URL - browser will show nothing
        }
        
        const url = `/assets/maps/tiles/${mapName}/${z}/${coords.x}_${coords.y}.webp`;
        console.log('✅ Valid tile:', url);
        return url;
      }
    });

    const tileLayer = new CustomTileLayer('', {
      minZoom: -1, // Match map minZoom
      maxZoom: 5, // Allow zoom beyond native tiles
      maxNativeZoom: 4, // Tiles exist up to zoom 4 (16×16 = 256 tiles for dam)
      minNativeZoom: 0, // Tiles start from zoom 0
      tileSize: 512,
      noWrap: true,
      bounds: bounds,
      keepBuffer: 0,
      updateWhenIdle: false,
      updateWhenZooming: false,
    });
    
    tileLayer.on('tileload', (e: any) => {
      console.log('✅ Tile loaded:', e.tile.src);
    });
    
    tileLayer.on('tileerror', (e: any) => {
      console.error('❌ Tile error - URL:', e.tile.src);
      console.error('❌ Tile error - Coords:', e.coords);
    });
    
    const container = document.getElementById('leaflet-map');
    console.log('🎯 Before adding tile layer, map state:', {
      center: this.mapInstance.getCenter(),
      zoom: this.mapInstance.getZoom(),
      pixelBounds: this.mapInstance.getPixelBounds(),
      containerSize: container ? [container.offsetWidth, container.offsetHeight] : 'N/A'
    });
    
    tileLayer.addTo(this.mapInstance);
    
    console.log('📍 Map state after adding tiles:', {
      center: this.mapInstance.getCenter(),
      zoom: this.mapInstance.getZoom(),
      bounds: this.mapInstance.getBounds(),
      pixelBounds: this.mapInstance.getPixelBounds()
    });

    // Add markers
    this.addMarkers(mapName);
  }

  private addMarkers(mapName: string) {
    if (!this.mapInstance) return;

    const mapData = this.allMapData.find(m => m.map === mapName);
    if (!mapData) return;
    
    const extent = this.mapExtents?.[mapName];
    if (!extent) return;
    
    const [, , worldMaxX, worldMaxY] = extent.worldExtent;
    const tileSize = extent.tileSize; // 512
    
    // Match the exact same logic as loadMap for each map
    // Ajuste fino: pode modificar scaleMultiplier para cada mapa
    let scaleX: number, scaleY: number;
    let scaleMultiplierX = 1.0; // Ajuste fino da escala X
    let scaleMultiplierY = 1.0; // Ajuste fino da escala Y
    const pixelWidth = tileSize;
    const pixelHeight = tileSize;
    
    if (mapName === 'dam') {
      const scale = tileSize / worldMaxX;
      scaleX = scale * scaleMultiplierX;
      scaleY = scale * scaleMultiplierY;
    } else if (mapName === 'buried-city') {
      const maxDim = Math.max(worldMaxX, worldMaxY);
      const scale = tileSize / maxDim;
      scaleMultiplierX = 0.93; // Ajuste aqui para buried-city
      scaleMultiplierY = 0.93; // Ajuste aqui para buried-city
      scaleX = scale * scaleMultiplierX;
      scaleY = scale * scaleMultiplierY;
    } else if (mapName === 'blue-gate') {
      const maxDim = Math.max(worldMaxX, worldMaxY);
      const scale = tileSize / maxDim;
      scaleMultiplierX = 0.53; // Ajuste aqui para blue-gate
      scaleMultiplierY = 0.53; // Ajuste aqui para blue-gate
      scaleX = scale * scaleMultiplierX;
      scaleY = scale * scaleMultiplierY;
    } else if (mapName === 'spaceport') {
      const maxDim = Math.max(worldMaxX, worldMaxY);
      const scale = tileSize / maxDim;
      scaleMultiplierX = 0.56; // Ajuste aqui para spaceport
      scaleMultiplierY = 0.56; // Ajuste aqui para spaceport
      scaleX = scale * scaleMultiplierX;
      scaleY = scale * scaleMultiplierY;
    } else {
      const maxDim = Math.max(worldMaxX, worldMaxY);
      const scale = tileSize / maxDim;
      scaleX = scale * scaleMultiplierX;
      scaleY = scale * scaleMultiplierY;
    }
    
    console.log(`[${mapName}] Adding markers:`, {
      worldSize: [worldMaxX, worldMaxY],
      tileSize,
      scale: { x: scaleX, y: scaleY },
      pixelDimensions: [pixelWidth, pixelHeight],
      markerCount: mapData.markers.length,
      firstMarker: mapData.markers[0] ? {
        lat: mapData.markers[0].lat,
        lng: mapData.markers[0].lng,
        pixelY: mapData.markers[0].lat * scaleY,
        pixelX: mapData.markers[0].lng * scaleX,
        transformedY: pixelHeight - (mapData.markers[0].lat * scaleY)
      } : null
    });

    // Group markers by category/subcategory
    const groupedMarkers = new Map<string, MapMarker[]>();

    mapData.markers.forEach(marker => {
      const key = `${marker.category}_${marker.subcategory}`;
      if (!groupedMarkers.has(key)) {
        groupedMarkers.set(key, []);
      }
      groupedMarkers.get(key)!.push(marker);
    });

    // Create layer groups
    groupedMarkers.forEach((markers, key) => {
      const [category, subcategory] = key.split('_');
      const layerGroup = L.layerGroup();

      markers.forEach((marker) => {
        const icon = this.createMarkerIcon(category, subcategory);
        // Convert world coordinates to pixel coordinates using separate X/Y scales
        const pixelY = marker.lat * scaleY;
        const pixelX = marker.lng * scaleX;
        
        // Since CRS has transformation (1, 0, -1, pixelHeight), pre-invert Y
        // This compensates for the CRS transformation so final position is correct
        const transformedY = pixelHeight - pixelY;
        
        // Manual offset adjustment per map (ajuste fino)
        let offsetX = 0;
        let offsetY = 0;
        
        if (mapName === 'buried-city') {
          offsetX = 2; // Move para direita (negativo = esquerda)
          offsetY = -2; // Move para cima (negativo = cima)
        } else if (mapName === 'blue-gate') {
          offsetX = -50.5; // Ajuste aqui para blue-gate
          offsetY = 11; // Ajuste aqui para blue-gate
        } else if (mapName === 'spaceport') {
          offsetX = 0; // Ajuste aqui para spaceport
          offsetY = 0; // Ajuste aqui para spaceport
        }
        
        const leafletMarker = L.marker([transformedY + offsetY, pixelX + offsetX], { icon });

        // Popup
        const popupContent = `
          <div class="marker-popup">
            <h4>${this.getCategoryLabel(category, subcategory)}</h4>
            ${marker.instance_name ? `<p>${marker.instance_name}</p>` : ''}
          </div>
        `;
        leafletMarker.bindPopup(popupContent);

        layerGroup.addLayer(leafletMarker);
      });

      this.markerLayers.set(key, layerGroup);
      layerGroup.addTo(this.mapInstance!);
    });
  }

  private createMarkerIcon(category: string, subcategory: string): L.DivIcon {
    const config = this.categoryConfig[category as keyof typeof this.categoryConfig];
    if (!config) {
      return L.divIcon({
        html: `<div class="custom-marker" style="background: #666;">📍</div>`,
        className: 'custom-marker-wrapper',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
    }
    const subConfig = config.subcategories[subcategory as keyof typeof config.subcategories] as any;
    const icon = subConfig?.icon || '📍';
    const color = config.color || '#666';

    return L.divIcon({
      html: `<div class="custom-marker" style="background: ${color};">${icon}</div>`,
      className: 'custom-marker-wrapper',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }

  private getCategoryLabel(category: string, subcategory: string): string {
    const config = this.categoryConfig[category as keyof typeof this.categoryConfig];
    if (!config) return subcategory;
    const subConfig = config.subcategories[subcategory as keyof typeof config.subcategories] as any;
    return subConfig?.label || subcategory;
  }

  private updateMarkerVisibility() {
    const container = document.getElementById('category-filters');
    if (!container || !this.mapInstance) return;

    // Get checked subcategories
    const checkedSubcats = new Set<string>();
    container.querySelectorAll('.subcategory-checkbox:checked').forEach((cb: any) => {
      const category = cb.getAttribute('data-category');
      const subcategory = cb.getAttribute('data-subcategory');
      checkedSubcats.add(`${category}_${subcategory}`);
    });

    // Update layer visibility
    this.markerLayers.forEach((layer, key) => {
      if (checkedSubcats.has(key)) {
        if (!this.mapInstance!.hasLayer(layer)) {
          layer.addTo(this.mapInstance!);
        }
      } else {
        if (this.mapInstance!.hasLayer(layer)) {
          this.mapInstance!.removeLayer(layer);
        }
      }
    });
  }

  public destroy() {
    if (this.mapInstance) {
      this.mapInstance.remove();
    }
  }
}
