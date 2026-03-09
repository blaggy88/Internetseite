# 🚀 Nginx Deployment Guide - EDEKA Niemerszein Website

## 📋 Voraussetzungen

### 1. Nginx Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install epel-release -y
sudo yum install nginx -y

# Status prüfen
sudo systemctl status nginx
```

### 2. Verzeichnisstruktur erstellen
```bash
# Website-Verzeichnis
sudo mkdir -p /var/www/edeka-niemerszein
sudo chown -R $USER:$USER /var/www/edeka-niemerszein
sudo chmod -R 755 /var/www/edeka-niemerszein
```

## 📁 Dateien kopieren

### Option A: Direkt von GitHub
```bash
cd /var/www/edeka-niemerszein

# Repository klonen
git clone https://github.com/blaggy88/Internetseite.git .

# ODER Dateien manuell kopieren:
# 1. index_nginx_ready.html → index.html
# 2. styles.css
# 3. app.js
# 4. app_ai.js
# 5. package.json (optional für Build)
```

### Option B: Manuelle Kopie
```bash
# Hauptdateien
cp index_nginx_ready.html index.html
cp styles.css .
cp app.js .
cp app_ai.js .

# Optional: Build Tools
cp package.json .
npm install  # Wenn Build benötigt
```

## ⚙️ Nginx Konfiguration

### 1. Hauptkonfiguration erstellen
```bash
sudo nano /etc/nginx/sites-available/edeka-niemerszein
```

### 2. Nginx Config einfügen:
```nginx
server {
    listen 80;
    listen [::]:80;
    
    server_name edeka-niemerszein.de www.edeka-niemerszein.de;
    root /var/www/edeka-niemerszein;
    index index.html;
    
    # GZIP Kompression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Caching für statische Dateien
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML Dateien
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    # Hauptseite
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy (für zukünftige Backend-Integration)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Error Pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 3. Konfiguration aktivieren
```bash
# Link erstellen
sudo ln -s /etc/nginx/sites-available/edeka-niemerszein /etc/nginx/sites-enabled/

# Test Konfiguration
sudo nginx -t

# Nginx neustarten
sudo systemctl restart nginx
```

## 🔒 SSL/TLS (HTTPS) - OPTIONAL

### Let's Encrypt mit Certbot
```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx -y

# SSL Zertifikat erstellen
sudo certbot --nginx -d edeka-niemerszein.de -d www.edeka-niemerszein.de

# Auto-Renew testen
sudo certbot renew --dry-run
```

## 🛠️ Build & Optimierung (OPTIONAL)

### 1. Node.js Installation
```bash
# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Version prüfen
node --version
npm --version
```

### 2. Build durchführen
```bash
cd /var/www/edeka-niemerszein

# Abhängigkeiten installieren
npm install

# Build ausführen (wenn Build-Skript in package.json)
npm run build

# ODER manuell optimieren
npm run minify-css
npm run minify-js
```

## 📱 PWA Konfiguration

### 1. Manifest Datei erstellen
```json
{
  "name": "EDEKA Niemerszein",
  "short_name": "EDEKA",
  "description": "Ihr regionaler Supermarkt",
  "theme_color": "#005A9C",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker registrieren
```javascript
// In app.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registriert:', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker Registrierung fehlgeschlagen:', error);
      });
  });
}
```

## 🚀 Deployment Script

### Automatisches Deployment Script
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starte Deployment..."

# 1. Repository aktualisieren
cd /var/www/edeka-niemerszein
git pull origin main

# 2. Build durchführen (wenn benötigt)
if [ -f "package.json" ]; then
    npm install
    npm run build
fi

# 3. Dateien kopieren
cp index_nginx_ready.html index.html

# 4. Berechtigungen setzen
sudo chown -R www-data:www-data /var/www/edeka-niemerszein
sudo chmod -R 755 /var/www/edeka-niemerszein

# 5. Nginx neustarten
sudo systemctl restart nginx

echo "✅ Deployment abgeschlossen!"
```

## 📊 Monitoring & Wartung

### 1. Nginx Logs
```bash
# Access Logs
sudo tail -f /var/log/nginx/access.log

# Error Logs
sudo tail -f /var/log/nginx/error.log
```

### 2. Performance Monitoring
```bash
# Nginx Status
sudo systemctl status nginx

# Memory Usage
free -h

# Disk Usage
df -h
```

### 3. Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/edeka-website"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup erstellen
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" /var/www/edeka-niemerszein

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup erstellt: $BACKUP_DIR/backup_$DATE.tar.gz"
```

## 🐛 Troubleshooting

### 1. Nginx startet nicht
```bash
# Konfiguration testen
sudo nginx -t

# Fehler im Log
sudo tail -f /var/log/nginx/error.log

# Port Konflikte
sudo netstat -tulpn | grep :80
```

### 2. Website nicht erreichbar
```bash
# Firewall prüfen
sudo ufw status

# Nginx Status
sudo systemctl status nginx

# DNS prüfen
nslookup edeka-niemerszein.de
```

### 3. Performance Probleme
```bash
# Nginx Worker Prozesse
ps aux | grep nginx

# Memory Usage
top -b -n 1 | grep nginx

# Connection Count
netstat -an | grep :80 | wc -l
```

## 🔧 Schnellstart für deinen Server

### Einzeiler für schnelles Deployment:
```bash
# Auf deinem Server ausführen:
cd /tmp && git clone https://github.com/blaggy88/Internetseite.git && \
sudo mkdir -p /var/www/edeka-niemerszein && \
sudo cp -r Internetseite/* /var/www/edeka-niemerszein/ && \
cd /var/www/edeka-niemerszein && \
cp index_nginx_ready.html index.html && \
sudo chown -R www-data:www-data /var/www/edeka-niemerszein && \
sudo chmod -R 755 /var/www/edeka-niemerszein && \
echo "✅ Website ist bereit unter: http://$(hostname -I | awk '{print $1}')"
```

## 📞 Support

Bei Problemen:
1. **Logs prüfen**: `sudo tail -f /var/log/nginx/error.log`
2. **Konfiguration testen**: `sudo nginx -t`
3. **Nginx neustarten**: `sudo systemctl restart nginx`
4. **Firewall prüfen**: `sudo ufw status`

## 🎉 Fertig!

Deine EDEKA Niemerszein Website ist jetzt:
- ✅ **Nginx optimiert**
- ✅ **Mobile-first responsive**
- ✅ **KI-Assistent integriert**
- ✅ **PWA ready**
- ✅ **Performance optimiert**
- ✅ **Sicherheitsheaders konfiguriert**

**Zugriff:** http://deine-server-ip

**KI-Assistent testen:** Klicke auf den Roboter-Button unten rechts! 🤖