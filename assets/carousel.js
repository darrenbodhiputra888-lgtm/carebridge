/* Generic carousel.
   Markup: <div data-carousel data-autoplay="5000">
             <button class="car-btn prev">…</button>
             <div class="car-track" tabindex="0"> …slides… </div>
             <button class="car-btn next">…</button>
             <div class="car-dots"></div>
           </div>
   Dots are generated here. Autoplay is optional, pauses on hover/focus
   and while the tab is hidden, and is skipped under reduced motion. */
(function () {
  var roots = Array.prototype.slice.call(document.querySelectorAll('[data-carousel]'));
  if (!roots.length) return;

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  roots.forEach(function (root) {
    var track = root.querySelector('.car-track');
    if (!track) return;

    var slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) return;

    var prev = root.querySelector('.car-btn.prev');
    var next = root.querySelector('.car-btn.next');
    var dotsBox = root.querySelector('.car-dots');
    var dots = [];

    if (dotsBox) {
      slides.forEach(function (slide, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', function () { go(i); });
        dotsBox.appendChild(dot);
        dots.push(dot);
      });
    }

    function current() {
      var best = 0, min = Infinity;
      slides.forEach(function (slide, i) {
        var d = Math.abs(slide.offsetLeft - track.scrollLeft);
        if (d < min) { min = d; best = i; }
      });
      return best;
    }

    function go(i) {
      var n = slides.length;
      i = ((i % n) + n) % n;
      track.scrollTo({ left: slides[i].offsetLeft, behavior: calm.matches ? 'auto' : 'smooth' });
    }

    function sync() {
      var i = current();
      dots.forEach(function (dot, n) { dot.setAttribute('aria-selected', String(n === i)); });
    }

    if (prev) prev.addEventListener('click', function () { go(current() - 1); });
    if (next) next.addEventListener('click', function () { go(current() + 1); });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(current() - 1); }
    });

    var tick;
    track.addEventListener('scroll', function () {
      clearTimeout(tick);
      tick = setTimeout(sync, 90);
    }, { passive: true });
    window.addEventListener('resize', sync);

    var delay = parseInt(root.getAttribute('data-autoplay'), 10);
    var timer = null;

    function start() {
      if (!delay || calm.matches || timer) return;
      timer = setInterval(function () {
        if (!document.hidden) go(current() + 1);
      }, delay);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    sync();
    start();
  });
})();
