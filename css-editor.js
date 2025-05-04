/**
 * FullScreen CSS Editor for SillyTavern-CharStyleCustomizer
 */

// Debounce function to limit function calls
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            func.apply(context, args);
        }, wait);
    };
}

// Create collapsible help section for CSS examples
function createCssHelpSection(type = 'message') {
    const container = document.createElement('div');
    container.className = 'csc-help-container';

    const header = document.createElement('div');
    header.className = 'csc-help-header';
    header.innerHTML = `<i class="fa fa-info-circle"></i> <span class="csc-help-title">How to use ${type} CSS?</span> <i class="fa fa-chevron-down csc-help-chevron"></i>`;

    const content = document.createElement('div');
    content.className = 'csc-help-content';

    if (type === 'message') {
        content.innerHTML = `
        <p>You can style this character's messages with custom CSS properties. You don't need to use any selectors—the CSS is automatically scoped to the character's messages.</p>

        <div class="csc-example-block">
            <div class="csc-example-title">Basic styling:</div>
            <pre>font-style: italic;
text-shadow: 0 0 3px rgba(255, 106, 149, 0.3);</pre>
        </div>

        <div class="csc-example-block">
            <div class="csc-example-title">Target specific elements:</div>
            <pre>.avatar {
    border: 1px solid #ff6a95 !important;
}
.name_text {
    font-family: 'Georgia', serif;
}</pre>
        </div>
        `;
    } else if (type === 'global') {
        content.innerHTML = `
        <p>Global CSS affects the entire page while this character is active. Use with caution as it can affect UI elements.</p>

        <div class="csc-example-block">
            <div class="csc-example-title">Change UI elements:</div>
            <pre>.drawer-content {
    border-top: 1px solid var(--csc-primary);
}</pre>
        </div>
        `;
    }

    // Set up toggle behavior
    header.addEventListener('click', () => {
        content.classList.toggle('expanded');
        const chevron = header.querySelector('.csc-help-chevron');
        if (content.classList.contains('expanded')) {
            chevron.className = 'fa fa-chevron-up csc-help-chevron';
        } else {
            chevron.className = 'fa fa-chevron-down csc-help-chevron';
        }
    });

    container.appendChild(header);
    container.appendChild(content);
    return container;
}

// Create full-screen CSS editor panel (ST style)
function createFullScreenCssEditor() {
    // Check if editor already exists
    if (document.getElementById('csc-fullscreen-editor')) {
        return document.getElementById('csc-fullscreen-editor');
    }

    // Use draggable template from ST
    const draggableTemplate = document.getElementById('generic_draggable_template');
    if (!draggableTemplate) {
        console.warn('[CSC] Draggable template not found. Using fallback editor.');
        return createFallbackEditor();
    }

    // Clone template
    const fragment = draggableTemplate.content.cloneNode(true);
    const draggable = fragment.querySelector('.draggable');
    const closeButton = fragment.querySelector('.dragClose');

    if (!draggable || !closeButton) {
        console.warn('[CSC] Failed to find draggable or close button. Using fallback editor.');
        return createFallbackEditor();
    }

    // Setup editor panel
    draggable.id = 'csc-fullscreen-editor';
    draggable.classList.add('csc-fullscreen-editor');

    // Create editor container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'csc-editor-container';

    // Create textarea for editing
    const textarea = document.createElement('textarea');
    textarea.id = 'csc-fullscreen-textarea';
    textarea.className = 'text_pole';
    textarea.wrap = 'off'; // Disable line wrapping for code

    // Create help sections container
    const helpContainer = document.createElement('div');
    helpContainer.className = 'csc-editor-help-container';

    // Add message CSS help section
    helpContainer.appendChild(createCssHelpSection('message'));

    // Add global CSS help section
    helpContainer.appendChild(createCssHelpSection('global'));

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'csc-editor-buttons';

    // Create save button
    const saveButton = document.createElement('button');
    saveButton.className = 'menu_button';
    saveButton.innerHTML = '<i class="fa-solid fa-save"></i> Apply';
    saveButton.id = 'csc-editor-save';

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'menu_button';
    cancelButton.innerHTML = '<i class="fa-solid fa-times"></i> Close';
    cancelButton.id = 'csc-editor-cancel';

    // Add real-time sync status indicator
    const syncIndicator = document.createElement('div');
    syncIndicator.className = 'csc-sync-indicator';
    syncIndicator.innerHTML = '<i class="fa-solid fa-sync"></i> Real-time sync enabled';
    syncIndicator.style.fontSize = '0.8rem';
    syncIndicator.style.opacity = '0.7';
    syncIndicator.style.marginRight = 'auto';
    syncIndicator.style.padding = '0 10px';

    // Assemble all components
    buttonsContainer.appendChild(syncIndicator);
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);

    editorContainer.appendChild(helpContainer);
    editorContainer.appendChild(textarea);
    editorContainer.appendChild(buttonsContainer);
    draggable.appendChild(editorContainer);

    // Get the movingDivs container
    const movingDivs = document.getElementById('movingDivs');
    if (!movingDivs) {
        console.warn('[CSC] Moving divs container not found. Using fallback editor.');
        return createFallbackEditor();
    }

    // Add editor to DOM
    movingDivs.appendChild(draggable);

    // Setup close button
    closeButton.addEventListener('click', hideFullScreenEditor);
    cancelButton.addEventListener('click', hideFullScreenEditor);

    // Add keyboard shortcut for save (Ctrl+S)
    textarea.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            document.getElementById('csc-editor-save').click();
        }
    });

    return draggable;
}

