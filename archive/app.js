// EDEKA Niemerszein - Haupt JavaScript Datei
// Version: 2026-03-09 - Korrigierte Version

// ===== KONFIGURATION =====
const config = {
    autoSlideInterval: 5000,
    notificationDuration: 3000,
    apiEndpoint: 'https://api.edeka.de'
};

// ===== GLOBALE VARIABLEN =====
let shoppingList = [];
let aiAssistantActive = false;

// DOM Elements cache
const elements = {
    listCounter: null,
    listItemsContainer: null,
    listTotalSum: null,
    customItemInput: null,
    shoppingSidebar: null,
    sidebarOverlay: null,
    mobileNav: null,
    burgerMenu: null,
    sliderContainer: null,
    slider: null,
    dots: null
};

// ===== DOM CACHING =====
const cacheElements = () => {
    elements.listCounter = document.getElementById('listCounter');
    elements.listItemsContainer = document.getElementById('listItemsContainer');
    elements.listTotalSum = document.getElementById('listTotalSum');
    elements.customItemInput = document.getElementById('customItemInput');
    elements.shoppingSidebar = document.getElementById('shoppingSidebar');
    elements.sidebarOverlay = document.getElementById('sidebarOverlay');
    elements.mobileNav = document.getElementById('mobileNav');
    elements.burgerMenu = document.getElementById('burgerMenu');
    elements.sliderContainer = document.getElementById('sliderContainer');
    elements.slider = document.getElementById('slider');
    elements.dots = document.querySelectorAll('.dot');
};

// ===== EINKAUFSLISTE =====
const initShoppingList = () => {
    // Lade gespeicherte Liste
    const saved = localStorage.getItem('edeka_shopping_list_v2');
    if (saved) {
        try {
            shoppingList = JSON.parse(saved);
        } catch (e) {
            console.error('Fehler beim Laden der Einkaufsliste:', e);
            shoppingList = [];
        }
    }
    
    updateListUI();
    
    // Event Listener für Custom Item Input
    if (elements.customItemInput) {
        elements.customItemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addCustomItem();
            }
        });
    }
};

