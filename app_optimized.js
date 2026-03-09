// ===== KOMBINIERTE VERSION =====
// app_optimized.js - Alle JavaScript-Funktionen
// Generiert: Mon Mar  9 20:31:16 UTC 2026

// Original app.js Inhalt:
/**
 * EDEKA Niemerszein - Modern JavaScript Application
 * Version 2.0 - AI Enhanced Shopping Experience
 */

// ===== MODULE PATTERN =====
const EdekaApp = (() => {
    // Private variables
    let shoppingList = [];
    let slideIndex = 0;
    let slideInterval;
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
        slider: null,
        sliderContainer: null,
        dots: null,
        sliderLoading: null
    };
    
    // Configuration
    const config = {
        autoSlideInterval: 5000,
        swipeThreshold: 50,
        localStorageKey: 'edeka_shopping_list_v2',
        aiEndpoint: 'https://api.edeka.ai/v1/assistant',
        apiTimeout: 10000,
        maxListItems: 100,
        animationDuration: 300
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
        initAIAssistant();
        initServiceWorker();
        initPerformanceMonitoring();
        
        // Event listeners
        setupEventListeners();
        
        // Load initial state
        loadInitialState();
        
        console.log('✅ EDEKA App ready!');
        
        // Send analytics
        trackEvent('app_loaded');
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
        elements.slider = document.getElementById('slider');
        elements.sliderContainer = document.getElementById('sliderContainer');
        elements.dots = document.querySelectorAll('.dot');
        elements.sliderLoading = document.getElementById('sliderLoading');
    };
    
    // ===== SHOPPING LIST MODULE =====
    const initShoppingList = () => {
        // Load from localStorage
        const savedList = localStorage.getItem(config.localStorageKey);
        if (savedList) {
            try {
                shoppingList = JSON.parse(savedList);
                updateListUI();
            } catch (error) {
                console.error('Error loading shopping list:', error);
                shoppingList = [];
            }
        }
    };
    
    const addItem = (item) => {
        if (shoppingList.length >= config.maxListItems) {
            showNotification('Maximale Anzahl von Artikeln erreicht', 'warning');
            return false;
        }
        
        const newItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: item.title.trim(),
            price: item.price || 0,
            isCustom: item.isCustom || false,
            category: item.category || 'uncategorized',
            addedAt: new Date().toISOString(),
            quantity: item.quantity || 1,
            unit: item.unit || 'Stück'
        };
        
        shoppingList.push(newItem);
        saveList();
        updateListUI();
        
        // AI suggestion
        if (!item.isCustom) {
            suggestRelatedItems(newItem);
        }
        
        showNotification(`"${newItem.title}" zur Liste hinzugefügt`, 'success');
        trackEvent('item_added', { category: newItem.category });
        
        return true;
    };
    
    const addCustomItem = () => {
        const input = elements.customItemInput;
        const title = input.value.trim();
        
        if (!title) {
            showNotification('Bitte geben Sie einen Artikelnamen ein', 'error');
            input.focus();
            return;
        }
        
        if (title.length > 100) {
            showNotification('Artikelname zu lang (max. 100 Zeichen)', 'error');
            return;
        }
        
        const success = addItem({
            title,
            price: 0,
            isCustom: true,
            category: 'custom'
        });
        
        if (success) {
            input.value = '';
            input.focus();
        }
    };
    
    const removeItem = (id) => {
        const item = shoppingList.find(item => item.id === id);
        if (item) {
            shoppingList = shoppingList.filter(item => item.id !== id);
            saveList();
            updateListUI();
            
            showNotification(`"${item.title}" entfernt`, 'info');
            trackEvent('item_removed', { category: item.category });
        }
    };
    
    const updateItemQuantity = (id, change) => {
        const itemIndex = shoppingList.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            const newQuantity = shoppingList[itemIndex].quantity + change;
            if (newQuantity >= 1 && newQuantity <= 99) {
                shoppingList[itemIndex].quantity = newQuantity;
                saveList();
                updateListUI();
            }
        }
    };
    
    const clearShoppingList = () => {
        if (shoppingList.length === 0) return;
        
        if (confirm('Möchten Sie wirklich die gesamte Liste löschen?')) {
            const itemCount = shoppingList.length;
            shoppingList = [];
            saveList();
            updateListUI();
            
            showNotification(`Alle ${itemCount} Artikel entfernt`, 'info');
            trackEvent('list_cleared');
        }
    };
    
    const saveList = () => {
        try {
            localStorage.setItem(config.localStorageKey, JSON.stringify(shoppingList));
            updateListCounter();
        } catch (error) {
            console.error('Error saving shopping list:', error);
            showNotification('Fehler beim Speichern der Liste', 'error');
        }
    };
    
    const updateListUI = () => {
        const container = elements.listItemsContainer;
        let total = 0;
        
        if (shoppingList.length === 0) {
            container.innerHTML = `
                <div class="empty-list-msg" role="status" aria-live="polite">
                    <i class="fas fa-clipboard-list" aria-hidden="true"></i>
                    <p>Deine Einkaufsliste ist noch leer.</p>
                    <p class="small-text">Füge Artikel hinzu, um sie hier zu sehen.</p>
                    <button class="btn btn-outline btn-sm mt-3" onclick="EdekaApp.showAISuggestions()">
                        <i class="fas fa-robot" aria-hidden="true"></i>
                        KI-Vorschläge anzeigen
                    </button>
                </div>
            `;
        } else {
            let html = '';
            
            shoppingList.forEach(item => {
                if (!item.isCustom) {
                    total += (item.price * item.quantity);
                }
                
                html += `
                    <div class="list-item" data-id="${item.id}" role="listitem">
                        <div class="list-item-info">
                            <span class="list-item-title">${escapeHtml(item.title)}</span>
                            <div class="list-item-meta">
                                ${item.isCustom 
                                    ? '<span class="list-item-custom-label">Eigener Artikel</span>' 
                                    : `<span class="list-item-price">${formatPrice(item.price * item.quantity)}</span>`
                                }
                                ${item.category !== 'custom' ? `<span class="list-item-category">${item.category}</span>` : ''}
                            </div>
                        </div>
                        <div class="list-item-actions">
                            <div class="quantity-control">
                                <button class="qty-btn" onclick="EdekaApp.updateQuantity('${item.id}', -1)" 
                                        aria-label="Menge verringern" ${item.quantity <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-minus" aria-hidden="true"></i>
                                </button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="qty-btn" onclick="EdekaApp.updateQuantity('${item.id}', 1)" 
                                        aria-label="Menge erhöhen">
                                    <i class="fas fa-plus" aria-hidden="true"></i>
                                </button>
                            </div>
                            <button class="remove-item-btn" onclick="EdekaApp.removeItem('${item.id}')" 
                                    aria-label="Artikel entfernen">
                                <i class="fas fa-trash-alt" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
        
        elements.listTotalSum.textContent = formatPrice(total);
        updateListCounter();
    };
    
    const updateListCounter = () => {
        if (elements.listCounter) {
            const totalItems = shoppingList.reduce((sum, item) => sum + item.quantity, 0);
            elements.listCounter.textContent = totalItems;
            
            // Update ARIA label
            elements.listCounter.setAttribute('aria-label', `${totalItems} Artikel in der Einkaufsliste`);
        }
    };
    
    // ===== NAVIGATION MODULE =====
    const initNavigation = () => {
        // Close mobile menu when clicking outside
        document.addEventListener('click', (event) => {
            const nav = elements.mobileNav;
            const burger = document.querySelector('.burger-menu');
            
            if (nav && nav.classList.contains('active') && 
                !nav.contains(event.target) && 
                !burger.contains(event.target)) {
                toggleMenu();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (elements.shoppingSidebar.classList.contains('active')) {
                    toggleSidebar();
                }
                if (elements.mobileNav.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });
    };
    
    const toggleMenu = () => {
        const nav = elements.mobileNav;
        const burger = document.querySelector('.burger-menu');
        
        nav.classList.toggle('active');
        burger.classList.toggle('active');
        burger.setAttribute('aria-expanded', nav.classList.contains('active'));
        
        // Toggle body scroll
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        
        trackEvent('menu_toggled', { state: nav.classList.contains('active') ? 'open' : 'closed' });
    };
    
    const toggleSidebar = () => {
        const sidebar = elements.shoppingSidebar;
        const overlay = elements.sidebarOverlay;
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        const isOpen = sidebar.classList.contains('active');
        document.querySelector('.list-toggle-btn').setAttribute('aria-expanded', isOpen);
        
        // Focus management
        if (isOpen) {
            setTimeout(() => elements.customItemInput.focus(), config.animationDuration);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.querySelector('.list-toggle-btn').focus();
        }
        
        trackEvent('sidebar_toggled', { state: isOpen ? 'open' : 'closed' });
    };
    
    // ===== SLIDER MODULE =====
    const initSlider = () => {
        if (!elements.slider) return;
        
        const totalSlides = document.querySelectorAll('.slide').length;
        if (totalSlides === 0) return;
        
        // Preload slider images
        preloadSliderImages();
        
        // Start auto-slide
        startSliderTimer();
        
        // Initialize dots
        updateDots();
        
        // Hide loading indicator
        if (elements.sliderLoading) {
            setTimeout(() => {
                elements.sliderLoading.style.opacity = '0';
                setTimeout(() => {
                    elements.sliderLoading.style.display = 'none';
                }, 500);
            }, 1000);
        }
    };
    
    const preloadSliderImages = () => {
        const images = document.querySelectorAll('.slide');
        images.forEach(slide => {
            const bgImage = slide.style.backgroundImage;
            if (bgImage) {
                const url = bgImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
                const img = new Image();
                img.src = url;
            }
        });
    };
    
    const moveSlide = (direction) => {
        const totalSlides = document.querySelectorAll('.slide').length;
        slideIndex += direction;
        
        if (slideIndex >= totalSlides) slideIndex = 0;
        if (slideIndex < 0) slideIndex = totalSlides - 1;
        
        updateSlider();
        resetSliderTimer();
        
        trackEvent('slide_changed', { direction, index: slideIndex });
    };
    
    const currentSlide = (index) => {
        slideIndex = index;
        updateSlider();
        resetSliderTimer();
        
        trackEvent('slide_selected', { index });
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
            if (touchEnd-e 

// ===== INLINE FUNKTIONEN AUS index.html =====

        // --- EINKAUFSLISTEN LOGIK ---
        let shoppingList = JSON.parse(localStorage.getItem('edeka_shopping_list')) || [];

        function initApp() {
            updateListUI();
        }

        function toggleSidebar() {
            document.getElementById('shoppingSidebar').classList.toggle('active');
            document.getElementById('sidebarOverlay').classList.toggle('active');
            if(document.getElementById('shoppingSidebar').classList.contains('active')) {
                setTimeout(() => document.getElementById('customItemInput').focus(), 300);
            }
        }

        function addCustomItem() {
            const inputField = document.getElementById('customItemInput');
            const title = inputField.value.trim();
            if (title !== '') {
                const customId = 'custom-' + Date.now();
                shoppingList.push({ id: customId, title: title, price: 0, isCustom: true });
                inputField.value = ''; 
                saveList();
                updateListUI();
            }
        }

        function handleCustomItemKeypress(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                addCustomItem();
            }
        }

        function removeItem(id) {
            shoppingList = shoppingList.filter(item => item.id !== id);
            saveList();
            updateListUI();
        }

        function saveList() {
            localStorage.setItem('edeka_shopping_list', JSON.stringify(shoppingList));
        }

        function updateListUI() {
            document.getElementById('listCounter').innerText = shoppingList.length;
            const container = document.getElementById('listItemsContainer');
            let sum = 0;
            
            if (shoppingList.length === 0) {
                container.innerHTML = '<div class="empty-list-msg">Deine Einkaufsliste ist noch leer.</div>';
            } else {
                container.innerHTML = '';
                shoppingList.forEach(item => {
                    if(!item.isCustom) sum += parseFloat(item.price);
                    const priceHtml = item.isCustom 
                        ? '<span class="list-item-custom-label">Eigener Artikel</span>' 
                        : `<span class="list-item-price">${item.price.toFixed(2).replace('.', ',')} €</span>`;
                    const itemHtml = `
                        <div class="list-item">
                            <div class="list-item-info">
                                <span class="list-item-title">${item.title}</span>
                                ${priceHtml}
                            </div>
                            <button class="remove-item-btn" onclick="removeItem('${item.id}')" aria-label="Entfernen">🗑️</button>
                        </div>`;
                    container.insertAdjacentHTML('beforeend', itemHtml);
                });
            }
            document.getElementById('listTotalSum').innerText = sum.toFixed(2).replace('.', ',') + ' €';
        }

        // --- MOBILE NAVIGATION ---
        function toggleMenu() {
            document.getElementById("mobileNav").classList.toggle("active");
        }

        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                const nav = document.getElementById("mobileNav");
                if (nav.classList.contains('active')) nav.classList.remove('active');
            });
        });

        // --- SLIDER LOGIK MIT TOUCH/SWIPE ---
        let slideIndex = 0;
        const slider = document.getElementById("slider");
        const sliderContainer = document.getElementById("sliderContainer");
        const dots = document.getElementsByClassName("dot");
        const totalSlides = document.getElementsByClassName("slide").length;
        let slideInterval;

        function updateSlider() {
            slider.style.transform = `translateX(-${slideIndex * 100}%)`;
            for (let i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(" active", "");
            }
            dots[slideIndex].className += " active";
        }

        function moveSlide(n) {
            slideIndex += n;
            if (slideIndex >= totalSlides) slideIndex = 0;
            if (slideIndex < 0) slideIndex = totalSlides - 1;
            updateSlider();
            resetTimer();
        }

        function currentSlide(n) {
            slideIndex = n;
            updateSlider();
            resetTimer();
        }

        function startTimer() {
            slideInterval = setInterval(() => { moveSlide(1); }, 5000);
        }

        function resetTimer() {
            clearInterval(slideInterval);
            startTimer();
        }

        // --- SWIPE ERKENNUNG ---
        let touchStartX = 0;
        let touchEndX = 0;

        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                moveSlide(1); 
            }
            if (touchEndX > touchStartX + 50) {
                moveSlide(-1); 
            }
        }

        sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        sliderContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        window.onload = () => {
            initApp();
            startTimer();
        };
