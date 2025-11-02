<template>
  <div class="relative min-h-[70vh] overflow-hidden rounded-3xl bg-[#0B0B12] p-6" data-reveal>
    <div class="absolute inset-0 bg-gradient-to-br from-black via-[#140820] to-black opacity-80" />
    <div class="absolute inset-0">
      <div class="smoke" />
    </div>
    <div class="relative z-10 flex flex-col items-center gap-6 text-center">
      <div class="space-y-3">
        <h1 class="text-2xl font-semibold tracking-wide">????</h1>
        <p class="text-sm text-smoke/70">???????????????????????????</p>
      </div>

      <Transition name="reveal" mode="out-in">
        <div v-if="result" :key="result.id" class="relative flex flex-col items-center gap-6">
          <div class="relative flex h-44 w-44 items-center justify-center">
            <div class="absolute inset-0 animate-smokeRise rounded-[30px] bg-gradient-to-br from-neonPurple/30 to-magenta/30 blur-3xl" />
            <div class="relative flex h-40 w-40 flex-col items-center justify-center gap-3 rounded-[28px] border border-neonPurple/40 bg-[#13091D] shadow-glow">
              <span :class="rarityClass" class="text-sm font-semibold">{{ result.rarity }}</span>
              <img :src="result.thumbnail" :alt="result.name" class="h-20 w-20 object-contain" />
              <p class="px-4 text-sm font-medium">{{ result.name }}</p>
            </div>
          </div>
          <div class="rounded-3xl border border-[#241033] bg-black/40 px-6 py-4 text-sm text-smoke/80">
            <p>?????????????????????</p>
            <p class="mt-1 text-magenta">??????{{ totalPoints }}</p>
          </div>
        </div>
        <div v-else key="empty" class="text-sm text-smoke/60">???????????????</div>
      </Transition>

      <div class="flex flex-col gap-3 sm:flex-row">
        <BaseButton class="w-48" @click="continueDraw">???</BaseButton>
        <BaseButton class="w-48" variant="secondary" @click="goRedeem">???</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '../components/BaseButton.vue';
import { useDrawStore } from '../stores/draw';
import { useReveal } from '../composables/useReveal';

const router = useRouter();
const route = useRoute();
const store = useDrawStore();

const result = computed(() => store.lastResult);
const totalPoints = computed(() => store.totalPoints);
// Highlight rarity with computed colors so UR/SR stand out instantly
const rarityClass = computed(() => {
  switch (result.value?.rarity) {
    case 'UR':
      return 'text-magenta';
    case 'SR':
      return 'text-neonPurple';
    default:
      return 'text-smoke/70';
  }
});

// Continue button drops users back into the last box for momentum
const continueDraw = () => {
  const target = route.query.boxId ?? store.mostPopular[0]?.id;
  if (!target) return;
  router.push({ name: 'detail', params: { id: target } });
};

// Redemption shortcut opens the profile inventory list
const goRedeem = () => {
  router.push({ name: 'profile' });
};

onMounted(() => {
  if (!store.lastResult) {
    const fallbackId = route.query.boxId ?? store.mostPopular[0]?.id;
    if (fallbackId) {
      router.replace({ name: 'detail', params: { id: fallbackId } });
    }
  }
});

useReveal();
</script>

<style scoped>
.smoke {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(123, 44, 191, 0.25), transparent 60%);
  filter: blur(40px);
  animation: smokePulse 6s ease-in-out infinite;
}

@keyframes smokePulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

.reveal-enter-active,
.reveal-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.reveal-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(1.05);
}
</style>
