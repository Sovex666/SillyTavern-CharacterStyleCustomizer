// --- Chat Effect Selection JavaScript ---

/**
 * Stores the currently selected effect's CSS class.
 * Initialize with a default effect or null if no effect is selected by default.
 */
let currentSelectedEffectClass = null;

/**
 * Initializes the chat effect selection UI.
 * This function should be called once the DOM is loaded.
 *
 * Assumes:
 * - Effect selection elements are identifiable (e.g., by a common class like '.effect-container').
 * - Each effect selection element has a 'data-effect-class' attribute storing the CSS class for that effect.
 */
function initializeEffectSelector() {
    // Assuming your effect selection containers (from chat_effects.html) have the class 'effect-container'
    const effectSelectors = document.querySelectorAll('.effect-container');

    effectSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            // Remove 'selected' visual state from previously selected effect, if any
            const previouslySelected = document.querySelector('.effect-container.selected');
            if (previouslySelected) {
                previouslySelected.classList.remove('selected');
            }

            // Add 'selected' visual state to current selection
            this.classList.add('selected'); // You'll need to style this '.selected' class in your CSS

            // Store the selected effect class
            currentSelectedEffectClass = this.dataset.effectClass;
            console.log(`Effect selected: ${currentSelectedEffectClass}`); // For debugging
        });
    });
}

/**
 * Applies the currently selected effect to a chat message element.
 * This function should be called when a new message is being prepared for display.
 *
 * @param {HTMLElement} messageElement The chat message HTML element to apply the effect to.
 * @param {string} messageText The raw text of the message (needed for effects like "Whispered Words").
 * @returns {HTMLElement} The (potentially modified) messageElement.
 */
function applyChatEffect(messageElement, messageText) {
    if (!messageElement) {
        console.error("Message element not provided for applying chat effect.");
        return;
    }

    // Remove any existing effect classes from previous effects
    // This regex matches classes that might follow the pattern of your effect classes, e.g., ending in '-effect'
    // You might need to adjust this if your class naming convention is different.
    const effectClassPattern = /\b\S+-effect\b/g;
    messageElement.className = messageElement.className.replace(effectClassPattern, '').trim();
    // Also remove specific effect classes if they don't match the pattern but were applied
    // Example: if you have a class like 'whispered-words-text' which isn't matched by the above
    // It's safer to have a list of all possible effect classes and remove them explicitly if the pattern is too broad or too narrow.
    // For now, this generic removal should work for classes like 'charge-up-aura-effect'.


    if (currentSelectedEffectClass) {
        messageElement.classList.add(currentSelectedEffectClass);

        // --- Handle special cases for specific effects ---

        // For "Whispered Words" effect: Wrap each letter in a span
        if (currentSelectedEffectClass === 'whispered-words-text') {
            messageElement.innerHTML = ''; // Clear existing content (e.g., plain text)
            messageText.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char;
                // The CSS handles the animation delay based on nth-child,
                // but if you need more complex delays or per-character styling via JS:
                // span.style.animationDelay = `${index * 0.1}s`; // Example if CSS nth-child is not used
                messageElement.appendChild(span);
            });
        }
        // For "Floating Particles" or "Cascading Runes":
        // The CSS provided creates a few static particles/runes.
        // If dynamic particle/rune generation is desired (e.g., random positions, more particles),
        // JavaScript would be needed here to create and append those .particle or .rune elements
        // into the messageElement or a dedicated sub-container within it.
        // Example for dynamic particles (conceptual):
        /*
        if (currentSelectedEffectClass === 'floating-particles-effect') {
            // Ensure the messageElement can contain absolutely positioned particles
            // (should have position: relative or similar if not already set by the effect class)
            for (let i = 0; i < 10; i++) { // Create 10 particles
                const particle = document.createElement('div');
                particle.className = 'particle'; // Base particle class
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.animationDelay = `${Math.random() * 5}s`;
                // Add more random styles (size, color variation if not handled by p1,p2 etc. classes)
                messageElement.appendChild(particle); // Or a specific sub-container
            }
        }
        */

        // For "Pulsing Heartbeat Icon":
        // If the icon is part of the message structure itself (e.g., for a reaction or specific message type)
        // and not just a background effect. The current CSS targets '.pulsing-heart-effect .heart-icon'.
        // If the messageElement *is* the heart or contains it directly, ensure the structure matches.
        // Often, such an icon might be conditionally added to the message HTML by other logic.
        /*
        if (currentSelectedEffectClass === 'pulsing-heart-effect') {
            const heartIcon = messageElement.querySelector('.heart-icon'); // Or create if not present
            if (!heartIcon) {
                // Create and append heart SVG if it's meant to be part of this effect dynamically
                // const svgNS = "http://www.w3.org/2000/svg";
                // const newHeart = document.createElementNS(svgNS, "svg");
                // ... set attributes and path for heart ...
                // messageElement.appendChild(newHeart);
            }
        }
        */
    }
    return messageElement;
}

