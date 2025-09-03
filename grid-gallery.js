// Grid gallery with hover enlarge and image swap (original/current)
// Assumes spaces.json has [{ images: [original, current, ...], ... }]

fetch('spaces_new.json')
  .then(r => r.json())
  .then(data => {
    const gallery = document.getElementById('grid-gallery');
    data.forEach(space => {
      // Use first two images: [original, current]
      const original = space.images && space.images[0];
      const current = space.images && space.images[1] ? space.images[1] : space.images[0];
      if (!original) return;
      const item = document.createElement('div');
      item.className = 'grid-item';
      const img = document.createElement('img');
      img.className = 'grid-img';
      img.src = original;
      img.alt = '';
      let swapTimer = null;
      let showingCurrent = false;
      // On hover, enlarge and start swapping
      item.addEventListener('mouseenter', () => {
        if (original !== current) {
          swapTimer = setInterval(() => {
            img.src = showingCurrent ? original : current;
            showingCurrent = !showingCurrent;
          }, 600);
        }
      });
      item.addEventListener('mouseleave', () => {
        clearInterval(swapTimer);
        img.src = original;
        showingCurrent = false;
      });
      item.appendChild(img);
      gallery.appendChild(item);
    });
  });
