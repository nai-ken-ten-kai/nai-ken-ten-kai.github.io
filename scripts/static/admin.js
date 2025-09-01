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

document.getElementById('quick_mark_taken').addEventListener('click', async function(){
  const spaceId = document.getElementById('quick_mark_id').value;
  const takenBy = document.getElementById('quick_taken_by').value;
  const note = document.getElementById('quick_taken_note').value;
  
  if (!spaceId || !takenBy) {
    alert('Please fill in Space ID and Taken By fields');
    return;
  }
  
  const fd = new FormData();
  fd.append('mark_id', spaceId);
  fd.append('taken_by', takenBy);
  if (note) fd.append('taken_note', note);
  
  try {
    const res = await fetch('/mark', {method: 'POST', body: fd});
    const j = await res.json();
    if (j.ok) {
      alert(`Success! Space ${spaceId} marked as taken by ${takenBy}`);
      // Clear the form
      document.getElementById('quick_mark_id').value = '';
      document.getElementById('quick_taken_by').value = '';
      document.getElementById('quick_taken_note').value = '';
    } else {
      alert('Error: ' + (j.error || 'Unknown error'));
    }
  } catch (error) {
    alert('Network error: ' + error.message);
  }
});

document.getElementById('revert_last').addEventListener('click', async function(){
  const form = document.getElementById('revert-form');
  const fd = new FormData(form);
  const res = await fetch('/revert', {method: 'POST', body: fd});
  const j = await res.json();
  alert(JSON.stringify(j));
});
