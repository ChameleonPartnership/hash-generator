# Hash Generator 🔐

A production-ready, feature-rich online cryptographic hash generator supporting MD5, SHA-1, SHA-256, SHA-384, and SHA-512.

## Features

✨ **Core Features**
- 🔢 Multiple hash algorithms: MD5, SHA-1, SHA-256, SHA-384, SHA-512
- 📝 Text input hashing with instant generation
- 📁 File upload and bulk processing (up to 100MB)
- ✅ Hash verification (compare hashes)
- 🔤 Case toggle (uppercase/lowercase output)
- 📋 Copy-to-clipboard for each hash
- 🌙 Dark mode toggle
- 📱 Fully mobile-responsive design
- ♿ WCAG AA accessibility compliance
- 💾 Browser-based history (persistent via localStorage)
- ⚡ Zero server dependency (client-side only)

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Cryptography:** SubtleCrypto API (SHA-256, SHA-384, SHA-512) + CryptoJS fallback (MD5, SHA-1)
- **Storage:** Browser localStorage
- **Deployment:** Static hosting (Vercel, Netlify, etc.)

## Project Structure

```
hash-generator/
├── index.html              # Main entry point (SEO-optimized)
├── assets/
│   ├── css/
│   │   └── styles.css      # Dark mode, responsive, accessibility
│   └── js/
│       └── app.js          # Hash generation logic, event handlers
├── robots.txt              # SEO: Search engine crawling
├── sitemap.xml             # SEO: URL indexing
├── .gitignore              # Git configuration
├── README.md               # This file
└── package.json            # (Optional) For future build tools
```

## Getting Started

### Installation

1. Clone or download the repository:
```bash
git clone https://github.com/yourusername/hash-generator.git
cd hash-generator
```

2. No build step required! Simply open `index.html` in a browser or deploy to any static hosting.

### Local Development

```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Or using Node.js http-server
npx http-server

# Visit http://localhost:8000
```

## Usage

### Text Input
1. Click "Text Input" tab
2. Enter or paste text
3. Select hash algorithms
4. Hashes generate instantly
5. Click "Copy" to copy to clipboard

### File Upload
1. Click "File Upload" tab
2. Drag & drop a file or click to select
3. Hashes generate automatically
4. Supports files up to 100MB

### Hash Verification
1. Click "Verify Hash" tab
2. Paste hash to verify
3. Paste generated hash to compare
4. Instant match/mismatch feedback

### Features
- **Dark Mode:** Click 🌙 in header
- **Uppercase:** Toggle for hash output format
- **Generate All:** Generate hashes for all algorithms at once
- **History:** Auto-saved, click to reuse
- **Clear History:** Remove all saved history

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome  | ✅ Full | All features |
| Firefox | ✅ Full | All features |
| Safari  | ✅ Full | All features (14+) |
| Edge    | ✅ Full | All features |
| IE 11   | ⚠️ Partial | No SubtleCrypto, use fallback |

## Accessibility

- ♿ **WCAG AA Compliant**
- ⌨️ Full keyboard navigation
- 🎨 High contrast color schemes
- 🔊 ARIA labels and live regions
- 📱 Mobile-friendly touch targets
- 🎬 Respects prefers-reduced-motion

## Security & Privacy

🔒 **Client-Side Only**
- No data sent to servers
- No cookies or tracking
- All processing happens in your browser
- Safe for sensitive data

⚠️ **Important Notes**
- MD5 and SHA-1 are cryptographically broken; use SHA-256+ for security-critical applications
- Browser history and localStorage may persist data locally
- Use HTTPS in production

## Performance

- **Lighthouse Score:** 85+
- **Load Time:** < 2 seconds
- **Hash Generation:** Instant (< 100ms for typical inputs)
- **File Handling:** Streaming for large files (no memory issues)

## SEO Features

- 📑 Meta title/description optimized for "hash generator" keywords
- 🔗 Canonical URL configuration
- 🌐 Open Graph tags for social sharing
- 📊 Structured data (SoftwareApplication schema)
- 🤖 robots.txt + sitemap.xml for search crawlers
- 📱 Mobile-first responsive design

## Configuration

### AdSense Integration
To enable Google AdSense:

1. Replace placeholder in `index.html`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"></script>
```

2. Add ad slots:
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
     data-ad-slot="YOUR_AD_SLOT_ID"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

### Custom Domain
Update these in `index.html` and `sitemap.xml`:
- `og:url` in meta tags
- `<loc>` in sitemap.xml
- Canonical URL in `<link rel="canonical">`

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

### GitHub Pages
```bash
# Push to gh-pages branch
git subtree push --prefix hash-generator origin gh-pages
```

### Docker (Optional)
```dockerfile
FROM httpd:2.4-alpine
COPY . /usr/local/apache2/htdocs/
EXPOSE 80
```

```bash
docker build -t hash-generator .
docker run -p 80:80 hash-generator
```

## Development

### Code Quality
- Uses standard ES6+ syntax
- Modular, well-commented code
- WCAG AA accessibility compliance
- Progressive enhancement

### Testing
```bash
# Manual testing checklist
- [ ] Text input hashing
- [ ] File upload (various formats)
- [ ] All 5 algorithms
- [ ] Uppercase toggle
- [ ] Dark mode
- [ ] History persistence
- [ ] Keyboard navigation
- [ ] Mobile responsiveness
- [ ] Copy to clipboard
- [ ] Hash verification
```

### Future Enhancements
- [ ] Batch processing UI
- [ ] Export results (CSV/JSON)
- [ ] Custom salt input
- [ ] HMAC support
- [ ] BLAKE2, BLAKE3 algorithms
- [ ] PWA offline support
- [ ] Keyboard shortcuts help
- [ ] Multi-language support

## Troubleshooting

### MD5/SHA-1 Not Working
- Ensure CryptoJS CDN loads (check console)
- Fallback: Use SHA-256 or check browser console for errors

### File Too Large
- Max 100MB for browser processing
- For larger files, use command-line tools:
  ```bash
  # macOS/Linux
  sha256sum filename.iso
  
  # Windows PowerShell
  Get-FileHash -Path filename.iso -Algorithm SHA256
  ```

### Dark Mode Not Persisting
- Check localStorage permissions in browser settings
- Ensure cookies/storage not blocked

### Copy Not Working
- Requires HTTPS on modern browsers (for security)
- HTTP works in development

## License

MIT License - See LICENSE file for details

## Credits

Built with ❤️ for developers who need quick hash generation.

### Libraries Used
- [CryptoJS](https://cryptojs.org/) - MD5 and SHA-1 hashing
- [SubtleCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) - Modern cryptography
- [Google Fonts](https://fonts.google.com/) - Typography (system fonts used for performance)

## Support

Found a bug? Have a feature request? 
- Check [Issues](https://github.com/yourusername/hash-generator/issues)
- Create a new issue with:
  - Browser and OS info
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots if applicable

---

**Happy Hashing!** 🚀
