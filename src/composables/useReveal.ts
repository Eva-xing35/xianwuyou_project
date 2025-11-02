import { onMounted, onBeforeUnmount } from 'vue';

/**
 * IntersectionObserver helper to add "is-visible" class once element is in viewport.
 * Keeps CSS-driven reveal animations consistent across views.
 */
export function useReveal(selector = '[data-reveal]') {
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(selector).forEach((element) => observer?.observe(element));
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });
}
