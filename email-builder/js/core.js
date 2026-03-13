// ============= GLOBAL VARIABLES =============
let structure = [];
let activePath = null;
let activeType = null;
let canvasWidth = 600;
let isMobilePreview = false;
let history = [];
let historyIndex = -1;
const maxHistory = 20;

let masterSettings = {
    backgroundColor: '#f6f6f6',
    bodyBackgroundColor: '#f6f6f6',
    bodyFontFamily: 'Arial, Helvetica, sans-serif',
    bodyTextColor: '#333333',
    bodyPadding: '0',
    masterBorderWidth: '0px',
    masterBorderColor: '#000000',
    masterBorderStyle: 'none',
    masterBorderRadius: '0px',
    masterBoxShadow: 'none',
    masterMargin: '0 auto'
};

const blockTypes = [
    { value: 'title', label: 'Title Block', icon: 'fa-heading' },
    { value: 'text', label: 'Text Block', icon: 'fa-paragraph' },
    { value: 'image', label: 'Image Block', icon: 'fa-image' },
    { value: 'button', label: 'Button Block', icon: 'fa-hand-pointer' },
    { value: 'two-column', label: '2 Column (Text & Image)', icon: 'fa-columns' }
];

// Drag and drop variables
let draggedPath = null;
let draggedType = null;
let draggedElement = null;
let dropTarget = null;
let dropPosition = null;

// DOM Elements
const previewFrame = document.getElementById('preview-frame');
const propertiesPanel = document.getElementById('properties-panel');
const propertyInputs = document.getElementById('property-inputs');
const codeOutput = document.getElementById('code-output');
const sectionListContainer = document.getElementById('section-list-container');
const sectionTypeSelect = document.getElementById('section-type-select');
const messageBox = document.getElementById('message-box');
const canvasWidthInput = document.getElementById('canvas-width');
const previewToggleButton = document.getElementById('preview-toggle');
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');
const loadHtmlInput = document.getElementById('load-html-input');
const dragFeedback = document.getElementById('drag-feedback');

const fontOptions = [
    {value: 'Arial, Helvetica, sans-serif', label: 'Arial'},
    {value: '"Times New Roman", Times, serif', label: 'Times New Roman'},
    {value: '"Georgia", serif', label: 'Georgia'},
    {value: '"Verdana", Geneva, sans-serif', label: 'Verdana'},
    {value: '"Helvetica", Arial, sans-serif', label: 'Helvetica'},
    {value: '"Courier New", Courier, monospace', label: 'Courier New'}
];

// ============= UTILITY FUNCTIONS =============
function showMessage(message, type = 'info') {
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-blue-100', 'border-green-300', 'border-red-300', 'border-blue-300');
    if (type === 'success') {
        messageBox.classList.add('bg-green-100', 'border-green-300');
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-100', 'border-red-300');
    } else {
        messageBox.classList.add('bg-blue-100', 'border-blue-300');
    }
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 5000);
}

function sanitizeHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const scripts = div.getElementsByTagName('script');
    while (scripts.length) scripts[0].parentNode.removeChild(scripts[0]);
    ['onerror', 'onload', 'onclick', 'onmouseover'].forEach(attr => {
        const elements = div.querySelectorAll(`[${attr}]`);
        elements.forEach(el => el.removeAttribute(attr));
    });
    return div.innerHTML;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getBackgroundStyle(content) {
    if (content.backgroundType === 'image' && content.backgroundImage) {
        return `background-image: url(${content.backgroundImage}); background-size: cover; background-position: center; background-repeat: no-repeat;`;
    } else if (content.backgroundType === 'gradient' && content.backgroundGradient) {
        return `background: ${content.backgroundGradient};`;
    }
    return `background-color: ${content.backgroundColor || '#ffffff'};`;
}

