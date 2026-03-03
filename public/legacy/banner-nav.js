function initBannerNav() {
  const header = document.querySelector('.major-nav');
  const nav = document.querySelector('.major-nav .nav');

  if (!header || !nav) return;
  if (header.querySelector('.banner-controls')) return;

  const currentPath = window.location.pathname;
  const isZh = currentPath.includes('/zh/');
  const filename = currentPath.split('/').pop() || 'index.html';
  const query = window.location.search || '';

  const controls = document.createElement('div');
  controls.className = 'banner-controls';

  const lang = document.createElement('a');
  lang.className = 'banner-lang';
  lang.textContent = isZh ? 'EN' : '中文';
  lang.href = isZh ? `../${filename}${query}` : `zh/${filename}${query}`;

  const menuButton = document.createElement('button');
  menuButton.type = 'button';
  menuButton.className = 'banner-menu-toggle';
  menuButton.id = 'bannerMenuToggle';
  menuButton.textContent = isZh ? '菜单' : 'Menu';
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', isZh ? '打开导航菜单' : 'Open navigation menu');

  controls.appendChild(lang);
  controls.appendChild(menuButton);
  header.appendChild(controls);

  const closeMenu = function () {
    header.classList.remove('is-menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', function () {
    const opening = !header.classList.contains('is-menu-open');
    header.classList.toggle('is-menu-open', opening);
    menuButton.setAttribute('aria-expanded', String(opening));
  });

  document.addEventListener('click', function (event) {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  nav.querySelectorAll('a').forEach(function (anchor) {
    anchor.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 980) {
      closeMenu();
    }
  });

  // Auto-hide header on downward scroll; reveal on upward scroll or top-edge hover.
  let lastScrollY = window.scrollY || 0;
  const revealZone = 78;
  const hideAfter = 96;
  const delta = 8;

  const showHeader = function () {
    header.classList.remove('is-scroll-hidden');
  };

  const hideHeader = function () {
    if (!header.classList.contains('is-menu-open')) {
      header.classList.add('is-scroll-hidden');
    }
  };

  window.addEventListener('scroll', function () {
    const currentY = window.scrollY || 0;
    const direction = currentY - lastScrollY;

    if (header.classList.contains('is-menu-open')) {
      showHeader();
      lastScrollY = currentY;
      return;
    }

    if (currentY <= revealZone) {
      showHeader();
    } else if (direction > delta && currentY > hideAfter) {
      hideHeader();
    } else if (direction < -delta) {
      showHeader();
    }

    lastScrollY = currentY;
  }, { passive: true });

  document.addEventListener('mousemove', function (event) {
    if (event.clientY <= revealZone) {
      showHeader();
    }
  });

  document.addEventListener('touchstart', function (event) {
    if (!event.touches || event.touches.length === 0) return;
    if (event.touches[0].clientY <= revealZone) {
      showHeader();
    }
  }, { passive: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBannerNav);
} else {
  initBannerNav();
}