/**
 * Resets the chat effect selection to none.
 */
function resetChatEffect() {
    const previouslySelectedUI = document.querySelector('.effect-container.selected');
    if (previouslySelectedUI) {
        previouslySelectedUI.classList.remove('selected');
    }
    currentSelectedEffectClass = null;
    console.log("Chat effect selection reset.");
}


// --- Integration Instructions ---
/*
1.  **Include this JavaScript file in your HTML:**
    Make sure this `chat_effects.js` file is loaded in your application, typically towards the end of your `<body>` tag or with `defer` attribute.
    `<script src="path/to/chat_effects.js" defer></script>`

2.  **Initialize the Effect Selector:**
    Call `initializeEffectSelector()` after the DOM is fully loaded and the effect selection UI (from `chat_effects.html` or similar) is present on the page.
    Example:
    `document.addEventListener('DOMContentLoaded', initializeEffectSelector);`

3.  **Identify Chat Message Container:**
    Your existing chat system will have a way to create and display new messages. You need to identify the HTML element that acts as the container for each individual chat message. This is the element that the effect's CSS class will be applied to.
    Let's assume you have a function like `displayNewMessage(messageText, sender)` which creates the HTML for a new message.

4.  **Modify Your Message Sending/Displaying Logic:**
    When a new message is being prepared to be displayed:
    a.  Get the message text.
    b.  Create the basic HTML element for the message (e.g., a `<div>` with sender info and text).
        `let messageDiv = document.createElement('div');`
        `messageDiv.classList.add('chat-message'); // Your existing class for a message`
        `messageDiv.textContent = messageText; // Or set innerHTML if it contains sender, etc.`

        // Example: If your message has a specific sub-element for the content that gets effects:
        // let messageContentSpan = document.createElement('span');
        // messageContentSpan.textContent = messageText;
        // messageDiv.appendChild(messageContentSpan);

    c.  Call `applyChatEffect(messageElement, messageText)` before appending it to the chat log.
        `messageDiv = applyChatEffect(messageDiv, messageText);`
        // If you have a specific content sub-element:
        // messageContentSpan = applyChatEffect(messageContentSpan, messageText);

    d.  Append the (potentially modified) message element to your chat log container.
        `document.getElementById('chat-log-container').appendChild(messageDiv);`

    **Example of integrating `applyChatEffect`:**

    ```javascript
    // --- Example in your existing chat application logic ---
    // Function that handles sending/displaying a new message
    function handleNewMessageSend(rawMessageText) {
        // 1. Create the basic message element
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message'); // Your base class for a message

        // If the effect should only apply to the text content, not the whole message bubble:
        const messageContentElement = document.createElement('span');
        messageContentElement.classList.add('message-text-content'); // A class for the part that gets styled
        messageContentElement.textContent = rawMessageText; // Set initial text

        // 2. Apply the selected chat effect to the content part
        // The applyChatEffect function might modify messageContentElement, e.g., for whispered words
        applyChatEffect(messageContentElement, rawMessageText);

        // 3. Assemble the full message structure
        // (e.g., add sender name, timestamp, and the styled message content)
        const senderNameElement = document.createElement('strong');
        senderNameElement.textContent = "You: "; // Or the actual sender's name
        messageElement.appendChild(senderNameElement);
        messageElement.appendChild(messageContentElement); // Add the (potentially effect-modified) content

        // 4. Add the complete message to the chat display
        const chatLog = document.getElementById('chat-log'); // Assuming you have a chat log container
        if (chatLog) {
            chatLog.appendChild(messageElement);
            chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the new message
        } else {
            console.error("Chat log container not found.");
        }

        // 5. Optional: Reset effect selection after sending a message if desired
        // resetChatEffect();
        // Or, keep the effect selected for subsequent messages until changed by the user.
    }

    // Example: Hook this up to a send button
    // document.getElementById('send-button').addEventListener('click', () => {
    //     const messageInput = document.getElementById('message-input');
    //     if (messageInput.value.trim() !== '') {
    //         handleNewMessageSend(messageInput.value);
    //         messageInput.value = ''; // Clear input
    //     }
    // });
    // --- End of example integration ---
    ```

5.  **CSS Styling for `.effect-container.selected`:**
    Add some CSS to visually indicate which effect is currently selected in your UI. For example:
    ```css
    .effect-container.selected {
        border-color: #007bff; /* Example: blue border */
        box-shadow: 0 0 5px rgba(0,123,255,0.5);
    }
    ```

6.  **SVG Filter Definition:**
    Remember that the "Elemental Manifestation (Fire)" effect (class `elemental-fire-effect`) requires an SVG filter. Ensure the SVG code block (provided in `chat_effects.html` instructions) is present in your main HTML file.

7.  **Font Dependencies:**
    Ensure fonts like 'Mrs Saint Delafield' and 'MedievalSharp' are loaded if you use effects that depend on them.

This script provides the core logic. You'll need to adapt the selectors and integration points to match your specific HTML structure and existing JavaScript codebase.
*/
