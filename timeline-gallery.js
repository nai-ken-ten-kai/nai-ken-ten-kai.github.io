// Timeline gallery: group images by 30-minute intervals, show timestamp on left, images in row
// Assumes spaces.json: [{ id, images: [{src, taken_at}], ... }]

function parseTime(ts) {
  // Returns a Date object or null
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d) ? null : d;
}

function formatTimeGroup(date) {
  // Returns e.g. '14:00\n14:30' for desktop (with line break)
  if (!date) return 'Unknown';
  const start = new Date(date);
  start.setMinutes(Math.floor(start.getMinutes() / 30) * 30, 0, 0);
  const end = new Date(start.getTime() + 30 * 60000);
  const startTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
  const endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  return `${startTime}\n${endTime}`;
}

fetch('spaces_new.json')
  .then(r => r.json())
  .then(data => {
    // Flatten all images with their space id
    let allImages = [];
    data.forEach(space => {
      (space.images || []).forEach(imgObj => {
        if (imgObj && imgObj.src) {
          allImages.push({
            id: space.id,
            src: imgObj.src,
            taken_at: imgObj.taken_at
          });
        }
      });
    });
    // Group by 30-min interval
    const groups = {};
    allImages.forEach(img => {
      const d = parseTime(img.taken_at);
      if (d) {
        const dateStr = d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
        const timeStr = formatTimeGroup(d);
        const key = dateStr + ' ' + timeStr.replace('\n', ' ');
        const displayKey = dateStr + '\n' + timeStr;
        if (!groups[key]) groups[key] = { images: [], display: displayKey };
        groups[key].images.push(img);
      } else {
        const key = 'Unknown';
        if (!groups[key]) groups[key] = { images: [], display: 'Unknown' };
        groups[key].images.push(img);
      }
    });
    // Sort groups by time
    const sortedKeys = Object.keys(groups).sort((a,b) => a.localeCompare(b));
    // Render
    const gallery = document.getElementById('timeline-gallery');
    sortedKeys.forEach(key => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'timeline-group';
      const tsDiv = document.createElement('div');
      tsDiv.className = 'timeline-timestamp';
      tsDiv.textContent = groups[key].display;
      const imgsDiv = document.createElement('div');
      imgsDiv.className = 'timeline-images';
      groups[key].images.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.className = 'timeline-img';
        imgEl.src = img.src;
        imgEl.alt = img.id;
        imgsDiv.appendChild(imgEl);
      });
      groupDiv.appendChild(tsDiv);
      groupDiv.appendChild(imgsDiv);
      gallery.appendChild(groupDiv);
    });
  });
