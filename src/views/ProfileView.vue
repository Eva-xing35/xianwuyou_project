<template>
  <div class="space-y-8">
    <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#09060F] via-[#120A1F] to-[#09060F] p-6 text-smoke" data-reveal>
      <div class="absolute inset-0 opacity-50">
        <div class="absolute -left-10 top-10 h-32 w-32 rounded-full bg-neonPurple/40 blur-3xl" />
        <div class="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-magenta/30 blur-3xl" />
      </div>
      <div class="relative z-10 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-white">&#20010;&#20154;&#20013;&#24515;</h2>
            <p class="text-xs text-smoke/60">&#35760;&#24405;&#20320;&#30340;&#28526;&#29609;&#25910;&#34255;&#36712;&#36857;</p>
          </div>
          <span class="rounded-full border border-magenta/40 bg-black/30 px-4 py-1 text-xs text-magenta">Lv. Neon Explorer</span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-white">
          <div class="rounded-2xl border border-[#241033] bg-black/30 p-4">
            <p class="text-xs text-smoke/60">&#31215;&#20998;</p>
            <p class="text-2xl font-semibold text-magenta">{{ totalPoints }}</p>
          </div>
          <div class="rounded-2xl border border-[#241033] bg-black/30 p-4">
            <p class="text-xs text-smoke/60">&#20313;&#39069;</p>
            <p class="text-2xl font-semibold text-magenta">&#165;{{ balance.toFixed(1) }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <RouterLink to="/address" class="text-xs text-magenta/80 hover:text-magenta">&#22320;&#22336;&#31649;&#29702;</RouterLink>
          <RouterLink to="/settings" class="text-xs text-smoke/60 hover:text-smoke">&#20010;&#24615;&#21270;&#35774;&#32622;</RouterLink>
        </div>
      </div>
    </section>

    <section class="space-y-4" data-reveal>
      <div class="flex items-center justify-between text-white">
        <h3 class="text-lg font-semibold">&#24050;&#33719;&#24471;&#22870;&#21697;</h3>
        <span class="text-xs text-smoke/60">&#20849; {{ prizes.length }} &#20214;</span>
      </div>
      <div class="space-y-3">
        <PrizeCard v-for="prize in prizes" :key="prize.id" :prize="prize" @redeem="handleRedeem" />
        <div v-if="!prizes.length" class="rounded-3xl border border-[#241033] bg-[#0F0B15] px-5 py-10 text-center text-sm text-smoke/60">
          &#26242;&#26080;&#22870;&#21697;&#65292;&#24555;&#21435;&#25277;&#30418;&#36194;&#21462;&#20320;&#30340;&#31532;&#19968;&#20214;&#28526;&#29609;&#21543;&#12290;
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import PrizeCard from '../components/PrizeCard.vue';
import { useDrawStore } from '../stores/draw';
import { useReveal } from '../composables/useReveal';

const store = useDrawStore();

// Dashboard metrics: compute prizes, points, and balance in sync with store
const prizes = computed(() => store.prizes);
const totalPoints = computed(() => store.totalPoints);
const balance = computed(() => store.balance);

const handleRedeem = async (id: string) => {
  await store.markRedeemed(id);
};

onMounted(async () => {
  await store.ensureInitialized();
  await store.loadProfile();
});

useReveal();
</script>
