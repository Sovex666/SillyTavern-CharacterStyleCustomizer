// --- Global Initializations & Library Loading ---

// 1. Sentiment Analysis Library
// Dynamically load the sentiment library and instantiate the analyzer.
const sentimentScript = document.createElement('script');
sentimentScript.src = 'https://cdn.jsdelivr.net/npm/sentiment@5/lib/index.js';
sentimentScript.onload = () => {
    window.sentimentAnalyzer = new Sentiment(); // Global sentiment analyzer instance
    console.log("Sentiment library loaded and analyzer instantiated.");
};
document.head.appendChild(sentimentScript);

// 2. Houdini Paint Worklet for Generative Backgrounds
// Check for browser support and register the worklet.
if (window.CSS && CSS.paintWorklet) {
    CSS.paintWorklet.addModule('generative-background-worklet.js')
        .then(() => console.log('Generative background paint worklet registered.'))
        .catch(err => console.error('Error registering generative background paint worklet:', err));
} else {
    console.warn('CSS Paint API (Houdini) is not supported in this browser.');
}


// --- Lottie Animation Processing ---

/**
 * Processes the HTML content of a message element to find keywords (e.g., /fire)
 * and replace them with Lottie animation containers.
 * @param {HTMLElement} messageElement - The HTML element whose innerHTML is to be processed.
 *                                      It's assumed this element is either in the DOM or will be
 *                                      immediately after this function so Lottie can find its containers.
 */
function processMessageForLottie(messageElement) {
    if (!window.lottie) { // Check if Lottie library is loaded
        console.warn("Lottie library (window.lottie) not available. Skipping Lottie processing.");
        return;
    }
    if (!messageElement) {
        console.warn("Message element not provided for Lottie processing.");
        return;
    }

    let currentContent = messageElement.innerHTML;
    let newContent = currentContent;
    let animationsToLoad = []; // Store details for animations to be loaded after HTML modification

    // Define keywords and their corresponding Lottie animation paths and container ID prefixes.
    const lottieKeywords = {
        "/fire": { path: 'animations/fire.json', idPrefix: 'lottie-fire-', style: "display: inline-block; width: 30px; height: 30px; vertical-align: middle;" },
        "/magic": { path: 'animations/magic.json', idPrefix: 'lottie-magic-', style: "display: inline-block; width: 30px; height: 30px; vertical-align: middle;" }
        // Add more keywords: e.g., "/smile": { path: 'animations/smile.json', ... }
    };

    // Iterate over keywords to find and replace them with placeholder divs.
    // This uses a loop and indexOf to handle multiple occurrences of the same keyword.
    for (const keyword in lottieKeywords) {
        let startIndex = 0;
        while (newContent.includes(keyword, startIndex)) { // Check if keyword exists from startIndex
            startIndex = newContent.indexOf(keyword, startIndex); // Find its position
            if (startIndex === -1) break; // Should not happen if includes is true, but as a safeguard

            const lottieContainerId = `${lottieKeywords[keyword].idPrefix}${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const placeholderDiv = `<div id="${lottieContainerId}" style="${lottieKeywords[keyword].style}"></div>`;

            newContent = newContent.substring(0, startIndex) + placeholderDiv + newContent.substring(startIndex + keyword.length);

            animationsToLoad.push({
                containerId: lottieContainerId,
                path: lottieKeywords[keyword].path
            });

            startIndex += placeholderDiv.length; // Move past the inserted div to avoid infinite loops
        }
    }

    // If content was changed, update the message element's HTML.
    if (newContent !== currentContent) {
        messageElement.innerHTML = newContent;

        // After innerHTML is updated, load the Lottie animations into their containers.
        animationsToLoad.forEach(animData => {
            // Query within the modified messageElement for the specific container.
            const containerElement = messageElement.querySelector(`#${animData.containerId}`);
            if (containerElement) {
                // Check if animation is already loaded for this div to prevent double loading.
                if (containerElement.dataset.lottieLoaded) return;

                try {
                    lottie.loadAnimation({
                        container: containerElement,
                        renderer: 'svg',
                        loop: false,
                        autoplay: true,
                        path: animData.path
                    });
                    containerElement.dataset.lottieLoaded = 'true'; // Mark as loaded.
                    console.log(`Lottie animation loading for ${animData.path} into #${animData.containerId}`);
                } catch (e) {
                    console.error(`Error loading Lottie animation for ${animData.path}:`, e);
                }
            } else {
                console.warn(`Lottie container #${animData.containerId} not found after innerHTML update.`);
            }
        });
    }
}


