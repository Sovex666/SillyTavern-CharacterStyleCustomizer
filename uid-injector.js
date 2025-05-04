/**
 * Character Style UID Injector
 * Handles message identification and UID injection for style customization
 */

import { EventEmitter } from "../../../../lib/eventemitter.js";

// Export event source for others to listen to
export const cssEventSource = new EventEmitter();

// Define event types
export const css_event_type = {
    MESSAGE_ADDED: "message_added",
    MESSAGE_REMOVED: "message_removed",
};

// Character type enum
export const CharacterType = {
    CHARACTER: "character",
    PERSONA: "persona",
};

/**
 * Extract avatar filename from image URL
 * @param {string} url The image URL
 * @returns {string} Extracted filename
 */
export function extractAvatarFilename(url) {
    if (!url) return '';

    // Handle thumbnail URLs
    if (url.includes('thumbnail?type=avatar&file=')) {
        try {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const filename = urlParams.get('file');
            return filename ? decodeURIComponent(filename) : '';
        } catch (error) {
            console.error('[CSC] Error parsing thumbnail URL:', error);
        }
    }

    // Handle base64 images
    if (url.startsWith('data:')) {
        return 'base64-image';
    }

    // Handle direct file paths
    const lastSlashIndex = url.lastIndexOf('/');
    let filename = lastSlashIndex !== -1 ? url.substring(lastSlashIndex + 1) : url;

    // Remove any query parameters
    const queryParamIndex = filename.indexOf('?');
    if (queryParamIndex !== -1) {
        filename = filename.substring(0, queryParamIndex);
    }

    return filename;
}

/**
 * Get avatar filename from image src
 * @param {string} charType Character type
 * @param {string} imageSrc Image source URL
 * @returns {string|null} Avatar filename or null
 */
export function getAvatarFileNameFromImgSrc(charType, imageSrc) {
    let split = imageSrc.split('/').pop();
    if (charType === CharacterType.CHARACTER) {
        const charThumbRegexp = /\?type=avatar&file=(.*)/i;
        const charMatch = split.match(charThumbRegexp)?.at(1);
        return charMatch ? decodeURIComponent(charMatch) : split;
    } else if (charType === CharacterType.PERSONA) {
        return split;
    }
    return null;
}

/**
 * Get the current character info being edited in the character card
 * @returns {Object|null} Character info or null
 */
export function getCurrentEditingCharacterInfo() {
    const charNameElem = document.querySelector('#rm_button_selected_ch h2');
    const avatarElem = document.getElementById('avatar_load_preview');
    const nameInput = document.getElementById('character_name_pole');

    if (!avatarElem) {
        return null;
    }

    // First try to get name from name input (more reliable)
    let charName = nameInput ? nameInput.value.trim() : '';

    // If that fails, try to get from header
    if (!charName && charNameElem) {
        charName = charNameElem.textContent.trim();
    }

    const avatarSrc = avatarElem.getAttribute('src');
    const avatarFilename = extractAvatarFilename(avatarSrc);

    if (!avatarFilename) {
        return null;
    }

    // Standardize character name by removing extension
    const cleanedName = charName.replace(/\.[^/.]+$/, "");

    return {
        id: `${CharacterType.CHARACTER}|${cleanedName}|${avatarFilename}`,
        name: cleanedName,
        avatar: avatarFilename
    };
}

/**
 * Get UID for a message author
 * @param {HTMLElement} message Message element
 * @returns {string|null} Author UID or null
 */
export function getMessageAuthorUid(message) {
    const avatarThumbImg = message.querySelector(".mesAvatarWrapper > .avatar > img");
    if (!avatarThumbImg) return null;

    const avatarThumbSrc = avatarThumbImg.getAttribute("src");
    if (!avatarThumbSrc) return null;

    const isUser = message.getAttribute("is_user") === "true";

    // Get character name from message
    const nameElement = message.querySelector(".name_text");
    const charName = nameElement ? nameElement.textContent.trim() : null;

    const charType = isUser ? CharacterType.PERSONA : CharacterType.CHARACTER;
    const avatarFileName = getAvatarFileNameFromImgSrc(charType, avatarThumbSrc);

    if (!avatarFileName) return null;

    // Clean up the name for character type
    const cleanedName = charType === CharacterType.CHARACTER ?
        charName?.replace(/\.[^/.]+$/, "") : charName;

    return `${charType}|${cleanedName || ''}|${avatarFileName}`;
}

/**
 * Process a message to add character identification
 * @param {HTMLElement} message Message element
 * @returns {boolean} Success flag
 */
export function addAuthorUidToMessage(message) {
    const authorUidAttr = "csc-author-uid";
    if (message.hasAttribute(authorUidAttr)) {
        return true; // Already processed
    }

    const messageAuthorUid = getMessageAuthorUid(message);
    if (!messageAuthorUid) {
        console.error("[CSC] Couldn't get message author UID.");
        return false;
    }

    message.setAttribute(authorUidAttr, messageAuthorUid);
    return true;
}

/**
 * Process all messages in the chat
 * @returns {number} Number of processed messages
 */
export function processAllMessages() {
    const messages = document.querySelectorAll('#chat .mes');
    messages.forEach(addAuthorUidToMessage);
    return messages.length;
}

/**
 * Set up message observer
 * @param {Function} onStyleUpdate Callback when styles need updating
 * @returns {MutationObserver|null} Observer or null
 */
export function setupMessageObserver(onStyleUpdate) {
    const chatContainer = document.getElementById('chat');
    if (!chatContainer) return null;

    // Observer for chat messages
    const observer = new MutationObserver((mutations) => {
        let processNeeded = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1 && node.classList.contains('mes')) {
                        cssEventSource.emit(css_event_type.MESSAGE_ADDED, node);
                        addAuthorUidToMessage(node);
                        processNeeded = true;
                    }
                }

                for (const node of mutation.removedNodes) {
                    if (node.nodeType === 1 && node.classList.contains('mes')) {
                        cssEventSource.emit(css_event_type.MESSAGE_REMOVED, node);
                    }
                }
            }
        }

        if (processNeeded && typeof onStyleUpdate === 'function') {
            onStyleUpdate();
        }
    });

    observer.observe(chatContainer, { childList: true });
    return observer;
}
