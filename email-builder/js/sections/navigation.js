SectionRegistry.register('navigation', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            menuItems: [
                { text: 'Home', link: '#', active: true },
                { text: 'Products', link: '#', active: false },
                { text: 'Services', link: '#', active: false },
                { text: 'Contact', link: '#', active: false }
            ],
            alignment: 'center',
            itemSpacing: '20px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '16px',
            textColor: '#333333',
            activeColor: '#3a86ff',
            backgroundColor: 'transparent',
            itemPadding: '10px 15px',
            itemBorderRadius: '4px',
            layout: 'horizontal'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        const menuItems = content.menuItems || [];
        let navHtml = '<table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;"><tr>';
        
        menuItems.forEach((item, index) => {
            const isActive = item.active || false;
            const color = isActive ? content.activeColor : content.textColor;
            const spacing = index < menuItems.length - 1 ? `padding-right: ${content.itemSpacing};` : '';
            
            navHtml += `
                <td align="${content.alignment}" style="font-family: ${content.fontFamily}; font-size: ${content.fontSize}; ${spacing}">
                    <a href="${item.link}" style="color: ${color}; text-decoration: none; padding: ${content.itemPadding}; border-radius: ${content.itemBorderRadius}; background-color: ${content.backgroundColor}; display: inline-block;${isActive ? ' font-weight: bold;' : ''}">${escapeHtml(item.text)}</a>
                </td>
            `;
        });
        
        navHtml += '</tr></table>';
        return navHtml;
    },

    showProperties: function(section, container) {
        const content = section.content;
        
        // Menu Items Management Section
        const menuDetails = document.createElement('details');
        menuDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        menuDetails.open = true;
        const menuSummary = document.createElement('summary');
        menuSummary.textContent = 'Menu Items';
        menuSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        menuDetails.appendChild(menuSummary);
        const menuContainer = document.createElement('div');
        menuContainer.classList.add('space-y-3');
        menuDetails.appendChild(menuContainer);
        container.appendChild(menuDetails);
        
        // Function to render menu items
        function renderMenuItems() {
            menuContainer.innerHTML = '';
            
            if (!content.menuItems || content.menuItems.length === 0) {
                const emptyDiv = document.createElement('div');
                emptyDiv.classList.add('text-center', 'text-gray-400', 'p-3', 'border', 'border-dashed', 'rounded');
                emptyDiv.innerHTML = '<i class="fas fa-bars mb-1"></i><p class="text-sm">No menu items</p>';
                menuContainer.appendChild(emptyDiv);
            } else {
                content.menuItems.forEach((item, index) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('border', 'rounded', 'p-3', 'bg-gray-50', 'relative');
                    
                    // Item header with controls
                    const headerDiv = document.createElement('div');
                    headerDiv.classList.add('flex', 'justify-between', 'items-center', 'mb-2');
                    headerDiv.innerHTML = `
                        <span class="font-medium text-sm">Item ${index + 1}</span>
                        <div class="flex gap-1">
                            <button class="text-blue-600 hover:text-blue-800 p-1 text-sm" title="Move Up" onclick="moveMenuItem('${section.id}', ${index}, 'up')">
                                <i class="fas fa-arrow-up"></i>
                            </button>
                            <button class="text-blue-600 hover:text-blue-800 p-1 text-sm" title="Move Down" onclick="moveMenuItem('${section.id}', ${index}, 'down')">
                                <i class="fas fa-arrow-down"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-800 p-1 text-sm" title="Remove" onclick="removeMenuItem('${section.id}', ${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    itemDiv.appendChild(headerDiv);
                    
                    // Item fields
                    const fieldsDiv = document.createElement('div');
                    fieldsDiv.classList.add('space-y-2');
                    
                    // Text field
                    const textDiv = document.createElement('div');
                    textDiv.innerHTML = `
                        <label class="property-label">Text</label>
                        <input type="text" class="property-input" value="${escapeHtml(item.text || '')}" 
                               onchange="updateMenuItem('${section.id}', ${index}, 'text', this.value)">
                    `;
                    fieldsDiv.appendChild(textDiv);
                    
                    // Link field
                    const linkDiv = document.createElement('div');
                    linkDiv.innerHTML = `
                        <label class="property-label">Link URL</label>
                        <input type="text" class="property-input" value="${escapeHtml(item.link || '#')}" 
                               onchange="updateMenuItem('${section.id}', ${index}, 'link', this.value)">
                    `;
                    fieldsDiv.appendChild(linkDiv);
                    
                    // Active checkbox
                    const activeDiv = document.createElement('div');
                    activeDiv.classList.add('flex', 'items-center', 'mt-2');
                    activeDiv.innerHTML = `
                        <input type="checkbox" class="property-checkbox" id="active-${section.id}-${index}" 
                               ${item.active ? 'checked' : ''} onchange="updateMenuItem('${section.id}', ${index}, 'active', this.checked)">
                        <label for="active-${section.id}-${index}" class="property-label mb-0 ml-1">Set as Active</label>
                    `;
                    fieldsDiv.appendChild(activeDiv);
                    
                    itemDiv.appendChild(fieldsDiv);
                    menuContainer.appendChild(itemDiv);
                });
            }
            
            // Add new item button
            const addButton = document.createElement('button');
            addButton.classList.add('w-full', 'mt-2', 'bg-green-100', 'hover:bg-green-200', 'text-green-700', 'p-2', 'rounded', 'text-sm', 'flex', 'items-center', 'justify-center', 'transition');
            addButton.innerHTML = '<i class="fas fa-plus mr-1"></i> Add Menu Item';
            addButton.onclick = () => addMenuItem(section);
            menuContainer.appendChild(addButton);
        }
        
        renderMenuItems();
        
        // Styling Options
        const styleDetails = document.createElement('details');
        styleDetails.classList.add('mb-2', 'border', 'rounded', 'p-2');
        styleDetails.open = true;
        const styleSummary = document.createElement('summary');
        styleSummary.textContent = 'Styling Options';
        styleSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        styleDetails.appendChild(styleSummary);
        const styleContainer = document.createElement('div');
        styleContainer.classList.add('p-2');
        styleDetails.appendChild(styleContainer);
        container.appendChild(styleDetails);
        
        createInput('Font Size', 'fontSize', 'text', '16px', null, content, styleContainer);
        createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, content, styleContainer);
        createInput('Text Color', 'textColor', 'color', '#333333', null, content, styleContainer);
        createInput('Active Color', 'activeColor', 'color', '#3a86ff', null, content, styleContainer);
        createInput('Background Color', 'backgroundColor', 'color', 'transparent', null, content, styleContainer);
        createInput('Item Spacing', 'itemSpacing', 'text', '20px', null, content, styleContainer);
        createInput('Item Padding', 'itemPadding', 'text', '10px 15px', null, content, styleContainer);
        createInput('Item Border Radius', 'itemBorderRadius', 'text', '4px', null, content, styleContainer);
        createInput('Alignment', 'alignment', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, styleContainer);
        
        // Store render function for updates
        section.__renderMenuItems = renderMenuItems;
    }
});

// Helper functions for menu item management
window.addMenuItem = function(section) {
    if (!section.content.menuItems) {
        section.content.menuItems = [];
    }
    section.content.menuItems.push({
        text: 'New Item',
        link: '#',
        active: false
    });
    if (section.__renderMenuItems) section.__renderMenuItems();
    saveHistory();
    updatePreview();
};

window.removeMenuItem = function(sectionId, index) {
    const section = findSectionById(sectionId);
    if (section && section.content.menuItems) {
        section.content.menuItems.splice(index, 1);
        if (section.__renderMenuItems) section.__renderMenuItems();
        saveHistory();
        updatePreview();
    }
};

window.updateMenuItem = function(sectionId, index, field, value) {
    const section = findSectionById(sectionId);
    if (section && section.content.menuItems && section.content.menuItems[index]) {
        section.content.menuItems[index][field] = value;
        saveHistory();
        updatePreview();
    }
};

window.moveMenuItem = function(sectionId, index, direction) {
    const section = findSectionById(sectionId);
    if (!section || !section.content.menuItems) return;
    
    const items = section.content.menuItems;
    if (direction === 'up' && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
    } else if (direction === 'down' && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
    } else {
        return;
    }
    
    if (section.__renderMenuItems) section.__renderMenuItems();
    saveHistory();
    updatePreview();
};

// Helper function to find section by ID
function findSectionById(id, items = structure) {
    for (let item of items) {
        if (item.id === id) return item;
        if (item.type === 'container' && item.items) {
            const found = findSectionById(id, item.items);
            if (found) return found;
        }
    }
    return null;
}