// --- Chat Effect Core Logic ---

/**
 * Stores the CSS class of the currently selected chat effect.
 * Null if no effect is selected.
 */
let currentSelectedEffectClass = null;

/**
 * Initializes the chat effect selection UI.
 * This function should be called once the DOM is loaded.
 * It adds click listeners to elements with class 'effect-container'.
 */
function initializeEffectSelector() {
    const effectSelectors = document.querySelectorAll('.effect-container');
    effectSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            const previouslySelected = document.querySelector('.effect-container.selected');
            if (previouslySelected) {
                previouslySelected.classList.remove('selected');
            }
            this.classList.add('selected');
            currentSelectedEffectClass = this.dataset.effectClass;
            console.log(`Chat Effect selected: ${currentSelectedEffectClass}`);
        });
    });
}

/**
 * Applies the currently selected chat effect, Lottie animations, and sentiment styles
 * to a given chat message's content element.
 *
 * @param {HTMLElement} messageContentElement - The HTML element that will contain the message text and inline effects (e.g., a <span>).
 * @param {string} rawMessageText - The raw text content of the message.
 * @param {HTMLElement} messageBubbleElement - The main message bubble element, used for sentiment borders.
 */
function applyChatEffectsPipeline(messageContentElement, rawMessageText, messageBubbleElement) {
    if (!messageContentElement || !messageBubbleElement) {
        console.error("Message content or bubble element not provided for applying effects.");
        return;
    }

    // 1. Clean up any old effect classes from the message content element.
    const effectClassPattern = /\b\S+-effect\b/g; // Matches classes like 'some-effect'
    messageContentElement.className = messageContentElement.className.replace(effectClassPattern, '').trim();
    messageContentElement.classList.add('message-text-content'); // Ensure base class is present

    // 2. Apply sentiment-based styles (e.g., borders) to the main message bubble.
    if (window.sentimentAnalyzer) {
        applySentimentStyles(messageBubbleElement, rawMessageText);
    } else {
        console.warn("Sentiment analyzer (window.sentimentAnalyzer) not available yet for sentiment styling.");
    }

    // 3. Prepare initial HTML content in messageContentElement.
    // Special handling for effects that define their own HTML structure from raw text, like "Whispered Words".
    if (currentSelectedEffectClass === 'whispered-words-text') {
        messageContentElement.innerHTML = ''; // Clear for Whispered Words
        rawMessageText.split('').forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char;
            messageContentElement.appendChild(span);
        });
    } else {
        // For other effects, or if no specific text-altering effect is selected,
        // set the raw text as the content. Lottie processing will then parse this.
        messageContentElement.textContent = rawMessageText;
    }

    // 4. Process for Lottie animations.
    // This will parse messageContentElement.innerHTML, replace keywords, and load animations.
    processMessageForLottie(messageContentElement);

    // 5. Add the main selected effect class (if any) to the messageContentElement.
    // This applies CSS-driven visual effects. For 'whispered-words-text',
    // this adds the class that makes the previously created spans animate.
    if (currentSelectedEffectClass) {
        messageContentElement.classList.add(currentSelectedEffectClass);
        // Add any other JS logic for specific effects if needed beyond CSS class.
    }
}


/**
 * Resets the chat effect selection to none, clearing the stored effect class
 * and removing the 'selected' state from the UI.
 */
