#!/bin/bash

# EDEKA Niemerszein Website Installation Script
# Einfache Installation auf deinem Nginx Server

set -e  # Bei Fehler abbrechen

echo "🚀 Starte Installation der EDEKA Niemerszein Website..."
echo "======================================================"

# Farben für Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktionen
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Prüfe ob Nginx installiert ist
print_info "Prüfe Nginx Installation..."
if ! command -v nginx &> /dev/null; then
    print_error "Nginx ist nicht installiert!"
    echo "Installiere Nginx..."
    
    # OS Detection
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        sudo apt update
        sudo apt install nginx -y
    elif [ -f /etc/redhat-release ]; then
        # RHEL/CentOS
        sudo yum install epel-release -y
        sudo yum install nginx -y
    else
        print_error "Unsupported OS. Bitte installiere Nginx manuell."
        exit 1
    fi
fi
print_success "Nginx ist installiert"

# 2. Website-Verzeichnis erstellen
print_info "Erstelle Website-Verzeichnis..."
WEBSITE_DIR="/var/www/edeka-niemerszein"
sudo mkdir -p $WEBSITE_DIR
sudo chown -R $USER:$USER $WEBSITE_DIR
sudo chmod -R 755 $WEBSITE_DIR
print_success "Verzeichnis erstellt: $WEBSITE_DIR"

# 3. Dateien kopieren
print_info "Kopiere Website-Dateien..."
cd $WEBSITE_DIR

# Aktuelles Verzeichnis merken
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "index_nginx_ready.html" ] && [ -f "$SCRIPT_DIR/index_nginx_ready.html" ]; then
    # Dateien aus Script-Verzeichnis kopieren
    cp "$SCRIPT_DIR/index_nginx_ready.html" .
    cp "$SCRIPT_DIR/styles.css" .
    cp "$SCRIPT_DIR/app.js" .
    cp "$SCRIPT_DIR/app_ai.js" .
    cp "$SCRIPT_DIR/package.json" .
    cp "$SCRIPT_DIR/nginx.conf" .
    cp "$SCRIPT_DIR/DEPLOY_NGINX.md" .
    
    # Hauptdatei umbenennen
    cp index_nginx_ready.html index.html
else
    # Dateien sind schon da
    if [ -f "index_nginx_ready.html" ]; then
        cp index_nginx_ready.html index.html
    fi
fi

print_success "Dateien kopiert"

# 4. Nginx Konfiguration
print_info "Konfiguriere Nginx..."
NGINX_CONF="/etc/nginx/sites-available/edeka-niemerszein"

# Backup bestehende Konfiguration
if [ -f "$NGINX_CONF" ]; then
    sudo cp "$NGINX_CONF" "$NGINX_CONF.backup.$(date +%Y%m%d_%H%M%S)"
    print_info "Backup der alten Konfiguration erstellt"
fi

# Neue Konfiguration erstellen
sudo tee "$NGINX_CONF" > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name _;
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
    
    # Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Error Pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

print_success "Nginx Konfiguration erstellt"

# 5. Konfiguration aktivieren
print_info "Aktiviere Nginx Konfiguration..."
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/

# Default Konfiguration deaktivieren (falls vorhanden)
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

# 6. Nginx Konfiguration testen
print_info "Teste Nginx Konfiguration..."
if sudo nginx -t; then
    print_success "Nginx Konfiguration ist gültig"
else
    print_error "Nginx Konfiguration hat Fehler"
    exit 1
fi

# 7. Nginx neustarten
print_info "Starte Nginx neu..."
sudo systemctl restart nginx
print_success "Nginx neu gestartet"

# 8. Firewall konfigurieren (optional)
print_info "Konfiguriere Firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 'Nginx HTTP'
    print_success "Firewall konfiguriert"
elif command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --reload
    print_success "Firewall konfiguriert"
else
    print_info "Keine bekannte Firewall gefunden"
fi

# 9. Installation abschließen
print_info "Installation wird abgeschlossen..."
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
fi

echo ""
echo "======================================================"
print_success "🎉 Installation abgeschlossen!"
echo ""
echo "📱 Deine EDEKA Niemerszein Website ist jetzt online:"
echo "   🌐 http://$SERVER_IP"
echo ""
echo "🔧 Website-Verzeichnis: $WEBSITE_DIR"
echo "📄 Nginx Konfiguration: $NGINX_CONF"
echo ""
echo "🚀 Features:"
echo "   • 🤖 KI-Shopping-Assistent"
echo "   • 📱 Mobile-first Design"
echo "   • 🛒 Interaktive Einkaufsliste"
echo "   • 🗺️  Interaktiver Marktplan"
echo "   • ⚡ Performance optimiert"
echo ""
echo "🔍 Teste den KI-Assistenten:"
echo "   Klicke auf den Roboter-Button unten rechts!"
echo ""
echo "📚 Weitere Informationen:"
echo "   Siehe DEPLOY_NGINX.md für erweiterte Konfiguration"
echo "======================================================"

# 10. Quick Test
print_info "Führe Schnelltest durch..."
sleep 2
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    print_success "Website ist erreichbar"
else
    print_error "Website ist nicht erreichbar"
    echo "Prüfe: sudo systemctl status nginx"
    echo "Prüfe: sudo tail -f /var/log/nginx/error.log"
fi