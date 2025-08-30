// Spaces Catalog JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const grid = document.getElementById('spaces-grid');
  const filterCheckbox = document.getElementById('available-only');
  const locationFilters = document.getElementById('location-filters');
  const elementFilters = document.getElementById('element-filters');
  const styleFilters = document.getElementById('style-filters');
  const resultsSummary = document.getElementById('results-summary');

  let spaces = [];
  let selectedLocation = null;
  let selectedElement = null;
  let selectedStyle = null;

  // Load spaces data (now from unified spaces.json)
  fetch('spaces.json')
    .then(response => response.json())
    .then(data => {
      spaces = data;
      renderFilters();
      renderSpaces(getFilteredSpaces());
    })
    .catch(error => console.error('Error loading spaces:', error));

  filterCheckbox.addEventListener('change', function() {
    renderSpaces(getFilteredSpaces());
  });

  function getUniqueValues(key) {
    const values = new Set();
    spaces.forEach(space => {
      if (Array.isArray(space[key])) {
        space[key].forEach(v => values.add(v));
      } else if (space[key]) {
        values.add(space[key]);
      }
    });
    return Array.from(values);
  }

  function renderFilters() {
    // Location
    locationFilters.innerHTML = '';
    getUniqueValues('location').forEach(loc => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (selectedLocation === loc ? ' selected' : '');
      btn.textContent = loc.charAt(0).toUpperCase() + loc.slice(1);
      btn.onclick = () => {
        selectedLocation = selectedLocation === loc ? null : loc;
        renderFilters();
        renderSpaces(getFilteredSpaces());
      };
      locationFilters.appendChild(btn);
    });
    // Element
    elementFilters.innerHTML = '';
    getUniqueValues('element').forEach(el => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (selectedElement === el ? ' selected' : '');
      btn.textContent = el.charAt(0).toUpperCase() + el.slice(1);
      btn.onclick = () => {
        selectedElement = selectedElement === el ? null : el;
        renderFilters();
        renderSpaces(getFilteredSpaces());
      };
      elementFilters.appendChild(btn);
    });
    // Style
    styleFilters.innerHTML = '';
    getUniqueValues('style').forEach(st => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (selectedStyle === st ? ' selected' : '');
      btn.textContent = st.charAt(0).toUpperCase() + st.slice(1);
      btn.onclick = () => {
        selectedStyle = selectedStyle === st ? null : st;
        renderFilters();
        renderSpaces(getFilteredSpaces());
      };
      styleFilters.appendChild(btn);
    });
  }

  function getFilteredSpaces() {
    let filtered = spaces.slice();
    if (filterCheckbox.checked) {
      filtered = filtered.filter(space => space.status === 'available');
    }
    if (selectedLocation) {
      filtered = filtered.filter(space => space.location === selectedLocation);
    }
    if (selectedElement) {
      filtered = filtered.filter(space => Array.isArray(space.element) && space.element.includes(selectedElement));
    }
    if (selectedStyle) {
      filtered = filtered.filter(space => Array.isArray(space.style) && space.style.includes(selectedStyle));
    }
    return filtered;
  }

  function renderSpaces(spacesList) {
    grid.innerHTML = '';
    resultsSummary.textContent = `${spacesList.length} space${spacesList.length !== 1 ? 's' : ''} found`;
    spacesList.forEach(space => {
      const card = document.createElement('div');
      card.className = 'space-card';
  card.onclick = () => openSpaceModal(space);

      const image = space.images[0];
      const statusClass = space.status === 'available' ? 'status-available' : 'status-taken';
      const statusText = space.status === 'available' ? 'Available' : 'Taken';

      // Badges
      let badges = '';
      if (space.location) {
        badges += `<span class="badge badge-location">${space.location}</span>`;
      }
      if (Array.isArray(space.element)) {
        badges += space.element.map(e => `<span class="badge badge-element">${e}</span>`).join(' ');
      }
      if (Array.isArray(space.style)) {
        badges += space.style.map(s => `<span class="badge badge-style">${s}</span>`).join(' ');
      }

      // Show both English and Japanese for title/description, and format title as number before description
      const titleNum = space.title || space.id;
      const titleJa = space.title_ja || '';
      const descEn = space.description || '';
      const descJa = space.description_ja || '';

      card.innerHTML = `
        <img src="${image}" alt="${titleNum}" class="space-image">
        <div class="space-info">
          <div class="space-badges">${badges}</div>
          <p class="space-description">
            <span class="jp">${titleNum}．${descJa}
              <span class="desc-tooltip" tabindex="0"><span class="desc-tooltip-text">${space.desc_source_ja || "Translated with Google Translation API"}</span></span>
            </span><br>
            ${descEn}
            <span class="desc-tooltip" tabindex="0">ⓘ<span class="desc-tooltip-text">${space.desc_source_en || "Generated by BLIP-2"}</span></span>
          </p>
          <span class="space-status ${statusClass}">${statusText}</span>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  function viewSpace(spaceId) {
    // (No longer used)
  }

  // Modal logic
  const modal = document.getElementById('space-modal');
  const modalClose = document.getElementById('modal-close');
  const modalImage = document.getElementById('modal-image');
  const modalInfo = document.getElementById('modal-info');
  const modalStatus = document.getElementById('modal-status');

  function openSpaceModal(space) {
    // Set image
    modalImage.src = space.images[0];
    modalImage.alt = space.title || space.id;
    // Info block: show all info fields
    modalInfo.innerHTML = `
      <h2>${space.title || ''} <span class=\"jp\">${space.title_ja || ''}</span></h2>
      <p><b>ID:</b> ${space.id}</p>
      <p><b>Description:</b><br>${space.description_ja || ''}<br>${space.description || ''}</p>
      <p><b>Tags:</b> ${(space.tags || []).join(', ')}</p>
      <p><b>Location:</b> ${space.location || ''}</p>
      <p><b>Element:</b> ${(space.element || []).join(', ')}</p>
      <p><b>Style:</b> ${(space.style || []).join(', ')}</p>
    `;
    // Status
    if (space.status === 'taken') {
      modalStatus.innerHTML = `<span style=\"color:#b00;font-weight:bold;\">Unfortunately, this space is already taken.<br>申し訳ありませんが、このスペースはすでに契約済みです。</span>`;
    } else {
      modalStatus.innerHTML = '';
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Reset scroll position to top
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;
  }

  modalClose.onclick = function() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };
});
