/**
 * EDEKA AI Assistant Module
 * Advanced AI-powered shopping features
 */

// ===== AI ASSISTANT MODULE =====
const AIAssistant = (() => {
    let assistantActive = false;
    let conversationHistory = [];
    
    // Product database (simulated - would come from API)
    const productDatabase = {
        'milch': { name: 'Milch', category: 'dairy', price: 1.29, unit: 'Liter' },
        'brot': { name: 'Brot', category: 'bakery', price: 2.49, unit: 'Stück' },
        'eier': { name: 'Eier', category: 'dairy', price: 2.99, unit: 'Packung' },
        'käse': { name: 'Käse', category: 'dairy', price: 3.49, unit: '100g' },
        'obst': { name: 'Obst', category: 'produce', price: 0, unit: 'kg' },
        'gemüse': { name: 'Gemüse', category: 'produce', price: 0, unit: 'kg' },
        'fleisch': { name: 'Fleisch', category: 'meat', price: 0, unit: 'kg' },
        'fisch': { name: 'Fisch', category: 'seafood', price: 0, unit: 'kg' }
    };
    
    // Recipe database
    const recipes = [
        {
            id: 'pasta-carbonara',
            name: 'Pasta Carbonara',
            difficulty: 'mittel',
            time: '30 min',
            ingredients: [
                { name: 'Spaghetti', amount: '400g', category: 'pasta' },
                { name: 'Eier', amount: '4 Stück', category: 'dairy' },
                { name: 'Parmesan', amount: '100g', category: 'dairy' },
                { name: 'Speck', amount: '150g', category: 'meat' },
                { name: 'Pfeffer', amount: 'nach Geschmack', category: 'spices' }
            ],
            instructions: 'Klassische italienische Carbonara',
            tags: ['italienisch', 'schnell', 'hausmannskost']
        },
        {
            id: 'gemuesepfanne',
            name: 'Gemüsepfanne',
            difficulty: 'einfach',
            time: '25 min',
            ingredients: [
                { name: 'Gemüse', amount: '500g', category: 'produce' },
                { name: 'Reis', amount: '200g', category: 'grains' },
                { name: 'Sojasauce', amount: '3 EL', category: 'sauces' },
                { name: 'Knoblauch', amount: '2 Zehen', category: 'produce' }
            ],
            instructions: 'Asiatische Gemüsepfanne mit Reis',
            tags: ['asiatisch', 'vegetarisch', 'gesund']
        }
    ];
    
    // Initialize AI Assistant
    const init = () => {
        console.log('🤖 AI Assistant initializing...');
        
        // Create AI interface
        createAIInteface();
        
        // Load conversation history
        loadConversationHistory();
        
        console.log('✅ AI Assistant ready!');
    };
    
    // Create AI interface elements
    const createAIInteface = () => {
        // AI Assistant Button (Floating)
        const aiButton = document.createElement('button');
        aiButton.className = 'ai-assistant-btn';
        aiButton.innerHTML = '<i class="fas fa-robot"></i><span>KI-Assistent</span>';
        aiButton.setAttribute('aria-label', 'KI-Assistent öffnen');
        aiButton.onclick = toggleAssistant;
        
        // AI Chat Container
        const aiContainer = document.createElement('div');
        aiContainer.className = 'ai-chat-container';
        aiContainer.id = 'aiChatContainer';
        aiContainer.innerHTML = `
            <div class="ai-chat-header">
                <h3><i class="fas fa-robot"></i> EDEKA KI-Assistent</h3>
                <button class="ai-close-btn" onclick="AIAssistant.toggleAssistant()" aria-label="Assistent schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="ai-chat-messages" id="aiChatMessages">
                <div class="ai-message ai-bot">
                    <div class="ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="ai-content">
                        <p>Hallo! Ich bin Ihr EDEKA KI-Assistent. Wie kann ich Ihnen helfen?</p>
                        <p class="ai-suggestions">
                            Sie können mich fragen nach:
                            <button class="ai-quick-btn" onclick="AIAssistant.suggestRecipe()">Rezeptvorschlägen</button>
                            <button class="ai-quick-btn" onclick="AIAssistant.suggestShoppingList()">Einkaufslisten-Tipps</button>
                            <button class="ai-quick-btn" onclick="AIAssistant.findProduct('')">Produktsuche</button>
                        </p>
                    </div>
                </div>
            </div>
            <div class="ai-chat-input">
                <input type="text" id="aiChatInput" placeholder="Fragen Sie mich etwas..." 
                       aria-label="Nachricht an KI-Assistent">
                <button class="ai-send-btn" onclick="AIAssistant.sendMessage()" aria-label="Nachricht senden">
                    <i class="fas fa-paper-plane"></i>
                </button>
                <button class="ai-voice-btn" onclick="AIAssistant.startVoiceInput()" aria-label="Spracheingabe">
                    <i class="fas fa-microphone"></i>
                </button>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(aiButton);
        document.body.appendChild(aiContainer);
        
        // Add event listener for Enter key
        document.getElementById('aiChatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    };
    
    // Toggle AI Assistant
    const toggleAssistant = () => {
        const container = document.getElementById('aiChatContainer');
        const button = document.querySelector('.ai-assistant-btn');
        
        assistantActive = !assistantActive;
        container.classList.toggle('active');
        button.classList.toggle('active');
        
        if (assistantActive) {
            document.getElementById('aiChatInput').focus();
            trackEvent('ai_assistant_opened');
        } else {
            trackEvent('ai_assistant_closed');
        }
    };
    
    // Send message to AI
    const sendMessage = () => {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        addMessage(message, 'user');
        input.value = '';
        
        // Process message
        processMessage(message);
        
        // Save to history
        conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        saveConversationHistory();
    };
    
    // Process user message
    const processMessage = async (message) => {
        const lowerMessage = message.toLowerCase();
        
        // Show typing indicator
        showTypingIndicator();
        
        // Simulate AI processing delay
        setTimeout(() => {
            removeTypingIndicator();
            
            let response = '';
            
            // Intent recognition
            if (lowerMessage.includes('rezept') || lowerMessage.includes('kochen') || lowerMessage.includes('essen')) {
                response = handleRecipeRequest(lowerMessage);
            } else if (lowerMessage.includes('einkaufen') || lowerMessage.includes('liste') || lowerMessage.includes('kaufen')) {
                response = handleShoppingRequest(lowerMessage);
            } else if (lowerMessage.includes('produkt') || lowerMessage.includes('finden') || lowerMessage.includes('wo ist')) {
                response = handleProductSearch(lowerMessage);
            } else if (lowerMessage.includes('preis') || lowerMessage.includes('teuer') || lowerMessage.includes('kosten')) {
                response = handlePriceRequest(lowerMessage);
            } else if (lowerMessage.includes('hallo') || lowerMessage.includes('hi') || lowerMessage.includes('moin')) {
                response = 'Moin moin! Schön, dass Sie da sind. Wie kann ich Ihnen heute helfen?';
            } else {
                response = generateGenericResponse(lowerMessage);
            }
            
            // Add AI response
            addMessage(response, 'bot');
            
            // Add to history
            conversationHistory.push({
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            });
            saveConversationHistory();
            
        }, 1000 + Math.random() * 1000); // Random delay for realism
    };
    
    // Handle recipe requests
    const handleRecipeRequest = (message) => {
        // Extract keywords
        const keywords = ['vegetarisch', 'schnell', 'einfach', 'italienisch', 'asiatisch', 'gesund'];
        const foundKeywords = keywords.filter(keyword => message.includes(keyword));
        
        // Filter recipes
        let filteredRecipes = recipes;
        
        if (foundKeywords.length > 0) {
            filteredRecipes = recipes.filter(recipe => 
                recipe.tags.some(tag => foundKeywords.includes(tag))
            );
        }
        
        if (filteredRecipes.length === 0) {
            return 'Ich habe leider kein passendes Rezept gefunden. Können Sie es anders beschreiben?';
        }
        
        // Pick a random recipe
        const recipe = filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
        
        // Format response
        let response = `Ich empfehle Ihnen: **${recipe.name}**\n\n`;
        response += `⏱️ Zubereitungszeit: ${recipe.time}\n`;
        response += `📊 Schwierigkeit: ${recipe.difficulty}\n\n`;
        response += `**Zutaten:**\n`;
        
        recipe.ingredients.forEach(ing => {
            response += `• ${ing.name}: ${ing.amount}\n`;
        });
        
        response += `\n**Zubereitung:**\n${recipe.instructions}\n\n`;
        response += `Möchten Sie alle Zutaten zur Einkaufsliste hinzufügen? `;
        response += `<button class="ai-action-btn" onclick="AIAssistant.addRecipeToCart('${recipe.id}')">Ja, hinzufügen</button>`;
        
        return response;
    };
    
    // Handle shopping requests
    const handleShoppingRequest = (message) => {
        // Check for specific products
        const products = Object.keys(productDatabase);
        const mentionedProducts = products.filter(product => 
            message.includes(product) || productDatabase[product].name.toLowerCase().includes(message)
        );
        
        if (mentionedProducts.length > 0) {
            const productNames = mentionedProducts.map(p => productDatabase[p].name);
            return `Sie haben ${productNames.join(', ')} erwähnt. Möchten Sie diese zur Einkaufsliste hinzufügen?`;
        }
        
        // Generic shopping advice
        const tips = [
            "Planen Sie Ihre Mahlzeiten für die Woche, um gezielt einzukaufen.",
            "Kaufen Sie saisonales Gemüse - es ist frischer und günstiger.",
            "Überprüfen Sie vor dem Einkauf, was Sie bereits zu Hause haben.",
            "Erstellen Sie eine Liste und halten Sie sich daran, um Impulskäufe zu vermeiden.",
            "Kaufen Sie Grundnahrungsmittel in größeren Mengen, wenn sie im Angebot sind."
        ];
        
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        return `Hier ein Tipp für Sie: ${randomTip}\n\nBrauchen Sie Hilfe bei konkreten Produkten?`;
    };
    
    // Handle product search
    const handleProductSearch = (message) => {
        // Extract product name
        const products = Object.keys(productDatabase);
        const foundProduct = products.find(product => 
            message.includes(product) || productDatabase[product].name.toLowerCase().includes(message)
        );
        
        if (foundProduct) {
            const product = productDatabase[foundProduct];
            return `**${product.name}** finden Sie in der Abteilung "${getCategoryName(product.category)}".\n` +
                   `📍 Regal: ${getShelfLocation(product.category)}\n` +
                   `💰 Preis: ${product.price > 0 ? `${product.price.toFixed(2)} €/${product.unit}` : 'Preis variiert'}\n` +
                   `<button class="ai-action-btn" onclick="AIAssistant.addProductToCart('${foundProduct}')">Zur Liste hinzufügen</button>`;
        }
        
        return 'Welches Produkt suchen Sie genau? Ich helfe Ihnen gerne bei der Suche.';
    };
    
    // Handle price requests
    const handlePriceRequest = (message) => {
        const products = Object.keys(productDatabase);
        const foundProduct = products.find(product => 
            message.includes(product) || productDatabase[product].name.toLowerCase().includes(message)
        );
        
        if (foundProduct && productDatabase[foundProduct].price > 0) {
            const product = productDatabase[foundProduct];
            return `**${product.name}** kostet ${product.price.toFixed(2)} € pro ${product.unit}.`;
        }
        
        return 'Für genaue Preisinformationen schauen Sie bitte in unseren aktuellen Prospekt oder fragen Sie an der Information.';
    };
    
    // Generate generic response
    const generateGenericResponse = (message) => {
        const responses = [
            "Das ist eine interessante Frage! Können Sie etwas genauer beschreiben, wie ich Ihnen helfen kann?",
            "Ich verstehe. Bei EDEKA Niemerszein legen wir Wert auf frische Produkte und persönliche Beratung. Was genau möchten Sie wissen?",
            "Dafür habe ich leider keine spezifische Information. Könnten Sie Ihre Frage anders formulieren?",
            "Ich bin hier, um Ihnen bei Ihrem Einkauf zu helfen. Fragen Sie mich nach Rezepten, Produkten oder Einkaufstipps!",
            "Schauen Sie doch auch in unseren aktuellen Prospekt - dort finden Sie viele tolle Angebote dieser Woche!"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    };
    
    // Add message to chat
    const addMessage = (content, sender) => {
        const messagesContainer = document.getElementById('aiChatMessages');
        const messageDiv = document.createElement('div');
        
        messageDiv.className = `ai-message ai-${sender}`;
        messageDiv.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-${sender === 'bot' ? 'robot' : 'user'}"></i>
            </div>
            <div class="ai-content">
                ${formatMessageContent(content)}
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    
    // Format message content (handle HTML/buttons)
    const formatMessageContent = (content) => {
        // Convert markdown-like formatting
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        
        return formatted;
    };
    
    // Show typing indicator
    const showTypingIndicator = () => {
        const messagesContainer = document.getElementById('aiChatMessages');
        const typingDiv = document.createElement('div');
        
        typingDiv.className = 'ai-message ai-bot ai-typing';
        typingDiv.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        typingDiv.id = 'aiTypingIndicator';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    
    // Remove typing indicator
    const removeTypingIndicator = () => {
        const typingIndicator = document.getElementById('aiTypingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    };
    
    // Quick action: Suggest recipe
    const suggestRecipe = () => {
        const input = document.getElementById('aiChatInput');
        input.value = 'Kannst du mir ein Rezept vorschlagen?';
        sendMessage();
    };
    
    // Quick action: Suggest shopping list
    const suggestShoppingList = () => {
        const input = document.getElementById('aiChatInput');
        input.value = 'Hast du Tipps für meine Einkaufsliste?';
        sendMessage();
    };
    
    // Quick action: Find product
    const findProduct = (productName) => {
        const input = document.getElementById('aiChatInput');
        if (productName) {
            input.value = `Wo finde ich ${productName}?`;
        } else {
            input.value = 'Ich suche ein Produkt';
        }
        sendMessage();
    };
    
    // Add recipe to shopping cart
    const addRecipeToCart = (recipeId) => {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return;
        
        recipe.ingredients.forEach(ingredient => {
            // Find product in database
            const productKey = Object.keys(productDatabase).find(key => 
                productDatabase[key].name.toLowerCase() === ingredient.name.toLowerCase()
            );
            
            if (productKey) {
                const product = productDatabase[productKey];
                EdekaApp.addItem({
                    title: product.name,
                    price: product.price,
                    category: product.category,
                    quantity: 1
