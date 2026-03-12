SectionRegistry.register('three-column-blocks', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            columns: [
                { 
                    blocks: JSON.parse(JSON.stringify(getDefaultBlocks())),
                    visible: {image: true, title: true, text: true, button: true},
                    order: ['image', 'title', 'text', 'button']
                },
                { 
                    blocks: JSON.parse(JSON.stringify(getDefaultBlocks())),
                    visible: {image: true, title: true, text: true, button: true},
                    order: ['image', 'title', 'text', 'button']
                },
                { 
                    blocks: JSON.parse(JSON.stringify(getDefaultBlocks())),
                    visible: {image: true, title: true, text: true, button: true},
                    order: ['image', 'title', 'text', 'button']
                }
            ],
            columnGap: '20px',
            columnWidth: '33.33%',
            equalHeight: true
        };
    },

    generateContent: function(section) {
        const content = section.content;
        const columns = content.columns || [];
        const columnGap = content.columnGap || '20px';
        const colWidth = '33.33%';
        
        let columnsHtml = '<table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>';
        
        columns.forEach((column, index) => {
            const colBlocks = column.blocks || getDefaultBlocks();
            const colVisible = column.visible || {image: true, title: true, text: true, button: true};
            
            let colContent = '';
            
            if (colVisible.image !== false && colBlocks.image && colBlocks.image.url) {
                colContent += `
                    <div style="text-align: ${colBlocks.image.align}; margin-bottom: 15px;">
                        ${colBlocks.image.link && colBlocks.image.link !== '#' ? 
                            `<a href="${colBlocks.image.link}" style="text-decoration: none;">` : ''}
                        <img src="${colBlocks.image.url}" alt="${colBlocks.image.altText}" 
                             style="max-width: 100%; height: auto; display: inline-block;" />
                        ${colBlocks.image.link && colBlocks.image.link !== '#' ? '</a>' : ''}
                    </div>
                `;
            }
            
            if (colVisible.title !== false && colBlocks.title) {
                colContent += `
                    <h2 style="font-size: ${colBlocks.title.fontSize}; 
                               color: ${colBlocks.title.color}; 
                               text-align: ${colBlocks.title.align}; 
                               line-height: ${colBlocks.title.lineHeight}; 
                               font-family: ${colBlocks.title.fontFamily}; 
                               margin: 0 0 10px 0;">
                        ${colBlocks.title.text}
                    </h2>
                `;
            }
            
            if (colVisible.text !== false && colBlocks.text) {
                colContent += `
                    <p style="font-size: ${colBlocks.text.fontSize}; 
                              color: ${colBlocks.text.color}; 
                              text-align: ${colBlocks.text.align}; 
                              line-height: ${colBlocks.text.lineHeight}; 
                              font-family: ${colBlocks.text.fontFamily}; 
                              margin: 0 0 15px 0;">
                        ${colBlocks.text.text}
                    </p>
                `;
            }
            
            if (colVisible.button !== false && colBlocks.button && colBlocks.button.showButton) {
                colContent += `
                    <div style="text-align: ${colBlocks.button.align};">
                        <a href="${colBlocks.button.link}" 
                           style="display: inline-block; 
                                  background-color: ${colBlocks.button.background}; 
                                  color: ${colBlocks.button.color}; 
                                  font-size: ${colBlocks.button.fontSize}; 
                                  padding: ${colBlocks.button.padding}; 
                                  border-radius: ${colBlocks.button.borderRadius}; 
                                  text-decoration: none;">
                            ${colBlocks.button.text}
                        </a>
                    </div>
                `;
            }
            
            columnsHtml += `
                <td class="column" width="${colWidth}" 
                    style="vertical-align: top; 
                           padding-right: ${index < columns.length - 1 ? columnGap : '0'};">
                    ${colContent || '&nbsp;'}
                </td>
            `;
        });
        
        columnsHtml += '</tr></table>';
        return columnsHtml;
    },

    showProperties: function(section, container) {
        const content = section.content;
        const columns = content.columns || [];
        const columnCount = 3;
        
        for (let i = 0; i < columnCount; i++) {
            if (!columns[i]) {
                columns[i] = { 
                    blocks: JSON.parse(JSON.stringify(getDefaultBlocks())),
                    visible: {image: true, title: true, text: true, button: true},
                    order: ['image', 'title', 'text', 'button']
                };
            }
        }
        content.columns = columns;
        
        createInput('Column Gap', 'columnGap', 'text', '20px', null, content, container);
        createCheckbox('Equal Height', 'equalHeight', content, container);
        
        const tabsDiv = document.createElement('div');
        tabsDiv.classList.add('flex', 'mb-3', 'border-b', 'flex-wrap', 'gap-1');
        
        for (let i = 0; i < columnCount; i++) {
            const tab = document.createElement('button');
            tab.classList.add('px-3', 'py-1', 'mr-1', 'mb-1', 'text-sm', 'rounded-t-lg');
            if (i === 0) {
                tab.classList.add('bg-blue-500', 'text-white');
            } else {
                tab.classList.add('bg-gray-200', 'text-gray-700');
            }
            tab.textContent = `Column ${i + 1}`;
            tab.setAttribute('data-col', i);
            tab.onclick = function() {
                tabsDiv.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('bg-blue-500', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-700');
                });
                this.classList.remove('bg-gray-200', 'text-gray-700');
                this.classList.add('bg-blue-500', 'text-white');
                
                const colContents = container.querySelectorAll('.column-content');
                colContents.forEach(content => content.classList.add('hidden'));
                const targetContent = container.querySelector(`.column-content[data-col="${i}"]`);
                if (targetContent) targetContent.classList.remove('hidden');
            };
            tabsDiv.appendChild(tab);
        }
        container.appendChild(tabsDiv);
        
        for (let i = 0; i < columnCount; i++) {
            const column = columns[i];
            const colBlocks = column.blocks;
            
            const colDiv = document.createElement('div');
            colDiv.className = `column-content ${i === 0 ? '' : 'hidden'}`;
            colDiv.setAttribute('data-col', i);
            
            const colLabel = document.createElement('h4');
            colLabel.className = 'font-medium text-sm mb-2 text-gray-600';
            colLabel.textContent = `Column ${i + 1} Content`;
            colDiv.appendChild(colLabel);
            
            const imageDetails = document.createElement('details');
            imageDetails.classList.add('mb-2', 'border', 'rounded', 'p-2');
            imageDetails.open = true;
            imageDetails.innerHTML = `
                <summary class="font-medium cursor-pointer text-sm">Image Block</summary>
                <div class="p-2" id="col-${i}-image"></div>
            `;
            colDiv.appendChild(imageDetails);
            
            const imageContainer = imageDetails.querySelector(`div[id^="col-${i}-image"]`);
            createCheckbox('Show Image Block', 'image', column.visible, imageContainer);
            if (column.visible.image !== false) {
                createInput('Image URL', 'url', 'text', 'https://placehold.co/200x200/EEEEEE/808080?text=Image', null, colBlocks.image, imageContainer);
                createInput('Alt Text', 'altText', 'text', 'Block Image', null, colBlocks.image, imageContainer);
                createInput('Link URL', 'link', 'text', '#', null, colBlocks.image, imageContainer);
                createInput('Align', 'align', 'select', 'center', [
                    {value: 'left', label: 'Left'},
                    {value: 'center', label: 'Center'},
                    {value: 'right', label: 'Right'}
                ], colBlocks.image, imageContainer);
            }
            
            const titleDetails = document.createElement('details');
            titleDetails.classList.add('mb-2', 'border', 'rounded', 'p-2');
            titleDetails.open = true;
            titleDetails.innerHTML = `
                <summary class="font-medium cursor-pointer text-sm">Title Block</summary>
                <div class="p-2" id="col-${i}-title"></div>
            `;
            colDiv.appendChild(titleDetails);
            
            const titleContainer = titleDetails.querySelector(`div[id^="col-${i}-title"]`);
            createCheckbox('Show Title Block', 'title', column.visible, titleContainer);
            if (column.visible.title !== false) {
                createInput('Title Text', 'text', 'text', 'Title', null, colBlocks.title, titleContainer);
                createInput('Font Size', 'fontSize', 'text', '20px', null, colBlocks.title, titleContainer);
                createInput('Color', 'color', 'color', '#000000', null, colBlocks.title, titleContainer);
                createInput('Align', 'align', 'select', 'center', [
                    {value: 'left', label: 'Left'},
                    {value: 'center', label: 'Center'},
                    {value: 'right', label: 'Right'}
                ], colBlocks.title, titleContainer);
                createInput('Line Height', 'lineHeight', 'text', '1.2', null, colBlocks.title, titleContainer);
                createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, colBlocks.title, titleContainer);
            }
            
            const textDetails = document.createElement('details');
            textDetails.classList.add('mb-2', 'border', 'rounded', 'p-2');
            textDetails.open = true;
            textDetails.innerHTML = `
                <summary class="font-medium cursor-pointer text-sm">Text Block</summary>
                <div class="p-2" id="col-${i}-text"></div>
            `;
            colDiv.appendChild(textDetails);
            
            const textContainer = textDetails.querySelector(`div[id^="col-${i}-text"]`);
            createCheckbox('Show Text Block', 'text', column.visible, textContainer);
            if (column.visible.text !== false) {
                createInput('Text Content', 'text', 'textarea', 'Description text.', null, colBlocks.text, textContainer);
                createInput('Font Size', 'fontSize', 'text', '14px', null, colBlocks.text, textContainer);
                createInput('Color', 'color', 'color', '#333333', null, colBlocks.text, textContainer);
                createInput('Align', 'align', 'select', 'center', [
                    {value: 'left', label: 'Left'},
                    {value: 'center', label: 'Center'},
                    {value: 'right', label: 'Right'}
                ], colBlocks.text, textContainer);
                createInput('Line Height', 'lineHeight', 'text', '1.5', null, colBlocks.text, textContainer);
                createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, colBlocks.text, textContainer);
            }
            
            const buttonDetails = document.createElement('details');
            buttonDetails.classList.add('mb-2', 'border', 'rounded', 'p-2');
            buttonDetails.open = true;
            buttonDetails.innerHTML = `
                <summary class="font-medium cursor-pointer text-sm">Button Block</summary>
                <div class="p-2" id="col-${i}-button"></div>
            `;
            colDiv.appendChild(buttonDetails);
            
            const buttonContainer = buttonDetails.querySelector(`div[id^="col-${i}-button"]`);
            createCheckbox('Show Button Block', 'button', column.visible, buttonContainer);
            if (column.visible.button !== false) {
                createCheckbox('Enable Button', 'showButton', colBlocks.button, buttonContainer);
                if (colBlocks.button.showButton) {
                    createInput('Button Text', 'text', 'text', 'Button', null, colBlocks.button, buttonContainer);
                    createInput('Button Link', 'link', 'text', '#', null, colBlocks.button, buttonContainer);
                    createInput('Background', 'background', 'color', '#007bff', null, colBlocks.button, buttonContainer);
                    createInput('Text Color', 'color', 'color', '#ffffff', null, colBlocks.button, buttonContainer);
                    createInput('Font Size', 'fontSize', 'text', '16px', null, colBlocks.button, buttonContainer);
                    createInput('Align', 'align', 'select', 'center', [
                        {value: 'left', label: 'Left'},
                        {value: 'center', label: 'Center'},
                        {value: 'right', label: 'Right'}
                    ], colBlocks.button, buttonContainer);
                    createInput('Padding', 'padding', 'text', '10px 20px', null, colBlocks.button, buttonContainer);
                    createInput('Border Radius', 'borderRadius', 'text', '4px', null, colBlocks.button, buttonContainer);
                }
            }
            
            container.appendChild(colDiv);
        }
    }
});