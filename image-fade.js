(() => {
  const loaders = new WeakMap();
  const sources = new WeakMap();
  const pendingImages = new Set();
  const trackedImages = new WeakSet();

  function positionLoader(img) {
    const loader = loaders.get(img);
    const parent = img.parentElement;
    if (!loader || !parent) return;

    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    if (loader.parentElement !== parent) {
      loader.remove();
      parent.insertBefore(loader, img.nextSibling);
    }

    const imageRect = img.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    loader.style.left = `${imageRect.left - parentRect.left - parent.clientLeft + parent.scrollLeft + imageRect.width / 2}px`;
    loader.style.top = `${imageRect.top - parentRect.top - parent.clientTop + parent.scrollTop + imageRect.height / 2}px`;
  }

  function finishImage(img) {
    img.classList.add('loaded');
    pendingImages.delete(img);
    const loader = loaders.get(img);
    if (loader) loader.remove();
  }

  function trackImage(img) {
    const source = [img.currentSrc, img.getAttribute('src'), img.getAttribute('srcset'), img.getAttribute('sizes')].join('|');
    if (!img.hasAttribute('src') && !img.hasAttribute('srcset')) return;

    if (!trackedImages.has(img)) {
      trackedImages.add(img);
      img.decoding = 'async';
      img.classList.add('fade-in');
      img.addEventListener('load', () => finishImage(img));
      img.addEventListener('error', () => finishImage(img));
    }

    if (sources.get(img) === source) {
      if (pendingImages.has(img)) positionLoader(img);
      return;
    }

    sources.set(img, source);
    img.classList.remove('loaded');

    let loader = loaders.get(img);
    if (!loader || !loader.isConnected) {
      loader = document.createElement('span');
      loader.className = 'image-loader';
      loader.setAttribute('aria-hidden', 'true');
      loaders.set(img, loader);
    }

    pendingImages.add(img);
    positionLoader(img);
    if (img.complete) finishImage(img);
  }

  function trackNode(node) {
    if (!(node instanceof Element)) return;
    if (node.matches('img')) trackImage(node);
    node.querySelectorAll('img').forEach(trackImage);
  }

  function trackTileBackgrounds() {
    document.querySelectorAll('.service-tile').forEach((tile) => {
      const background = getComputedStyle(tile).backgroundImage;
      const match = background.match(/url\((?:"([^"]+)"|'([^']+)'|([^)]*))\)/);
      if (!match || tile.dataset.backgroundTracked) return;

      const source = (match[1] || match[2] || match[3]).trim();
      if (!source) return;
      tile.dataset.backgroundTracked = 'true';

      const loader = document.createElement('span');
      loader.className = 'image-loader';
      loader.setAttribute('aria-hidden', 'true');
      tile.appendChild(loader);

      const preload = new Image();
      const clearLoader = () => loader.remove();
      preload.addEventListener('load', clearLoader, { once: true });
      preload.addEventListener('error', clearLoader, { once: true });
      preload.src = source;
      if (preload.complete) clearLoader();
    });
  }

  function start() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') trackImage(mutation.target);
        mutation.addedNodes.forEach(trackNode);
      });
      trackTileBackgrounds();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['src', 'srcset', 'sizes'],
      childList: true,
      subtree: true
    });

    document.querySelectorAll('img').forEach(trackImage);
    trackTileBackgrounds();
    window.addEventListener('resize', () => pendingImages.forEach(positionLoader));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
