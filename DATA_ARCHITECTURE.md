# Data Architecture for Nai-Ken-Ten-Kai

## File Structure & Responsibilities

### 📊 **Data Files:**

1. **`spaces_new.json`** - *Administrative backup/full data*
   - Contains complete space data with all fields
   - Used by admin system for reading/writing
   - Includes full update history, artist info, instruction images
   - Backup and source of truth for all operations

2. **`spaces_optimized.json`** - *Frontend-optimized data*
   - Minimal data needed for main gallery display
   - Auto-generated from `spaces_new.json`
   - Contains: id, description, status, artist info, original_image, final_image
   - Used by main spaces gallery (`spaces.js`)

3. **`spaces_timeline.json`** - *Timeline events*
   - Chronologically sorted events for timeline gallery
   - Auto-generated from `spaces_new.json`
   - Contains: original photos + update events with timestamps
   - Used by timeline gallery (`timeline-gallery.js` in `ten.html`)

### 🔄 **Data Flow:**

```
Admin System (scripts/admin.py)
    ↓ writes to
spaces_new.json (backup/full data)
    ↓ auto-generates
├── spaces_optimized.json → Main Gallery (index.html, ken.html)
└── spaces_timeline.json → Timeline Gallery (ten.html)
```

### 🎯 **Frontend Data Sources:**

- **Main Gallery**: `spaces_optimized.json`
- **Timeline Gallery**: `spaces_timeline.json`
- **Admin Operations**: `spaces_new.json`

### ⚙️ **Auto-Update Process:**

When admin system makes changes:
1. Backs up `spaces_new.json`
2. Writes new data to `spaces_new.json`
3. Auto-generates `spaces_optimized.json` (via `export_optimized.py`)
4. Auto-generates `spaces_timeline.json` (via `export_timeline.py`)

### 📅 **Timeline Events:**

Timeline includes:
1. **Original photos** - When spaces are first documented
2. **Update events** - When artists follow instructions and submit final work

Each event includes:
- space_id, type (original/update)
- images with taken_at timestamps
- author, text, action

### 🎨 **Space Lifecycle:**

1. **Available** → Space is documented with original photo
2. **Taken** → Artist marks space, adds instructions/images
3. **Published** → Artist submits final work, appears in timeline

### 🛠 **Scripts:**

- `scripts/admin.py` - Web admin interface
- `scripts/export_optimized.py` - Generate optimized frontend data
- `scripts/export_timeline.py` - Generate timeline events
- `scripts/sync_spaces_new_to_spaces.py` - Legacy sync (optional)

This architecture ensures:
- ✅ Fast frontend loading (optimized data)
- ✅ Complete admin functionality (full data)
- ✅ Real-time timeline updates
- ✅ Automatic data consistency
