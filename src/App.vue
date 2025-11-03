<template>
  <div class="min-h-screen bg-gradient-dark text-white">
    <header class="sticky top-0 z-50 backdrop-blur bg-black/60 border-b border-[#241033]">
      <div class="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-3">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="h-9 w-9 rounded-2xl bg-gradient-cta shadow-magenta flex items-center justify-center text-black font-bold">
            Z
          </div>
          <span class="font-semibold tracking-widest uppercase text-sm">ZeroBox</span>
        </RouterLink>
        <label class="flex flex-1 items-center gap-2 rounded-full border border-[#241033] bg-[#13091D] px-3 py-2">
          <svg class="h-4 w-4 text-smoke" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-3.8-3.8m0 0a7 7 0 1 0-9.9 0 7 7 0 0 0 9.9 0z" />
          </svg>
          <input
            class="w-full bg-transparent text-sm outline-none placeholder:text-smoke/50"
            :placeholder="copy.searchPlaceholder"
          />
        </label>
        <nav class="flex items-center gap-3 text-smoke/70">
          <RouterLink to="/cart" class="hover:text-magenta transition-colors">
            <span class="sr-only">{{ copy.cart }}</span>
            <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm9 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm3 0H8.214a1.5 1.5 0 0 1-1.463-1.146l-1.5-6A1.5 1.5 0 0 1 6.714 5.25h11.786a1.5 1.5 0 0 1 1.463 1.854l-1.464 5.732A1.5 1.5 0 0 1 19.5 14.25Z"
              />
            </svg>
          </RouterLink>
          <RouterLink to="/profile" class="hover:text-magenta transition-colors">
            <span class="sr-only">{{ copy.profile }}</span>
            <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 21a7.5 7.5 0 0 1 15 0m-12-12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z"
              />
            </svg>
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto min-h-[calc(100vh-120px)] w-full max-w-3xl px-5 pb-32 pt-6">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>

    <footer class="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-6">
      <div class="w-full max-w-2xl px-6">
        <BaseButton v-if="ctaTarget" class="btn-primary w-full" @click="goDraw">
          {{ copy.ctaPrefix }}{{ copy.ctaSeparator }}{{ ctaTarget?.name }}
        </BaseButton>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import BaseButton from './components/BaseButton.vue';
import { useDrawStore } from './stores/draw';

const router = useRouter();
const drawStore = useDrawStore();

const copy = {
  searchPlaceholder: '\u641c\u7d22\u6f6e\u73a9\u76f2\u76d2',
  cart: '\u8d2d\u7269\u8f66',
  profile: '\u4e2a\u4eba\u4e2d\u5fc3',
  ctaPrefix: '\u5f00\u59cb\u62bd\u76d2',
  ctaSeparator: ' \u00b7 '
};

const ctaTarget = computed(() => drawStore.mostPopular[0] ?? drawStore.blindBoxes[0]);

const goDraw = () => {
  if (!ctaTarget.value) return;
  router.push({ name: 'detail', params: { id: ctaTarget.value.id } });
};

onMounted(() => {
  drawStore.ensureInitialized().catch((error) => {
    console.error('[app] initialisation failed', error);
  });
});
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  filter: saturate(0.6);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
  filter: saturate(0.6);
}
</style>
