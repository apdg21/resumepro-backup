SectionRegistry.register('dynamic-blocks', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            blocks: []
        };
    },

    generateContent: function(section) {
        const content = section.content;
        const blocks = content.blocks || [];
        
        if (blocks.length === 0) {
            return '<p style="text-align: center; color: #999; padding: 20px;">No blocks added yet</p>';
        }
        
        let html = '';
        
        blocks.forEach(block => {
            switch(block.type) {
                case 'title':
                    html += `
                        <h2 style="font-size: ${block.content.fontSize}; 
                                  color: ${block.content.color}; 
                                  text-align: ${block.content.align}; 
                                  line-height: ${block.content.lineHeight}; 
                                  font-family: ${block.content.fontFamily}; 
                                  margin: 0 0 15px 0;">
                            ${escapeHtml(block.content.text)}
                        </h2>
                    `;
                    break;
                    
                case 'text':
                    html += `
                        <p style="font-size: ${block.content.fontSize}; 
                                 color: ${block.content.color}; 
                                 text-align: ${block.content.align}; 
                                 line-height: ${block.content.lineHeight}; 
                                 font-family: ${block.content.fontFamily}; 
                                 margin: 0 0 15px 0;">
                            ${escapeHtml(block.content.text)}
                        </p>
                    `;
                    break;
                    
                case 'image':
                    const imgLink = block.content.link && block.content.link !== '#' ? block.content.link : null;
                    const imgTag = `
                        <img src="${block.content.url}" alt="${escapeHtml(block.content.altText)}" 
                             style="display: block; width: ${block.content.width}; max-width: ${block.content.maxWidth}; height: auto; border: 0; margin: 0 auto;" />
                    `;
                    html += `<div style="text-align: ${block.content.align}; margin-bottom: 15px;">`;
                    html += imgLink ? `<a href="${imgLink}" style="text-decoration: none;">${imgTag}</a>` : imgTag;
                    html += `</div>`;
                    break;
                    
                case 'button':
                    html += `
                        <div style="text-align: ${block.content.align}; margin-bottom: 15px;">
                            <a href="${block.content.link}" 
                               style="display: inline-block; 
                                      background-color: ${block.content.background}; 
                                      color: ${block.content.color}; 
                                      font-size: ${block.content.fontSize}; 
                                      padding: ${block.content.padding}; 
                                      border-radius: ${block.content.borderRadius}; 
                                      text-decoration: none;">
                                ${escapeHtml(block.content.text)}
                            </a>
                        </div>
                    `;
                    break;
                    
                case 'two-column':
                    const position = block.content.imagePosition || 'left';
                    const col1 = position === 'left' ? 'image' : 'text';
                    const col2 = position === 'left' ? 'text' : 'image';
                    
                    const twoColHtml = `
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 15px;">
                            <tr>
                                <td width="50%" style="vertical-align: middle; ${col1 === 'image' ? 'padding-right: 15px;' : ''}">
                                    ${col1 === 'image' ? 
                                        `<img src="${block.content.imageUrl}" alt="${escapeHtml(block.content.altText)}" style="display: block; width: 100%; height: auto;" />` :
                                        `<div style="font-size: ${block.content.fontSize}; color: ${block.content.textColor};">${escapeHtml(block.content.text)}</div>`
                                    }
                                </td>
                                <td width="50%" style="vertical-align: middle; ${col2 === 'image' ? 'padding-left: 15px;' : ''}">
                                    ${col2 === 'image' ? 
                                        `<img src="${block.content.imageUrl}" alt="${escapeHtml(block.content.altText)}" style="display: block; width: 100%; height: auto;" />` :
                                        `<div style="font-size: ${block.content.fontSize}; color: ${block.content.textColor};">${escapeHtml(block.content.text)}</div>`
                                    }
                                </td>
                            </tr>
                        </table>
                    `;
                    
                    html += twoColHtml;
                    
                    if (block.content.showButton) {
                        html += `
                            <div style="text-align: center; margin-top: 10px;">
                                <a href="${block.content.buttonLink}" 
                                   style="display: inline-block; 
                                          background-color: ${block.content.buttonBackground}; 
                                          color: ${block.content.buttonColor}; 
                                          font-size: 14px; 
                                          padding: 8px 16px; 
                                          border-radius: 4px; 
                                          text-decoration: none;">
                                    ${escapeHtml(block.content.buttonText)}
                                </a>
                            </div>
                        `;
                    }
                    break;
            }
        });
        
        return html;
    },

    showProperties: function(section, container) {
        const content = section.content;
        
        const addBlockDiv = document.createElement('div');
        addBlockDiv.classList.add('mb-4', 'flex', 'flex-wrap', 'gap-2');
        
        const blockSelect = document.createElement('select');
        blockSelect.classList.add('property-select', 'flex-1');
        blockTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.label;
            blockSelect.appendChild(option);
        });
        
        const addBtn = document.createElement('button');
        addBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white', 'px-3', 'py-2', 'rounded-lg', 'text-sm', 'flex', 'items-center');
        addBtn.innerHTML = '<i class="fas fa-plus mr-1"></i> Add';
        addBtn.onclick = () => addBlock(section, blockSelect.value);
        
        addBlockDiv.appendChild(blockSelect);
        addBlockDiv.appendChild(addBtn);
        container.appendChild(addBlockDiv);
        
        if (!content.blocks || content.blocks.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('text-center', 'text-gray-400', 'p-4', 'border', 'border-dashed', 'rounded-lg');
            emptyDiv.innerHTML = '<i class="fas fa-cubes mb-2 text-3xl"></i><p>No blocks yet. Add your first block above.</p>';
            container.appendChild(emptyDiv);
            return;
        }
        
        const blocksContainer = document.createElement('div');
        blocksContainer.classList.add('space-y-3');
        
        content.blocks.forEach((block, index) => {
            const blockDiv = document.createElement('div');
            blockDiv.classList.add('block-item');
            
            const blockType = blockTypes.find(t => t.value === block.type) || { label: block.type };
            
            const headerDiv = document.createElement('div');
            headerDiv.classList.add('block-header', 'mb-2');
            headerDiv.innerHTML = `
                <span class="font-medium text-sm">
                    <i class="fas ${blockType.icon || 'fa-cube'} mr-1 text-blue-500"></i>
                    ${blockType.label}
                </span>
                <div class="block-controls">
                    <button class="text-gray-600 hover:text-blue-600" title="Move Up" onclick="moveBlockUp(getItemByPath(${JSON.stringify(activePath)}), ${index})">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="text-gray-600 hover:text-blue-600" title="Move Down" onclick="moveBlockDown(getItemByPath(${JSON.stringify(activePath)}), ${index})">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-800" title="Remove" onclick="if(confirm(\'Remove this block?\')) removeBlock(getItemByPath(${JSON.stringify(activePath)}), ${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            blockDiv.appendChild(headerDiv);
            
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('mt-2', 'pl-2', 'border-l-2', 'border-gray-200');
            
            switch(block.type) {
                case 'title':
                    createInput('Text', 'text', 'text', 'Title', null, block.content, contentDiv);
                    createInput('Font Size', 'fontSize', 'text', '24px', null, block.content, contentDiv);
                    createInput('Color', 'color', 'color', '#000000', null, block.content, contentDiv);
                    createInput('Align', 'align', 'select', 'center', [
                        {value: 'left', label: 'Left'},
                        {value: 'center', label: 'Center'},
                        {value: 'right', label: 'Right'}
                    ], block.content, contentDiv);
                    createInput('Line Height', 'lineHeight', 'text', '1.2', null, block.content, contentDiv);
                    createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, block.content, contentDiv);
                    break;
                    
                case 'text':
                    createInput('Text', 'text', 'textarea', 'Text content', null, block.content, contentDiv);
                    createInput('Font Size', 'fontSize', 'text', '16px', null, block.content, contentDiv);
                    createInput('Color', 'color', 'color', '#333333', null, block.content, contentDiv);
                    createInput('Align', 'align', 'select', 'left', [
                        {value: 'left', label: 'Left'},
                        {value: 'center', label: 'Center'},
                        {value: 'right', label: 'Right'}
                    ], block.content, contentDiv);
                    createInput('Line Height', 'lineHeight', 'text', '1.5', null, block.content, contentDiv);
                    createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, block.content, contentDiv);
                    break;
                    
                case 'image':
                    createInput('Image URL', 'url', 'text', 'https://placehold.co/600x300/3a86ff/ffffff?text=Image', null, block.content, contentDiv);
                    createInput('Alt Text', 'altText', 'text', 'Image', null, block.content, contentDiv);
                    createInput('Link URL', 'link', 'text', '#', null, block.content, contentDiv);
                    createInput('Align', 'align', 'select', 'center', [
                        {value: 'left', label: 'Left'},
                        {value: 'center', label: 'Center'},
                        {value: 'right', label: 'Right'}
                    ], block.content, contentDiv);
                    createInput('Width', 'width', 'text', '100%', null, block.content, contentDiv);
                    createInput('Max Width', 'maxWidth', 'text', '600px', null, block.content, contentDiv);
                    break;
                    
                case 'button':
                    createInput('Text', 'text', 'text', 'Click Me', null, block.content, contentDiv);
                    createInput('Link', 'link', 'text', '#', null, block.content, contentDiv);
                    createInput('Background', 'background', 'color', '#007bff', null, block.content, contentDiv);
                    createInput('Text Color', 'color', 'color', '#ffffff', null, block.content, contentDiv);
                    createInput('Font Size', 'fontSize', 'text', '16px', null, block.content, contentDiv);
                    createInput('Align', 'align', 'select', 'center', [
                        {value: 'left', label: 'Left'},
                        {value: 'center', label: 'Center'},
                        {value: 'right', label: 'Right'}
                    ], block.content, contentDiv);
                    createInput('Padding', 'padding', 'text', '12px 24px', null, block.content, contentDiv);
                    createInput('Border Radius', 'borderRadius', 'text', '4px', null, block.content, contentDiv);
                    break;
                    
                case 'two-column':
                    createInput('Image Position', 'imagePosition', 'select', 'left', [
                        {value: 'left', label: 'Left'},
                        {value: 'right', label: 'Right'}
                    ], block.content, contentDiv);
                    createInput('Image URL', 'imageUrl', 'text', 'https://placehold.co/300x200/3a86ff/ffffff?text=Image', null, block.content, contentDiv);
                    createInput('Alt Text', 'altText', 'text', 'Image', null, block.content, contentDiv);
                    createInput('Text', 'text', 'textarea', 'Text content', null, block.content, contentDiv);
                    createInput('Font Size', 'fontSize', 'text', '16px', null, block.content, contentDiv);
                    createInput('Text Color', 'textColor', 'color', '#333333', null, block.content, contentDiv);
                    createCheckbox('Show Button', 'showButton', block.content, contentDiv);
                    if (block.content.showButton) {
                        createInput('Button Text', 'buttonText', 'text', 'Button', null, block.content, contentDiv);
                        createInput('Button Link', 'buttonLink', 'text', '#', null, block.content, contentDiv);
                        createInput('Button Background', 'buttonBackground', 'color', '#007bff', null, block.content, contentDiv);
                        createInput('Button Color', 'buttonColor', 'color', '#ffffff', null, block.content, contentDiv);
                    }
                    break;
            }
            
            blockDiv.appendChild(contentDiv);
            blocksContainer.appendChild(blockDiv);
        });
        
        container.appendChild(blocksContainer);
    }
});