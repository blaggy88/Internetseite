// EDEKA Niemerszein - Verbesserte JavaScript
// Modernes, responsives Design mit erweiterten Funktionen

document.addEventListener('DOMContentLoaded', function() {
    // Initialisiere alle Komponenten
    initShoppingList();
    initSlider();
    initMobileMenu();
    initAnimations();
    initNewsletterForm();
    
    // Zeige Willkommensnachricht
    showToast('Willkommen bei EDEKA Niemerszein!', 'success');
});

// ==================== EINKAUFSLISTE ====================
let shoppingList = JSON.parse(localStorage.getItem('edeka_shopping_list_v2')) || [];

function initShoppingList() {
    updateListUI();
    
    // Event Listener für Enter-Taste
    document.getElementById('customItemInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomItem();
        }
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('shoppingSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        setTimeout(() => {
            const input = document.getElementById('customItemInput');
            if (input) input.focus();
        }, 300);
    }
}

function addCustomItem() {
    const input = document.getElementById('customItemInput');
    const title = input.value.trim();
    
    if (title) {
        const customId = 'custom-' + Date.now();
        shoppingList.push({
            id: customId,
            title: title,
            price: 0,
            isCustom: true,
            addedAt: new Date().toISOString()
        });
        
        input.value = '';
        saveList();
        updateListUI();
        showToast('Artikel hinzugefügt!', 'success');
    }
}

function removeItem(id) {
    shoppingList = shoppingList.filter(item => item.id !== id);
    saveList();
    updateListUI();
    showToast('Artikel entfernt', 'warning');
}

function saveList() {
    localStorage.setItem('edeka_shopping_list_v2', JSON.stringify(shoppingList));
}

function updateListUI() {
    const counter = document.getElementById('listCounter');
    const container = document.getElementById('listItemsContainer');
    let sum = 0;
    
    if (counter) {
        counter.textContent = shoppingList.length;
    }
    
    if (container) {
        if (shoppingList.length === 0) {
            container.innerHTML = '<div class="empty-list-msg">Deine Einkaufsliste ist noch leer.</div>';
        } else {
            container.innerHTML = '';
            shoppingList.forEach(item => {
                if (!item.isCustom) {
                    sum += parseFloat(item.price) || 0;
                }
                
                const priceHtml = item.isCustom 
                    ? '<span class="list-item-custom-label">Eigener Artikel</span>' 
                    : `<span class="list-item-price">${(item.price || 0).toFixed(2).replace('.', ',')} €</span>`;
                
                const itemHtml = `
                    <div class="list-item fade-in">
                        <div class="list-item-info">
                            <span class="list-item-title">${escapeHtml(item.title)}</span>
                            ${priceHtml}
                        </div>
                        <button class="remove-item-btn" onclick="removeItem('${item.id}')" aria-label="Entfernen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>`;
                
                container.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    }
    
    const totalElement = document.getElementById('listTotalSum');
    if (totalElement) {
        totalElement.textContent = sum.toFixed(2).replace('.', ',') + ' €';
    }
}

// ==================== SLIDER ====================
let slideIndex = 0;
let slideInterval;
const totalSlides = document.querySelectorAll('.slide').length;

function initSlider() {
    if (totalSlides === 0) return;
    
    updateSlider();
    startSliderTimer();
    initTouchSwipe();
}

function moveSlide(n) {
    slideIndex += n;
    
    if (slideIndex >= totalSlides) slideIndex = 0;
    if (slideIndex < 0) slideIndex = totalSlides - 1;
    
    updateSlider();
    resetSliderTimer();
}

function currentSlide(n) {
    slideIndex = n;
    updateSlider();
    resetSliderTimer();
}

function updateSlider() {
    const slider = document.getElementById('slider');
    const dots = document.querySelectorAll('.dot');
    
    if (slider) {
        slider.style.transform = `translateX(-${slideIndex * 100}%)`;
    }
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndex);
    });
}

function startSliderTimer() {
    if (totalSlides > 1) {
        slideInterval = setInterval(() => {
            moveSlide(1);
        }, 5000);
    }
}

function resetSliderTimer() {
    clearInterval(slideInterval);
    startSliderTimer();
}

function initTouchSwipe() {
    const sliderContainer = document.getElementById('sliderContainer');
    if (!sliderContainer) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            moveSlide(1); // Swipe nach links
        } else if (touchEndX > touchStartX + swipeThreshold) {
            moveSlide(-1); // Swipe nach rechts
        }
    }
}

