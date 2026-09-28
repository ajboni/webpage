<script>
  import { onMount, onDestroy } from "svelte";

  let progress = 0;
  let ticking = false;

  function update() {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  onMount(() => {
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  });

  onDestroy(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  });
</script>

<div
  class="scroll-progress"
  style={`transform: scaleX(${progress});`}
  aria-hidden="true"
/>

<style>
  .scroll-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    transform-origin: 0 50%;
    background: linear-gradient(to right, #6f4b86, #9b4dca);
    z-index: 101;
    pointer-events: none;
  }
</style>
