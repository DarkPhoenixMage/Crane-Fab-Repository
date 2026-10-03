window.openModal = function (imgSrc, title, description, images) {
  const modal = document.getElementById('modal');
  const img = document.getElementById('modal-img');
  const titleEl = document.getElementById('modal-title');
  const textEl = document.getElementById('modal-text');
  const gallery = document.getElementById('modal-gallery');
  const imageList = Array.isArray(images) && images.length ? images : [imgSrc];

  if (!modal || !img || !titleEl || !textEl || !gallery) return;

  img.src = imgSrc;
  img.alt = title;
  titleEl.textContent = title;
  textEl.textContent = description;
  gallery.replaceChildren();

  imageList.forEach((src) => {
    const thumb = document.createElement('img');
    thumb.src = src;
    thumb.alt = title;
    thumb.title = title;
    thumb.addEventListener('click', () => {
      img.src = src;
    });
    gallery.appendChild(thumb);
  });

  modal.style.display = 'block';
};

window.closeModal = function () {
  const modal = document.getElementById('modal');
  if (modal) modal.style.display = 'none';
};

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') window.closeModal();
});