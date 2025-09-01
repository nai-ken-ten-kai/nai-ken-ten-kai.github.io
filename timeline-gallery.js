// Timeline gallery: group images by 30-minute intervals, show timestamp on left, images in row
// Assumes spaces.json: [{ id, images: [{src, taken_at}], ... }]

function parseTime(ts) {
  // Returns a Date object or null
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d) ? null : d;
}

function formatTimeGroup(date) {
  // Returns e.g. '07:30 ~ 08:30'
  if (!date) return 'Unknown';
  const start = new Date(date);
  start.setMinutes(Math.floor(start.getMinutes() / 30) * 30, 0, 0);
  const end = new Date(start.getTime() + 30 * 60000);
  const startTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
  const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  return `${startTime} ~ ${endTime}`;
}

fetch('spaces_new.json')
  .then(r => r.json())
  .then(data => {
    // Flatten all originals and updates with their space id
    let allPosts = [];
    data.forEach(space => {
      // Include original if it has taken_at
      if (space.images && space.images.length > 0 && space.images[0].taken_at) {
        allPosts.push({
          id: space.id,
          type: 'original',
          src: space.images[0].src,
          taken_at: space.images[0].taken_at,
          author: space.created_by || 'Original',
          text: 'Original state',
          supplementary: []
        });
      }
      // Include updates
      (space.updates || []).forEach(upd => {
        if (upd && upd.images && upd.images.length > 0) {
          const primaryImg = upd.images.find(im => im.role === 'primary') || upd.images[0];
          allPosts.push({
            id: space.id,
            type: 'update',
            update: upd,
            src: primaryImg.src,
            taken_at: upd.created_at,
            author: upd.author || 'Unknown',
            text: upd.text || '',
            supplementary: upd.images.filter(im => im.role !== 'primary')
          });
        }
      });
    });
    // Group by date, then by 30-min interval
    const dateGroups = {};
    allPosts.forEach(post => {
      const d = parseTime(post.taken_at);
      if (d) {
        const dateStr = d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
        if (!dateGroups[dateStr]) dateGroups[dateStr] = {};
        const timeStr = formatTimeGroup(d);
        if (!dateGroups[dateStr][timeStr]) dateGroups[dateStr][timeStr] = [];
        dateGroups[dateStr][timeStr].push(post);
      } else {
        if (!dateGroups['Unknown']) dateGroups['Unknown'] = {};
        if (!dateGroups['Unknown']['Unknown']) dateGroups['Unknown']['Unknown'] = [];
        dateGroups['Unknown']['Unknown'].push(post);
      }
    });
    // Sort dates
    const sortedDates = Object.keys(dateGroups).sort((a,b) => a.localeCompare(b));
    // Render
    const gallery = document.getElementById('timeline-gallery');
    sortedDates.forEach(dateStr => {
      // Date label
      const dateLabel = document.createElement('div');
      dateLabel.className = 'timeline-date-label';
      dateLabel.textContent = dateStr;
      dateLabel.style = 'font-weight:bold;font-size:1.1rem;margin-bottom:4px;margin-top:24px;color:#181818;';
      gallery.appendChild(dateLabel);
      // Time groups
      const timeGroups = dateGroups[dateStr];
      const sortedTimes = Object.keys(timeGroups).sort((a,b) => a.localeCompare(b));
      sortedTimes.forEach(timeStr => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'timeline-group';
        const tsDiv = document.createElement('div');
        tsDiv.className = 'timeline-timestamp';
        tsDiv.textContent = timeStr;
        const imgsDiv = document.createElement('div');
        imgsDiv.className = 'timeline-images';
        timeGroups[timeStr].forEach(post => {
          const imgEl = document.createElement('img');
          imgEl.className = 'timeline-img';
          imgEl.src = post.src;
          imgEl.alt = post.id;
          imgEl.onclick = () => {
            // Find the space for this post
            const space = data.find(s => s.id == post.id);
            if (!space) return;
            // Build events: original, then each update
            const events = [];
            // Original
            if (space.images && space.images.length > 0) {
              events.push({
                type: 'original',
                img: space.images[0].src,
                info: '<b>Original State</b>',
                supp: []
              });
            }
            // Updates
            (space.updates || []).forEach(upd => {
              if (upd.images && upd.images.length > 0) {
                const mainImg = upd.images.find(im => im.role === 'primary') || upd.images[0];
                const suppImgs = upd.images.filter(im => im !== mainImg);
                events.push({
                  type: 'update',
                  img: mainImg.src,
                  info: `<b>${upd.author || ''}</b><br>${upd.text || ''}`,
                  supp: suppImgs.map(im => im.src)
                });
              }
            });
            // Build modal
            const modal = document.createElement('div');
            modal.className = 'update-modal';
            modal.innerHTML = `
              <div class="update-modal-content">
                <button class="update-modal-close">&times;</button>
                <div class="update-modal-timeline">
                  ${events.map(ev => `
                    <div class="update-modal-event">
                      <img src="${ev.img}" alt="zoomed">
                      <div class="event-info">${ev.info}</div>
                      ${ev.supp.length ? `<div class="event-supp">${ev.supp.map(s => `<img src="${s}" alt="supp">`).join('')}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
            document.body.appendChild(modal);
            // Prevent background scroll
            document.body.style.overflow = 'hidden';
            // Close logic
            modal.querySelector('.update-modal-close').onclick = () => { modal.remove(); document.body.style.overflow = ''; };
            modal.onclick = (e) => { if (e.target === modal) { modal.remove(); document.body.style.overflow = ''; } };
            // Prevent modal content click from closing
            modal.querySelector('.update-modal-content').onclick = (e) => { e.stopPropagation(); };
          };
          imgsDiv.appendChild(imgEl);
        });
        groupDiv.appendChild(tsDiv);
        groupDiv.appendChild(imgsDiv);
        gallery.appendChild(groupDiv);
      });
    });
  });
