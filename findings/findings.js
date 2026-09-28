/* Nothing on this page needs JavaScript to be readable. This only marks the
   entry currently in view, so a long log keeps its place while you scroll. */
(function () {
  const entries = [...document.querySelectorAll('.finding')];
  if (!entries.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((rows) => {
    rows.forEach((r) => r.target.classList.toggle('is-current', r.isIntersecting));
  }, { rootMargin: '-45% 0px -45% 0px' });
  entries.forEach((e) => io.observe(e));
})();
