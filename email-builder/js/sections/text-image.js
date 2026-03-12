SectionRegistry.register('text-image', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            imageUrl: 'https://placehold.co/300x200/3a86ff/ffffff?text=Image',
            altText: 'Content Image',
            text: 'This is some text next to an image. You can edit this content.',
            fontSize: '16px',
            lineHeight: '1.5',
            textColor: '#333333',
            textAlign: 'left',
            imagePosition: 'left',
            imageWidth: '50%',
            textWidth: '50%',
            verticalAlign: 'middle',
            showButton: false,
            buttonText: 'Learn More',
            buttonLink: '#',
            buttonBackground: '#007bff',
            buttonColor: '#ffffff',
            buttonFontSize: '14px',
            buttonPadding: '8px 16px',
            buttonBorderRadius: '4px',
            buttonAlign: 'left'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        const imagePosition = content.imagePosition || 'left';
        const textWidth = content.textWidth || '50%';
        const imageWidth = content.imageWidth || '50%';
        
        const imgHtml = `
            <img src="${content.imageUrl}" alt="${escapeHtml(content.altText)}" style="display: block; width: 100%; max-width: 100%; height: auto; border: 0;" />
        `;
        
        let textHtml = `
            <p style="font-size: ${content.fontSize}; line-height: ${content.lineHeight}; color: ${content.textColor}; margin: 0; text-align: ${content.textAlign};">${escapeHtml(content.text)}</p>
        `;
        
        if (content.showButton) {
            textHtml += `
                <table cellpadding="0" cellspacing="0" border="0" align="${content.buttonAlign}" style="margin-top: 15px;">
                    <tr>
                        <td style="background-color: ${content.buttonBackground}; border-radius: ${content.buttonBorderRadius};">
                            <a href="${content.buttonLink}" style="font-size: ${content.buttonFontSize}; color: ${content.buttonColor}; padding: ${content.buttonPadding}; display: inline-block; text-decoration: none;">${escapeHtml(content.buttonText)}</a>
                        </td>
                    </tr>
                </table>
            `;
        }
        
        if (imagePosition === 'left') {
            return `
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td width="${imageWidth}" style="vertical-align: ${content.verticalAlign}; padding-right: 20px;">${imgHtml}</td>
                        <td width="${textWidth}" style="vertical-align: ${content.verticalAlign};">${textHtml}</td>
                    </tr>
                </table>
            `;
        } else {
            return `
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td width="${textWidth}" style="vertical-align: ${content.verticalAlign}; padding-right: 20px;">${textHtml}</td>
                        <td width="${imageWidth}" style="vertical-align: ${content.verticalAlign};">${imgHtml}</td>
                    </tr>
                </table>
            `;
        }
    },

    showProperties: function(section, container) {
        const content = section.content;
        createInput('Image URL', 'imageUrl', 'text', 'https://placehold.co/300x200/3a86ff/ffffff?text=Image', null, content, container);
        createInput('Alt Text', 'altText', 'text', 'Content Image', null, content, container);
        createInput('Text Content', 'text', 'textarea', 'This is some text next to an image.', null, content, container);
        createInput('Font Size', 'fontSize', 'text', '16px', null, content, container);
        createInput('Text Color', 'textColor', 'color', '#333333', null, content, container);
        createInput('Image Position', 'imagePosition', 'select', 'left', [
            {value: 'left', label: 'Left'},
            {value: 'right', label: 'Right'}
        ], content, container);
        createInput('Image Width', 'imageWidth', 'text', '50%', null, content, container);
        createCheckbox('Show Button', 'showButton', content, container);
        if (content.showButton) {
            createInput('Button Text', 'buttonText', 'text', 'Learn More', null, content, container);
            createInput('Button Link', 'buttonLink', 'text', '#', null, content, container);
            createInput('Button Background', 'buttonBackground', 'color', '#007bff', null, content, container);
            createInput('Button Color', 'buttonColor', 'color', '#ffffff', null, content, container);
        }
    }
});