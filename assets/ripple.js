/* Splash (ripple) on press.
   One delegated listener for the whole page, so buttons added later —
   the carousel dots, for instance — get it for free. The ripple starts
   where the pointer landed and cleans itself up afterwards. */
(function () {
  var SEL = '.btn, .car-btn, .copy-btn, .logo-wall a, .go';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('pointerdown', function (e) {
    if (calm.matches) return;
    if (e.button !== undefined && e.button !== 0) return;   // left / touch only

    var host = e.target.closest && e.target.closest(SEL);
    if (!host) return;

    var box  = host.getBoundingClientRect();
    var size = Math.max(box.width, box.height) * 2.2;

    var ink = document.createElement('span');
    ink.className = 'ripple';
    ink.style.width = ink.style.height = size + 'px';
    ink.style.left = (e.clientX - box.left - size / 2) + 'px';
    ink.style.top  = (e.clientY - box.top  - size / 2) + 'px';

    host.appendChild(ink);
    ink.addEventListener('animationend', function () { ink.remove(); });
    // Belt and braces: if the animation never fires, don't leave it behind.
    setTimeout(function () { if (ink.parentNode) ink.remove(); }, 1000);
  }, true);
})();
