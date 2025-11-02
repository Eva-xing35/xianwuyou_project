<template>
  <div class="neon-card p-5 flex flex-col gap-4" @click="openDetail">
    <div class="relative aspect-square rounded-2xl overflow-hidden bg-[#13091D] flex items-center justify-center">
      <div
        class="absolute inset-0 bg-gradient-to-br from-neonPurple/40 via-transparent to-magenta/30 mix-blend-screen"
      />
      <img :src="box.cover" :alt="box.name" class="h-28 object-contain floating" />
      <span
        class="absolute left-4 top-4 rounded-full border border-magenta/30 bg-black/40 px-2 py-0.5 text-xs text-magenta"
      >
        {{ box.category }}
      </span>
      <span class="absolute bottom-4 right-4 text-xs text-smoke/80">
        &#21097;&#20313; {{ box.stock }}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold tracking-wide">{{ box.name }}</h3>
        <span class="text-sm text-magenta">&#165;{{ box.price.toFixed(1) }}</span>
      </div>
      <p class="text-sm text-smoke/70 leading-relaxed line-clamp-2">{{ box.description }}</p>
      <div class="flex items-center gap-2">
        <div class="flex-1 h-1.5 rounded-full bg-[#241033] overflow-hidden">
          <div class="h-full bg-magenta" :style="{ width: progressWidth }" />
        </div>
        <span class="text-[11px] text-smoke/60">&#28909;&#24230; {{ heatLevel }}</span>
      </div>
      <BaseButton class="mt-1 w-full" @click.stop="startDraw">&#24320;&#22987;&#25277;&#30418;</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { BlindBox } from '../stores/draw';
import BaseButton from './BaseButton.vue';

const props = defineProps<{ box: BlindBox }>();

const router = useRouter();

const progressWidth = computed(() => `${Math.max(10, 100 - props.box.stock / 2)}%`);
const heatLevel = computed(() => (props.box.stock < 50 ? 'MAX' : 'HIGH'));

const openDetail = () => {
  router.push({ name: 'detail', params: { id: props.box.id } });
};

const startDraw = () => {
  router.push({ name: 'detail', params: { id: props.box.id }, query: { draw: 'true' } });
};
</script>
