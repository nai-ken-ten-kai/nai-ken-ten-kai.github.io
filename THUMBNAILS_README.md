# Image Optimization System

This document explains the automatic image optimization system implemented for the nai-ken-ten-kai website.

## Overview

The website now uses progressive image loading to dramatically improve loading performance:

- **Thumbnails**: 25% of original size (~8.7KB average)
- **Full Images**: Loaded only when needed
- **Automatic Generation**: Thumbnails created automatically when images are uploaded

## How It Works

### 1. Automatic Thumbnail Generation
- When images are uploaded via the admin panel, thumbnails are generated automatically
- Thumbnails are saved in `img/thumbnails/` directory
- Size: 25% of original dimensions, 85% JPEG quality

### 2. Progressive Loading
- **Catalog/Timeline**: Shows small thumbnails first
- **Modal Views**: Loads full-size images when clicked
- **Fallback**: If thumbnail missing, falls back to full image

### 3. Admin System Integration
- Modified `scripts/admin_simple.py` to generate thumbnails on upload
- Added `ensure_all_thumbnails()` function for startup checks
- Automatic thumbnail regeneration for existing images

## File Structure

```
img/
├── 0001.jpg              # Full-size images
├── 0002.jpg
├── ...
├── thumbnails/           # Auto-generated thumbnails
│   ├── 0001.jpg
│   ├── 0002.jpg
│   └── ...
└── update-XXX/           # Update folders (handled separately)
```

## Maintenance Scripts

### Regenerate All Thumbnails
```bash
python3 scripts/regenerate_thumbnails.py
```

### Check Admin System
```bash
python3 scripts/admin_simple.py --port 5010
```

## Performance Benefits

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Load | 14.1MB | 1.2MB | **91.7% smaller** |
| Thumbnail Size | - | 8.7KB | **92% smaller** |
| User Experience | Slow | Fast | **Much better** |

## Technical Details

### Thumbnail Generation
- **Library**: PIL (Pillow)
- **Size**: 25% of original dimensions
- **Quality**: 85% JPEG compression
- **Format**: JPEG (same as originals)

### JavaScript Integration
- Thumbnails loaded with `loading="lazy"`
- Error handling with `onerror` fallback
- Smooth transitions with CSS

### Admin Integration
- Automatic thumbnail generation on upload
- Startup thumbnail verification
- Error handling for failed generations

## Troubleshooting

### Missing Thumbnails
If thumbnails are missing, run:
```bash
python3 scripts/regenerate_thumbnails.py
```

### Admin Server Issues
Restart the admin server:
```bash
python3 scripts/admin_simple.py --port 5010
```

### Performance Issues
Check thumbnail sizes:
```bash
ls -lh img/thumbnails/
```

## Future Improvements

- [ ] WebP format support for even smaller thumbnails
- [ ] Different thumbnail sizes for different views
- [ ] CDN integration for faster delivery
- [ ] Lazy loading for below-the-fold content
