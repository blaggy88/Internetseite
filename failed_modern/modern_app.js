// EDEKA MODERN APP - Erstklassige Webanwendung
class EdekaModernApp {
    constructor() {
        this.shoppingList = [];
        this.slideIndex = 0;
        this.slideInterval = null;
        this.elements = {};
        this.init();
    }
    
    // ===== INITIALIZATION =====
    init() {
        console.log('🚀 EDEKA Modern App starting...');
        this.cacheElements();
        this.initShoppingList();
        this.initSlider();
        this.initEventListeners();
        this.initAnimations();
        console.log('✅ EDEKA Modern App ready');
    }
    
    cacheElements() {
        // Core elements
        this.elements = {
            // Shopping List
            listCounter: document.getElementById('listCounter'),
            listItems: document.getElementById('listItemsContainer'),
            listTotal: document.getElementById('listTotalSum'),
            customInput: document.getElementById('customItemInput'),
            addCustomBtn: document.getElementById('addCustomItemBtn'),
            clearListBtn: document.getElementById('clearListBtn'),
            
            // Slider
            slider: document.getElementById('slider'),
            sliderContainer: document.getElementById('sliderContainer'),
            prevBtn: document.getElementById('prevSlide'),
            nextBtn: document.getElementById('nextSlide'),
            dots: document.querySelectorAll('.dot'),
            
            // Navigation
            burgerMenu: document.getElementById('burgerMenu'),
            mobileNav: document.getElementById('mobileNav'),
            shoppingSidebar: document.getElementById('shoppingSidebar'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            
            // Product Grid
            productGrid: document.getElementById('productGrid'),
            categoryFilter: document.getElementById('categoryFilter')
        };
    }
    
    // ===== SHOPPING LIST =====
    initShoppingList() {
        // Load from localStorage
        const saved = localStorage.getItem('edeka_shopping_list_modern');
        if (saved) {
            try {
                this.shoppingList = JSON.parse(saved);
                this.updateListUI();
            } catch (e) {
                console.error('Error loading shopping list:', e);
                this.shoppingList = [];
            }
        }
        
        // Migrate from old version if exists
        this.migrateOldList();
    }
    
    migrateOldList() {
        const oldList = localStorage.getItem('edeka_shopping_list_v2');
        if (oldList && this.shoppingList.length === 0) {
            try {
                const oldItems = JSON.parse(oldList);
                this.shoppingList = oldItems.map(item => ({
                    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: item.title || item.name || 'Unbekannter Artikel',
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    category: item.category || 'uncategorized',
                    addedAt: new Date().toISOString()
                }));
                this.saveList();
                this.showNotification('Einkaufsliste migriert', 'success');
            } catch (e) {
                console.error('Migration failed:', e);
            }
        }
    }
    
    addItem(name, price = null, category = 'uncategorized') {
        const newItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: name.trim(),
            price: price,
            quantity: 1,
            category: category,
            addedAt: new Date().toISOString(),
            checked: false
        };
        
        this.shoppingList.push(newItem);
        this.saveList();
        this.updateListUI();
        this.showNotification(`"${name}" hinzugefügt`, 'success');
        this.animateAdd(newItem.id);
        
        return newItem.id;
    }
    
    addCustomItem() {
        if (!this.elements.customInput) return;
        
        const name = this.elements.customInput.value.trim();
        if (name) {
            this.addItem(name, null, 'custom');
            this.elements.customInput.value = '';
            this.elements.customInput.focus();
        } else {
            this.showNotification('Bitte Artikelnamen eingeben', 'error');
        }
    }
    
    removeItem(itemId) {
        const index = this.shoppingList.findIndex(item => item.id === itemId);
        if (index !== -1) {
            const item = this.shoppingList[index];
            this.shoppingList.splice(index, 1);
            this.saveList();
            this.updateListUI();
            this.showNotification(`"${item.name}" entfernt`, 'info');
        }
    }
    
