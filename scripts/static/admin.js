// Utility functions
function showStatus(message, type = 'success') {
  const statusDiv = document.getElementById('status-message');
  statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
  setTimeout(() => statusDiv.innerHTML = '', 5000);
}

function clearMarkForm() {
  document.getElementById('space_ids').value = '';
  document.getElementById('taken_by').value = '';
  document.getElementById('taken_note').value = '';
  document.getElementById('instruction_text').value = '';
  document.getElementById('instruction-files').value = '';
  document.getElementById('instruction-preview').innerHTML = '';
}

function clearPublishForm() {
  document.getElementById('publish_space_id').value = '';
  document.getElementById('publish_author').value = '';
  document.getElementById('update_text').value = '';
  document.getElementById('update-files').value = '';
  document.getElementById('update-preview').innerHTML = '';
}

// File upload preview functions
function setupFileUpload(uploadAreaId, fileInputId, previewId) {
  const uploadArea = document.getElementById(uploadAreaId);
  const fileInput = document.getElementById(fileInputId);
  const preview = document.getElementById(previewId);

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    fileInput.files = files;
    updatePreview(files, preview);
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    updatePreview(e.target.files, preview);
  });
}

function updatePreview(files, previewDiv) {
  previewDiv.innerHTML = '';
  for (const file of files) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    previewDiv.appendChild(img);
  }
}

// Mark multiple spaces
document.getElementById('mark-spaces').addEventListener('click', async function(){
  const spaceIds = document.getElementById('space_ids').value.trim();
  const takenBy = document.getElementById('taken_by').value.trim();
  const note = document.getElementById('taken_note').value.trim();
  // Instructions are from the participant/artist
  const instructionText = document.getElementById('instruction_text').value.trim();
  const instructionFiles = document.getElementById('instruction-files').files;

  if (!spaceIds || !takenBy) {
    showStatus('Please fill in Space IDs and Taken By fields', 'error');
    return;
  }

  const fd = new FormData();
  fd.append('space_ids', spaceIds);
  fd.append('taken_by', takenBy);
  if (note) fd.append('taken_note', note);
  if (instructionText) fd.append('instruction_text', instructionText);

  // Add instruction files
  for (let i = 0; i < instructionFiles.length; i++) {
    fd.append('instruction_files', instructionFiles[i]);
  }

  try {
    const res = await fetch('/mark_multiple', {method: 'POST', body: fd});
    const j = await res.json();
    if (j.ok) {
      const markedCount = j.marked.length;
      const errorCount = j.errors.length;
      let message = `Success! Marked ${markedCount} space(s) as taken by ${takenBy}`;
      if (j.instruction_images > 0) {
        message += ` with ${j.instruction_images} instruction image(s)`;
      }
      if (errorCount > 0) {
        message += `. Errors: ${j.errors.join(', ')}`;
      }
      showStatus(message);
      clearMarkForm();
    } else {
      showStatus('Error: ' + (j.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    showStatus('Network error: ' + error.message, 'error');
  }
});

// Publish update
document.getElementById('publish-update').addEventListener('click', async function(){
  const spaceId = document.getElementById('publish_space_id').value.trim();
  const author = document.getElementById('publish_author').value.trim();
  const updateText = document.getElementById('update_text').value.trim();
  const updateFiles = document.getElementById('update-files').files;

  if (!spaceId || !author) {
    showStatus('Please fill in Space ID and Author fields', 'error');
    return;
  }

  if (updateFiles.length === 0) {
    showStatus('Please select at least one image file', 'error');
    return;
  }

  const fd = new FormData();
  fd.append('space_id', spaceId);
  fd.append('author', author);
  if (updateText) fd.append('update_text', updateText);

  // Add update files
  for (let i = 0; i < updateFiles.length; i++) {
    fd.append('update_files', updateFiles[i]);
  }

  try {
    const res = await fetch('/publish_update', {method: 'POST', body: fd});
    const j = await res.json();
    if (j.ok) {
      showStatus(`Success! Published ${j.images} image(s) for space ${spaceId}`);
      clearPublishForm();
    } else {
      showStatus('Error: ' + (j.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    showStatus('Network error: ' + error.message, 'error');
  }
});

// Setup file upload areas
setupFileUpload('instruction-uploader', 'instruction-files', 'instruction-preview');
setupFileUpload('update-uploader', 'update-files', 'update-preview');

// Legacy functionality (keeping for compatibility)
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

document.getElementById('revert_last').addEventListener('click', async function(){
  const form = document.getElementById('revert-form');
  const fd = new FormData(form);
  const res = await fetch('/revert', {method: 'POST', body: fd});
  const j = await res.json();
  alert(JSON.stringify(j));
});
