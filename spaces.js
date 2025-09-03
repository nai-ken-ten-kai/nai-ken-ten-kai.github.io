// Spaces Catalog JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Ensure body allows scrolling (reset any leftover modal states)
  document.body.style.overflow = '';
  
  // Language state and translations
  let currentLang = 'en';
  const translations = {
    en: {
    allSpaces: 'All Spaces',
    shared: 'Shared',
  about: 'ⓘ',
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
      aboutTitle: '',
      aboutContent: `<div class="about-banner">
        <img src="poster/GAPbannerfinal.png" alt="GAP Banner" class="gap-banner-img">
      </div>
      <p>Ichida Family's house designated as a cultural heritage site of Japan, was built in Meiji period. During Japan's period of modernization, the traditional houses and surrounding neighborhood began to gradually disappear.</p>
      <p>In response, a group of people came together with the intention of preserving the traditional atmosphere—keeping the houses "alive" by inviting others to live in them and engage with the space through exhibitions and events.</p>
      <p>This time, we, too, have this opportunity to spend five days here. During our stay, we are inviting anyone to choose a spot within the space and engage with it—by bringing something that makes the first encounter of the shared space, feel personally more comfortable.</p>
      <ol>
        <li>You will have an overview of all the places which are available in the space</li>
        <li>Put something / do something that you are comfortable to. It does not have to be an "artwork".</li>
        <li>Choose one of the photo and its ID number</li>
        <li>Inform us online/ on site</li>
        <li>Congratulation, you have just claimed this certain place in this place!</li>
        <li>You can either bring something or send data/instructions online, by 6th of September 2025</li>
      </ol>
      <div class="about-credits">
        <h3>Venue</h3>
        <p><a href="https://taireki.com/ichidatei/" target="_blank" rel="noopener">Ichida Residence (市田邸)</a><br>
        1-chōme-6-2 Uenosakuragi, Taito City, Tokyo</p>
        
        <div class="map-section">
          <div class="embedded-map">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d280.27023770179244!2d139.77073111813516!3d35.719782375395496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188c2a28187f35%3A0xcff5e5240c7b2583!2s1-ch%C5%8Dme-6-2%20Uenosakuragi%2C%20Taito%20City%2C%20Tokyo%20110-0002!5e0!3m2!1sen!2sjp!4v1756741256306!5m2!1sen!2sjp"
              width="100%" 
              height="250" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
        
        <h3>Supported by</h3>
        <p><a href="https://gap.geidai.ac.jp/" target="_blank" rel="noopener" class="geidai-link">
          <img src="logo/GAP_logo.svg" alt="GAP Logo" class="geidai-logo-img">
          Tokyo University of the Arts - Global Art Practice (GAP)
        </a></p>
      </div>`,
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
    shared: '共有',
  about: 'ⓘ',
      availableOnly: '空きのみ',
      available: '空き',
      taken: '契約済み',
      contact: 'お問い合わせ:',
      instagram: 'インスタグラム',
      gmail: 'Gmail',
      rememberId: 'このスペースは（たぶん）まだ空いています！<br><br>ご興味があれば、オープン時間にふらっとお立ち寄りください。<br>9月3–4日　9:00–18:00  |  9月5–7日　12:00–20:00<br><br>また、<a href="https://www.instagram.com/nai.ken.ten.kai/" target="_blank">Instagram</a> | <a href="mailto:nai.ken.ten.kai@gmail.com">Gmail</a> からご連絡いただくことや、リモート参加も可能です。<br><br>その際は、気になる画像のIDをお知らせください。<br>ウェブサイトの更新に少し時間がかかるため、スペースがすでに埋まっている場合もあります。<br>そのときは、他の希望あれば頑張ってご案内します！',
      rememberIdShort: 'お問い合わせの際はこの画像のIDをお伝えください。',
      alreadyTaken: '申し訳ありませんが、このスペースはすでに契約済みです。何かの変化をお楽しみください！他のスペース是非ご利用ください！',
      found: (n) => `全${n}件`,
      aboutTitle: '',
      aboutContent: `<div class="about-banner">
        <img src="poster/GAPbannerfinal.png" alt="GAP Banner" class="gap-banner-img">
      </div>
      <p>明治時代に建てられた市田家の住宅は、日本の文化的遺産として指定されています。日本の近代化の過程で、伝統的な住宅とその周辺の街並みは徐々に姿を消していきました。</p>
      <p>これに対し、伝統的な雰囲気を保存する意図を持った人々が集まり、住宅を「生きたまま」保つため、他の人々を招いて住まわせ、展覧会やイベントを通じて空間との関わりを持たせることにしました。</p>
      <p>今回、私たちもここで5日間を過ごす機会を得ました。滞在中、誰でも空間内のスポットを選んで関わることができます—共有空間との最初の出会いを、個人的により居心地よく感じられるものを持ち込むことで。</p>
      <ol>
        <li>空間内で利用可能なすべての場所の概要を確認できます</li>
        <li>快適に感じられることを何かしたり、何かを置いたりしてください。「アートワーク」である必要はありません。</li>
        <li>写真とそのID番号の一つを選んでください</li>
        <li>オンラインまたは現地でお知らせください</li>
        <li>おめでとうございます、この場所のこの特定の場所を確保しました！</li>
        <li>2025年9月6日までに、何かを持参するか、オンラインでデータ/指示を送ることができます</li>
      </ol>
      <div class="about-credits">
        <h3>会場</h3>
        <p><a href="https://taireki.com/ichidatei/" target="_blank" rel="noopener">市田邸</a><br>
        東京都台東区上野桜木1丁目6-2</p>
        
        <div class="map-section">
          <div class="embedded-map">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d280.27023770179244!2d139.77073111813516!3d35.719782375395496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188c2a28187f35%3A0xcff5e5240c7b2583!2s1-ch%C5%8Dme-6-2%20Uenosakuragi%2C%20Taito%20City%2C%20Tokyo%20110-0002!5e0!3m2!1sen!2sjp!4v1756741256306!5m2!1sen!2sjp"
              width="100%" 
              height="250" 
              style="border:0;" 
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
        
        <h3>助成</h3>
        <p><a href="https://gap.geidai.ac.jp/" target="_blank" rel="noopener" class="geidai-link">
          <img src="logo/GAP_logo.svg" alt="GAP Logo" class="geidai-logo-img">
          東京藝術大学 グローバルアートプラクティス (GAP)
        </a></p>
      </div>`,
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
    const aboutLink = document.querySelector('.about[data-i18n="about"]');
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

  // Load spaces data (optimized for frontend)
  fetch('spaces_optimized.json')
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

      // For nai-ken-kai, show only the original image
      const imageObj = space.original_image || (space.images && space.images.length > 0 ? space.images[0] : null);
      const image = imageObj && (typeof imageObj === 'string' ? imageObj : imageObj.src);

      // Special handling for shared space (140)
      let statusClass, statusText;
      if (space.id === 140) {
        statusClass = 'status-shared';
        statusText = (translations[currentLang] && translations[currentLang].shared) || 'Shared';
      } else {
        statusClass = space.status === 'available' ? 'status-available' : 'status-taken';
        // Some admin actions set non-standard statuses like 'published'. For display,
        // treat anything that isn't 'available' as 'taken'. Use translation keys.
        const statusKey = space.status === 'available' ? 'available' : 'taken';
        statusText = (translations[currentLang] && translations[currentLang][statusKey]) || (statusKey === 'available' ? 'Available' : 'Taken');
      }

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
        <img src="${image}" alt="${space.id}" class="space-image" loading="lazy">
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
    // Set image - handle both data structures
    const modalImageObj = space.original_image || (space.images && space.images[0]);
    modalImage.src = modalImageObj && (typeof modalImageObj === 'string' ? modalImageObj : modalImageObj.src);
    modalImage.alt = space.id;
    // Always clear modal content first
    modalInfo.innerHTML = '';
    modalStatus.innerHTML = '';
    let infoHtml = `<h2>${space.id}</h2>`;
    if (space.id === 140) {
      infoHtml += `<div style='margin-bottom:0.7em;'>This is a shared projection space. Multiple artists may use it over time. Please check updates for details.</div>`;
      modalStatus.innerHTML = `<span class="space-status status-shared">Shared</span>`;
    } else if (space.status && space.status !== 'available') {
      // Taken: show only taken message and contact (once)
      infoHtml += `<div style='margin-bottom:0.7em;'>${translations[currentLang].alreadyTaken}</div>`;
      infoHtml += `<div class="modal-contact"><b>${translations[currentLang].contact}</b> <a href="https://www.instagram.com/nai.ken.ten.kai/" target="_blank">${translations[currentLang].instagram}</a> | <a href="mailto:nai.ken.ten.kai@gmail.com">${translations[currentLang].gmail}</a></div>`;
      modalStatus.innerHTML = `<span class="space-status status-taken">${translations[currentLang].taken}</span>`;
    } else {
      // Available: show only rememberId (which already includes contact info)
      infoHtml += `<div style='margin-bottom:0.7em;'>${translations[currentLang].rememberId}</div>`;
      modalStatus.innerHTML = `<span class="space-status status-available">${translations[currentLang].available}</span>`;
    }
    modalInfo.innerHTML = infoHtml;
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
            return `<img src="${src}" class="update-thumb" data-spaceid="${space.id}" data-update-index="${ui}" data-img-index="${idx}" loading="lazy"/>`;
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

  if (modalClose) {
    modalClose.onclick = function() {
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = '';
    };
  }
  window.onclick = function(event) {
    if (event.target === modal) {
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    if (event.target === aboutModal) {
      if (aboutModal) aboutModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // About modal functionality
  const aboutModal = document.getElementById('about-modal');
  const aboutModalClose = document.getElementById('about-modal-close');
  const aboutModalInfo = document.getElementById('about-modal-info');

  function openAboutModal() {
    if (aboutModalInfo) {
      const titleHtml = translations[currentLang].aboutTitle ? 
        `<h2>${translations[currentLang].aboutTitle}</h2>` : '';
      aboutModalInfo.innerHTML = `
        <div class="about-lang-section">
          ${titleHtml}
          ${translations[currentLang].aboutContent}
        </div>
      `;
      
      // Calculate dynamic spacing based on banner image with mobile considerations
      setTimeout(() => {
        const bannerImg = document.querySelector('.gap-banner-img');
        const spacer = document.querySelector('.about-lang-section');
        
        if (bannerImg && spacer) {
          // Wait for image to load
          if (bannerImg.complete) {
            applySpacing();
          } else {
            bannerImg.onload = applySpacing;
          }
          
          function applySpacing() {
            const bannerHeight = bannerImg.offsetHeight;
            const isMobile = window.innerWidth <= 768;
            const extraPadding = isMobile ? 30 : 20; // More padding on mobile
            const minPadding = isMobile ? 120 : 100; // Minimum padding
            
            const finalPadding = Math.max(bannerHeight + extraPadding, minPadding);
            spacer.style.paddingTop = finalPadding + 'px';
            
            // Also adjust modal info padding on mobile
            if (isMobile) {
              const modalInfo = document.querySelector('.about-modal-info');
              if (modalInfo) {
                modalInfo.style.paddingTop = '16px';
              }
            }
          }
        }
      }, 100); // Longer timeout for mobile
    }
    if (aboutModal) {
      aboutModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
  }

  if (aboutModalClose) {
    aboutModalClose.onclick = function() {
      if (aboutModal) aboutModal.style.display = 'none';
      document.body.style.overflow = '';
    };
  }

  // Periodically animate the about icon(s) and attach click handlers robustly
  const aboutElems = document.querySelectorAll('a.about, a[href="#about"], .about');
  if (aboutElems && aboutElems.length) {
    aboutElems.forEach((el) => {
      // For elements that use textual icon, set content
      if (el.classList && el.classList.contains('about')) {
        el.textContent = translations[currentLang].about;
      }
      // Attach click handler (idempotent)
      el.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openAboutModal();
      });
    });

    // small periodic animation on the first about element
    const first = aboutElems[0];
    setInterval(() => {
      if (!first) return;
      first.classList.add('animate');
      setTimeout(() => first.classList.remove('animate'), 2000);
    }, 10000);
  }
  
  // Add window resize listener to recalculate spacing on mobile rotation
  window.addEventListener('resize', function() {
    const modal = document.getElementById('about-modal');
    if (modal && modal.style.display === 'block') {
      setTimeout(() => {
        const bannerImg = document.querySelector('.gap-banner-img');
        const spacer = document.querySelector('.about-lang-section');
        
        if (bannerImg && spacer) {
          const bannerHeight = bannerImg.offsetHeight;
          const isMobile = window.innerWidth <= 768;
          const extraPadding = isMobile ? 30 : 20;
          const minPadding = isMobile ? 120 : 100;
          
          const finalPadding = Math.max(bannerHeight + extraPadding, minPadding);
          spacer.style.paddingTop = finalPadding + 'px';
        }
      }, 200);
    }
  });
});
