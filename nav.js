document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('header');
  if (!header) return;

  const btn = header.querySelector('.nav-toggle');
  const navList = header.querySelector('nav ul');

  // If there's no toggle or nav list, nothing to do
  if (!btn || !navList) return;

  function openMenu() {
    header.classList.add('nav-open');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    header.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    // remove any active submenu state
    const active = navList.querySelectorAll('.nav-parent.active');
    active.forEach(a => a.classList.remove('active'));
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (header.classList.contains('nav-open')) closeMenu();
    else openMenu();
  });

  // Toggle submenu on caret button click (small/touch screens only)
  const navParents = navList.querySelectorAll('.nav-parent');
  navParents.forEach(parent => {
    const link = parent.querySelector('a');
    const caret = parent.querySelector('.nav-caret');
    if (!link) return;

    // Accessibility: indicate this link controls a submenu (even though the caret does)
    link.setAttribute('aria-haspopup', 'true');

    // Caret button click handler: toggle submenu (small/touch screens)
    if (caret) {
      caret.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        // Toggle active state and close any other open submenu
        const others = navList.querySelectorAll('.nav-parent.active');
        others.forEach(o => { if (o !== parent) o.classList.remove('active'); });
        parent.classList.toggle('active');
        // Sync caret aria-expanded
        const expanded = parent.classList.contains('active');
        caret.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });

      // Keyboard: allow Enter/Space on caret to toggle submenu
      caret.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const others = navList.querySelectorAll('.nav-parent.active');
          others.forEach(o => { if (o !== parent) o.classList.remove('active'); });
          parent.classList.toggle('active');
          const expanded = parent.classList.contains('active');
          caret.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
      });
    }

    // Hover on desktop: set aria-expanded for screen readers and caret visual state when submenu is shown via hover
    parent.addEventListener('mouseenter', function () {
      if (window.innerWidth > 900 && caret) {
        caret.setAttribute('aria-expanded', 'true');
      }
    });
    parent.addEventListener('mouseleave', function () {
      if (window.innerWidth > 900 && caret) {
        caret.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close when clicking outside header
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target) && header.classList.contains('nav-open')) {
      closeMenu();
    }
  });

  // Close on resize to avoid stale open state when switching layouts
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && header.classList.contains('nav-open')) {
      closeMenu();
    }
    // also remove any active flags when resizing to large view
    if (window.innerWidth > 900) {
      const active = navList.querySelectorAll('.nav-parent.active');
      active.forEach(a => a.classList.remove('active'));
      // ensure aria-expanded flags are reset
      const parentLinks = navList.querySelectorAll('.nav-parent > a');
      parentLinks.forEach(l => l.setAttribute('aria-expanded', 'false'));
    }
  });
});