// ==================== MOBILE MENU ====================
function initMobileMenu() {
    const burgerMenu = document.querySelector('.burger-menu');
    const mobileNav = document.getElementById('mobileNav');
    const navLinks = document.querySelectorAll('.main-nav a');
    
    if (burgerMenu && mobileNav) {
        burgerMenu.addEventListener('click', toggleMenu);
        
        // Schließe Menu bei Klick auf Links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNav.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
        
        // Schließe Menu bei Klick außerhalb
        document.addEventListener('click', (e) => {
            if (mobileNav.classList.contains('active') && 
                !mobileNav.contains(e.target) && 
                !burgerMenu.contains(e.target)) {
                toggleMenu();
            }
        });
    }
}

function toggleMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const burgerMenu = document.querySelector('.burger-menu');
    
    if (mobileNav) {
        mobileNav.classList.toggle('active');
        
        // Toggle Burger Icon
        if (burgerMenu) {
            const icon = burgerMenu.querySelector('i');
            if (icon) {
                if (mobileNav.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        }
        
        // Verhindere Scrollen im Hintergrund
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    }
}

// ==================== ANIMATIONEN ====================
function initAnimations() {
    // Intersection Observer für Scroll-Animationen
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Beobachte alle Elemente mit der Klasse 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // Füge Animationen zu Karten hinzu
    document.querySelectorAll('.highlight-card, .market-card, .feature').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-on-scroll');
    });
}

// ==================== NEWSLETTER FORM ====================
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // Simuliere API-Aufruf
                simulateNewsletterSignup(email)
                    .then(() => {
                        showToast('Erfolgreich für den Newsletter angemeldet!', 'success');
                        emailInput.value = '';
                    })
                    .catch(() => {
                        showToast('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.', 'error');
                    });
            } else {
                showToast('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
                emailInput.focus();
            }
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function simulateNewsletterSignup(email) {
    return new Promise((resolve, reject) => {
        // Simuliere Netzwerklatenz
        setTimeout(() => {
            // In einer echten Anwendung würde hier ein API-Aufruf stehen
            console.log('Newsletter-Anmeldung für:', email);
            
            // Simuliere 90% Erfolgsrate
            Math.random() > 0.1 ? resolve() : reject();
        }, 1000);
    });
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    // Entferne bestehende Toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
        toast.remove();
    });
    
    // Erstelle neuen Toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Zeige Toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Verstecke Toast nach 3 Sekunden
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ==================== HELPER FUNCTIONS ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== PERFORMANCE OPTIMIERUNGEN ====================
// Lazy Loading für Bilder
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Service Worker Registrierung (für PWA-Funktionalität)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker Registrierung fehlgeschlagen:', error);
        });
    });
}

// ==================== OFFLINE FUNKTIONALITÄT ====================
// Speichere Einkaufsliste auch im IndexedDB für Offline-Nutzung
if ('indexedDB' in window) {
    const request = indexedDB.open('edekaShoppingList', 1);
    
    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('items')) {
            db.createObjectStore('items', { keyPath: 'id' });
        }
    };
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        window.edekaDB = db;
    };
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // Strg+L öffnet/schließt Einkaufsliste
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        toggleSidebar();
    }
    
    // Escape schließt alle Modals/Sidebars
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('shoppingSidebar');
        const mobileNav = document.getElementById('mobileNav');
        
        if (sidebar && sidebar.classList.contains('active')) {
            toggleSidebar();
        }
        
        if (mobileNav && mobileNav.classList.contains('active')) {
            toggleMenu();
        }
    }
});

// ==================== ANALYTICS (privacy-friendly) ====================
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
    
    // Eigene einfache Analytics
    console.log(`Analytics: ${category} - ${action} - ${label}`);
}

// Tracke wichtige Interaktionen
document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Tracke Klicks auf Hauptnavigation
    if (target.closest('.nav-links a')) {
        const linkText = target.closest('.nav-links a').textContent.trim();
        trackEvent('Navigation', 'click', linkText);
    }
    
    // Tracke Klicks auf Call-to-Action Buttons
    if (target.closest('.btn-hero, .btn-blue, .btn-market')) {
        const buttonText = target.closest('button, a').textContent.trim();
        trackEvent('CTA', 'click', buttonText);
    }
});

// ==================== ERROR HANDLING ====================
window.addEventListener('error', function(e) {
    console.error('JavaScript Fehler:', e.error);
    
    // Sende Fehler an Analytics (in Produktion)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            'description': e.error.message,
            'fatal': false
        });
    }
});

// ==================== EXPORT FUNKTIONEN FÜR GLOBALE NUTZUNG ====================
window.EdekaApp = {
    toggleSidebar,
    addCustomItem,
    removeItem,
    moveSlide,
    currentSlide,
    toggleMenu,
    showToast
};