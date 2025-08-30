// Spaces Catalog JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Language state and translations
  let currentLang = 'en';
  const translations = {
    en: {
      allSpaces: 'All Spaces',
      availableOnly: 'Available Only',
      available: 'Available',
      taken: 'Taken',
      contact: 'Contact:',
      instagram: 'Instagram',
      gmail: 'Gmail',
      rememberId: 'Please remember the ID of this image when contacting us. Since it takes time to update the website there is chance that the space you want is already taken, so if you have second/third option it would also be great.',
      rememberIdShort: 'Please remember the ID of this image when contacting us.',
      alreadyTaken: 'Unfortunately, this space is already taken.',
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
      availableOnly: '空きのみ',
      available: '空き',
      taken: '契約済み',
      contact: 'お問い合わせ:',
      instagram: 'インスタグラム',
      gmail: 'Gmail',
      rememberId: 'お問い合わせの際はこの画像のIDをお伝えください。ウェブサイト更新に時間がかかりますので、すでに埋められている可能性があります。第二、第三の選択肢があればそれも教えていただけると幸いです。',
      rememberIdShort: 'お問い合わせの際はこの画像のIDをお伝えください。',
      alreadyTaken: '申し訳ありませんが、このスペースはすでに契約済みです。',
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
    langEnBtn.classList.toggle('active', lang === 'en');
    langJaBtn.classList.toggle('active', lang === 'ja');
    // Update header
    // document.getElementById('header-sub').textContent = translations[lang].allSpaces;
    // Robustly update the available-only label
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
          renderSpaces(getFilteredSpaces());
        });
      }
    }
    renderFilters();
    renderSpaces(getFilteredSpaces());
    // Modal instructions (if open)
    const modalInstructions = document.querySelector('.modal-instructions b');
    if (modalInstructions) {
      modalInstructions.innerHTML = translations[lang].rememberId;
    }
  }

  langEnBtn.onclick = () => setLang('en');
  langJaBtn.onclick = () => setLang('ja');
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
      btn.textContent = translations[currentLang].tagTranslations.location[loc] || loc;
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
      btn.textContent = translations[currentLang].tagTranslations.element[el] || el;
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
      btn.textContent = translations[currentLang].tagTranslations.style[st] || st;
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
  grid.innerHTML = '';
  resultsSummary.textContent = translations[currentLang].found(spacesList.length);
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
          <span class="space-status ${statusClass}">${currentLang === 'ja' ? translations.ja[space.status] : translations.en[space.status]}</span>
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
    // Status
    if (space.status === 'taken') {
      modalStatus.innerHTML = `<span style=\"color:#b00;font-weight:bold;\">${translations[currentLang].alreadyTaken}</span>`;
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