// Create a fallback editor if the draggable template is not available
function createFallbackEditor() {
    // Check if editor already exists
    if (document.getElementById('csc-fullscreen-editor')) {
        return document.getElementById('csc-fullscreen-editor');
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'csc-fullscreen-editor';
    overlay.className = 'csc-fallback-editor-overlay';
    overlay.style.display = 'none';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'csc-fallback-editor-modal';

    // Create header
    const header = document.createElement('div');
    header.className = 'csc-fallback-editor-header';

    const title = document.createElement('div');
    title.className = 'csc-fallback-editor-title';
    title.textContent = 'CSS Editor';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'csc-fallback-editor-close';
    closeBtn.innerHTML = '&times;';

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create help sections
    const helpContainer = document.createElement('div');
    helpContainer.className = 'csc-editor-help-container';

    // Add message CSS help section
    helpContainer.appendChild(createCssHelpSection('message'));

    // Add global CSS help section
    helpContainer.appendChild(createCssHelpSection('global'));

    // Create textarea
    const textarea = document.createElement('textarea');
    textarea.id = 'csc-fullscreen-textarea';
    textarea.className = 'text_pole';
    textarea.style.flex = '1';
    textarea.style.margin = '10px 0';

    // Create buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'csc-editor-buttons';

    // Add real-time sync status indicator
    const syncIndicator = document.createElement('div');
    syncIndicator.className = 'csc-sync-indicator';
    syncIndicator.innerHTML = '<i class="fa-solid fa-sync"></i> Real-time sync enabled';
    syncIndicator.style.fontSize = '0.8rem';
    syncIndicator.style.opacity = '0.7';
    syncIndicator.style.marginRight = 'auto';
    syncIndicator.style.padding = '0 10px';

    const saveButton = document.createElement('button');
    saveButton.id = 'csc-editor-save';
    saveButton.className = 'menu_button';
    saveButton.innerHTML = '<i class="fa-solid fa-save"></i> Apply Changes';

    const cancelButton = document.createElement('button');
    cancelButton.id = 'csc-editor-cancel';
    cancelButton.className = 'menu_button';
    cancelButton.innerHTML = '<i class="fa-solid fa-times"></i> Close';

    buttonsContainer.appendChild(syncIndicator);
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(saveButton);

    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(helpContainer);
    modal.appendChild(textarea);
    modal.appendChild(buttonsContainer);
    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    // Add event listeners
    closeBtn.addEventListener('click', hideFullScreenEditor);
    cancelButton.addEventListener('click', hideFullScreenEditor);

    // Add keyboard shortcut for save (Ctrl+S)
    textarea.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            document.getElementById('csc-editor-save').click();
        }
    });

    return overlay;
}

// Keep track of the current source textarea for real-time sync
let currentSourceTextarea = null;

// Real-time sync handler with debounce to improve performance
const syncToSourceDebounced = debounce(function(event) {
    if (!currentSourceTextarea) return;

    const editorTextarea = event.target;
    currentSourceTextarea.value = editorTextarea.value;

    // Dispatch input event to trigger any event listeners on the source textarea
    currentSourceTextarea.dispatchEvent(new Event('input'));

    // Visual indicator of sync (optional)
    const syncIndicator = document.querySelector('.csc-sync-indicator i');
    if (syncIndicator) {
        syncIndicator.className = 'fa-solid fa-check';
        setTimeout(() => {
            syncIndicator.className = 'fa-solid fa-sync';
        }, 500);
    }
}, 300); // Debounce delay in milliseconds

