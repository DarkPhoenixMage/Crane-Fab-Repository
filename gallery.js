document.addEventListener('DOMContentLoaded', function () {
  // Find every gallery wrapper on the page and wire up its arrows
  const wrappers = document.querySelectorAll('.gallery-wrapper');

  wrappers.forEach((wrapper) => {
    const track = wrapper.querySelector('.gallery-track');
    const leftArrow = wrapper.querySelector('.arrow.left');
    const rightArrow = wrapper.querySelector('.arrow.right');
    if (!track) return;

    // Compute a precise scroll step: prefer item offsetWidth + gap. We'll use this
    // step to align the track so each click advances exactly one card.
    const getScrollStep = () => {
      const firstItem = track.querySelector('.gallery-item');
      if (firstItem) {
        // offsetWidth includes borders and padding; better for layout alignment
        const itemWidth = firstItem.offsetWidth;
        // gap may be set on the track via CSS; fall back to 20px if not found
        const gapValue = getComputedStyle(track).gap || getComputedStyle(track).columnGap || '20px';
        const gap = parseFloat(gapValue) || 20;
        return Math.round(itemWidth + gap);
      }
      return Math.round(wrapper.clientWidth * 0.8);
    };

    // Scroll to the next/previous card by a fixed step (item width + gap)
    // Use clamped increments to ensure each click moves one card.
    let _isAnimating = false;
    let _animTimeout = null;

    const scrollByCard = (direction) => {
      // ignore clicks while animating to avoid double-click glitches
      if (_isAnimating) return;
      const step = getScrollStep();
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      const cur = Math.max(0, Math.min(track.scrollLeft, maxScrollLeft));
      let nextLeft = cur + direction * step;
      // clamp
      nextLeft = Math.max(0, Math.min(nextLeft, maxScrollLeft));
      // if we're already at the target, do nothing
      if (Math.abs(nextLeft - cur) < 1) return;

      _isAnimating = true;
      // heuristics: smooth scroll will take ~250-450ms depending on device
      const ANIM_MS = 420;
      clearTimeout(_animTimeout);
      _animTimeout = setTimeout(() => {
        _isAnimating = false;
      }, ANIM_MS);

      track.scrollTo({ left: Math.round(nextLeft), behavior: 'smooth' });
    };

    // Click handlers (guard in case arrows are missing)
    if (leftArrow) {
      leftArrow.addEventListener('click', () => scrollByCard(-1));
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', () => scrollByCard(1));
    }

    // Update arrows: hide/disable when there's nothing to scroll
    const updateArrows = () => {
      if (!leftArrow && !rightArrow) return;
      const maxScrollLeft = track.scrollWidth - track.clientWidth;

      if (maxScrollLeft <= 0) {
        // Nothing to scroll
        if (leftArrow) leftArrow.style.display = 'none';
        if (rightArrow) rightArrow.style.display = 'none';
        return;
      } else {
        if (leftArrow) leftArrow.style.display = '';
        if (rightArrow) rightArrow.style.display = '';
      }

      // Disabled state (visual hint)
      if (leftArrow) {
        const atStart = track.scrollLeft <= 0;
        leftArrow.disabled = atStart;
        leftArrow.style.opacity = atStart ? '0.5' : '';
      }
      if (rightArrow) {
        const atEnd = track.scrollLeft >= maxScrollLeft - 1;
        rightArrow.disabled = atEnd;
        rightArrow.style.opacity = atEnd ? '0.5' : '';
      }
    };

    // Keep arrows in sync with scroll/resize
    track.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', () => {
      // recalc step and arrow visibility after layout changes
      updateArrows();
    });

    // Initial state
    updateArrows();
  });
});