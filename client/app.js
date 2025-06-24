// Global state
let messages = [];
let checkpointId = null;
// We'll initialize messages in the DOMContentLoaded event

// DOM elements
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageArea = document.getElementById('message-area');

// Initialize the chat
document.addEventListener('DOMContentLoaded', () => {
    // Set up suggestion buttons
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            messageInput.value = btn.textContent.trim();
            messageInput.focus();
        });
    });
    
    // Render initial state
    renderMessages();
});

// Handle form submission
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentMessage = messageInput.value.trim();
    
    if (currentMessage) {
        // Hide welcome container if it exists
        const welcomeContainer = document.querySelector('.welcome-container');
        if (welcomeContainer) {
            welcomeContainer.classList.add('animate-fade-out');
            setTimeout(() => {
                welcomeContainer.remove();
            }, 300);
        }
        
        // Add user message to chat
        const newMessageId = messages.length > 0 ? Math.max(...messages.map(msg => msg.id)) + 1 : 1;
        
        messages.push({
            id: newMessageId,
            content: currentMessage,
            isUser: true,
            type: 'message',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        
        // Clear input field
        messageInput.value = '';
        
        // Render updated messages
        renderMessages();
        
        try {
            // Create AI response placeholder
            const aiResponseId = newMessageId + 1;
            
            messages.push({
                id: aiResponseId,
                content: '',
                isUser: false,
                type: 'message',
                isLoading: true,
                searchInfo: {
                    stages: [],
                    query: '',
                    urls: []
                }
            });
            
            renderMessages();
            
            // Create URL with checkpoint ID if it exists
            let url = `https://perplexity-2.onrender.com/chat_stream/${encodeURIComponent(currentMessage)}`;
            
            if (checkpointId) {
                url += `?checkpoint_id=${encodeURIComponent(checkpointId)}`;
            }
            
            // Connect to SSE endpoint
            const eventSource = new EventSource(url);
            let streamedContent = '';
            let searchData = null;
            
            // Process incoming messages
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.type === 'checkpoint') {
                        // Store checkpoint ID
                        checkpointId = data.checkpoint_id;
                    }
                    else if (data.type === 'content') {
                        streamedContent += data.content;
                        
                        // Update message with accumulated content
                        const messageIndex = messages.findIndex(msg => msg.id === aiResponseId);
                        if (messageIndex !== -1) {
                            messages[messageIndex].content = streamedContent;
                            messages[messageIndex].isLoading = false;
                            renderMessages();
                        }
                    }
                    else if (data.type === 'search_start') {
                        // Create search info with 'searching' stage
                        const newSearchInfo = {
                            stages: ['searching'],
                            query: data.query,
                            urls: []
                        };
                        searchData = newSearchInfo;
                        
                        // Update AI message with search info
                        const messageIndex = messages.findIndex(msg => msg.id === aiResponseId);
                        if (messageIndex !== -1) {
                            messages[messageIndex].searchInfo = newSearchInfo;
                            messages[messageIndex].isLoading = false;
                            renderMessages();
                        }
                    }
                    else if (data.type === 'search_results') {
                        try {
                            // Parse URLs from search results
                            const urls = typeof data.urls === 'string' ? JSON.parse(data.urls) : data.urls;
                            
                            // Update search info to add 'reading' stage
                            const newSearchInfo = {
                                stages: searchData ? [...searchData.stages, 'reading'] : ['reading'],
                                query: searchData?.query || '',
                                urls: urls
                            };
                            searchData = newSearchInfo;
                            
                            // Update AI message with search info
                            const messageIndex = messages.findIndex(msg => msg.id === aiResponseId);
                            if (messageIndex !== -1) {
                                messages[messageIndex].searchInfo = newSearchInfo;
                                messages[messageIndex].isLoading = false;
                                renderMessages();
                            }
                        } catch (err) {
                            console.error('Error parsing search results:', err);
                        }
                    }
                    else if (data.type === 'search_error') {
                        // Handle search error
                        const newSearchInfo = {
                            stages: searchData ? [...searchData.stages, 'error'] : ['error'],
                            query: searchData?.query || '',
                            error: data.error,
                            urls: []
                        };
                        searchData = newSearchInfo;
                        
                        // Update AI message with search info
                        const messageIndex = messages.findIndex(msg => msg.id === aiResponseId);
                        if (messageIndex !== -1) {
                            messages[messageIndex].searchInfo = newSearchInfo;
                            messages[messageIndex].isLoading = false;
                            renderMessages();
                        }
                    }
                    else if (data.type === 'end') {
                        // When stream ends, add 'writing' stage if we had search info
                        if (searchData) {
                            const finalSearchInfo = {
                                ...searchData,
                                stages: [...searchData.stages, 'writing']
                            };
                            
                            const messageIndex = messages.findIndex(msg => msg.id === aiResponseId);
                            if (messageIndex !== -1) {
                                messages[messageIndex].searchInfo = finalSearchInfo;
                                messages[messageIndex].isLoading = false;
                                renderMessages();
                            }
                        }
                        
                        eventSource.close();
                    }
                } catch (error) {
                    console.error('Error parsing event data:', error, event.data);
                }
            };
            
            // Handle errors
            eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                eventSource.close();
                
                // Only update with error if we don't have content yet
                if (!streamedContent) {
                    const messageIndex = messages.findIndex(msg => msg.id === aiResponseId);
                    if (messageIndex !== -1) {
                        messages[messageIndex].content = 'Sorry, there was an error processing your request.';
                        messages[messageIndex].isLoading = false;
                        renderMessages();
                    }
                }
            };
            
            // Listen for end event
            eventSource.addEventListener('end', () => {
                eventSource.close();
            });
            
        } catch (error) {
            console.error('Error setting up EventSource:', error);
            messages.push({
                id: newMessageId + 1,
                content: 'Sorry, there was an error connecting to the server.',
                isUser: false,
                type: 'message',
                isLoading: false
            });
            renderMessages();
        }
    }
});

