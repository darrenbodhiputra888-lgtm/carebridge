/* Loading screen between pages.
   Any link marked data-loading shows a spinner for three seconds, then
   goes. Skipped for new-tab clicks, modifier clicks, and for anyone who
   has asked for reduced motion — they just follow the link straight away. */
(function () {
  var HOLD = 3000;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'route-loader';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', 'Loading');

    var spin = document.createElement('div');
    spin.className = 'spinner';
    for (var i = 0; i < 12; i++) {
      var bar = document.createElement('i');
      bar.style.transform = 'rotate(' + (i * 30) + 'deg)';
      // Negative delay starts each bar further along the same cycle.
      bar.style.animationDelay = (-1.2 + i * 0.1).toFixed(2) + 's';
      spin.appendChild(bar);
    }

    var word = document.createElement('div');
    word.className = 'route-word';
    word.textContent = 'Loading…';

    wrap.appendChild(spin);
    wrap.appendChild(word);
    document.body.appendChild(wrap);

    // Next frame, so the fade-in has a starting point to animate from.
    // rAF is throttled in hidden tabs, so back it with a timer: whichever
    // fires first reveals the overlay, and the second call is a no-op.
    function show() { wrap.classList.add('on'); }
    requestAnimationFrame(show);
    setTimeout(show, 40);
    return wrap;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    var a = e.target.closest && e.target.closest('a[data-loading]');
    if (!a || a.dataset.going) return;
    if (a.target && a.target !== '_self') return;

    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;

    e.preventDefault();
    a.dataset.going = '1';

    if (calm.matches) { window.location.href = a.href; return; }

    build();
    setTimeout(function () { window.location.href = a.href; }, HOLD);
  });

  // Coming back via the Back button can restore the page with the overlay
  // still on screen — clear it.
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    var old = document.querySelector('.route-loader');
    if (old) old.remove();
    document.querySelectorAll('a[data-loading]').forEach(function (a) {
      delete a.dataset.going;
    });
  });
})();
