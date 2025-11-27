import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface KeepForData {
  workshop?: number;
  quest?: number;
  expedition?: number;
  scrappy?: number;
}

// Mapeamento completo baseado nos dados do arcdb.site (verificado em 2025-11-24)
const keepForMapping: Record<string, KeepForData> = {
  'advanced-electrical-components': { workshop: 5, expedition: 5 },
  'advanced-mechanical-components': { workshop: 5 },
  'antiseptic': { workshop: 8, quest: 2 },
  'apricot': { scrappy: 15 },
  'arc-alloy': { workshop: 18, expedition: 80 },
  'arc-circuitry': { workshop: 10 },
  'arc-motion-core': { workshop: 5 },
  'arc-powercell': { workshop: 5 },
  'bastion-cell': { workshop: 6 },
  'bombardier-cell': { workshop: 6 },
  'cat-bed': { scrappy: 1 },
  'chemicals': { workshop: 50 },
  'cooling-fan': { expedition: 5 },
  'cracked-bioscanner': { workshop: 2 },
  'crude-explosives': { workshop: 5 },
  'damaged-heat-sink': { workshop: 2 },
  'dog-collar': { workshop: 1 },
  'durable-cloth': { workshop: 5, expedition: 35, quest: 1 },
  'electrical-components': { workshop: 10, expedition: 30 },
  'explosive-compound': { workshop: 5 },
  'fabric': { workshop: 80 },
  'faded-photograph': { quest: 2 },
  'film-reel': { quest: 1 },
  'fireball-burner': { workshop: 8 },
  'flow-controller': { quest: 1 },
  'fried-motherboard': { workshop: 3 },
  'great-mullein': { quest: 1 },
  'hornet-driver': { workshop: 5 },
  'humidifier': { expedition: 5 },
  'industrial-battery': { workshop: 3 },
  'ion-sputter': { expedition: 30, quest: 3 },
  'laboratory-reagents': { workshop: 3 },
  'leaper-pulse-unit': { expedition: 3, workshop: 4 },
  'lemon': { scrappy: 3 },
  'light-bulb': { expedition: 5 },
  'magnetic-accelerator': { expedition: 3 },
  'magnetron': { quest: 1 },
  'mechanical-components': { workshop: 5 },
  'metal-parts': { workshop: 80, expedition: 150 },
  'motor': { workshop: 3 },
  'mushroom': { scrappy: 12 },
  'olives': { scrappy: 6 },
  'plastic-parts': { workshop: 75 },
  'pop-trigger': { workshop: 5 },
  'power-cable': { workshop: 3 },
  'prickly-pear': { scrappy: 6 },
  'rocketeer-driver': { workshop: 3 },
  'rubber-duck': { quest: 2 },
  'rubber-parts': { workshop: 30, expedition: 200 },
  'rusted-gear': { workshop: 3 },
  'rusted-shut-medical-kit': { workshop: 3 },
  'rusted-tools': { workshop: 3 },
  'sentinel-firing-core': { workshop: 4 },
  'snitch-scanner': { workshop: 6 },
  'steel-spring': { expedition: 15 },
  'surveyor-vault': { workshop: 5, quest: 1 },
  'synthesized-fuel': { workshop: 3 },
  'syringe': { quest: 1 },
  'tick-pod': { workshop: 8 },
  'toaster': { workshop: 3 },
  'very-comfortable-pillow': { scrappy: 3 },
  'wasp-driver': { workshop: 8 },
  'water-pump': { quest: 2 },
  'wires-recipe': { expedition: 30, quest: 3 },
};

async function main() {
  const itemsPath = path.join(__dirname, '..', 'public', 'data', 'items.json');
  
  console.log('Reading items.json...');
  const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));
  
  let updatedCount = 0;
  
  for (const item of itemsData) {
    const keepForData = keepForMapping[item.id];
    
    if (keepForData && Object.keys(keepForData).length > 0) {
      item.keepFor = keepForData;
      updatedCount++;
      console.log(`✓ Added keepFor to: ${item.name} (${item.id})`);
    }
  }
  
  console.log(`\nWriting updated items.json...`);
  fs.writeFileSync(itemsPath, JSON.stringify(itemsData, null, 2), 'utf-8');
  
  console.log(`\n✅ Done! Updated ${updatedCount} items with keepFor data.`);
}

main().catch(console.error);