// Render messages in the message area
function renderMessages() {
    // Clear message area if there are messages to render
    if (messages.length > 0) {
        // Remove welcome container if it exists
        const welcomeContainer = document.querySelector('.welcome-container');
        if (welcomeContainer) {
            welcomeContainer.remove();
        }
        
        // Clear message area
        messageArea.innerHTML = '';
    }
    
    // Render each message
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'animate-fade-in');
        
        if (message.isUser) {
            messageElement.classList.add('user-message');
        } else {
            messageElement.classList.add('assistant-message');
        }
        
        if (message.isLoading) {
            // Show typing animation for loading messages
            messageElement.innerHTML = createTypingAnimation();
        } else {
            // Regular message content
            const contentElement = document.createElement('div');
            contentElement.classList.add('message-content');
            contentElement.innerHTML = message.content;
            messageElement.appendChild(contentElement);
            
            // Add timestamp
            if (message.timestamp) {
                const timestampElement = document.createElement('div');
                timestampElement.classList.add('message-time');
                timestampElement.textContent = message.timestamp;
                messageElement.appendChild(timestampElement);
            }
        }
        
        // Add search stages if available
        if (message.searchInfo && message.searchInfo.stages && message.searchInfo.stages.length > 0) {
            const searchStagesElement = createSearchStages(message.searchInfo);
            messageElement.appendChild(searchStagesElement);
        }
        
        messageArea.appendChild(messageElement);
    });
    
    // Scroll to bottom
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Create typing animation for loading state
function createTypingAnimation() {
    return `
        <div class="typing-animation">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
}

// Create search stages element
function createSearchStages(searchInfo) {
    const stagesContainer = document.createElement('div');
    stagesContainer.classList.add('search-stages');
    
    // Create stages display
    const stagesElement = document.createElement('div');
    stagesElement.classList.add('flex', 'mb-2', 'overflow-x-auto', 'pb-1');
    
    const stages = ['searching', 'reading', 'writing'];
    stages.forEach(stage => {
        const stageElement = document.createElement('span');
        const isActive = searchInfo.stages.includes(stage);
        stageElement.classList.add('search-stage');
        
        if (isActive) {
            stageElement.classList.add('active');
        }
        
        // Add icon based on stage
        let icon = '';
        switch(stage) {
            case 'searching':
                icon = '<i class="fas fa-search search-stage-icon"></i>';
                break;
            case 'reading':
                icon = '<i class="fas fa-book-open search-stage-icon"></i>';
                break;
            case 'writing':
                icon = '<i class="fas fa-pen search-stage-icon"></i>';
                break;
        }
        
        stageElement.innerHTML = `${icon}${stage.charAt(0).toUpperCase() + stage.slice(1)}`;
        stagesElement.appendChild(stageElement);
    });
    
    // Add error stage if present
    if (searchInfo.stages.includes('error')) {
        const errorElement = document.createElement('span');
        errorElement.classList.add('search-stage', 'bg-red-500', 'text-white');
        errorElement.innerHTML = '<i class="fas fa-exclamation-triangle search-stage-icon"></i>Error';
        stagesElement.appendChild(errorElement);
    }
    
    stagesContainer.appendChild(stagesElement);
    
    // Add query if available
    if (searchInfo.query) {
        const queryElement = document.createElement('div');
        queryElement.classList.add('mb-2', 'text-gray-600');
        queryElement.innerHTML = `<i class="fas fa-search-plus mr-1"></i> <strong>Query:</strong> ${searchInfo.query}`;
        stagesContainer.appendChild(queryElement);
    }
    
    // Add URLs if available
    if (searchInfo.urls && searchInfo.urls.length > 0) {
        const urlsElement = document.createElement('div');
        urlsElement.innerHTML = '<strong>Sources:</strong>';
        urlsElement.classList.add('mb-1', 'text-gray-600');
        stagesContainer.appendChild(urlsElement);
        
        const urlsList = document.createElement('div');
        urlsList.classList.add('search-urls', 'flex', 'flex-wrap');
        
        searchInfo.urls.forEach(url => {
            const urlElement = document.createElement('a');
            urlElement.href = url;
            urlElement.target = '_blank';
            urlElement.classList.add('search-url');
            
            // Extract domain for display
            let displayUrl;
            try {
                const urlObj = new URL(url);
                displayUrl = urlObj.hostname;
            } catch (e) {
                displayUrl = url;
            }
            
            urlElement.innerHTML = `<i class="fas fa-external-link-alt mr-1"></i>${displayUrl}`;
            urlsList.appendChild(urlElement);
        });
        
        stagesContainer.appendChild(urlsList);
    }
    
    return stagesContainer;
}

// Add keydown event listener for Enter key
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        messageForm.dispatchEvent(new Event('submit'));
    }
});