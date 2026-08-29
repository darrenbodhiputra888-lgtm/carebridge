/* Rolling number counters.
   Any element with data-count animates 0 -> that value when scrolled into view.
   Optional data-prefix / data-suffix wrap the number.
   The final value stays in the HTML, so it still reads correctly without JS. */
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (!els.length) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render(el, value) {
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    el.textContent = prefix + value.toLocaleString('en-US') + suffix;
  }

  function run(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    if (calm) { render(el, target); return; }

    var duration = 1400;
    var start = null;

    // Only zero it out at the moment it starts animating, so any failure
    // below leaves the real number on screen rather than a stuck "0".
    render(el, 0);

    // Safety net: if rAF is throttled and never finishes, snap to the value.
    var guard = setTimeout(function () { render(el, target); }, duration + 800);

    function step(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      render(el, Math.round(target * eased));
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        clearTimeout(guard);
        render(el, target);
      }
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    els.forEach(run);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        run(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  els.forEach(function (el) { io.observe(el); });
})();
