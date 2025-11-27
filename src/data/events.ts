export interface EventWindow {
  startHour: number; // 0-23 (UTC)
  endHour: number;
  maps: string[]; // Dam, Spaceport, Buried City, Blue Gate
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  schedule: EventWindow[]; // Janelas de horário do evento
}

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'night-raid',
    name: 'Night Raid',
    description: 'Raids noturnas com melhor loot e mais desafios',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/night.webp',
    schedule: [
      { startHour: 1, endHour: 2, maps: ['Spaceport'] },
      { startHour: 2, endHour: 3, maps: ['Dam'] },
      { startHour: 3, endHour: 4, maps: ['Buried City'] },
      { startHour: 4, endHour: 5, maps: ['Blue Gate'] },
      { startHour: 6, endHour: 7, maps: ['Buried City'] },
    ]
  },
  {
    id: 'electromagnetic-storm',
    name: 'Electromagnetic Storm',
    description: 'Tempestade eletromagnética que afeta equipamentos',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/electrical.webp',
    schedule: [
      { startHour: 5, endHour: 6, maps: ['Dam'] },
      { startHour: 7, endHour: 8, maps: ['Blue Gate'] },
      { startHour: 11, endHour: 12, maps: ['Dam'] },
      { startHour: 16, endHour: 17, maps: ['Spaceport', 'Blue Gate'] },
    ]
  },
  {
    id: 'harvester',
    name: 'Harvester',
    description: 'Harvester ARC aparece para coletar recursos',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/harvester.webp',
    schedule: [
      { startHour: 9, endHour: 10, maps: ['Dam'] },
      { startHour: 16, endHour: 17, maps: ['Dam'] },
      { startHour: 17, endHour: 18, maps: ['Blue Gate'] },
      { startHour: 18, endHour: 19, maps: ['Spaceport'] },
      { startHour: 0, endHour: 1, maps: ['Spaceport'] },
    ]
  },
  {
    id: 'hidden-bunker',
    name: 'Hidden Bunker',
    description: 'Bunkers secretos abrem com loot valioso',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/hiddenbunker.webp',
    schedule: [
      { startHour: 10, endHour: 11, maps: ['Spaceport'] },
      { startHour: 19, endHour: 20, maps: ['Spaceport'] },
    ]
  },
  {
    id: 'husk-graveyard',
    name: 'Husk Graveyard',
    description: 'Cemitério de Husks com partes raras',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/husk-graveyard.webp',
    schedule: [
      { startHour: 10, endHour: 11, maps: ['Dam'] },
      { startHour: 14, endHour: 15, maps: ['Buried City'] },
      { startHour: 18, endHour: 19, maps: ['Blue Gate'] },
    ]
  },
  {
    id: 'lush-blooms',
    name: 'Lush Blooms',
    description: 'Vegetação exuberante com recursos naturais',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/lush.webp',
    schedule: [
      { startHour: 8, endHour: 9, maps: ['Buried City'] },
      { startHour: 9, endHour: 10, maps: ['Blue Gate'] },
      { startHour: 12, endHour: 13, maps: ['Spaceport'] },
      { startHour: 17, endHour: 18, maps: ['Dam', 'Buried City'] },
    ]
  },
  {
    id: 'matriarch',
    name: 'Matriarch',
    description: 'Boss Matriarch aparece para desafio extremo',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/matriarch.webp',
    schedule: [
      { startHour: 11, endHour: 12, maps: ['Blue Gate'] },
      { startHour: 20, endHour: 21, maps: ['Dam'] },
      { startHour: 21, endHour: 22, maps: ['Spaceport'] },
      { startHour: 23, endHour: 0, maps: ['Blue Gate'] },
      { startHour: 0, endHour: 1, maps: ['Dam'] },
    ]
  },
  {
    id: 'prospecting-probes',
    name: 'Prospecting Probes',
    description: 'Sondas de prospecção revelam recursos',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/probe.webp',
    schedule: [
      { startHour: 9, endHour: 10, maps: ['Spaceport'] },
      { startHour: 10, endHour: 11, maps: ['Buried City'] },
      { startHour: 11, endHour: 12, maps: ['Buried City'] },
      { startHour: 13, endHour: 14, maps: ['Dam'] },
      { startHour: 23, endHour: 0, maps: ['Buried City'] },
    ]
  },
  {
    id: 'uncovered-caches',
    name: 'Uncovered Caches',
    description: 'Caches descobertas com loot garantido',
    imageUrl: 'https://cdn.metaforge.app/arc-raiders/custom/cache.webp',
    schedule: [
      { startHour: 14, endHour: 15, maps: ['Blue Gate'] },
      { startHour: 15, endHour: 16, maps: ['Spaceport'] },
      { startHour: 20, endHour: 21, maps: ['Buried City'] },
      { startHour: 23, endHour: 0, maps: ['Dam'] },
    ]
  },
];
