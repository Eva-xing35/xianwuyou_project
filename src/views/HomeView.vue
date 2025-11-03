<template>
  <div class="space-y-8">
    <section class="relative overflow-hidden rounded-3xl bg-gradient-purple-smoke p-6" data-reveal>
      <div class="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-neonPurple/40 blur-2xl" />
      <div class="absolute -right-12 bottom-0 h-32 w-32 rounded-full bg-magenta/30 blur-3xl" />
      <div class="relative z-10 flex items-center justify-between gap-6">
        <div class="flex-1 space-y-4">
          <span class="inline-flex items-center gap-2 rounded-full border border-magenta/40 bg-black/30 px-3 py-1 text-xs font-semibold text-magenta">
            {{ copy.heroBadge }}
          </span>
          <h1 class="text-2xl font-semibold leading-snug">
            {{ copy.heroTitle }}
            <span class="block text-base text-smoke/70"> {{ copy.heroSubtitle }} </span>
          </h1>
          <div class="flex items-center gap-2 text-sm text-smoke/70">
            <svg class="h-4 w-4 text-magenta" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.5 1.5a.5.5 0 0 0-1 0v3.73A6 6 0 1 0 16 11a5.97 5.97 0 0 0-5.5-5.96V1.5Z" />
            </svg>
            {{ copy.heroTicker }}
          </div>
          <div class="flex items-center gap-3">
            <BaseButton @click="goDetail(activeBox.id)">{{ copy.heroPrimary }}</BaseButton>
            <BaseButton variant="secondary" class="text-sm" @click="goDetail(activeBox.id)">{{ copy.heroSecondary }}</BaseButton>
          </div>
        </div>
        <div class="relative h-36 w-36 flex-shrink-0">
          <div class="absolute inset-0 rounded-[28px] bg-[#13091D]" />
          <Transition name="carousel" mode="out-in">
            <div :key="activeBox.id" class="relative h-full w-full">
              <img :src="activeBox.cover" :alt="activeBox.name" class="floating h-full w-full object-contain" />
              <span class="absolute bottom-3 left-3 text-[11px] text-smoke/60">{{ copy.stockPrefix }} {{ activeBox.stock }} {{ copy.stockSuffix }}</span>
            </div>
          </Transition>
        </div>
      </div>
      <div class="mt-6 flex items-center justify-center gap-2">
        <button
          v-for="box in carouselItems"
          :key="box.id"
          class="h-1.5 w-8 rounded-full transition-all"
          :class="activeBox.id === box.id ? 'bg-magenta' : 'bg-white/20'"
          @click="setActive(box.id)"
        />
      </div>
    </section>

    <section class="space-y-4" data-reveal>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ copy.categoryTitle }}</h2>
        <span class="text-xs text-smoke/60">{{ copy.categorySubtitle }}</span>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="category in categories"
          :key="category.name"
          class="group relative overflow-hidden rounded-2xl border border-[#241033] bg-[#13091D] px-4 py-5 text-left transition-all hover:-translate-y-1 hover:shadow-glow"
        >
          <div class="absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <div class="absolute -inset-12 bg-gradient-to-br from-neonPurple/30 to-magenta/30 blur-3xl" />
          </div>
          <div class="relative space-y-2">
            <h3 class="text-sm font-semibold tracking-wide text-white">{{ category.name }}</h3>
            <p class="text-xs text-smoke/60">{{ copy.categoryCountPrefix }} {{ category.items.length }} {{ copy.categoryCountSuffix }}</p>
          </div>
        </button>
      </div>
    </section>

    <section class="space-y-5" data-reveal>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ copy.presaleTitle }}</h2>
        <RouterLink to="/profile" class="text-xs text-magenta/80 hover:text-magenta">{{ copy.presaleLink }}</RouterLink>
      </div>
      <div class="grid grid-cols-1 gap-4">
        <BlindBoxCard v-for="box in blindBoxes" :key="box.id" :box="box" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDrawStore } from '../stores/draw';
import BaseButton from '../components/BaseButton.vue';
import BlindBoxCard from '../components/BlindBoxCard.vue';
import { useReveal } from '../composables/useReveal';

const drawStore = useDrawStore();
const router = useRouter();

const copy = {
  heroBadge: '\u672c\u5468\u9650\u5b9a \xb7 \u6f6e\u73a9\u7a7a\u6295',
  heroTitle: '\u9713\u8679\u6df1\u591c \xb7 \u6f6e\u73a9\u76f2\u76d2',
  heroSubtitle: '\u62bd\u51fa\u4f60\u7684 UR \u68a6\u5e7b\u85cf\u54c1',
  heroTicker: '3 \u5c0f\u65f6\u524d\u521a\u6709\u73a9\u5bb6\u62bd\u4e2d UR',
  heroPrimary: '\u7acb\u523b\u62a2\u5148\u4f53\u9a8c',
  heroSecondary: '\u67e5\u770b\u6982\u7387\u516c\u793a',
  stockPrefix: '\u5269\u4f59',
  stockSuffix: '\u4efd',
  categoryTitle: '\u70ed\u95e8\u5206\u7c7b',
  categorySubtitle: 'Z \u4e16\u4ee3\u6700\u7231\u7684\u6f6e\u6d41\u6807\u7b7e',
  categoryCountPrefix: '\u5171',
  categoryCountSuffix: '\u4e2a\u7cfb\u5217',
  presaleTitle: '\u9650\u91cf\u9884\u552e',
  presaleLink: '\u67e5\u770b\u62bd\u76d2\u8bb0\u5f55'
};

// Pinia-backed data: hot series, full list, and categories for the home screen
const carouselItems = computed(() => drawStore.mostPopular);
const blindBoxes = computed(() => drawStore.blindBoxes);
const categories = computed(() => drawStore.categories);

// Carousel state controls animated gradient transitions per series card
const activeId = ref('');
const activeBox = computed(() => carouselItems.value.find((item) => item.id === activeId.value) ?? carouselItems.value[0]);

let interval: number | undefined;

const setActive = (id: string) => {
  activeId.value = id;
};

const goDetail = (id: string) => {
  router.push({ name: 'detail', params: { id } });
};

watch(
  carouselItems,
  (items) => {
    if (!items.length) return;
    activeId.value = items[0].id;
    if (interval) window.clearInterval(interval);
    interval = window.setInterval(() => {
      const currentIndex = items.findIndex((item) => item.id === activeId.value);
      const next = items[(currentIndex + 1) % items.length];
      if (next) activeId.value = next.id;
    }, 4500);
  },
  { immediate: true }
);

onMounted(() => {
  drawStore.ensureInitialized().catch((error) => {
    console.error('[home] failed to initialise store', error);
  });
});

onBeforeUnmount(() => {
  if (interval) window.clearInterval(interval);
});

useReveal();
</script>

<style scoped>
.carousel-enter-active,
.carousel-leave-active {
  transition: all 0.45s ease;
}

.carousel-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.carousel-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(1.05) rotate(-2deg);
}

[data-reveal] {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  will-change: transform, opacity;
}

.is-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
</style>