    updateQuantity(itemId, change) {
        const item = this.shoppingList.find(item => item.id === itemId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity >= 1 && newQuantity <= 99) {
                item.quantity = newQuantity;
                this.saveList();
                this.updateListUI();
            }
        }
    }
    
    toggleChecked(itemId) {
        const item = this.shoppingList.find(item => item.id === itemId);
        if (item) {
            item.checked = !item.checked;
            this.saveList();
            this.updateListUI();
        }
    }
    
    clearList() {
        if (this.shoppingList.length === 0) return;
        
        if (confirm('Wirklich alle Artikel löschen?')) {
            const count = this.shoppingList.length;
            this.shoppingList = [];
            this.saveList();
            this.updateListUI();
            this.showNotification(`${count} Artikel gelöscht`, 'info');
        }
    }
    
    updateListUI() {
        if (!this.elements.listItems) return;
        
        let total = 0;
        
        if (this.shoppingList.length === 0) {
            this.elements.listItems.innerHTML = `
                <div class="empty-state fade-in">
                    <i class="fas fa-shopping-basket" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
                    <h4>Einkaufsliste leer</h4>
                    <p>Füge Artikel hinzu, um sie hier zu sehen</p>
                </div>
            `;
        } else {
            let html = '';
            
            this.shoppingList.forEach(item => {
                if (item.price) {
                    total += (item.price * item.quantity);
                }
                
                html += `
                    <div class="list-item modern fade-in" data-id="${item.id}">
                        <div class="item-check" onclick="app.toggleChecked('${item.id}')">
                            <i class="fas fa-${item.checked ? 'check-circle' : 'circle'}" 
                               style="color: ${item.checked ? 'var(--edeka-green)' : 'var(--gray)'}"></i>
                        </div>
                        <div class="item-info">
                            <div class="item-name ${item.checked ? 'checked' : ''}">${this.escapeHtml(item.name)}</div>
                            <div class="item-meta">
                                ${item.category !== 'custom' ? `<span class="item-category">${item.category}</span>` : ''}
                                ${item.price ? `<span class="item-price">${this.formatPrice(item.price * item.quantity)}</span>` : ''}
                            </div>
                        </div>
                        <div class="item-actions">
                            <div class="quantity-control">
                                <button class="qty-btn" onclick="app.updateQuantity('${item.id}', -1)" 
                                        ${item.quantity <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="qty-btn" onclick="app.updateQuantity('${item.id}', 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="remove-btn" onclick="app.removeItem('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            this.elements.listItems.innerHTML = html;
        }
        
        // Update counter
        if (this.elements.listCounter) {
            this.elements.listCounter.textContent = this.shoppingList.length;
            this.elements.listCounter.classList.add('pulse');
            setTimeout(() => this.elements.listCounter.classList.remove('pulse'), 300);
        }
        
        // Update total
        if (this.elements.listTotal) {
            this.elements.listTotal.textContent = this.formatPrice(total);
        }
    }
    
    saveList() {
        try {
            localStorage.setItem('edeka_shopping_list_modern', JSON.stringify(this.shoppingList));
        } catch (e) {
            console.error('Error saving list:', e);
            this.showNotification('Fehler beim Speichern', 'error');
        }
    }
    
    // ===== SLIDER =====
    initSlider() {
        if (!this.elements.slider) return;
        
        // Start auto-slide
        this.startSlider();
        
        // Event listeners
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.moveSlide(-1));
        }
        
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.moveSlide(1));
        }
        
        // Dot navigation
        if (this.elements.dots) {
            this.elements.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });
        }
        
        // Touch support
        this.initTouchEvents();
    }
    
    moveSlide(direction) {
        const slides = this.elements.slider ? this.elements.slider.children : [];
        if (slides.length === 0) return;
        
        this.slideIndex = (this.slideIndex + direction + slides.length) % slides.length;
        this.updateSlider();
        this.resetSlider();
    }
    
    goToSlide(index) {
        const slides = this.elements.slider ? this.elements.slider.children : [];
        if (index >= 0 && index < slides.length) {
            this.slideIndex = index;
            this.updateSlider();
            this.resetSlider();
        }
    }
    
    updateSlider() {
        if (!this.elements.slider) return;
        
        this.elements.slider.style.transform = `translateX(-${this.slideIndex * 100}%)`;
        
        // Update dots
        if (this.elements.dots) {
            this.elements.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.slideIndex);
                dot.setAttribute('aria-selected', index === this.slideIndex);
            });
        }
    }
    
    startSlider() {
        this.slideInterval = setInterval(() => {
            this.moveSlide(1);
        }, 5000);
    }
    
    resetSlider() {
        clearInterval(this.slideInterval);
        this.startSlider();
    }
    
    stopSlider() {
        clearInterval(this.slideInterval);
    }
    
    initTouchEvents() {
        if (!this.elements.sliderContainer) return;
        
        let touchStartX = 0;
        
        this.elements.sliderContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            this.stopSlider();
        }, { passive: true });
        
        this.elements.sliderContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.moveSlide(1); // Swipe left
                } else {
                    this.moveSlide(-1); // Swipe right
                }
            }
            
            this.resetSlider();
        }, { passive: true });
    }
    
    // ===== NAVIGATION =====
    initEventListeners() {
        // Burger menu
        if (this.elements.burgerMenu) {
            this.elements.burgerMenu.addEventListener('click', () => this.toggleMenu());
        }
        
        // Shopping sidebar
        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Custom item input
        if (this.elements.customInput) {
            this.elements.customInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addCustomItem();
                }
            });
        }
        
        // Clear list button
        if (this.elements.clearListBtn) {
            this.elements.clearListBtn.addEventListener('click', () => this.clearList());
        }
        
        // Add custom button
        if (this.elements.addCustomBtn) {
            this.elements.addCustomBtn.addEventListener('click', () => this.addCustomItem());
        }
    }
    
    toggleMenu() {
        if (!this.elements.mobileNav) return;
        
        const isOpen = this.elements.mobileNav.classList.contains('open');
        this.elements.mobileNav.classList.toggle('open');
        
        if (this.elements.burgerMenu) {
            this.elements.burgerMenu.innerHTML = isOpen ? '☰' : '✕';
            this.elements.burgerMenu.setAttribute('aria-label', isOpen ? 'Menü öffnen' : 'Menü schließen');
        }
        
        // Animation
        if (!isOpen) {
            this.elements.mobileNav.classList.add('fade-in');
        }
    }
    
    toggleSidebar() {
        if (!this.elements.shoppingSidebar) return;
        
        const isOpen = this.elements.shoppingSidebar.classList.contains('open');
        this.elements.shoppingSidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open', !isOpen);
        
        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.style.display = isOpen ? 'none' : 'block';
        }
    }
    
    // ===== ANIMATIONS =====
    initAnimations() {
        // Intersection Observer for scroll animations
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                    }
                });
            }, { threshold: 0.1 });
            
            // Observe all cards and sections
            document.querySelectorAll('.feature-card, .product-card').forEach(el => {
                observer.observe(el);
            });
        }
    }
    
    animateAdd(itemId) {
        const itemElement = document.querySelector(`[data-id="${itemId}"]`);
        if (itemElement) {
            itemElement.classList.add('pulse');
            setTimeout(() => itemElement.classList.remove('pulse'), 600);
        }
    }
    
    // ===== UTILITIES =====
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fade-in`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    formatPrice(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ===== PRODUCTS =====
    loadProducts() {
        // Sample products - in real app would come from API
        const products = [
            { id: 1, name: 'Bio Äpfel', price: 2.99, category: 'Obst', image: 'https://via.placeholder.com/300x200/009640/fff?text=Bio+Äpfel' },
            { id: 2, name: 'Vollkornbrot', price: 1.89, category: 'Backwaren', image: 'https://via.placeholder.com/300x200/ffcc00/000?text=Vollkornbrot' },
            { id: 3, name: 'Milch 1L', price: 0.99, category: 'Milchprodukte', image: 'https://via.placeholder.com/300x200/00b74f/fff?text=Milch+1L' },
            { id: 4, name: 'Rindersteak', price: 8.99, category: 'Fleisch', image: 'https://via.placeholder.com/300x200/e30613/fff?text=Rindersteak' },
            { id: 5, name: 'Tomaten', price: 1.49, category: 'Gemüse', image: 'https://via.placeholder.com/300x200/ff6b00/fff?text=Tomaten' },
            { id: 6, name: 'Mineralwasser', price: 0.29, category: 'Getränke', image: 'https://via.placeholder.com/300x200/009640/fff?text=Mineralwasser' }
        ];
        
        if (this.elements.productGrid) {
            let html = '';
            products.forEach(product => {
                html += `
                    <div class="product-card fade-in">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}" loading="lazy">
                        </div>
                        <div class="product-info">
                            <h4 class="product-name">${product.name}</h4>
                            <div class="product-meta">
                                <span class="product-category">${product.category