// Show full screen editor with content from a source textarea
function showFullScreenEditor(sourceTextarea, saveCallback) {
    let editorPanel = document.getElementById('csc-fullscreen-editor');

    if (!editorPanel) {
        editorPanel = createFullScreenCssEditor();
    }

    // Store reference to current source textarea for real-time sync
    currentSourceTextarea = sourceTextarea;

    // Get the editor textarea
    const editorTextarea = document.getElementById('csc-fullscreen-textarea');
    if (!editorTextarea) {
        console.error('[CSC] Editor textarea not found');
        return;
    }

    // Clone textarea to remove existing event listeners
    const newTextarea = editorTextarea.cloneNode(true);
    editorTextarea.parentNode.replaceChild(newTextarea, editorTextarea);

    // Get the fresh textarea reference
    const updatedTextarea = document.getElementById('csc-fullscreen-textarea');

    // Copy content from source textarea
    updatedTextarea.value = sourceTextarea.value;

    // Add real-time synchronization
    updatedTextarea.addEventListener('input', syncToSourceDebounced);

    // Setup save button
    const saveButton = document.getElementById('csc-editor-save');
    if (saveButton) {
        // Remove existing event listeners
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);

        // Add new event listener
        newSaveButton.addEventListener('click', () => {
            // Make sure we have the latest content
            sourceTextarea.value = updatedTextarea.value;
            // Dispatch input event to trigger any event listeners on the source textarea
            sourceTextarea.dispatchEvent(new Event('input'));
            if (saveCallback && typeof saveCallback === 'function') {
                saveCallback();
            }
            hideFullScreenEditor();
        });
    }

    // Show the editor
    editorPanel.classList.add('visible');
    editorPanel.style.display = 'block';

    // Focus the textarea
    setTimeout(() => {
        updatedTextarea.focus();
    }, 100);
}

// Hide full screen editor
function hideFullScreenEditor() {
    const editorPanel = document.getElementById('csc-fullscreen-editor');
    if (editorPanel) {
        editorPanel.classList.remove('visible');
        editorPanel.style.display = 'none';
    }

    // Clear current source textarea reference
    currentSourceTextarea = null;
}

// Add edit button to CSS fields (optimized)
function addEditButtonToCssFields() {
    const fieldIds = [
        'character-custom-css',
        'character-global-css',
        'card-custom-css',
        'card-global-css',
        'persona-custom-css',
        'persona-global-css'
    ];

    const titles = {
        'character-custom-css': 'Message CSS',
        'character-global-css': 'Global CSS',
        'card-custom-css': 'Message CSS',
        'card-global-css': 'Global CSS',
        'persona-custom-css': 'Persona Message CSS',
        'persona-global-css': 'Persona Global CSS'
    };

    for (const fieldId of fieldIds) {
        const textarea = document.getElementById(fieldId);
        if (!textarea) continue;

        // Skip if button already exists
        if (textarea.nextElementSibling && textarea.nextElementSibling.classList.contains('csc-edit-button-container')) {
            continue;
        }

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'csc-edit-button-container';

        // Create edit button
        const editButton = document.createElement('button');
        editButton.className = 'menu_button csc-edit-button';
        editButton.innerHTML = '<i class="fa-solid fa-expand"></i> Edit in Full Screen';
        editButton.title = `Edit ${titles[fieldId] || 'CSS'} in full screen`;

        // Add click handler
        editButton.addEventListener('click', (e) => {
            e.preventDefault();
            showFullScreenEditor(textarea);
        });

        // Add button to container
        buttonContainer.appendChild(editButton);

        // Insert after textarea
        textarea.parentNode.insertBefore(buttonContainer, textarea.nextSibling);
    }
}

// Initialize full screen editor functionality
function initFullScreenEditor() {

    // Add edit buttons to visible CSS fields
    addEditButtonToCssFields();

    // Setup a lightweight mutation observer that only targets specific containers
    const targetContainers = [
        // Character-specific settings
        '#character-specific-settings',
        // Character card
        '#cs-card-option',
        // Persona settings
        '#cs-persona-style-option'
    ];

    // Observe only specific containers
    targetContainers.forEach(selector => {
        const container = document.querySelector(selector);
        if (container) {
            const observer = new MutationObserver(debounce(() => {
                addEditButtonToCssFields();
            }, 500));

            observer.observe(container, {
                childList: true,
                subtree: true
            });
        }
    });

    // Also check periodically but not too frequently
    const interval = setInterval(() => {
        addEditButtonToCssFields();
    }, 3000);

    // Clear interval when navigating away
    window.addEventListener('beforeunload', () => {
        clearInterval(interval);
    });

    // Create editor in advance to ensure it's ready when needed
    setTimeout(() => {
        createFullScreenCssEditor();
    }, 2000);
}

// Export functions for use in the extension
export {
    initFullScreenEditor,
    showFullScreenEditor,
    hideFullScreenEditor,
    createCssHelpSection
};
