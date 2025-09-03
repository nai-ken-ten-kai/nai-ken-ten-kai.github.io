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

fetch('spaces_timeline.json')
  .then(r => r.json())
  .then(data => {
    // Timeline data is already flattened into events
    let allPosts = [];
    
    // Group timeline events by space_id to reconstruct space structure for modal
    const spaceEvents = {};
    data.forEach(event => {
      const spaceId = event.space_id;
      if (!spaceEvents[spaceId]) {
        spaceEvents[spaceId] = {
          id: spaceId,
          originals: [],
          updates: []
        };
      }
      
      if (event.type === 'original') {
        spaceEvents[spaceId].originals.push(event);
      } else if (event.type === 'update') {
        spaceEvents[spaceId].updates.push(event);
      }
      
      // Add to allPosts for timeline display
      if (event.images && event.images.length > 0) {
        allPosts.push({
          id: spaceId,
          type: event.type,
          src: event.images[0].src,
          taken_at: event.taken_at,
          author: event.author || 'Unknown',
          text: event.text || (event.type === 'original' ? 'Original state' : ''),
          supplementary: event.images.slice(1) // Additional images beyond the first
        });
      }
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
            // Find the space events for this post
            const spaceId = post.id;
            const space = spaceEvents[spaceId];
            if (!space) return;
            
            // Build events: originals first, then updates in chronological order
            const events = [];
            
            // Add original events
            space.originals.forEach(orig => {
              if (orig.images && orig.images.length > 0) {
                const timestamp = orig.taken_at ? new Date(orig.taken_at).toLocaleString() : 'Unknown time';
                events.push({
                  type: 'original',
                  img: orig.images[0].src,
                  info: `<b>Space ${spaceId}</b><br><small>${timestamp}</small>`,
                  supp: orig.images.slice(1).map(im => im.src)
                });
              }
            });
            
            // Add update events, sorted by taken_at
            space.updates.sort((a, b) => (a.taken_at || '').localeCompare(b.taken_at || ''));
            space.updates.forEach(upd => {
              if (upd.images && upd.images.length > 0) {
                const timestamp = upd.taken_at ? new Date(upd.taken_at).toLocaleString() : 'Unknown time';
                const authorInfo = upd.author ? `<b>${upd.author}</b><br>` : '';
                const updateText = upd.text ? `${upd.text}<br>` : '';
                events.push({
                  type: 'update',
                  img: upd.images[0].src,
                  info: `${authorInfo}${updateText}<small>${timestamp}</small>`,
                  supp: upd.images.slice(1).map(im => im.src)
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
                      <img src="${ev.img}" alt="zoomed" loading="lazy">
                      <div class="event-info">${ev.info}</div>
                      ${ev.supp.length ? `<div class="event-supp">${ev.supp.map(s => `<img src="${s}" alt="supp" loading="lazy">`).join('')}</div>` : ''}
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