function getItemByPath(path) {
    if (!path || path.length === 0) return null;
    
    let current = structure;
    let item = null;
    
    for (let i = 0; i < path.length; i++) {
        const segment = path[i];
        
        if (segment === 'items') {
            continue;
        } else if (typeof segment === 'number') {
            if (Array.isArray(current)) {
                if (segment < current.length) {
                    item = current[segment];
                    if (item && item.type === 'container' && i + 1 < path.length) {
                        current = item.items || [];
                    } else {
                        current = item;
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    
    return current;
}

function getParentArrayAndIndex(path) {
    if (!path || path.length === 0) return { parentArray: null, index: -1 };
    
    let parentArray = structure;
    let parent = null;
    
    const cleanPath = path.filter(segment => segment !== 'items');
    
    for (let i = 0; i < cleanPath.length - 1; i++) {
        const index = cleanPath[i];
        
        if (typeof index === 'number') {
            if (Array.isArray(parentArray) && index < parentArray.length) {
                parent = parentArray[index];
                if (parent && parent.type === 'container') {
                    parentArray = parent.items || [];
                } else {
                    parentArray = parent;
                }
            } else {
                return { parentArray: null, index: -1 };
            }
        }
    }
    
    const lastIndex = cleanPath[cleanPath.length - 1];
    if (typeof lastIndex === 'number') {
        return { parentArray, index: lastIndex };
    }
    
    return { parentArray: null, index: -1 };
}

function removeItemByPath(path) {
    const { parentArray, index } = getParentArrayAndIndex(path);
    if (parentArray && index >= 0 && index < parentArray.length) {
        parentArray.splice(index, 1);
        return true;
    }
    return false;
}

function countItems(container) {
    if (!container.items) return 0;
    let count = container.items.length;
    container.items.forEach(item => {
        if (item.type === 'container' && item.items) {
            count += countItems(item);
        }
    });
    return count;
}

function saveHistory() {
    try {
        history = history.slice(0, historyIndex + 1);
        history.push({
            structure: JSON.parse(JSON.stringify(structure)),
            activePath: activePath ? [...activePath] : null,
            activeType: activeType,
            canvasWidth: canvasWidth,
            masterSettings: JSON.parse(JSON.stringify(masterSettings))
        });
        if (history.length > maxHistory) {
            history.shift();
        }
        historyIndex = history.length - 1;
        updateHistoryButtons();
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

function undo() {
    try {
        if (historyIndex > 0) {
            historyIndex--;
            const state = history[historyIndex];
            structure = JSON.parse(JSON.stringify(state.structure));
            activePath = state.activePath ? [...state.activePath] : null;
            activeType = state.activeType;
            canvasWidth = state.canvasWidth;
            masterSettings = JSON.parse(JSON.stringify(state.masterSettings));
            canvasWidthInput.value = canvasWidth;
            updateStructureList();
            if (activePath) {
                showProperties();
            } else {
                showMasterSettings();
            }
            updatePreview();
            showMessage('Undo successful', 'success');
        }
    } catch (error) {
        console.error('Error undoing action:', error);
        showMessage('Error undoing action: ' + error.message, 'error');
    }
}

function redo() {
    try {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            const state = history[historyIndex];
            structure = JSON.parse(JSON.stringify(state.structure));
            activePath = state.activePath ? [...state.activePath] : null;
            activeType = state.activeType;
            canvasWidth = state.canvasWidth;
            masterSettings = JSON.parse(JSON.stringify(state.masterSettings));
            canvasWidthInput.value = canvasWidth;
            updateStructureList();
            if (activePath) {
                showProperties();
            } else {
                showMasterSettings();
            }
            updatePreview();
            updateHistoryButtons();
            showMessage('Redo successful', 'success');
        }
    } catch (error) {
        console.error('Error redoing action:', error);
        showMessage('Error redoing action: ' + error.message, 'error');
    }
}

function updateHistoryButtons() {
    if (undoButton) undoButton.disabled = historyIndex <= 0;
    if (redoButton) redoButton.disabled = historyIndex >= history.length - 1;
}

function togglePreview() {
    try {
        isMobilePreview = !isMobilePreview;
        if (previewToggleButton) {
            previewToggleButton.innerHTML = isMobilePreview ? 
                '<i class="fas fa-desktop mr-1"></i> Desktop View' : 
                '<i class="fas fa-mobile-alt mr-1"></i> Mobile View';
        }
        updatePreview();
        showMessage(isMobilePreview ? 'Switched to mobile preview' : 'Switched to desktop preview', 'success');
    } catch (error) {
        console.error('Error toggling preview:', error);
        showMessage('Error toggling preview: ' + error.message, 'error');
    }
}

// ============= INITIALIZATION =============
function initPreviewFrame() {
    if (!previewFrame) return;
    const doc = previewFrame.contentWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head><style>body { margin: 0; padding: 10px; }</style></head><body><p>Preview will appear here</p></body></html>');
    doc.close();
}

// ============= CANVAS WIDTH HANDLER =============
if (canvasWidthInput) {
    canvasWidthInput.oninput = (e) => {
        const value = parseInt(e.target.value);
        if (value >= 300 && value <= 800) {
            canvasWidth = value;
            saveHistory();
            updatePreview();
        } else {
            showMessage('Canvas width must be between 300 and 800 pixels.', 'error');
            canvasWidthInput.value = canvasWidth;
        }
    };
}

// ============= DEFAULT CONTENT FUNCTIONS =============
function getDefaultContainerContent() {
    return {
        name: 'Container',
        backgroundType: 'color',
        backgroundColor: '#ffffff',
        backgroundImage: '',
        backgroundGradient: 'linear-gradient(to right, #ffffff, #ffffff)',
        borderWidth: '0px',
        borderColor: '#000000',
        borderStyle: 'solid',
        borderRadius: '0px',
        paddingTop: '20px',
        paddingBottom: '20px',
        paddingLeft: '20px',
        paddingRight: '20px',
        marginTop: '0px',
        marginBottom: '0px',
        marginLeft: '0px',
        marginRight: '0px',
        containerClass: 'email-container',
        containerId: ''
    };
}

function getDefaultBlocks() {
    return {
        image: {url: 'https://placehold.co/200x200/EEEEEE/808080?text=Image', altText: 'Block Image', link: '#', align: 'center'},
        title: {text: 'Title', fontSize: '20px', color: '#000000', align: 'center', lineHeight: '1.2', fontFamily: 'Arial, Helvetica, sans-serif'},
        text: {text: 'Description text.', fontSize: '14px', color: '#333333', align: 'center', lineHeight: '1.5', fontFamily: 'Arial, Helvetica, sans-serif'},
        button: {text: 'Button', link: '#', background: '#007bff', color: '#ffffff', fontSize: '16px', align: 'center', padding: '10px 20px', borderRadius: '4px', showButton: true}
    };
}

function getContainerCount() {
    let count = 0;
    function countContainers(items) {
        items.forEach(item => {
            if (item.type === 'container') {
                count++;
                if (item.items) {
                    countContainers(item.items);
                }
            }
        });
    }
    countContainers(structure);
    return count;
}

function getDefaultContent(type) {
    try {
        const commonStyles = {
            backgroundType: 'color',
            backgroundColor: '#ffffff',
            backgroundImage: '',
            backgroundGradient: 'linear-gradient(to right, #ffffff, #ffffff)',
            borderWidth: '0px',
            borderColor: '#000000',
            borderStyle: 'solid',
            borderRadius: '0px',
            paddingTop: '20px',
            paddingBottom: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            marginTop: '0px',
            marginBottom: '0px',
            marginLeft: '0px',
            marginRight: '0px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            textAlign: 'center',
            sectionClass: '',
            sectionId: '',
            customStyles: ''
        };

        const handler = SectionRegistry.getHandler(type);
        if (handler && handler.getDefaultContent) {
            return handler.getDefaultContent(commonStyles);
        }
        return commonStyles;
    } catch (error) {
        console.error('Error in getDefaultContent:', error);
        return {};
    }
}

// ============= MASTER SETTINGS =============
function showMasterSettings() {
    if (!propertiesPanel || !propertyInputs) return;
    
    propertiesPanel.classList.remove('hidden');
    propertyInputs.innerHTML = '';
    
    const masterDetails = document.createElement('details');
    masterDetails.classList.add('mb-2');
    masterDetails.open = true;
    const masterSummary = document.createElement('summary');
    masterSummary.textContent = 'Master Container Settings';
    masterSummary.classList.add('font-medium', 'cursor-pointer', 'text-lg', 'mb-2');
    masterDetails.appendChild(masterSummary);
    const masterContainer = document.createElement('div');
    masterContainer.classList.add('p-2');
    masterDetails.appendChild(masterContainer);
    propertyInputs.appendChild(masterDetails);

    createMasterInput('Body Background Color', 'bodyBackgroundColor', 'color', '#f6f6f6', null, masterSettings, masterContainer);
    createMasterInput('Master Background Color', 'backgroundColor', 'color', '#ffffff', null, masterSettings, masterContainer);
    createMasterInput('Body Font Family', 'bodyFontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, masterSettings, masterContainer);
    createMasterInput('Body Text Color', 'bodyTextColor', 'color', '#333333', null, masterSettings, masterContainer);
    createMasterInput('Body Padding', 'bodyPadding', 'text', '0', null, masterSettings, masterContainer);
    
    const borderDetails = document.createElement('details');
    borderDetails.classList.add('mb-2', 'mt-2');
    borderDetails.open = false;
    const borderSummary = document.createElement('summary');
    borderSummary.textContent = 'Master Border & Effects';
    borderSummary.classList.add('font-medium', 'cursor-pointer');
    borderDetails.appendChild(borderSummary);
    const borderContainer = document.createElement('div');
    borderContainer.classList.add('p-2');
    borderDetails.appendChild(borderContainer);
    masterContainer.appendChild(borderDetails);

    createMasterInput('Border Width', 'masterBorderWidth', 'text', '0px', null, masterSettings, borderContainer);
    createMasterInput('Border Color', 'masterBorderColor', 'color', '#000000', null, masterSettings, borderContainer);
    createMasterInput('Border Style', 'masterBorderStyle', 'select', 'none', [
        {value: 'none', label: 'None'},
        {value: 'solid', label: 'Solid'},
        {value: 'dashed', label: 'Dashed'},
        {value: 'dotted', label: 'Dotted'}
    ], masterSettings, borderContainer);
    createMasterInput('Border Radius', 'masterBorderRadius', 'text', '0px', null, masterSettings, borderContainer);
    createMasterInput('Box Shadow', 'masterBoxShadow', 'text', 'none', null, masterSettings, borderContainer);
}

function createMasterInput(label, key, type = 'text', defaultValue = '', options = null, target = null, container = null) {
    if (!target || !container) return;
    
    const div = document.createElement('div');
    div.classList.add('mb-3');
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.classList.add('property-label');
    
    let inputEl;
    if (type === 'select') {
        inputEl = document.createElement('select');
        inputEl.classList.add('property-select');
        if (options) {
            options.forEach(opt => {
                const optionEl = document.createElement('option');
                optionEl.value = opt.value;
                optionEl.textContent = opt.label;
                if (target[key] === opt.value) optionEl.selected = true;
                inputEl.appendChild(optionEl);
            });
        }
    } else if (type === 'color') {
        inputEl = document.createElement('input');
        inputEl.type = 'color';
        inputEl.classList.add('property-input', 'h-10');
    } else {
        inputEl = document.createElement('input');
        inputEl.type = type;
        inputEl.classList.add('property-input');
    }
    
    inputEl.value = target[key] !== undefined ? target[key] : defaultValue;
    inputEl.setAttribute('aria-label', label);
    
    inputEl.addEventListener('input', (e) => {
        target[key] = e.target.value;
        updatePreview();
    });
    
    div.appendChild(labelEl);
    div.appendChild(inputEl);
    container.appendChild(div);
}

function createInput(label, key, type = 'text', defaultValue = '', options = null, target = null, container = null) {
    if (!target || !container) return;
    
    const div = document.createElement('div');
    div.classList.add('mb-3');
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.classList.add('property-label');
    
    let inputEl;
    if (type === 'textarea') {
        inputEl = document.createElement('textarea');
        inputEl.rows = 4;
        inputEl.classList.add('property-input');
    } else if (type === 'select') {
        inputEl = document.createElement('select');
        inputEl.classList.add('property-select');
        if (options) {
            options.forEach(opt => {
                const optionEl = document.createElement('option');
                optionEl.value = opt.value;
                optionEl.textContent = opt.label;
                if (target[key] === opt.value) optionEl.selected = true;
                inputEl.appendChild(optionEl);
            });
        }
    } else if (type === 'color') {
        inputEl = document.createElement('input');
        inputEl.type = 'color';
        inputEl.classList.add('property-input', 'h-10');
    } else if (type === 'checkbox') {
        inputEl = document.createElement('input');
        inputEl.type = 'checkbox';
        inputEl.classList.add('property-checkbox');
        inputEl.checked = target[key] || false;
    } else {
        inputEl = document.createElement('input');
        inputEl.type = type;
        inputEl.classList.add('property-input');
    }
    
    if (type !== 'checkbox' && type !== 'select') {
        inputEl.value = target[key] !== undefined ? target[key] : defaultValue;
    }
    
    inputEl.setAttribute('aria-label', label);
    
    inputEl.addEventListener('input', (e) => {
        let value = e.target.value;
        if (type === 'checkbox') {
            target[key] = e.target.checked;
        } else {
            target[key] = value;
        }
        
        saveHistory();
        updatePreview();
    });
    
    inputEl.addEventListener('change', (e) => {
        if (type === 'select') {
            target[key] = e.target.value;
            saveHistory();
            updatePreview();
        }
    });
    
    div.appendChild(labelEl);
    div.appendChild(inputEl);
    container.appendChild(div);
}

function createCheckbox(label, key, target, container) {
    const div = document.createElement('div');
    div.classList.add('mb-3', 'flex', 'items-center');
    
    const inputEl = document.createElement('input');
    inputEl.type = 'checkbox';
    inputEl.id = key;
    inputEl.checked = target[key] || false;
    inputEl.classList.add('property-checkbox');
    
    inputEl.addEventListener('change', (e) => {
        target[key] = e.target.checked;
        saveHistory();
        updatePreview();
    });
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.htmlFor = key;
    labelEl.classList.add('property-label', 'mb-0');
    
    div.appendChild(inputEl);
    div.appendChild(labelEl);
    container.appendChild(div);
}

// ============= SECTION OPERATIONS =============
function addSection() {
    try {
        const type = sectionTypeSelect.value;
        if (!type) {
            showMessage('Error: No section type selected', 'error');
            return;
        }
        
        if (type === 'container') {
            addContainer();
            return;
        }
        
        const newSection = {
            id: Date.now() + Math.random(),
            type: type,
            content: getDefaultContent(type)
        };
        
        if (activePath && activePath.length > 0) {
            const parent = getItemByPath(activePath);
            if (parent && parent.type === 'container') {
                if (!parent.items) parent.items = [];
                parent.items.push(newSection);
                activePath = [...activePath, 'items', parent.items.length - 1];
                activeType = 'section';
            } else {
                structure.push(newSection);
                activePath = [structure.length - 1];
                activeType = 'section';
            }
        } else {
            structure.push(newSection);
            activePath = [structure.length - 1];
            activeType = 'section';
        }
        
        saveHistory();
        updateStructureList();
        showProperties();
        updatePreview();
        showMessage(`Added ${type.replace(/-/g, ' ')} section`, 'success');
    } catch (error) {
        console.error('Error adding section:', error);
        showMessage('Error adding section: ' + error.message, 'error');
    }
}

function addContainer() {
    try {
        const newContainer = {
            id: Date.now() + Math.random(),
            type: 'container',
            name: `Container ${getContainerCount() + 1}`,
            content: getDefaultContainerContent(),
            items: []
        };
        
        if (activePath && activePath.length > 0) {
            const parent = getItemByPath(activePath);
            if (parent && parent.type === 'container') {
                if (!parent.items) parent.items = [];
                parent.items.push(newContainer);
                activePath = [...activePath, 'items', parent.items.length - 1];
                activeType = 'container';
            } else {
                structure.push(newContainer);
                activePath = [structure.length - 1];
                activeType = 'container';
            }
        } else {
            structure.push(newContainer);
            activePath = [structure.length - 1];
            activeType = 'container';
        }
        
        saveHistory();
        updateStructureList();
        showProperties();
        updatePreview();
        showMessage('Added new container', 'success');
    } catch (error) {
        console.error('Error adding container:', error);
        showMessage('Error adding container: ' + error.message, 'error');
    }
}

function removeSelected() {
    try {
        if (!activePath || activePath.length === 0) {
            showMessage('No item selected to remove', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to remove this item?')) {
            removeItemByPath(activePath);
            activePath = null;
            activeType = null;
            saveHistory();
            updateStructureList();
            showMasterSettings();
            updatePreview();
            showMessage('Item removed', 'success');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        showMessage('Error removing item: ' + error.message, 'error');
    }
}

function moveToContainer() {
    if (!activePath || activePath.length === 0) {
        showMessage('Please select a section to move', 'error');
        return;
    }

    let containerIndex = -1;
    for (let i = 0; i < structure.length; i++) {
        if (structure[i].type === 'container') {
            containerIndex = i;
            break;
        }
    }

    if (containerIndex === -1) {
        showMessage('No container found. Please add a container first.', 'error');
        return;
    }

    const section = getItemByPath(activePath);
    if (!section) return;

    removeItemByPath(activePath);
    
    if (!structure[containerIndex].items) structure[containerIndex].items = [];
    structure[containerIndex].items.push(section);
    
    activePath = [containerIndex, 'items', structure[containerIndex].items.length - 1];
    activeType = 'section';
    
    saveHistory();
    updateStructureList();
    showProperties();
    updatePreview();
    showMessage('Section moved to container', 'success');
}

// ============= BLOCK OPERATIONS =============
function addBlock(section, blockType) {
    const newBlock = {
        id: Date.now() + Math.random(),
        type: blockType,
        content: getDefaultBlockContent(blockType)
    };
    if (!section.content.blocks) section.content.blocks = [];
    section.content.blocks.push(newBlock);
    saveHistory();
    showProperties();
    updatePreview();
    showMessage(`Added ${blockType} block`, 'success');
}

function removeBlock(section, blockIndex) {
    section.content.blocks.splice(blockIndex, 1);
    saveHistory();
    showProperties();
    updatePreview();
    showMessage('Block removed', 'success');
}

function moveBlockUp(section, blockIndex) {
    if (blockIndex > 0) {
        const blocks = section.content.blocks;
        [blocks[blockIndex - 1], blocks[blockIndex]] = [blocks[blockIndex], blocks[blockIndex - 1]];
        saveHistory();
        showProperties();
        updatePreview();
    }
}

function moveBlockDown(section, blockIndex) {
    const blocks = section.content.blocks;
    if (blockIndex < blocks.length - 1) {
        [blocks[blockIndex], blocks[blockIndex + 1]] = [blocks[blockIndex + 1], blocks[blockIndex]];
        saveHistory();
        showProperties();
        updatePreview();
    }
}

function getDefaultBlockContent(type) {
    switch(type) {
        case 'title':
            return {
                text: 'New Title',
                fontSize: '24px',
                color: '#000000',
                align: 'center',
                lineHeight: '1.2',
                fontFamily: 'Arial, Helvetica, sans-serif'
            };
        case 'text':
            return {
                text: 'New text content. You can edit this.',
                fontSize: '16px',
                color: '#333333',
                align: 'left',
                lineHeight: '1.5',
                fontFamily: 'Arial, Helvetica, sans-serif'
            };
        case 'image':
            return {
                url: 'https://placehold.co/600x300/3a86ff/ffffff?text=Image',
                altText: 'Image',
                link: '#',
                align: 'center',
                width: '100%',
                maxWidth: '600px'
            };
        case 'button':
            return {
                text: 'Click Me',
                link: '#',
                background: '#007bff',
                color: '#ffffff',
                fontSize: '16px',
                align: 'center',
                padding: '12px 24px',
                borderRadius: '4px',
                showButton: true
            };
        case 'two-column':
            return {
                imagePosition: 'left',
                imageUrl: 'https://placehold.co/300x200/3a86ff/ffffff?text=Image',
                altText: 'Image',
                text: 'Text content for the column.',
                fontSize: '16px',
                textColor: '#333333',
                buttonText: 'Button',
                buttonLink: '#',
                buttonBackground: '#007bff',
                buttonColor: '#ffffff',
                showButton: false
            };
        default:
            return {};
    }
}

// ============= PROPERTIES DISPLAY =============
function showProperties() {
    try {
        if (!activePath || activePath.length === 0) {
            showMasterSettings();
            return;
        }

        const item = getItemByPath(activePath);
        
        if (!item) {
            showMasterSettings();
            return;
        }

        propertiesPanel.classList.remove('hidden');
        propertyInputs.innerHTML = '';
        
        if (item.type === 'container') {
            showContainerProperties(item);
        } else {
            showSectionProperties(item);
        }
    } catch (error) {
        console.error('Error showing properties:', error);
        showMessage('Error showing properties: ' + error.message, 'error');
    }
}

function showContainerProperties(container) {
    const content = container.content;
    
    createInput('Container Name', 'name', 'text', 'Container', null, container, propertyInputs);
    
    const commonDetails = document.createElement('details');
    commonDetails.classList.add('mb-2');
    commonDetails.open = true;
    const commonSummary = document.createElement('summary');
    commonSummary.textContent = 'Container Styles';
    commonSummary.classList.add('font-medium', 'cursor-pointer');
    commonDetails.appendChild(commonSummary);
    const commonContainer = document.createElement('div');
    commonContainer.classList.add('p-2');
    commonDetails.appendChild(commonContainer);
    propertyInputs.appendChild(commonDetails);

    createInput('CSS Class', 'containerClass', 'text', 'email-container', null, content, commonContainer);
    createInput('CSS ID', 'containerId', 'text', '', null, content, commonContainer);
    createInput('Background Type', 'backgroundType', 'select', 'color', [
        {value: 'color', label: 'Color'},
        {value: 'image', label: 'Image'},
        {value: 'gradient', label: 'Gradient'}
    ], content, commonContainer);
    
    if (content.backgroundType === 'color') {
        createInput('Background Color', 'backgroundColor', 'color', '#ffffff', null, content, commonContainer);
    } else if (content.backgroundType === 'image') {
        createInput('Background Image URL', 'backgroundImage', 'text', '', null, content, commonContainer);
    } else if (content.backgroundType === 'gradient') {
        createInput('Background Gradient', 'backgroundGradient', 'text', 'linear-gradient(to right, #ffffff, #ffffff)', null, content, commonContainer);
    }
    
    createInput('Border Width', 'borderWidth', 'text', '0px', null, content, commonContainer);
    createInput('Border Color', 'borderColor', 'color', '#000000', null, content, commonContainer);
    createInput('Border Style', 'borderStyle', 'select', 'solid', [
        {value: 'solid', label: 'Solid'},
        {value: 'dashed', label: 'Dashed'},
        {value: 'dotted', label: 'Dotted'},
        {value: 'none', label: 'None'}
    ], content, commonContainer);
    createInput('Border Radius', 'borderRadius', 'text', '0px', null, content, commonContainer);
    createInput('Padding Top', 'paddingTop', 'text', '20px', null, content, commonContainer);
    createInput('Padding Bottom', 'paddingBottom', 'text', '20px', null, content, commonContainer);
    createInput('Padding Left', 'paddingLeft', 'text', '20px', null, content, commonContainer);
    createInput('Padding Right', 'paddingRight', 'text', '20px', null, content, commonContainer);
    createInput('Margin Top', 'marginTop', 'text', '0px', null, content, commonContainer);
    createInput('Margin Bottom', 'marginBottom', 'text', '0px', null, content, commonContainer);
    createInput('Margin Left', 'marginLeft', 'text', '0px', null, content, commonContainer);
    createInput('Margin Right', 'marginRight', 'text', '0px', null, content, commonContainer);
}

function showSectionProperties(section) {
    const content = section.content;

    const commonDetails = document.createElement('details');
    commonDetails.classList.add('mb-2');
    commonDetails.open = true;
    const commonSummary = document.createElement('summary');
    commonSummary.textContent = 'Row Styles';
    commonSummary.classList.add('font-medium', 'cursor-pointer');
    commonDetails.appendChild(commonSummary);
    const commonContainer = document.createElement('div');
    commonContainer.classList.add('p-2');
    commonDetails.appendChild(commonContainer);
    propertyInputs.appendChild(commonDetails);

    createInput('CSS Class', 'sectionClass', 'text', '', null, content, commonContainer);
    createInput('CSS ID', 'sectionId', 'text', '', null, content, commonContainer);
    createInput('Custom Styles', 'customStyles', 'textarea', '', null, content, commonContainer);
    createInput('Background Type', 'backgroundType', 'select', 'color', [
        {value: 'color', label: 'Color'},
        {value: 'image', label: 'Image'},
        {value: 'gradient', label: 'Gradient'}
    ], content, commonContainer);
    
    if (content.backgroundType === 'color') {
        createInput('Background Color', 'backgroundColor', 'color', '#ffffff', null, content, commonContainer);
    } else if (content.backgroundType === 'image') {
        createInput('Background Image URL', 'backgroundImage', 'text', '', null, content, commonContainer);
    } else if (content.backgroundType === 'gradient') {
        createInput('Background Gradient', 'backgroundGradient', 'text', 'linear-gradient(to right, #ffffff, #ffffff)', null, content, commonContainer);
    }
    
    createInput('Border Width', 'borderWidth', 'text', '0px', null, content, commonContainer);
    createInput('Border Color', 'borderColor', 'color', '#000000', null, content, commonContainer);
    createInput('Border Style', 'borderStyle', 'select', 'solid', [
        {value: 'solid', label: 'Solid'},
        {value: 'dashed', label: 'Dashed'},
        {value: 'dotted', label: 'Dotted'},
        {value: 'none', label: 'None'}
    ], content, commonContainer);
    createInput('Border Radius', 'borderRadius', 'text', '0px', null, content, commonContainer);
    createInput('Padding Top', 'paddingTop', 'text', '20px', null, content, commonContainer);
    createInput('Padding Bottom', 'paddingBottom', 'text', '20px', null, content, commonContainer);
    createInput('Padding Left', 'paddingLeft', 'text', '20px', null, content, commonContainer);
    createInput('Padding Right', 'paddingRight', 'text', '20px', null, content, commonContainer);
    createInput('Margin Top', 'marginTop', 'text', '0px', null, content, commonContainer);
    createInput('Margin Bottom', 'marginBottom', 'text', '0px', null, content, commonContainer);
    createInput('Margin Left', 'marginLeft', 'text', '0px', null, content, commonContainer);
    createInput('Margin Right', 'marginRight', 'text', '0px', null, content, commonContainer);

    // Get section-specific properties from registry
    const handler = SectionRegistry.getHandler(section.type);
    if (handler && handler.showProperties) {
        const specificDetails = document.createElement('details');
        specificDetails.classList.add('mb-2');
        specificDetails.open = true;
        const specificSummary = document.createElement('summary');
        specificSummary.textContent = 'Content Properties';
        specificSummary.classList.add('font-medium', 'cursor-pointer');
        specificDetails.appendChild(specificSummary);
        const specificContainer = document.createElement('div');
        specificContainer.classList.add('p-2');
        specificDetails.appendChild(specificContainer);
        propertyInputs.appendChild(specificDetails);
        
        handler.showProperties(section, specificContainer);
    }
}

// ============= HTML GENERATION =============
function generateEmailHtml() {
    try {
        const rowsHtml = structure.map(item => {
            if (item.type === 'container') {
                return generateContainerRow(item);
            } else {
                return generateSectionRow(item);
            }
        }).join('');
        
        const masterBorderStyle = masterSettings.masterBorderStyle === 'none' ? 
            'border: none;' : 
            `border: ${masterSettings.masterBorderWidth} ${masterSettings.masterBorderStyle} ${masterSettings.masterBorderColor};`;
        
        const fullHtml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Template</title>
    <style type="text/css">
        body {
            margin: 0;
            padding: ${masterSettings.bodyPadding};
            background-color: ${masterSettings.bodyBackgroundColor};
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            font-family: ${masterSettings.bodyFontFamily};
            color: ${masterSettings.bodyTextColor};
        }
        table {
            border-spacing: 0;
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        td {
            font-family: ${masterSettings.bodyFontFamily};
        }
        img {
            display: block;
            max-width: 100%;
            height: auto;
            border: 0;
        }
        a {
            text-decoration: none;
        }
        @media only screen and (max-width: 480px) {
            .master-table {
                width: 100% !important;
                max-width: 320px !important;
                min-width: 0 !important;
            }
            .column {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                padding: 10px 0 !important;
            }
            img {
                width: 100% !important;
                max-width: 100% !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: ${masterSettings.bodyPadding}; background-color: ${masterSettings.bodyBackgroundColor}; font-family: ${masterSettings.bodyFontFamily}; color: ${masterSettings.bodyTextColor};">
    <center style="width: 100%; background-color: ${masterSettings.bodyBackgroundColor};">
        <!-- MASTER TABLE - contains all sections as rows -->
        <table class="master-table" cellpadding="0" cellspacing="0" border="0" align="center" 
               style="width: 100%; max-width: ${canvasWidth}px; min-width: 0; background-color: ${masterSettings.backgroundColor}; ${masterBorderStyle} border-radius: ${masterSettings.masterBorderRadius}; box-shadow: ${masterSettings.masterBoxShadow}; margin: ${masterSettings.masterMargin};" 
               role="presentation">
            ${rowsHtml}
        </table>
    </center>
</body>
</html>
        `;
        return fullHtml;
    } catch (error) {
        console.error('Error generating email HTML:', error);
        return `<div>Error generating email</div>`;
    }
}

function generateSectionRow(section) {
    try {
        const content = section.content || {};
        
        const backgroundStyle = getBackgroundStyle(content);
        const borderStyle = content.borderStyle === 'none' ? 
            `border: none;` : 
            `border: ${content.borderWidth || '0px'} ${content.borderStyle || 'solid'} ${content.borderColor || '#000000'};`;
        const borderRadiusStyle = `border-radius: ${content.borderRadius || '0px'};`;
        const marginStyle = `margin: ${content.marginTop || '0px'} ${content.marginRight || '0px'} ${content.marginBottom || '0px'} ${content.marginLeft || '0px'};`;
        
        const rowStyle = `${backgroundStyle} ${borderStyle} ${borderRadiusStyle} ${marginStyle}`;
        
        const cellStyle = `padding: ${content.paddingTop || '20px'} ${content.paddingRight || '20px'} ${content.paddingBottom || '20px'} ${content.paddingLeft || '20px'}; ${content.fontFamily ? 'font-family: ' + content.fontFamily + ';' : ''} ${content.customStyles || ''}`;
        
        let innerContent = generateSectionContent(section);
        
        return `
            <tr class="${content.sectionClass || ''}" id="${content.sectionId || ''}" style="${rowStyle}">
                <td style="${cellStyle}">
                    ${innerContent}
                </td>
            </tr>
        `;
    } catch (error) {
        console.error('Error generating section row:', error);
        return `<tr><td>Error rendering section</td></tr>`;
    }
}

function generateContainerRow(container) {
    try {
        const content = container.content || {};
        
        const nestedRowsHtml = (container.items || []).map(item => {
            if (item.type === 'container') {
                return generateContainerRow(item);
            } else {
                return generateSectionRow(item);
            }
        }).join('');
        
        const backgroundStyle = getBackgroundStyle(content);
        const borderStyle = content.borderStyle === 'none' ? 
            `border: none;` : 
            `border: ${content.borderWidth || '0px'} ${content.borderStyle || 'solid'} ${content.borderColor || '#000000'};`;
        const borderRadiusStyle = `border-radius: ${content.borderRadius || '0px'};`;
        const marginStyle = `margin: ${content.marginTop || '0px'} ${content.marginRight || '0px'} ${content.marginBottom || '0px'} ${content.marginLeft || '0px'};`;
        
        const tableStyle = `width: 100%; ${backgroundStyle} ${borderStyle} ${borderRadiusStyle} ${marginStyle}`;
        const cellStyle = `padding: ${content.paddingTop || '20px'} ${content.paddingRight || '20px'} ${content.paddingBottom || '20px'} ${content.paddingLeft || '20px'};`;
        
        return `
            <tr style="background-color: transparent;">
                <td style="padding: 0;">
                    <!-- Nested Container Table -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" 
                           style="${tableStyle}" 
                           class="${content.containerClass || ''}" 
                           id="${content.containerId || ''}" 
                           role="presentation">
                        <tr>
                            <td style="${cellStyle}">
                                ${nestedRowsHtml}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        `;
    } catch (error) {
        console.error('Error generating container row:', error);
        return `<tr><td>Error rendering container</td></tr>`;
    }
}

function generateSectionContent(section) {
    const handler = SectionRegistry.getHandler(section.type);
    if (handler && handler.generateContent) {
        return handler.generateContent(section);
    }
    return `<div>Section type: ${section.type}</div>`;
}

function updatePreview() {
    try {
        if (!previewFrame) return;
        const doc = previewFrame.contentWindow.document;
        doc.open();
        doc.write(generateEmailHtml());
        doc.close();
        if (codeOutput) codeOutput.value = generateEmailHtml();
        previewFrame.style.maxWidth = isMobilePreview ? '320px' : `${canvasWidth}px`;
    } catch (error) {
        console.error('Error updating preview:', error);
    }
}

function copyCode() {
    try {
        if (!codeOutput) return;
        codeOutput.select();
        document.execCommand('copy');
        showMessage('HTML code copied to clipboard!', 'success');
    } catch (error) {
        console.error('Error copying code:', error);
        showMessage('Error copying code: ' + error.message, 'error');
    }
}

function saveToFile() {
    try {
        const htmlContent = generateEmailHtml();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'email-template.html';
        a.click();
        URL.revokeObjectURL(url);
        showMessage('Template saved as email-template.html!', 'success');
    } catch (error) {
        console.error('Error saving to file:', error);
        showMessage('Error saving to file: ' + error.message, 'error');
    }
}

function loadHtml() {
    try {
        const htmlContent = loadHtmlInput.value.trim();
        if (!htmlContent) {
            showMessage('Please paste valid HTML code.', 'error');
            return;
        }

        structure = [];
        
        structure.push({
            id: Date.now() + Math.random(),
            type: 'custom-html',
            content: {
                ...getDefaultContent('custom-html'),
                html: sanitizeHtml(htmlContent)
            }
        });

        activePath = [0];
        activeType = 'section';
        saveHistory();
        updateStructureList();
        showProperties();
        updatePreview();
        showMessage('HTML loaded successfully!', 'success');
        loadHtmlInput.value = '';
    } catch (error) {
        console.error('Error loading HTML:', error);
        showMessage('Error loading HTML: ' + error.message, 'error');
    }
}

// ============= STRUCTURE LIST RENDERING =============
function updateStructureList() {
    try {
        if (!sectionListContainer) return;
        sectionListContainer.innerHTML = '';
        if (structure.length === 0) {
            sectionListContainer.innerHTML = '<div class="text-center text-gray-400 p-4">Add a section or container to get started</div>';
        } else {
            renderItems(structure, [], sectionListContainer, 0);
        }
    } catch (error) {
        console.error('Error updating structure list:', error);
    }
}

function renderItems(items, path, container, depth = 0) {
    if (!items || !Array.isArray(items)) return;
    
    items.forEach((item, index) => {
        const currentPath = [...path, index];
        
        if (item.type === 'container') {
            renderContainerItem(item, currentPath, container, depth);
        } else {
            renderSectionItem(item, currentPath, container, depth);
        }
    });
}

function renderSectionItem(section, path, containerEl, depth) {
    const div = document.createElement('div');
    div.classList.add('section-item', 'p-2', 'rounded-lg', 'flex', 'items-center', 'justify-between', 'bg-white', 'mb-1');
    if (depth > 0) div.style.marginLeft = '20px';
    div.draggable = true;
    div.setAttribute('tabindex', '0');
    div.setAttribute('data-path', JSON.stringify(path));
    
    let sectionName = section.type.replace(/-/g, ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    if (section.type === 'dynamic-blocks') {
        sectionName = '✨ Dynamic Blocks';
    }
    
    const isActive = activePath && activePath.length === path.length && 
                    activePath.every((val, i) => val === path[i]) && 
                    activeType === 'section';
    
    if (isActive) {
        div.classList.add('active');
        div.setAttribute('aria-selected', 'true');
    }
    
    let badge = '';
    if (section.type === 'dynamic-blocks' && section.content && section.content.blocks) {
        badge = `<span class="badge badge-blue ml-2">${section.content.blocks.length} blocks</span>`;
    }
    
    div.innerHTML = `
        <span class="font-medium text-gray-700 flex items-center">
            <i class="fas fa-file-alt mr-1 text-xs text-gray-500"></i> ${sectionName}
            ${badge}
        </span>
        <span class="draggable-handle text-gray-400" title="Drag to reorder">☰</span>
    `;
    
    div.addEventListener('dragstart', (e) => handleDragStart(e, path, 'section', section));
    div.addEventListener('dragend', handleDragEnd);
    div.addEventListener('dragover', (e) => handleDragOver(e, path, 'section', div));
    div.addEventListener('dragleave', (e) => {
        div.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inside');
    });
    div.addEventListener('drop', (e) => handleDrop(e, path, 'section', div));
    
    div.addEventListener('click', (e) => {
        if (e.target.closest('.draggable-handle')) return;
        
        const exactPath = [...path];
        activePath = exactPath;
        activeType = 'section';
        
        updateStructureList();
        showProperties();
    });
    
    containerEl.appendChild(div);
}

function renderContainerItem(container, path, containerEl, depth) {
    const div = document.createElement('div');
    div.classList.add('container-item', 'p-2', 'rounded-lg', 'mb-2', 'bg-purple-50');
    if (depth > 0) div.classList.add('container-nested');
    div.draggable = true;
    div.setAttribute('tabindex', '0');
    div.setAttribute('data-path', JSON.stringify(path));
    
    const isActive = activePath && activePath.length === path.length && 
                    activePath.every((val, i) => val === path[i]) && 
                    activeType === 'container';
    
    if (isActive) {
        div.classList.add('active');
        div.setAttribute('aria-selected', 'true');
    }
    
    div.innerHTML = `
        <div class="flex items-center justify-between mb-1">
            <span class="font-semibold text-purple-700 flex items-center">
                <i class="fas fa-cubes mr-1 text-sm"></i> ${container.name || 'Container'}
                <span class="badge badge-purple">${countItems(container)} items</span>
            </span>
            <span class="draggable-handle text-gray-400 text-sm" title="Drag to reorder">☰</span>
        </div>
    `;
    
    if (container.items && container.items.length > 0) {
        const nestedDiv = document.createElement('div');
        nestedDiv.classList.add('ml-4', 'mt-2', 'space-y-1');
        renderItems(container.items, [...path, 'items'], nestedDiv, depth + 1);
        div.appendChild(nestedDiv);
    } else {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('ml-4', 'mt-1', 'text-xs', 'text-gray-400', 'italic');
        emptyDiv.textContent = 'Empty container';
        div.appendChild(emptyDiv);
    }
    
    div.addEventListener('dragstart', (e) => handleDragStart(e, path, 'container', container));
    div.addEventListener('dragend', handleDragEnd);
    div.addEventListener('dragover', (e) => handleDragOver(e, path, 'container', div));
    div.addEventListener('dragleave', (e) => {
        div.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inside');
    });
    div.addEventListener('drop', (e) => handleDrop(e, path, 'container', div));
    
    div.addEventListener('click', (e) => {
        if (e.target.closest('.draggable-handle')) return;
        activePath = path;
        activeType = 'container';
        updateStructureList();
        showProperties();
    });
    
    containerEl.appendChild(div);
}

// ============= DRAG AND DROP FUNCTIONS =============
function handleDragStart(e, path, type, item) {
    e.stopPropagation();
    
    draggedPath = path;
    draggedType = type;
    draggedElement = e.target.closest('.section-item, .container-item');
    
    if (!draggedElement) return;
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
        path: path,
        type: type,
        id: item.id
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    draggedElement.classList.add('dragging');
    
    let itemName = '';
    if (type === 'container') {
        itemName = item.name || 'Container';
    } else {
        itemName = item.type.replace(/-/g, ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    }
    
    if (dragFeedback) {
        dragFeedback.textContent = `Moving: ${itemName}`;
        dragFeedback.style.display = 'block';
        dragFeedback.style.left = (e.clientX + 20) + 'px';
        dragFeedback.style.top = (e.clientY + 10) + 'px';
    }
    
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    
    clearDropIndicators();
}

function handleDragOver(e, path, type, element) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedPath || pathsEqual(draggedPath, path)) return;
    
    const targetElement = e.target.closest('.section-item, .container-item');
    if (!targetElement) return;
    
    if (dragFeedback) {
        dragFeedback.style.left = (e.clientX + 20) + 'px';
        dragFeedback.style.top = (e.clientY + 10) + 'px';
    }
    
    const rect = targetElement.getBoundingClientRect();
    const mouseY = e.clientY;
    
    clearDropIndicators();
    
    if (type === 'container' && mouseY > rect.top + rect.height * 0.25 && mouseY < rect.bottom - rect.height * 0.25) {
        targetElement.classList.add('drag-over-inside');
        dropTarget = { path, type: 'container', position: 'inside' };
        dropPosition = 'inside';
    } else if (mouseY < rect.top + rect.height / 2) {
        targetElement.classList.add('drag-over-top');
        dropTarget = { path, type, position: 'top' };
        dropPosition = 'top';
    } else {
        targetElement.classList.add('drag-over-bottom');
        dropTarget = { path, type, position: 'bottom' };
        dropPosition = 'bottom';
    }
}

function handleDragEnd(e) {
    document.querySelectorAll('.section-item, .container-item').forEach(el => {
        el.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom', 'drag-over-inside');
    });
    
    if (dragFeedback) dragFeedback.style.display = 'none';
    
    draggedPath = null;
    draggedType = null;
    draggedElement = null;
    dropTarget = null;
    dropPosition = null;
}

function handleDrop(e, targetPath, targetType, targetElement) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedPath || pathsEqual(draggedPath, targetPath)) {
        handleDragEnd(e);
        return;
    }
    
    try {
        const draggedItem = getItemByPath(draggedPath);
        if (!draggedItem) return;
        
        if (draggedType === 'container' && isDescendant(draggedPath, targetPath)) {
            showMessage('Cannot drop a container into itself or its children', 'error');
            handleDragEnd(e);
            return;
        }
        
        removeItemByPath(draggedPath);
        
        if (dropPosition === 'inside' && targetType === 'container') {
            const targetContainer = getItemByPath(targetPath);
            if (targetContainer && targetContainer.type === 'container') {
                if (!targetContainer.items) targetContainer.items = [];
                targetContainer.items.push(draggedItem);
            }
        } else {
            const { parentArray, index } = getParentArrayAndIndex(targetPath);
            if (parentArray) {
                const insertIndex = dropPosition === 'bottom' ? index + 1 : index;
                parentArray.splice(insertIndex, 0, draggedItem);
            }
        }
        
        if (activePath) {
            if (pathsEqual(activePath, draggedPath)) {
                activePath = null;
                activeType = null;
            }
        }
        
        saveHistory();
        updateStructureList();
        if (activePath) {
            showProperties();
        } else {
            showMasterSettings();
        }
        updatePreview();
        showMessage('Item moved successfully', 'success');
    } catch (error) {
        console.error('Error during drop:', error);
        showMessage('Error moving item: ' + error.message, 'error');
    } finally {
        handleDragEnd(e);
    }
}

function pathsEqual(path1, path2) {
    if (!path1 || !path2) return false;
    if (path1.length !== path2.length) return false;
    for (let i = 0; i < path1.length; i++) {
        if (path1[i] !== path2[i]) return false;
    }
    return true;
}

function isDescendant(parentPath, childPath) {
    if (!parentPath || !childPath) return false;
    if (childPath.length <= parentPath.length) return false;
    
    for (let i = 0; i < parentPath.length; i++) {
        if (parentPath[i] !== childPath[i]) return false;
    }
    
    return childPath[parentPath.length] === 'items';
}

function clearDropIndicators() {
    document.querySelectorAll('.section-item, .container-item').forEach(el => {
        el.classList.remove('drag-over-top', 'drag-over-bottom', 'drag-over-inside');
    });
}

// ============= TEMPLATE STORAGE =============
const STORAGE_KEY = 'emailBuilder_templates';

function getTemplates() {
    const templates = localStorage.getItem(STORAGE_KEY);
    return templates ? JSON.parse(templates) : {};
}

function saveNamedTemplate() {
    const name = document.getElementById('template-name')?.value.trim();
    if (!name) {
        showMessage('Please enter a template name', 'error');
        return;
    }
    
    const templates = getTemplates();
    
    if (templates[name]) {
        if (!confirm(`Template "${name}" already exists. Overwrite?`)) {
            return;
        }
    }
    
    templates[name] = {
        structure: JSON.parse(JSON.stringify(structure)),
        masterSettings: JSON.parse(JSON.stringify(masterSettings)),
        canvasWidth: canvasWidth,
        date: new Date().toLocaleString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    const input = document.getElementById('template-name');
    if (input) input.value = '';
    updateTemplatesList();
    showMessage(`Template "${name}" saved!`, 'success');
}

function loadNamedTemplate(name) {
    const templates = getTemplates();
    const template = templates[name];
    
    if (!template) return;
    
    if (confirm(`Load template "${name}"? Current work will be lost.`)) {
        structure = JSON.parse(JSON.stringify(template.structure));
        masterSettings = JSON.parse(JSON.stringify(template.masterSettings));
        canvasWidth = template.canvasWidth || 600;
        if (canvasWidthInput) canvasWidthInput.value = canvasWidth;
        
        activePath = null;
        activeType = null;
        
        saveHistory();
        updateStructureList();
        showMasterSettings();
        updatePreview();
        showMessage(`Template "${name}" loaded!`, 'success');
    }
}

function deleteTemplate(name, event) {
    event.stopPropagation();
    
    if (!confirm(`Delete template "${name}"?`)) return;
    
    const templates = getTemplates();
    delete templates[name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    updateTemplatesList();
    showMessage(`Template "${name}" deleted`, 'success');
}

function updateTemplatesList() {
    const listDiv = document.getElementById('saved-templates-list');
    if (!listDiv) return;
    
    const templates = getTemplates();
    const names = Object.keys(templates);
    
    if (names.length === 0) {
        listDiv.innerHTML = '<div class="text-gray-400 text-sm text-center py-2">No saved templates</div>';
        return;
    }
    
    names.sort((a, b) => {
        return new Date(templates[b].date) - new Date(templates[a].date);
    });
    
    let html = '';
    names.forEach(name => {
        const template = templates[name];
        html += `
            <div class="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-2 rounded-lg cursor-pointer group" onclick="loadNamedTemplate('${name.replace(/'/g, "\\'")}')">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center">
                        <i class="fas fa-file-alt text-gray-400 mr-2 text-sm"></i>
                        <span class="text-sm font-medium truncate">${name}</span>
                    </div>
                    <div class="text-xs text-gray-400 ml-6">${template.date || ''}</div>
                </div>
                <button onclick="deleteTemplate('${name.replace(/'/g, "\\'")}', event)" class="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition" title="Delete">
                    <i class="fas fa-trash-alt text-sm"></i>
                </button>
            </div>
        `;
    });
    
    listDiv.innerHTML = html;
}

// ============= MAKE ALL FUNCTIONS GLOBALLY AVAILABLE =============
window.structure = structure;
window.activePath = activePath;
window.activeType = activeType;
window.canvasWidth = canvasWidth;
window.isMobilePreview = isMobilePreview;
window.masterSettings = masterSettings;

window.showMessage = showMessage;
window.sanitizeHtml = sanitizeHtml;
window.escapeHtml = escapeHtml;
window.getBackgroundStyle = getBackgroundStyle;
window.getItemByPath = getItemByPath;
window.getParentArrayAndIndex = getParentArrayAndIndex;
window.removeItemByPath = removeItemByPath;
window.countItems = countItems;
window.saveHistory = saveHistory;
window.undo = undo;
window.redo = redo;
window.togglePreview = togglePreview;
window.initPreviewFrame = initPreviewFrame;
window.getDefaultContainerContent = getDefaultContainerContent;
window.getContainerCount = getContainerCount;
window.getDefaultBlocks = getDefaultBlocks;
window.getDefaultContent = getDefaultContent;
window.showMasterSettings = showMasterSettings;
window.createMasterInput = createMasterInput;
window.createInput = createInput;
window.createCheckbox = createCheckbox;
window.removeSelected = removeSelected;
window.moveToContainer = moveToContainer;
window.generateEmailHtml = generateEmailHtml;
window.generateSectionRow = generateSectionRow;
window.generateContainerRow = generateContainerRow;
window.generateSectionContent = generateSectionContent;
window.updatePreview = updatePreview;
window.copyCode = copyCode;
window.saveToFile = saveToFile;
window.loadHtml = loadHtml;
window.addSection = addSection;
window.addContainer = addContainer;
window.addBlock = addBlock;
window.removeBlock = removeBlock;
window.moveBlockUp = moveBlockUp;
window.moveBlockDown = moveBlockDown;
window.getDefaultBlockContent = getDefaultBlockContent;
window.showProperties = showProperties;
window.showContainerProperties = showContainerProperties;
window.updateStructureList = updateStructureList;
window.renderItems = renderItems;
window.renderSectionItem = renderSectionItem;
window.renderContainerItem = renderContainerItem;
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDragEnd = handleDragEnd;
window.handleDrop = handleDrop;
window.pathsEqual = pathsEqual;
window.isDescendant = isDescendant;
window.clearDropIndicators = clearDropIndicators;
window.getTemplates = getTemplates;
window.saveNamedTemplate = saveNamedTemplate;
window.loadNamedTemplate = loadNamedTemplate;
window.deleteTemplate = deleteTemplate;
window.updateTemplatesList = updateTemplatesList;

console.log('Core.js loaded successfully');

// Ensure templates list is updated when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        updateTemplatesList();
        console.log('Templates loaded:', Object.keys(getTemplates()).length);
    }, 200);
});