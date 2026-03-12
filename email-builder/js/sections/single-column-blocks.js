SectionRegistry.register('single-column-blocks', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            blocks: getDefaultBlocks(),
            order: ['image', 'title', 'text', 'button'],
            visible: {image: true, title: true, text: true, button: true},
            blockSpacing: '20px',
            blockAlign: 'center'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        const blocks = content.blocks || getDefaultBlocks();
        const order = content.order || ['image', 'title', 'text', 'button'];
        const visible = content.visible || {image: true, title: true, text: true, button: true};
        
        let blocksHtml = '';
        order.forEach(blockType => {
            if (visible[blockType] && blocks[blockType]) {
                if (blockType === 'image' && blocks.image.url) {
                    blocksHtml += `
                        <div style="text-align: ${blocks.image.align}; margin-bottom: 15px;">
                            <img src="${blocks.image.url}" alt="${blocks.image.altText}" style="max-width: 100%; height: auto; display: inline-block;" />
                        </div>
                    `;
                } else if (blockType === 'title') {
                    blocksHtml += `
                        <h2 style="font-size: ${blocks.title.fontSize}; color: ${blocks.title.color}; text-align: ${blocks.title.align}; line-height: ${blocks.title.lineHeight}; font-family: ${blocks.title.fontFamily}; margin: 0 0 10px 0;">
                            ${blocks.title.text}
                        </h2>
                    `;
                } else if (blockType === 'text') {
                    blocksHtml += `
                        <p style="font-size: ${blocks.text.fontSize}; color: ${blocks.text.color}; text-align: ${blocks.text.align}; line-height: ${blocks.text.lineHeight}; font-family: ${blocks.text.fontFamily}; margin: 0 0 15px 0;">
                            ${blocks.text.text}
                        </p>
                    `;
                } else if (blockType === 'button' && blocks.button.showButton) {
                    blocksHtml += `
                        <div style="text-align: ${blocks.button.align};">
                            <a href="${blocks.button.link}" style="display: inline-block; background-color: ${blocks.button.background}; color: ${blocks.button.color}; font-size: ${blocks.button.fontSize}; padding: ${blocks.button.padding}; border-radius: ${blocks.button.borderRadius}; text-decoration: none;">
                                ${blocks.button.text}
                            </a>
                        </div>
                    `;
                }
            }
        });
        
        return blocksHtml;
    },

    showProperties: function(section, container) {
        const content = section.content;
        const blocks = content.blocks || getDefaultBlocks();
        content.blocks = blocks;
        
        createInput('Block Spacing', 'blockSpacing', 'text', '20px', null, content, container);
        createInput('Block Align', 'blockAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, container);
        
        const imageDetails = document.createElement('details');
        imageDetails.classList.add('mb-2', 'border', 'rounded', 'p-2');
        imageDetails.innerHTML = `
            <summary class="font-medium cursor-pointer">Image Block</summary>
            <div class="p-2" id="image-block-props"></div>
        `;
        container.appendChild(imageDetails);
        
        const imageContainer = imageDetails.querySelector('#image-block-props');
        createInput('Image URL', 'url', 'text', 'https://placehold.co/200x200/EEEEEE/808080?text=Image', null, blocks.image, imageContainer);
        createInput('Alt Text', 'altText', 'text', 'Block Image', null, blocks.image, imageContainer);
        createInput('Link URL', 'link', 'text', '#', null, blocks.image, imageContainer);
        createInput('Align', 'align', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], blocks.image, imageContainer);
        
        const titleDetails = document.createElement('details');
        titleDetails.classList.add('mb-2', 'border', 'rounded', 'p-2');
        titleDetails.innerHTML = `
            <summary class="font-medium cursor-pointer">Title Block</summary>
            <div class="p-2" id="title-block-props"></div>
        `;
        container.appendChild(titleDetails);
        
        const titleContainer = titleDetails.querySelector('#title-block-props');
        createInput('Title Text', 'text', 'text', 'Title', null, blocks.title, titleContainer);
        createInput('Font Size', 'fontSize', 'text', '20px', null, blocks.title, titleContainer);
        createInput('Color', 'color', 'color', '#000000', null, blocks.title, titleContainer);
        createInput('Align', 'align', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], blocks.title, titleContainer);
        createInput('Line Height', 'lineHeight', 'text', '1.2', null, blocks.title, titleContainer);
        createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, blocks.title, titleContainer);
        
        const textDetails = document.createElement('details');
        textDetails.classList.add('mb-2', 'border', 'rounded', 'p-2');
        textDetails.innerHTML = `
            <summary class="font-medium cursor-pointer">Text Block</summary>
            <div class="p-2" id="text-block-props"></div>
        `;
        container.appendChild(textDetails);
        
        const textContainer = textDetails.querySelector('#text-block-props');
        createInput('Text Content', 'text', 'textarea', 'Description text.', null, blocks.text, textContainer);
        createInput('Font Size', 'fontSize', 'text', '14px', null, blocks.text, textContainer);
        createInput('Color', 'color', 'color', '#333333', null, blocks.text, textContainer);
        createInput('Align', 'align', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], blocks.text, textContainer);
        createInput('Line Height', 'lineHeight', 'text', '1.5', null, blocks.text, textContainer);
        createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, blocks.text, textContainer);
        
        const buttonDetails = document.createElement('details');
        buttonDetails.classList.add('mb-2', 'border', 'rounded', 'p-2');
        buttonDetails.innerHTML = `
            <summary class="font-medium cursor-pointer">Button Block</summary>
            <div class="p-2" id="button-block-props"></div>
        `;
        container.appendChild(buttonDetails);
        
        const buttonContainer = buttonDetails.querySelector('#button-block-props');
        createCheckbox('Show Button', 'showButton', blocks.button, buttonContainer);
        if (blocks.button.showButton) {
            createInput('Button Text', 'text', 'text', 'Button', null, blocks.button, buttonContainer);
            createInput('Button Link', 'link', 'text', '#', null, blocks.button, buttonContainer);
            createInput('Background', 'background', 'color', '#007bff', null, blocks.button, buttonContainer);
            createInput('Text Color', 'color', 'color', '#ffffff', null, blocks.button, buttonContainer);
            createInput('Font Size', 'fontSize', 'text', '16px', null, blocks.button, buttonContainer);
            createInput('Align', 'align', 'select', 'center', [
                {value: 'left', label: 'Left'},
                {value: 'center', label: 'Center'},
                {value: 'right', label: 'Right'}
            ], blocks.button, buttonContainer);
            createInput('Padding', 'padding', 'text', '10px 20px', null, blocks.button, buttonContainer);
            createInput('Border Radius', 'borderRadius', 'text', '4px', null, blocks.button, buttonContainer);
        }
    }
});