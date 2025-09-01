document.getElementById('files').addEventListener('change', function(e){
  const preview = document.getElementById('preview');
  preview.innerHTML = '';
  for (const f of e.target.files){
    const p = document.createElement('div');
    p.textContent = f.name + ' (' + Math.round(f.size/1024) + ' KB)';
    preview.appendChild(p);
  }
});

document.getElementById('save').addEventListener('click', async function(){
  const form = document.getElementById('upload');
  const fd = new FormData(form);
  const files = document.getElementById('files').files;
  for (let i=0;i<files.length;i++) fd.append('files', files[i]);
  const res = await fetch('/save', {method:'POST', body: fd});
  const j = await res.json();
  if (j && j.preview && document.getElementById('dry_run').checked) {
    // show preview JSON nicely
    const w = window.open('', '_blank');
    w.document.write('<pre>' + JSON.stringify(j.preview, null, 2) + '</pre>');
  } else {
    alert(JSON.stringify(j));
  }
});

document.getElementById('mark_taken').addEventListener('click', async function(){
  // first perform preview
  const form = document.getElementById('mark-form');
  const fd = new FormData(form);
  const f = document.getElementById('taken_file').files[0];
  if (f) fd.append('taken_file', f);
  const res = await fetch('/mark_preview', {method: 'POST', body: fd});
  const j = await res.json();
  if (!j.ok) { alert(JSON.stringify(j)); return; }
  // show confirmation modal
  document.getElementById('confirm-old-img').src = j.old ? j.old.src : '';
  document.getElementById('confirm-new-img').src = j.new ? j.new.src : '';
  document.getElementById('confirm-meta').innerText = 'Note: ' + (j.note || '');
  const modal = document.getElementById('confirm-modal');
  modal.style.display = 'block';
  document.getElementById('confirm-cancel').onclick = () => { modal.style.display = 'none'; };
  document.getElementById('confirm-ok').onclick = async () => {
    modal.style.display = 'none';
    // now send real mark request
    const fd2 = new FormData(form);
    if (f) fd2.append('taken_file', f);
    const res2 = await fetch('/mark', {method: 'POST', body: fd2});
    const j2 = await res2.json();
    alert(JSON.stringify(j2));
  };
});

document.getElementById('revert_last').addEventListener('click', async function(){
  const form = document.getElementById('revert-form');
  const fd = new FormData(form);
  const res = await fetch('/revert', {method: 'POST', body: fd});
  const j = await res.json();
  alert(JSON.stringify(j));
});
