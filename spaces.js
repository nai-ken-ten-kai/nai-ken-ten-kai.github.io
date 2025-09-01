// Spaces Catalog JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Language state and translations
  let currentLang = 'en';
  const translations = {
    en: {
      allSpaces: 'All Spaces',
  about: 'About',
      availableOnly: 'Available Only',
      available: 'Available',
      taken: 'Taken',
      contact: 'Contact:',
      instagram: 'Instagram',
      gmail: 'Gmail',
      rememberId: 'This space is (Most Likely) still free! <br><br>To use it just drop by during open time <br>Sept 3–4 (9:00–18:00) | Sept 5–7 (12:00–20:00)<br><br>and/or contact us: <a href="https://www.instagram.com/nai.ken.ten.kai/" target="_blank">Instagram</a> | <a href="mailto:nai.ken.ten.kai@gmail.com">Gmail</a><br><br>Please remember the ID of this image when contacting us. <br>Since it takes time to update the website there is chance that the space you want is already taken, but maybe we can arrange your second/third option in that case!',
      rememberIdShort: 'Please remember the ID of this image when contacting us.',
      alreadyTaken: 'Sorry but this space is already taken, it will be updated when something happens here! Feel free to check other spaces!',
      found: (n) => `${n} space${n !== 1 ? 's' : ''} found`,
      location: 'Location',
      element: 'Element',
      style: 'Style',
      description: 'Description',
      tags: 'Tags',
      id: 'ID',
      tagTranslations: {
        location: {
          outside: 'Outside',
          inside: 'Inside'
        },
        element: {
          wall: 'Wall',
          door: 'Door',
          window: 'Window',
          floor: 'Floor',
          ceiling: 'Ceiling'
        },
        style: {
          neutral: 'Neutral',
          modern: 'Modern',
          vintage: 'Vintage',
          rustic: 'Rustic'
        }
      }
    },
    ja: {
      allSpaces: '全スペース',
  about: 'このサイトについて',
      availableOnly: '空きのみ',
      available: '空き',
      taken: '契約済み',
      contact: 'お問い合わせ:',
      instagram: 'インスタグラム',
      gmail: 'Gmail',
      rememberId: 'このスペースは（おそらく）まだ空いています！<br><br>ご興味があれば、オープン時間にふらっとお立ち寄りください。<br>9月3–4日　9:00–18:00  |  9月5–7日　12:00–20:00<br><br>また、<a href="https://www.instagram.com/nai.ken.ten.kai/" target="_blank">Instagram</a> | <a href="mailto:nai.ken.ten.kai@gmail.com">Gmail</a> からご連絡いただくことや、リモート参加も可能です。<br><br>その際は、気になる画像のIDをお知らせください。<br>ウェブサイトの更新に少し時間がかかるため、スペースがすでに埋まっている場合もあります。<br>そのときは、他の希望あれば頑張ってご案内します！',
      rememberIdShort: 'お問い合わせの際はこの画像のIDをお伝えください。',
      alreadyTaken: '申し訳ありませんが、このスペースはすでに契約済みです。何かの変化をお楽しみください！他のスペース是非ご利用ください！',
      found: (n) => `全${n}件`,
      location: '場所',
      element: '要素',
      style: 'スタイル',
      description: '説明',
      tags: 'タグ',
      id: 'ID',
      tagTranslations: {
        location: {
          outside: '屋外',
          inside: '室内'
        },
        element: {
          wall: '壁',
          door: 'ドア',
          window: '窓',
          floor: '床',
          ceiling: '天井'
        },
        style: {
          neutral: 'ニュートラル',
          modern: 'モダン',
          vintage: 'ヴィンテージ',
          rustic: 'ラスティック'
        }
      }
    }
  };

  // Language switcher logic
  const langEnBtn = document.getElementById('lang-en');
  const langJaBtn = document.getElementById('lang-ja');
  function setLang(lang) {
    currentLang = lang;
    if (langEnBtn) langEnBtn.classList.toggle('active', lang === 'en');
    if (langJaBtn) langJaBtn.classList.toggle('active', lang === 'ja');
    // Update header
    const aboutLink = document.querySelector('.header-nav a[data-i18n="about"]');
    if (aboutLink) aboutLink.textContent = translations[lang].about;
    // Robustly update the available-only label (if present on this page)
    const availableLabel = document.querySelector('.filter-group label');
    if (availableLabel) {
      const checkbox = availableLabel.querySelector('#available-only');
      const isChecked = checkbox ? checkbox.checked : false;
      availableLabel.innerHTML = `<input type="checkbox" id="available-only"> ${translations[lang].availableOnly}`;
      // Restore checkbox state and re-add event listener
      const newCheckbox = availableLabel.querySelector('#available-only');
      if (newCheckbox) {
        newCheckbox.checked = isChecked;
        newCheckbox.addEventListener('change', function() {
          // Only re-render if grid exists
          if (typeof renderSpaces === 'function') renderSpaces(getFilteredSpaces());
        });
      }
    }
    // Update filters and spaces if the relevant containers exist
    if (typeof renderFilters === 'function') renderFilters();
    if (typeof renderSpaces === 'function') renderSpaces(getFilteredSpaces());
    // Modal instructions (if open)
    const modalInstructions = document.querySelector('.modal-instructions b');
    if (modalInstructions) {
      modalInstructions.innerHTML = translations[lang].rememberId;
    }
  }

  if (langEnBtn) langEnBtn.onclick = () => setLang('en');
  if (langJaBtn) langJaBtn.onclick = () => setLang('ja');
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

  // Set initial language (after all DOM assignments and variable declarations)
  setLang('en');

  // Load spaces data (now from unified spaces_new.json)
  fetch('spaces_new.json')
    .then(response => response.json())
    .then(data => {
      spaces = data;
      renderFilters();
      renderSpaces(getFilteredSpaces());
    })
    .catch(error => console.error('Error loading spaces:', error));

  if (filterCheckbox) {
    filterCheckbox.addEventListener('change', function() {
      if (typeof renderSpaces === 'function') renderSpaces(getFilteredSpaces());
    });
  }

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
    if (locationFilters) {
      locationFilters.innerHTML = '';
      getUniqueValues('location').forEach(loc => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (selectedLocation === loc ? ' selected' : '');
      btn.textContent = translations[currentLang].tagTranslations.location[loc] || loc;
      btn.onclick = () => {
        selectedLocation = selectedLocation === loc ? null : loc;
        renderFilters();
        renderSpaces(getFilteredSpaces());
      };
      locationFilters.appendChild(btn);
      });
    }
    // Element
    if (elementFilters) {
      elementFilters.innerHTML = '';
      getUniqueValues('element').forEach(el => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (selectedElement === el ? ' selected' : '');
      btn.textContent = translations[currentLang].tagTranslations.element[el] || el;
      btn.onclick = () => {
        selectedElement = selectedElement === el ? null : el;
        renderFilters();
        renderSpaces(getFilteredSpaces());
      };
      elementFilters.appendChild(btn);
      });
    }
    // Style
    if (styleFilters) {
      styleFilters.innerHTML = '';
      getUniqueValues('style').forEach(st => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (selectedStyle === st ? ' selected' : '');
      btn.textContent = translations[currentLang].tagTranslations.style[st] || st;
      btn.onclick = () => {
        selectedStyle = selectedStyle === st ? null : st;
        renderFilters();
        renderSpaces(getFilteredSpaces());
      };
      styleFilters.appendChild(btn);
      });
    }
  }

  function getFilteredSpaces() {
    let filtered = spaces.slice();
    const currentFilterCheckbox = document.getElementById('available-only');
    if (currentFilterCheckbox && currentFilterCheckbox.checked) {
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
  if (!grid) return; // nothing to render on this page
  grid.innerHTML = '';
  if (resultsSummary) resultsSummary.textContent = translations[currentLang].found(spacesList.length);
    spacesList.forEach(space => {
      const card = document.createElement('div');
      card.className = 'space-card';
  card.onclick = () => openSpaceModal(space);

  // For nai-ken-kai, show only the original image (first in images)
  const imageObj = space.images && space.images.length > 0 ? space.images[0] : null;
  const image = imageObj && (typeof imageObj === 'string' ? imageObj : imageObj.src);
  const statusClass = space.status === 'available' ? 'status-available' : 'status-taken';
  // Some admin actions set non-standard statuses like 'published'. For display,
  // treat anything that isn't 'available' as 'taken'. Use translation keys.
  const statusKey = space.status === 'available' ? 'available' : 'taken';
  const statusText = (translations[currentLang] && translations[currentLang][statusKey]) || (statusKey === 'available' ? 'Available' : 'Taken');

      // Badges
      let badges = '';
      if (space.location) {
        const locTrans = translations[currentLang].tagTranslations.location[space.location] || space.location;
        badges += `<span class="badge badge-location">${locTrans}</span>`;
      }
      if (Array.isArray(space.element)) {
        badges += space.element.map(e => {
          const elemTrans = translations[currentLang].tagTranslations.element[e] || e;
          return `<span class="badge badge-element">${elemTrans}</span>`;
        }).join(' ');
      }
      if (Array.isArray(space.style)) {
        badges += space.style.map(s => {
          const styleTrans = translations[currentLang].tagTranslations.style[s] || s;
          return `<span class="badge badge-style">${styleTrans}</span>`;
        }).join(' ');
      }

      // Show only id for title, and bilingual description
      const descEn = space.description || '';
      const descJa = space.description_ja || '';
      card.innerHTML = `
        <img src="${image}" alt="${space.id}" class="space-image">
        <div class="space-info">
          <div class="space-badges">${badges}</div>
          <p class="space-description">
            <span class="jp">${space.id}．${descJa}
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
  const modalImageObj = space.images[0];
  modalImage.src = modalImageObj && (typeof modalImageObj === 'string' ? modalImageObj : modalImageObj.src);
  modalImage.alt = space.id;
    // Info block: just show ID as heading and plain text for the rest
    let infoHtml = `<h2>${space.id}</h2>`;
    if (currentLang === 'ja' && space.description_ja) {
      infoHtml += `<div style='margin-bottom:0.7em;'>${space.description_ja}</div>`;
    } else if (space.description) {
      infoHtml += `<div style='margin-bottom:0.7em;'>${space.description}</div>`;
    }
    if (space.tags && space.tags.length) {
      const tagBadges = space.tags.map(t => `<span class="badge badge-tag">${t}</span>`).join(' ');
      infoHtml += `<div style='margin-bottom:0.7em;'>${tagBadges}</div>`;
    }
    if (space.location) {
      const locTrans = translations[currentLang].tagTranslations.location[space.location] || space.location;
      infoHtml += `<div style='margin-bottom:0.7em;'><span class="badge badge-location">${locTrans}</span></div>`;
    }
    if (space.element && space.element.length) {
      const elemBadges = space.element.map(e => {
        const elemTrans = translations[currentLang].tagTranslations.element[e] || e;
        return `<span class="badge badge-element">${elemTrans}</span>`;
      }).join(' ');
      infoHtml += `<div style='margin-bottom:0.7em;'>${elemBadges}</div>`;
    }
    if (space.style && space.style.length) {
      const styleBadges = space.style.map(s => {
        const styleTrans = translations[currentLang].tagTranslations.style[s] || s;
        return `<span class="badge badge-style">${styleTrans}</span>`;
      }).join(' ');
      infoHtml += `<div style='margin-bottom:0.7em;'>${styleBadges}</div>`;
    }
    modalInfo.innerHTML = infoHtml;
    // Status: any non-available status should be shown as taken
    if (space.status && space.status !== 'available') {
      modalStatus.innerHTML = `<span style=\"color:#b00;font-weight:bold;\">${translations[currentLang].alreadyTaken}</span>`;
    } else {
      modalStatus.innerHTML = '';
    }
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Reset scroll position to top
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;
    // If the space has updates, render them below the info and wire click handlers
    if (Array.isArray(space.updates) && space.updates.length) {
      const updatesHtml = document.createElement('div');
      updatesHtml.className = 'space-updates';
      updatesHtml.innerHTML = '<h3>' + (currentLang === 'ja' ? '更新' : 'Updates') + '</h3>';
      space.updates.forEach((u, ui) => {
        const udiv = document.createElement('div');
        udiv.className = 'space-update';
        const author = u.author || '';
        const action = u.action ? (' — ' + u.action) : '';
        const txt = u.text ? ('<div class="update-text">' + u.text + '</div>') : '';
        let imgsHtml = '';
        if (Array.isArray(u.images)) {
          imgsHtml = '<div class="update-images">' + u.images.map((im, idx) => {
            const src = (typeof im === 'string') ? im : (im.src || '');
            return `<img src="${src}" class="update-thumb" data-spaceid="${space.id}" data-update-index="${ui}" data-img-index="${idx}"/>`;
          }).join('') + '</div>';
        }
        udiv.innerHTML = `<div class="update-header"><strong>${author}</strong>${action}</div>${txt}${imgsHtml}`;
        updatesHtml.appendChild(udiv);
      });
      modalInfo.appendChild(updatesHtml);

      // wire click handlers for thumbnails
      modalInfo.querySelectorAll('.update-thumb').forEach(imgEl => {
        imgEl.style.cursor = 'pointer';
        imgEl.addEventListener('click', function(ev) {
          const upIdx = parseInt(this.getAttribute('data-update-index'));
          const imgIdx = parseInt(this.getAttribute('data-img-index'));
          const upd = space.updates[upIdx];
          const imgObj = upd.images && upd.images[imgIdx];
          if (imgObj) {
            const src = (typeof imgObj === 'string') ? imgObj : imgObj.src;
            modalImage.src = src;
            // show update metadata in modalInfo (replace existing info for clarity)
            const metaHtml = `<h2>${space.id} — ${upd.author || ''}</h2>` + (upd.action ? `<div><em>${upd.action}</em></div>` : '') + (upd.text ? `<div class="update-text">${upd.text}</div>` : '');
            // keep badges above, but replace lower info
            const badgesDiv = modalInfo.querySelector('.space-badges');
            modalInfo.innerHTML = '';
            if (badgesDiv) modalInfo.appendChild(badgesDiv);
            const infoContainer = document.createElement('div');
            infoContainer.innerHTML = metaHtml;
            modalInfo.appendChild(infoContainer);
          }
        });
      });
    }
  }

  modalClose.onclick = function() {
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  };
  window.onclick = function(event) {
    if (event.target === modal) {
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };
});
