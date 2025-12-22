// Fade-in effect for images as they load, with a centered loader element
document.querySelectorAll("img.fade-in").forEach(img => {
  // Create loader element and append after the image
  const loader = document.createElement('div');
  loader.className = 'image-loader';
  // Start hidden by default; we'll remove hidden when we need to show it
  loader.setAttribute('aria-hidden', 'true');

  // Ensure the parent is positioned (gallery items already are). Insert after the image
  if (img.parentNode) {
    img.parentNode.insertBefore(loader, img.nextSibling);
  }

  function showLoaded() {
    // mark image loaded and hide loader
    img.classList.add('loaded');
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
  }

  function showLoader() {
    if (loader) loader.removeAttribute('hidden');
  }

  // Show loader right away if image not yet complete
  if (!img.complete) {
    showLoader();
  }

  img.addEventListener('load', showLoaded);
  img.addEventListener('error', () => {
    // On error, remove loader and still mark as loaded so it's visible fallback
    if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    img.classList.add('loaded');
  });

  // If already cached/loaded, mark immediately and remove loader
  if (img.complete) {
    showLoaded();
  }
});
