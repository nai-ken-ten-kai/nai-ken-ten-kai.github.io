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
            // Show modal with details
            const modal = document.createElement('div');
            modal.className = 'update-modal';
            modal.innerHTML = `
              <div class="update-modal-content">
                <span class="update-modal-close">&times;</span>
                <h3>${post.type === 'original' ? 'Original' : 'Update'} by ${post.author}</h3>
                <p>${post.text}</p>
                <div class="update-images">
                  ${post.supplementary.map(im => `<img src="${im.src}" alt="supp" class="update-thumb">`).join('')}
                </div>
              </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('.update-modal-close').onclick = () => modal.remove();
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
          };
          imgsDiv.appendChild(imgEl);
        });
        groupDiv.appendChild(tsDiv);
        groupDiv.appendChild(imgsDiv);
        gallery.appendChild(groupDiv);
      });
    });
  });
