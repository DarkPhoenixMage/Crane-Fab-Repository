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

  function closeSubmenus() {
    navList.querySelectorAll('.nav-parent.active').forEach(parent => {
      parent.classList.remove('active');
      const toggle = parent.querySelector('.nav-gallery-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function closeMenu() {
    header.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    closeSubmenus();
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (header.classList.contains('nav-open')) closeMenu();
    else openMenu();
  });

  // Toggle the Gallery submenu by activating its label button.
  const navParents = navList.querySelectorAll('.nav-parent');
  navParents.forEach(parent => {
    const toggle = parent.querySelector('.nav-gallery-toggle');
    if (!toggle) return;

    toggle.setAttribute('aria-haspopup', 'true');
    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      const shouldOpen = !parent.classList.contains('active');
      closeSubmenus();
      if (shouldOpen) {
        parent.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close open menus when clicking outside the header.
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    closeSubmenus();
    if (header.classList.contains('nav-open')) closeMenu();
  });

  // Close on resize to avoid stale menu state when switching layouts.
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900 && header.classList.contains('nav-open')) {
      closeMenu();
    }
    closeSubmenus();
  });
});

