export function reveal(node, { delay = 0, y = 24, duration = 600 } = {}) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
    return { destroy() {} };
  }

  node.style.opacity = "0";
  node.style.transform = `translateY(${y}px)`;
  node.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
  node.style.transitionDelay = `${delay}ms`;
  node.style.willChange = "opacity, transform";

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          node.style.opacity = "1";
          node.style.transform = "none";
          observer.unobserve(node);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
