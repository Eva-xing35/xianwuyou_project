<template>
  <div v-if="box" class="space-y-8 pb-16">
    <section class="relative overflow-hidden rounded-3xl border border-[#241033] bg-[#13091D] p-5" data-reveal>
      <div class="flex flex-col gap-6">
        <div class="relative flex items-center justify-center">
          <div
            ref="previewRef"
            class="relative h-64 w-64 origin-center rounded-[32px] bg-gradient-to-br from-[#1D0F2C] to-[#0B0610] p-6"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointerleave="onPointerUp"
          >
            <div class="absolute inset-0 rounded-[32px] border border-neonPurple/20" />
            <Transition name="flip" mode="out-in">
              <div
                :key="activeImage"
                class="relative h-full w-full rounded-3xl bg-[#120816]"
                :style="{ transform: `rotateY(${rotation}deg)` }"
              >
                <img :src="activeImage" :alt="box.name" class="h-full w-full object-contain" />
                <div class="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </Transition>
            <span class="absolute -left-3 top-1/2 -translate-y-1/2 rotate-90 text-[11px] text-smoke/70">?? 360? ??</span>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold">{{ box.name }}</h2>
              <p class="mt-1 text-sm text-smoke/70">{{ box.description }}</p>
            </div>
            <span class="rounded-full border border-magenta/40 bg-black/30 px-3 py-1 text-sm text-magenta">
              &#165;{{ box.price.toFixed(1) }} / ?
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-smoke/60">
              <span>&#21097;&#20313;&#25968;&#37327;</span>
              <span>{{ box.stock }} / 200</span>
            </div>
            <div class="h-2 rounded-full bg-[#1F0F2A]">
              <div class="h-full rounded-full bg-magenta" :style="{ width: stockPercent }" />
            </div>
          </div>
          <div class="rounded-2xl border border-[#241033] bg-[#0E0915] p-4 text-sm text-smoke/80">
            <h3 class="mb-3 text-sm font-semibold text-white">&#25277;&#30418;&#35268;&#21017;</h3>
            <ul class="space-y-2 text-xs leading-relaxed">
              <li>&#183; &#21333;&#27425;&#25277;&#30418; &#165;{{ box.price.toFixed(1) }}&#65292;&#21313;&#36830;&#25277;&#20139;&#39069;&#22806;&#38543;&#26426;&#31215;&#20998;&#36192;&#36865;&#12290;</li>
              <li>
                &#183; &#31232;&#26377;&#24230;&#25481;&#29575;&#65306;UR {{ box.rarityRates.UR * 100 }}%&#12289;SR {{ box.rarityRates.SR * 100 }}%&#12289;R {{
                  box.rarityRates.R * 100
                }}%&#12290;
              </li>
              <li>&#183; &#25152;&#26377;&#25277;&#21462;&#35760;&#24405;&#23454;&#26102;&#21516;&#27493;&#33267;&#20010;&#20154;&#20013;&#24515;&#65292;&#21487;&#19968;&#38190;&#20817;&#25442;&#12290;</li>
            </ul>
          </div>
        </div>

        <div class="flex items-center justify-center gap-4">
          <button
            v-for="(image, idx) in box.gallery"
            :key="image"
            class="relative h-16 w-16 overflow-hidden rounded-2xl border"
            :class="idx === activeIndex ? 'border-magenta' : 'border-transparent'"
            @click="setActive(idx)"
          >
            <img :src="image" :alt="`${box.name} ${idx}`" class="h-full w-full object-cover" />
            <div class="absolute inset-0 bg-black/40" />
          </button>
        </div>
      </div>
    </section>

    <section class="space-y-5" data-reveal>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">&#25277;&#30418;&#21160;&#20316;</h3>
        <span class="text-xs text-smoke/60">&#32043;&#33394;&#31890;&#23376;&#21160;&#25928;&#24378;&#21270;&#20202;&#24335;&#24863;</span>
      </div>
      <div class="relative flex flex-col gap-4">
        <div class="relative overflow-hidden rounded-3xl border border-[#241033] bg-[#13091D] p-5">
          <div class="absolute inset-0 opacity-50" ref="burstHost">
            <span
              v-for="burst in bursts"
              :key="burst.id"
              class="pointer-events-none absolute block h-16 w-16 rounded-full bg-magenta/25 blur-md"
              :style="{
                transform: `translate3d(${burst.x}px, ${burst.y}px, 0) scale(${burst.scale})`,
                opacity: burst.opacity
              }"
            />
          </div>
          <div class="relative z-10 flex flex-col gap-4">
            <p class="text-sm text-smoke/70">
              &#28857;&#20987;&#19979;&#26041;&#25353;&#38062;&#65292;&#20250;&#35302;&#21457;&#32043;&#33394;&#31890;&#23376;&#29190;&#28856;&#21644;&#29611;&#32418;&#27874;&#32441;&#21453;&#39304;&#12290;&#21152;&#36733;&#36807;&#31243;&#20013;&#20351;&#29992;&#32043;&#33394; 3D &#30450;&#30418;&#22270;&#26631;&#26059;&#36716;&#26469;&#20256;&#36882;&#25277;&#21462;&#29366;&#24577;&#12290;
            </p>
            <div class="grid grid-cols-2 gap-3">
              <BaseButton class="w-full" :loading="loading" @click="performDraw(1, $event)">&#21333;&#25277;</BaseButton>
              <BaseButton class="w-full" :loading="loading" @click="performDraw(10, $event)">&#21313;&#36830;&#25277;</BaseButton>
            </div>
            <div v-if="loading" class="flex items-center gap-3 rounded-2xl border border-[#241033] bg-black/30 px-4 py-3">
              <div class="h-10 w-10 rounded-2xl border border-neonPurple/40 bg-[#1B0F28] p-2">
                <div class="h-full w-full rounded-xl bg-gradient-to-br from-neonPurple/40 to-magenta/40 animate-drawLoading" />
              </div>
              <div class="text-sm text-smoke/70">&#27491;&#22312;&#25277;&#21462;... &#32043;&#33394;&#33021;&#37327;&#27491;&#22312;&#27719;&#32858;</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div v-else class="flex min-h-[60vh] items-center justify-center text-smoke/60">&#30450;&#30418;&#19981;&#23384;&#22312;&#25110;&#24050;&#19979;&#26550;</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '../components/BaseButton.vue';
