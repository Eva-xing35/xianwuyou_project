<template>
  <button
    ref="buttonRef"
    :class="[
      'btn-base btn-hover-effect overflow-hidden',
      variant === 'primary' ? 'btn-primary' : 'btn-secondary',
      disabled ? 'opacity-60 pointer-events-none' : '',
      loading ? 'cursor-wait' : ''
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span
      v-for="ripple in ripples"
      :key="ripple.id"
      class="absolute block rounded-full bg-magenta/40 animate-ripple"
      :style="{
        width: ripple.size + 'px',
        height: ripple.size + 'px',
        top: ripple.y + 'px',
        left: ripple.x + 'px'
      }"
    />
    <span class="relative flex items-center gap-2">
      <span v-if="loading" class="h-4 w-4 rounded-full border-2 border-magenta border-t-transparent animate-spin" />
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue';

const props = defineProps({
  variant: { type: String as () => 'primary' | 'secondary', default: 'primary' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
});

const emits = defineEmits<{ (e: 'click', event: MouseEvent): void }>();

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

const buttonRef = ref<HTMLButtonElement | null>(null);
const ripples = ref<Ripple[]>([]);
let rippleCount = 0;

const cleanupTimeouts: number[] = [];

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return;

  createRipple(event);
  emits('click', event);
};

// Magenta ripple feedback keeps click interaction aligned with brand accents
const createRipple = (event: MouseEvent) => {
  const el = buttonRef.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  const ripple: Ripple = { id: rippleCount++, x, y, size };
  ripples.value.push(ripple);

  nextTick(() => {
    const timeout = window.setTimeout(() => {
      ripples.value = ripples.value.filter((item) => item.id !== ripple.id);
    }, 550);
    cleanupTimeouts.push(timeout);
  });
};

onBeforeUnmount(() => {
  cleanupTimeouts.forEach((timeout) => window.clearTimeout(timeout));
});
</script>

<style scoped>
.animate-ripple {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}
</style>