function resetChatEffect() {
    const previouslySelectedUI = document.querySelector('.effect-container.selected');
    if (previouslySelectedUI) {
        previouslySelectedUI.classList.remove('selected');
    }
    currentSelectedEffectClass = null;
    console.log("Chat effect selection reset.");
}


// --- Integration & Testing Setup ---

/**
 * Example function to handle sending/displaying a new message for testing purposes.
 * This demonstrates how to use `applyChatEffectsPipeline`.
 * @param {string} rawMessageText - The raw text of the message to display.
 * @param {string} [sender="User"] - The sender of the message.
 * @param {string[]} [bubbleClasses=[]] - Array of CSS classes to add to the main message bubble (e.g., 'generative-background').
 */
function handleNewMessageSendForTesting(rawMessageText, sender = "User", bubbleClasses = []) {
    const chatLog = document.getElementById('chat-log-container');
    if (!chatLog) {
        console.error("#chat-log-container not found. Cannot display message.");
        return;
    }

    // Create the main message bubble element. This will get sentiment borders and custom backgrounds.
    const messageBubbleElement = document.createElement('div');
    messageBubbleElement.classList.add('chat-message'); // Basic class for all messages
    bubbleClasses.forEach(cls => messageBubbleElement.classList.add(cls));

    // Create the content span element. This will hold the text and inline effects like Lottie, Whispered Words.
    const messageContentElement = document.createElement('span');
    // `applyChatEffectsPipeline` will add 'message-text-content' and other effect classes.

    // Apply all effects via the pipeline.
    applyChatEffectsPipeline(messageContentElement, rawMessageText, messageBubbleElement);

    // Assemble the full message structure (e.g., add sender name).
    const senderNameElement = document.createElement('strong');
    senderNameElement.textContent = `${sender}: `;
    messageBubbleElement.appendChild(senderNameElement);
    messageBubbleElement.appendChild(messageContentElement); // Add the processed content

    // Add the complete message to the chat display.
    chatLog.appendChild(messageBubbleElement);
    chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the new message
}

// Initialize effect selector and run example messages when DOM is loaded.
document.addEventListener('DOMContentLoaded', () => {
    initializeEffectSelector();
    console.log("DOM fully loaded. Initializing examples.");

    // Example messages to test features:
    setTimeout(() => handleNewMessageSendForTesting("Hello world! This is a neutral message."), 500);
    setTimeout(() => handleNewMessageSendForTesting("I am so happy and positive! This is great! :)"), 1000);
    setTimeout(() => handleNewMessageSendForTesting("This is terrible, I feel quite negative about this. :("), 1500);

    // Test Houdini background - apply class directly to the message bubble
    setTimeout(() => {
        handleNewMessageSendForTesting("This message has a generative background!", "System", ["generative-background"]);
    }, 2000);

    // Test Lottie animations
    setTimeout(() => handleNewMessageSendForTesting("Time for some /fire effects and then some /magic! Should be fun /fire /fire."), 2500);

    // Test Whispered Words effect (selects the effect, then sends message)
    setTimeout(() => {
        // Simulate selecting "Whispered Words"
        const whisperEffectSelector = document.querySelector('[data-effect-class="whispered-words-text"]');
        if (whisperEffectSelector) whisperEffectSelector.click();

        handleNewMessageSendForTesting("These are whispered words with a /magic spell.", "Whisperer");
        // resetChatEffect(); // Optionally reset effect selection
    }, 3000);

    setTimeout(() => {
        if (currentSelectedEffectClass === 'whispered-words-text') resetChatEffect(); // Reset if whisper was selected
        handleNewMessageSendForTesting("Another /fire test just to be sure. No other effects selected here."), 3500
    });
    setTimeout(() => handleNewMessageSendForTesting("This is a normal message again after all effects."), 4000);

    // Mood Tracker examples will run based on their own setTimeout calls.
});


// --- Sentiment Analysis Styling Function ---

