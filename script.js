let images = [];
let current = 0;
let timer = null;

fetch('database.json')
  .then(res => res.json())
  .then(data => {
    images = data.flatMap(cell => cell.images);
    render();
    startLoop();
  });

function render() {
  document.getElementById('app').innerHTML = `
    <div class="viewer">
      <div class="titles">
  <h1 class="main-title">内<span class="overlap-wrap">見<span class="overlap">展</span></span><span class="indent">会</span></h1>
      <h2 class="subtitle">An occasion of inner <span class="overlap-wrap"><span class="overlap-en">viewing</span>displaying</span></h2>
      </div>
      <div class="main-img" id="main-img-container">
        <img id="main-img" src="${images[current]}" alt="Image" />
      </div>
    </div>
    <div class="thumbs" id="thumbs">
            ${images.map((img, i) => `<img src="${img}" class="thumb${i===current?' active':''}" data-idx="${i}">`).join('')}
    </div>
  `;
  document.getElementById('main-img-container').onclick = e => {
    const x = e.offsetX;
    const w = e.target.clientWidth;
    if (x < w/2) prevImg(); else nextImg();
  };
  document.querySelectorAll('.thumb').forEach(el => {
    el.onclick = e => {
      current = parseInt(el.dataset.idx);
      update();
      resetLoop();
    };
  });
  document.getElementById('main-img').onmouseenter = stopLoop;
  document.getElementById('main-img').onmouseleave = startLoop;
}

function update() {
  document.getElementById('main-img').src = images[current];
  document.querySelectorAll('.thumb').forEach((el, i) => {
    el.classList.toggle('active', i === current);
    if (i === current) {
      const thumbs = document.getElementById('thumbs');
      const rect = el.getBoundingClientRect();
      const parentRect = thumbs.getBoundingClientRect();
      const scrollLeft = thumbs.scrollLeft;
      const offset = rect.left - parentRect.left - (parentRect.width/2) + (rect.width/2);
      thumbs.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  });
}

function nextImg() {
  current = (current + 1) % images.length;
  update();
}
function prevImg() {
  current = (current - 1 + images.length) % images.length;
  update();
}
function startLoop() {
  if (timer) return;
  timer = setInterval(() => {
    nextImg();
  }, 3000);
}
function stopLoop() {
  clearInterval(timer);
  timer = null;
}
function resetLoop() {
  stopLoop();
  startLoop();
}
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { prevImg(); resetLoop(); }
  if (e.key === 'ArrowRight') { nextImg(); resetLoop(); }
});