const updateListUI = () => {
    const container = elements.listItemsContainer;
    let total = 0;
    
    if (shoppingList.length === 0) {
        container.innerHTML = `
            <div class="empty-list-msg" role="status" aria-live="polite">
                <i class="fas fa-shopping-cart"></i>
                <p>Deine Einkaufsliste ist leer</p>
                <small>Füge Produkte hinzu, indem du auf das "+" klickst</small>
            </div>
        `;
    } else {
        let html = '';
        shoppingList.forEach((item, index) => {
            if (!item.isCustom) {
                total += (item.price * item.quantity);
            }
            
            html += `
                <div class="list-item" data-index="${index}" role="listitem">
                    <div class="item-info">
                        <span class="item-name">${item.name}</span>
                        ${item.price ? `<span class="item-price">${item.price.toFixed(2)}€</span>` : ''}
                    </div>
                    <div class="item-actions">
                        <span class="item-quantity">
                            <button class="qty-btn minus" onclick="changeQuantity(${index}, -1)" aria-label="Menge verringern">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn plus" onclick="changeQuantity(${index}, 1)" aria-label="Menge erhöhen">+</button>
                        </span>
                        <button class="remove-btn" onclick="removeFromList(${index})" aria-label="Artikel entfernen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Update Counter
    if (elements.listCounter) {
        elements.listCounter.textContent = shoppingList.length;
        elements.listCounter.setAttribute('aria-label', `${shoppingList.length} Artikel in der Einkaufsliste`);
    }
    
    // Update Total
    if (elements.listTotalSum) {
        elements.listTotalSum.textContent = total.toFixed(2);
    }
};

const addToList = (name, price = null, isCustom = false) => {
    shoppingList.push({
        name,
        price,
        quantity: 1,
        isCustom,
        addedAt: new Date().toISOString()
    });
    
    saveList();
    updateListUI();
    showNotification(`${name} zur Liste hinzugefügt`, 'success');
};

const addCustomItem = () => {
    if (!elements.customItemInput) return;
    
    const name = elements.customItemInput.value.trim();
    if (name) {
        addToList(name, null, true);
        elements.customItemInput.value = '';
        elements.customItemInput.focus();
    }
};

const removeFromList = (index) => {
    if (index >= 0 && index < shoppingList.length) {
        const item = shoppingList[index];
        shoppingList.splice(index, 1);
        saveList();
        updateListUI();
        showNotification(`${item.name} entfernt`, 'info');
    }
};

const changeQuantity = (index, delta) => {
    if (index >= 0 && index < shoppingList.length) {
        shoppingList[index].quantity = Math.max(1, shoppingList[index].quantity + delta);
        saveList();
        updateListUI();
    }
};

const saveList = () => {
    try {
        localStorage.setItem('edeka_shopping_list_v2', JSON.stringify(shoppingList));
    } catch (e) {
        console.error('Fehler beim Speichern der Liste:', e);
        showNotification('Fehler beim Speichern der Liste', 'error');
    }
};

// ===== NAVIGATION =====
const initNavigation = () => {
    // Burger Menu Toggle
    if (elements.burgerMenu) {
        elements.burgerMenu.addEventListener('click', toggleMenu);
    }
    
    // Sidebar Toggle
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', toggleSidebar);
    }
    
    // Mobile Nav Links
    if (elements.mobileNav) {
        const links = elements.mobileNav.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleMenu();
                }
            });
        });
    }
};

const toggleMenu = () => {
    if (elements.mobileNav) {
        const isOpen = elements.mobileNav.classList.contains('open');
        elements.mobileNav.classList.toggle('open');
        elements.mobileNav.setAttribute('aria-expanded', !isOpen);
        
        if (elements.burgerMenu) {
            elements.burgerMenu.setAttribute('aria-label', isOpen ? 'Menü öffnen' : 'Menü schließen');
            elements.burgerMenu.innerHTML = isOpen ? '☰' : '✕';
        }
    }
};

const toggleSidebar = () => {
    if (elements.shoppingSidebar) {
        elements.shoppingSidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open');
    }
};

// ===== SLIDER =====
let slideIndex = 0;
let slideInterval;

const initSlider = () => {
    if (!elements.slider || !elements.sliderContainer) return;
    
    // Start Auto-Slide
    startSliderTimer();
    
    // Touch Events
    initTouchEvents();
};

const moveSlide = (direction) => {
    const slides = elements.slider ? elements.slider.children : [];
    if (slides.length === 0) return;
    
    slideIndex = (slideIndex + direction + slides.length) % slides.length;
    updateSlider();
};

const updateSlider = () => {
    if (!elements.slider) return;
    
    elements.slider.style.transform = `translateX(-${slideIndex * 100}%)`;
    updateDots();
};

const updateDots = () => {
    if (!elements.dots) return;
    
    elements.dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndex);
        dot.setAttribute('aria-selected', index === slideIndex);
    });
};

const startSliderTimer = () => {
    slideInterval = setInterval(() => {
        moveSlide(1);
    }, config.autoSlideInterval);
};

const resetSliderTimer = () => {
    clearInterval(slideInterval);
    startSliderTimer();
};

const stopSliderTimer = () => {
    clearInterval(slideInterval);
};

// Touch/swipe handling
const initTouchEvents = () => {
    if (!elements.sliderContainer) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    elements.sliderContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopSliderTimer();
    }, { passive: true });
    
    elements.sliderContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        resetSliderTimer();
    }, { passive: true });
    
    const handleSwipe = () => {
        if (touchEndX < touchStartX - 50) {
            moveSlide(1); // Swipe left = next
        } else if (touchEndX > touchStartX + 50) {
            moveSlide(-1); // Swipe right = previous
        }
    };
};

// ===== NOTIFICATIONS =====
const showNotification = (message, type = 'info') => {
    // Einfache Console Notification für jetzt
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // In Zukunft: Schöne UI Notification
    // const notification = document.createElement('div');
    // notification.className = `notification ${type}`;
    // notification.textContent = message;
    // document.body.appendChild(notification);
    // setTimeout(() => notification.remove(), config.notificationDuration);
};

// ===== INITIALIZATION =====
const init = () => {
    console.log('🚀 EDEKA App initializing...');
    
    // Cache DOM elements
    cacheElements();
    
    // Initialize modules
    initShoppingList();
    initNavigation();
    initSlider();
    
    // Event listeners für globale Funktionen
    window.addToList = addToList;
    window.removeFromList = removeFromList;
    window.changeQuantity = changeQuantity;
    window.addCustomItem = addCustomItem;
    window.toggleMenu = toggleMenu;
    window.toggleSidebar = toggleSidebar;
    
    console.log('✅ EDEKA App initialized');
};

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