/**
 * Applies sentiment-based styling to a message element (typically the main bubble).
 * @param {HTMLElement} messageBubbleElement - The HTML element of the message bubble.
 * @param {string} messageText - The text content of the message to analyze for sentiment.
 */
function applySentimentStyles(messageBubbleElement, messageText) {
    if (!messageBubbleElement) {
        console.warn("Message bubble element not provided for sentiment styling.");
        return;
    }
    if (!window.sentimentAnalyzer) { // Check if sentiment analyzer is loaded
        console.warn("Sentiment analyzer (window.sentimentAnalyzer) not available. Skipping sentiment styling.");
        return;
    }

    const sentimentResult = window.sentimentAnalyzer.analyze(messageText);
    const score = sentimentResult.score;

    // Remove any existing sentiment border classes
    messageBubbleElement.classList.remove('positive-sentiment-border', 'negative-sentiment-border', 'neutral-sentiment-border');

    // Apply new class based on sentiment score
    if (score > 0) {
        messageBubbleElement.classList.add('positive-sentiment-border');
    } else if (score < 0) {
        messageBubbleElement.classList.add('negative-sentiment-border');
    } else {
        messageBubbleElement.classList.add('neutral-sentiment-border');
    }
    // console.log(`Sentiment for "${messageText}": ${score}`, messageBubbleElement.classList);
}

// --- Mood Tracker Bar JavaScript ---

/**
 * Updates the Mood Tracker Bar's fill percentage and color based on the current mood.
 * @param {number} percentage - A value between 0 and 100 representing the fill level.
 * @param {string} mood - A string (e.g., "positive", "negative", "neutral") to determine the gradient color.
 */
function updateMoodTracker(percentage, mood) {
    const moodFillElement = document.querySelector('.mood-tracker-fill');
    if (!moodFillElement) { // Check if the mood tracker element exists in the DOM
        console.error('.mood-tracker-fill element not found in the DOM.');
        return;
    }

    // Clamp percentage to be within 0-100 for valid CSS width
    const validPercentage = Math.max(0, Math.min(100, percentage));
    moodFillElement.style.width = `${validPercentage}%`;

    // Define gradients for different moods
    let gradient = '';
    switch (mood.toLowerCase()) { // Convert mood to lowercase for case-insensitive matching
        case 'positive':
            gradient = 'linear-gradient(to right, #a8e063, #56ab2f)'; // Greenish gradient
            break;
        case 'negative':
            gradient = 'linear-gradient(to right, #ff7e5f, #feb47b)'; // Reddish-Orange gradient
            break;
        case 'neutral':
        default: // Default to neutral if mood is unrecognized or not specified
            gradient = 'linear-gradient(to right, #ffb347, #ffcc33)'; // Orange-Yellow gradient
            break;
    }
    moodFillElement.style.backgroundImage = gradient; // Apply the chosen gradient

    console.log(`Mood Tracker updated: ${validPercentage}% width, mood: ${mood}`);
}

// Example calls to demonstrate Mood Tracker functionality.
// These will run after the DOM is fully loaded and a short delay.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM fully loaded and parsed for Mood Tracker examples.");
        setTimeout(() => updateMoodTracker(75, "positive"), 2000);
        setTimeout(() => updateMoodTracker(25, "negative"), 4000);
        setTimeout(() => updateMoodTracker(50, "neutral"), 6000);
    });
} else {
    console.log("DOM already loaded for Mood Tracker examples.");
    setTimeout(() => updateMoodTracker(75, "positive"), 2000);
    setTimeout(() => updateMoodTracker(25, "negative"), 4000);
    setTimeout(() => updateMoodTracker(50, "neutral"), 6000);
}

// (The old "Integration Instructions" comments block can be removed if this file is considered complete for its purpose)
// For this task, I'll leave them as they might still offer context on how this script was envisioned to be used.
// However, the new `handleNewMessageSendForTesting` and `applyChatEffectsPipeline` are now the primary examples.
