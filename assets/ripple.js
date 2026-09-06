/* Splash (ripple) on press.
   One delegated listener for the whole page, so buttons added later —
   the carousel dots, for instance — get it for free. The ripple starts
   where the pointer landed and cleans itself up afterwards. */
(function () {
  var SEL = '.btn, .car-btn, .copy-btn, .logo-wall a, .go';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function splash(e, x, y) {
    if (calm.matches) return;

    var host = e.target.closest && e.target.closest(SEL);
    if (!host) return;

    var box  = host.getBoundingClientRect();
    var size = Math.max(box.width, box.height) * 2.2;

    var ink = document.createElement('span');
    ink.className = 'ripple';
    ink.style.width = ink.style.height = size + 'px';
    ink.style.left = (x - box.left - size / 2) + 'px';
    ink.style.top  = (y - box.top  - size / 2) + 'px';

    host.appendChild(ink);
    ink.addEventListener('animationend', function () { ink.remove(); });
    // Belt and braces: if the animation never fires, don't leave it behind.
    setTimeout(function () { if (ink.parentNode) ink.remove(); }, 1000);
  }

  if (window.PointerEvent) {
    document.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;                 // left button or touch
      splash(e, e.clientX, e.clientY);
    }, true);
  } else {
    document.addEventListener('touchstart', function (e) {
      var t = e.changedTouches[0];
      splash(e, t.clientX, t.clientY);
    }, true);
    document.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      splash(e, e.clientX, e.clientY);
    }, true);
  }

  /* A link normally navigates the instant it is released, which cuts the
     splash off before it is visible. Hold the page for a fifth of a second
     so the animation has time to read, then follow the link as usual. */
  document.addEventListener('click', function (e) {
    if (calm.matches) return;
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    var a = e.target.closest && e.target.closest('a.btn');
    if (!a || a.dataset.splashing) return;
    if (a.target && a.target !== '_self') return;        // new tab: leave alone

    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel):/i.test(href)) return;

    e.preventDefault();
    a.dataset.splashing = '1';
    setTimeout(function () { window.location.href = a.href; }, 200);
  });
})();
