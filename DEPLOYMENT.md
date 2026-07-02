# Deployment Guide - Hash Generator

This guide covers deploying Hash Generator to various platforms.

## Pre-Deployment Checklist

- [ ] Review `README.md` for any configuration needed
- [ ] Update canonical URL in `index.html` (line ~15)
- [ ] Update sitemap.xml with your domain (line ~6)
- [ ] Configure Google Analytics (optional)
- [ ] Configure AdSense (optional)
- [ ] Test locally: `python -m http.server 8000`
- [ ] Verify all features work in target browsers
- [ ] Run Lighthouse audit

## Vercel (Recommended) ⭐

**Why Vercel?** Zero-config deployment, global CDN, auto-SSL, analytics.

### Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd hash-generator
vercel

# Set production domain
vercel alias hash-generator-pro.vercel.app hash-generator.pro
```

### Configure Custom Domain

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select project → Settings → Domains
3. Add custom domain: `hash-generator.pro`
4. Update DNS records at your registrar

### Environment & Caching

Already configured in `vercel.json`:
- Assets cached for 1 year (immutable)
- HTML cached for 1 hour
- Security headers enabled

## Netlify

### Option 1: Via UI
1. Connect GitHub repo to [netlify.com](https://netlify.com)
2. Build settings: Leave empty (static site)
3. Publish directory: `.`
4. Deploy!

### Option 2: Via CLI
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.
```

### netlify.toml (Optional)
```toml
[build]
  command = "echo 'Static site'"
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/"
  [headers.values]
    Cache-Control = "public, max-age=3600"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
```

## GitHub Pages

### Deploy via Git Subtree
```bash
# Add remote
git remote add github https://github.com/yourusername/hash-generator.git

# Deploy to gh-pages
git subtree push --prefix . github gh-pages
```

### GitHub Pages Settings
1. Go to repo → Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `/(root)`
4. Custom domain: Add CNAME file or via DNS

### CNAME File (Optional)
```
hash-generator.pro
```

## AWS S3 + CloudFront

```bash
# Create S3 bucket
aws s3 mb s3://hash-generator-pro

# Upload files
aws s3 sync . s3://hash-generator-pro \
  --exclude ".git/*" \
  --exclude ".gitignore"

# Enable static website hosting
aws s3api put-bucket-website \
  --bucket hash-generator-pro \
  --website-configuration file://website-config.json
```

**website-config.json:**
```json
{
  "IndexDocument": {
    "Suffix": "index.html"
  },
  "ErrorDocument": {
    "Key": "index.html"
  }
}
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript;
    
    # Cache static assets
    location /assets/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML: No cache
    location = /index.html {
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }
    
    # Fallback to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

### Build & Run
```bash
docker build -t hash-generator .
docker run -p 80:80 hash-generator
```

### Push to Registry
```bash
docker tag hash-generator gcr.io/your-project/hash-generator:latest
docker push gcr.io/your-project/hash-generator:latest
```

## Self-Hosted (VPS/Dedicated)

### Using Apache
```apache
<Directory /var/www/hash-generator>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
    
    # Fallback
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.html [QSA,L]
    </IfModule>
    
    # Gzip
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
    </IfModule>
    
    # Cache
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/html A3600
        ExpiresByType text/css A31536000
        ExpiresByType application/javascript A31536000
        ExpiresByType image/* A31536000
    </IfModule>
</Directory>
```

### Using Nginx
```nginx
server {
    listen 80;
    server_name hash-generator.pro;
    
    # SSL redirect (recommended)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hash-generator.pro;
    
    ssl_certificate /etc/letsencrypt/live/hash-generator.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hash-generator.pro/privkey.pem;
    
    root /var/www/hash-generator;
    index index.html;
    
    # ... (see Docker nginx.conf above for rules)
}
```

## Performance Optimization

### Minification (Optional)
```bash
# Install build tools
npm install -g terser cleancss

# Minify CSS
cleancss assets/css/styles.css -o assets/css/styles.min.css

# Minify JS
terser assets/js/app.js -o assets/js/app.min.js -c -m

# Update index.html to use .min files
```

### Image Optimization
Already optimized: Only uses emoji and SVG (no external images).

### Code Splitting (Future)
For larger projects, consider lazy-loading heavy libraries.

## Domain Setup

### DNS Configuration
```
Type    Name    Value
-----   ----    -----
A       @       1.2.3.4  (your server IP)
CNAME   www     hash-generator.pro
TXT     @       v=spf1 include:_spf.google.com ~all  (if using email)
```

### SSL Certificate (Let's Encrypt)
```bash
# Via Certbot (Nginx/Apache)
certbot certonly --standalone -d hash-generator.pro

# Via Vercel/Netlify: Automatic ✓
```

## Monitoring & Analytics

### Google Analytics
```html
<!-- Add to <head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Error Tracking (Sentry)
```html
<!-- Add to <head> -->
<script src="https://cdn.ravenjs.com/3.26.4/raven.min.js"></script>
<script>
  Raven.config('YOUR_SENTRY_URL').install();
</script>
```

## Rollback

### Git-Based
```bash
git revert HEAD  # Last commit
git push origin main
```

### Vercel
Dashboard → Deployments → Select previous → Promote to Production

### Manual Backup
```bash
# Keep daily backups
tar -czf backup-$(date +%Y-%m-%d).tar.gz .
```

## Security Checklist

- [ ] HTTPS/SSL enabled
- [ ] Security headers configured
- [ ] Robots.txt in place
- [ ] No sensitive data in code/git history
- [ ] Content Security Policy (CSP) headers (optional)
- [ ] CORS properly configured (if needed)
- [ ] DDoS protection enabled (Cloudflare, etc.)

### CSP Header (Recommended)
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://cdnjs.cloudflare.com; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:
```

## Troubleshooting

### 404 on Refresh
**Solution:** Configure fallback to index.html (see deployment configs above)

### Styles Not Loading
**Solution:** Check CSS file path, verify case sensitivity

### Hash Generation Not Working
**Solution:** Check console for CryptoJS CDN errors

### Slow Performance
1. Enable gzip compression
2. Use CDN (Cloudflare, CloudFront)
3. Set proper cache headers
4. Minify CSS/JS

### Custom Domain Not Working
1. Wait 24-48 hours for DNS propagation
2. Verify DNS records at registrar
3. Check nameserver configuration

---

**Need help?** Check platform-specific docs or create an issue on GitHub.
