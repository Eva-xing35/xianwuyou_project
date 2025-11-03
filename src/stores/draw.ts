import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchBlindBoxDetail, fetchBlindBoxes, fetchProfile, performDraw, redeemPrize } from '../services/api';
import { useAuthStore } from './auth';

export type Rarity = 'UR' | 'SR' | 'R';

export interface BlindBox {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  totalStock: number;
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

interface CategoryGroup {
  name: string;
  items: BlindBox[];
}

const DEFAULT_GALLERY = (cover: string) => [cover];

const mapBlindBox = (box: {
  id: number;
  name: string;
  category: string;
  cover_url: string;
  price: number;
  remaining_stock: number;
  total_stock?: number;
  description?: string;
}): BlindBox => ({
  id: String(box.id),
  name: box.name,
  category: box.category,
  description: box.description ?? '',
  price: box.price,
  stock: box.remaining_stock,
  totalStock: box.total_stock ?? box.remaining_stock,
  cover: box.cover_url,
  gallery: DEFAULT_GALLERY(box.cover_url),
  rarityRates: { UR: 0, SR: 0, R: 0 }
});

const mapPrizeItem = (record: {
  id: number;
  blind_box_id: number;
  prize_id: number;
  draw_time: string;
  status: string;
  prize?: { id: number; name: string; image_url: string; level: Rarity };
}): PrizeItem => ({
  id: String(record.id),
  blindBoxId: String(record.blind_box_id),
  name: record.prize?.name ?? `Prize #${record.prize_id}`,
  rarity: record.prize?.level ?? 'R',
  thumbnail: record.prize?.image_url ?? '/images/prize-placeholder.png',
  obtainedAt: record.draw_time,
  status: record.status === '\u5df2\u5151\u6362' ? '\u5df2\u5151\u6362' : '\u672a\u5151\u6362'
});

export const useDrawStore = defineStore('draw', () => {
  const authStore = useAuthStore();

  const blindBoxes = ref<BlindBox[]>([]);
  const isCatalogLoading = ref(false);
  const drawLoading = ref(false);
  const isInitialized = ref(false);
  const initPromise = ref<Promise<void> | null>(null);

  const prizes = ref<PrizeItem[]>([]);
  const lastResult = ref<PrizeItem | null>(null);
  const points = ref(0);
  const balance = ref(0);

  const mostPopular = computed(() => blindBoxes.value.slice(0, 2));

  const categories = computed<CategoryGroup[]>(() => {
    const buckets = new Map<string, BlindBox[]>();
    blindBoxes.value.forEach((box) => {
      const list = buckets.get(box.category) ?? [];
      list.push(box);
      buckets.set(box.category, list);
    });
    return Array.from(buckets.entries()).map(([name, items]) => ({ name, items }));
  });

  const totalPoints = computed(() => points.value);

  const ensureInitialized = async () => {
    if (isInitialized.value) return;
    if (initPromise.value) return initPromise.value;
    initPromise.value = (async () => {
      await authStore.ensureDemoSession();
      await Promise.all([loadBlindBoxes(), loadProfile()]);
      isInitialized.value = true;
    })().finally(() => {
      initPromise.value = null;
    });
    return initPromise.value;
  };

  const loadBlindBoxes = async () => {
    if (isCatalogLoading.value) return;
    isCatalogLoading.value = true;
    try {
      const { list } = await fetchBlindBoxes({ page: 1, size: 12 });
      blindBoxes.value = list.map(mapBlindBox);
    } finally {
      isCatalogLoading.value = false;
    }
  };

  const applyDetail = (detail: Awaited<ReturnType<typeof fetchBlindBoxDetail>>) => {
    const rarityRates: Record<Rarity, number> = { UR: 0, SR: 0, R: 0 };
    detail.prizes.forEach((prize) => {
      const level = prize.level as Rarity;
      rarityRates[level] = (rarityRates[level] ?? 0) + prize.probability;
    });

    const enriched: BlindBox = {
      id: String(detail.id),
      name: detail.name,
      category: detail.category,
      description: detail.description ?? '',
      price: detail.price,
      stock: detail.remaining_stock,
      totalStock: detail.total_stock ?? detail.remaining_stock,
      cover: detail.cover_url,
      gallery: detail.gallery && detail.gallery.length ? detail.gallery : DEFAULT_GALLERY(detail.cover_url),
      rarityRates
    };

    const index = blindBoxes.value.findIndex((item) => item.id === enriched.id);
    if (index >= 0) {
      blindBoxes.value.splice(index, 1, enriched);
    } else {
      blindBoxes.value.push(enriched);
    }
  };

  const loadBlindBoxDetail = async (id: string) => {
    const detail = await fetchBlindBoxDetail(id);
    applyDetail(detail);
  };

  const loadProfile = async () => {
    const profile = await fetchProfile();
    points.value = profile.user.points;
    balance.value = profile.user.balance ?? 0;
    prizes.value = profile.records.map(mapPrizeItem);
  };

  const performDrawAction = async (blindBoxId: string, count = 1) => {
    if (drawLoading.value) return;
    drawLoading.value = true;
    try {
      let latestPrize: PrizeItem | undefined;
      const iterations = Math.max(1, count);
      for (let i = 0; i < iterations; i += 1) {
        const response = await performDraw({ blind_box_id: Number(blindBoxId) });
        const prize = mapPrizeItem({ ...response.record, prize: response.prize });
        prizes.value = [prize, ...prizes.value];
        latestPrize = prize;
      }
      if (latestPrize) {
        lastResult.value = latestPrize;
      }
      await Promise.all([loadProfile(), loadBlindBoxDetail(blindBoxId)]);
      return latestPrize;
    } finally {
      drawLoading.value = false;
    }
  };

  const markRedeemed = async (id: string, address = '\u9ed8\u8ba4\u5730\u5740 - \u8bf7\u5728\u4e2a\u4eba\u4e2d\u5fc3\u5b8c\u5584') => {
    await redeemPrize({ record_id: Number(id), address });
    prizes.value = prizes.value.map((item) =>
      item.id === id ? { ...item, status: '\u5df2\u5151\u6362' } : item
    );
    await loadProfile();
  };

  return {
    blindBoxes,
    prizes,
    lastResult,
    totalPoints,
    balance,
    mostPopular,
    categories,
    loading: computed(() => drawLoading.value),
    ensureInitialized,
    loadBlindBoxes,
    loadBlindBoxDetail,
    loadProfile,
    performDraw: performDrawAction,
    markRedeemed
  };
});
