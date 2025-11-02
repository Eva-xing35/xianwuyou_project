<template>
  <div class="neon-card p-4 flex items-center gap-4">
    <div class="relative h-16 w-16 rounded-2xl bg-[#13091D] flex items-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-neonPurple/40 to-magenta/30 mix-blend-screen" />
      <img :src="prize.thumbnail" :alt="prize.name" class="h-12 w-12 object-contain" />
    </div>
    <div class="flex-1 space-y-1">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold">{{ prize.name }}</h4>
        <span :class="rarityClass" class="text-xs font-semibold">{{ prize.rarity }}</span>
      </div>
      <p class="text-[11px] text-smoke/60">{{ formattedDate }}</p>
      <span
        class="inline-flex items-center gap-1 rounded-full border border-magenta/50 bg-black/30 px-2 py-0.5 text-[11px] text-magenta"
      >
        {{ prize.status }}
      </span>
    </div>
    <BaseButton
      v-if="prize.status === UNREDEEMED"
      variant="secondary"
      class="text-[12px] px-3 py-1"
      @click.stop="handleRedeem"
    >
      &#21435;&#20817;&#25442;
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';
import type { PrizeItem } from '../stores/draw';

const props = defineProps<{ prize: PrizeItem }>();
const emits = defineEmits<{ (e: 'redeem', id: string): void }>();

const UNREDEEMED = '\u672a\u5151\u6362';

const rarityClass = computed(() => {
  switch (props.prize.rarity) {
    case 'UR':
      return 'text-magenta';
    case 'SR':
      return 'text-neonPurple';
    default:
      return 'text-smoke/70';
  }
});

const formattedDate = computed(() => new Date(props.prize.obtainedAt).toLocaleString());

const handleRedeem = () => {
  emits('redeem', props.prize.id);
};
</script>