import { useDrawStore } from '../stores/draw';
import { useReveal } from '../composables/useReveal';

const route = useRoute();
const router = useRouter();
const store = useDrawStore();

const box = computed(() => store.blindBoxes.find((item) => item.id === route.params.id));
const stockPercent = computed(() => `${Math.max(0, Math.min(100, box.value ? (box.value.stock / 200) * 100 : 0))}%`);

const activeIndex = ref(0);
const activeImage = computed(() => box.value?.gallery[activeIndex.value] ?? '');

// 360-degree rotation: track drag gesture to imitate 3D box preview
const rotation = ref(0);
const isDragging = ref(false);
const lastPointerX = ref(0);

const previewRef = ref<HTMLDivElement | null>(null);
const loading = computed(() => store.loading);

// Particle burst pool: short-lived entries amplify ritual during draw
const bursts = ref<{ id: number; x: number; y: number; scale: number; opacity: number }[]>([]);
let burstId = 0;

const stockAutoDraw = () => {
  if (route.query.draw === 'true' && box.value) {
    performDraw(1);
  }
};

const setActive = (index: number) => {
  activeIndex.value = index;
};

const onPointerDown = (event: PointerEvent) => {
  isDragging.value = true;
  lastPointerX.value = event.clientX;
};

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return;
  const delta = event.clientX - lastPointerX.value;
  rotation.value = (rotation.value + delta * 0.6) % 360;
  lastPointerX.value = event.clientX;
};

const onPointerUp = () => {
  isDragging.value = false;
};

const injectBurst = (event?: MouseEvent) => {
  const host = previewRef.value?.parentElement;
  const rect = host?.getBoundingClientRect();
  if (!rect) return;
  const x = event ? event.clientX - rect.left - 32 : rect.width / 2 - 32;
  const y = event ? event.clientY - rect.top - 32 : rect.height / 2 - 32;
  const burst = { id: burstId++, x, y, scale: 1, opacity: 1 };
  bursts.value = [...bursts.value, burst];
  window.setTimeout(() => {
    bursts.value = bursts.value.filter((item) => item.id !== burst.id);
  }, 600);
};

const performDraw = async (count: number, event?: MouseEvent) => {
  if (!box.value || store.loading) return;
  injectBurst(event);
  await store.simulateDraw(box.value.id, count);
  router.push({ name: 'result', query: { count: String(count), boxId: box.value.id } });
};

watch(
  () => route.params.id,
  () => {
    activeIndex.value = 0;
    rotation.value = 0;
  }
);

onMounted(() => {
  stockAutoDraw();
});

useReveal();
</script>

<style scoped>
.flip-enter-active,
.flip-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.flip-enter-from {
  opacity: 0;
  transform: rotateY(-30deg) scale(0.95);
}

.flip-leave-to {
  opacity: 0;
  transform: rotateY(30deg) scale(0.95);
}
</style>
