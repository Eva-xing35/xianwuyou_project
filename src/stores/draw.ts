import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export type Rarity = 'UR' | 'SR' | 'R';

export interface BlindBox {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  cover: string;
  gallery: string[];
  rarityRates: Record<Rarity, number>;
}

export interface PrizeItem {
  id: string;
  blindBoxId: string;
  name: string;
  rarity: Rarity;
  thumbnail: string;
  obtainedAt: string;
  status: '\u672a\u5151\u6362' | '\u5df2\u5151\u6362';
}

// Pinia store centralising blind box catalog, draw history, and wallet data
export const useDrawStore = defineStore('draw', () => {
  const blindBoxes = ref<BlindBox[]>([
    {
      id: '1',
      name: '\u8d5b\u535a\u670b\u514b\u7cfb\u5217',
      category: '\u6f6e\u73a9',
      description: '\u878d\u5408\u8d5b\u535a\u670b\u514b\u4e0e\u6f6e\u73a9\u6587\u5316\u7684\u8054\u540d\u7cfb\u5217\uff0c\u6bcf\u4e2a\u76f2\u76d2\u90fd\u5e26\u6765\u9713\u8679\u8dc3\u52a8\u611f\u3002',
      price: 39.9,
      stock: 86,
      cover: '/images/cyberpunk-cover.png',
      gallery: ['/images/cyberpunk-front.png', '/images/cyberpunk-side.png', '/images/cyberpunk-top.png'],
      rarityRates: { UR: 0.05, SR: 0.25, R: 0.7 }
    },
    {
      id: '2',
      name: '\u6f6e\u6d41\u624b\u529e\u6d3e\u5bf9',
      category: '\u624b\u529e',
      description: '\u6f6e\u6d41\u827a\u672f\u5bb6\u4eb2\u81ea\u64cd\u5200\uff0c\u6bcf\u671f\u53ea\u4e0a\u7ebf 200 \u4efd\u7684\u9650\u91cf\u6d3e\u5bf9\u624b\u529e\u3002',
      price: 59.9,
      stock: 42,
      cover: '/images/figurine-cover.png',
      gallery: ['/images/figurine-front.png', '/images/figurine-side.png', '/images/figurine-top.png'],
      rarityRates: { UR: 0.08, SR: 0.32, R: 0.6 }
    },
    {
      id: '3',
      name: '\u6570\u7801\u670b\u514b\u5468\u8fb9',
      category: '\u6570\u7801\u5468\u8fb9',
      description: '\u8de8\u6b21\u5143\u7684\u6570\u7801\u6f6e\u6d41\u5468\u8fb9\uff0c\u6bcf\u4ef6\u90fd\u5e26\u6765\u672a\u6765\u611f\u548c\u5b9e\u7528\u5ea6\u3002',
      price: 29.9,
      stock: 125,
      cover: '/images/digital-cover.png',
      gallery: ['/images/digital-front.png', '/images/digital-side.png', '/images/digital-top.png'],
      rarityRates: { UR: 0.03, SR: 0.2, R: 0.77 }
    }
  ]);

  const prizes = ref<PrizeItem[]>([]);
  const loading = ref(false);
  const lastResult = ref<PrizeItem | null>(null);

  const totalPoints = computed(() =>
    prizes.value.reduce((acc, item) => {
      const bonus = item.rarity === 'UR' ? 600 : item.rarity === 'SR' ? 240 : 80;
      return acc + bonus;
    }, 0)
  );

  const balance = ref(188.8);

  const mostPopular = computed(() => blindBoxes.value.slice(0, 2));

  const categories = computed(() => {
    const map = new Map<string, BlindBox[]>();
    blindBoxes.value.forEach((box) => {
      const list = map.get(box.category) ?? [];
      list.push(box);
      map.set(box.category, list);
    });
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  });

  // Draw simulation: supports single/ten draws and adds a delay to match loading animation
  const simulateDraw = async (blindBoxId: string, count = 1) => {
    const target = blindBoxes.value.find((item) => item.id === blindBoxId);
    if (!target) return [];

    loading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1600));
    const results: PrizeItem[] = [];

    for (let i = 0; i < count; i += 1) {
      const rarity = rollRarity(target.rarityRates);
      const prize: PrizeItem = {
        id: `${Date.now()}-${Math.random()}`,
        blindBoxId,
        name: `${target.name} #${Math.floor(Math.random() * 999)}`,
        rarity,
        thumbnail: `/images/${rarity.toLowerCase()}-reward.png`,
        obtainedAt: new Date().toISOString(),
        status: '\u672a\u5151\u6362'
      };
      results.push(prize);
    }

    prizes.value = [...results, ...prizes.value];
    lastResult.value = results[0] ?? null;
    if (target.stock > 0) {
      target.stock = Math.max(target.stock - count, 0);
    }
    balance.value = Math.max(balance.value - target.price * count, 0);
    loading.value = false;
    return results;
  };

  const markRedeemed = (id: string) => {
    const item = prizes.value.find((prize) => prize.id === id);
    if (item) item.status = '\u5df2\u5151\u6362';
  };

  return {
    blindBoxes,
    prizes,
    loading,
    lastResult,
    totalPoints,
    balance,
    mostPopular,
    categories,
    simulateDraw,
    markRedeemed
  };
});

function rollRarity(rarityRates: Record<Rarity, number>): Rarity {
  const seed = Math.random();
  let cumulative = 0;
  for (const rarity of ['UR', 'SR', 'R'] as Rarity[]) {
    cumulative += rarityRates[rarity];
    if (seed <= cumulative) {
      return rarity;
    }
  }
  return 'R';
}
