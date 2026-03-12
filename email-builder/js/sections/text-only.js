SectionRegistry.register('text-only', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            text: 'This is a paragraph of text. You can edit this.',
            fontSizeText: '16px',
            lineHeightText: '1.5',
            textColorText: '#333333',
            textAlign: 'center'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        return `
            <p style="font-size: ${content.fontSizeText}; line-height: ${content.lineHeightText}; color: ${content.textColorText}; margin: 0; text-align: ${content.textAlign};">${escapeHtml(content.text)}</p>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        createInput('Text', 'text', 'textarea', 'This is a paragraph of text. You can edit this.', null, content, container);
        createInput('Font Size', 'fontSizeText', 'text', '16px', null, content, container);
        createInput('Line Height', 'lineHeightText', 'text', '1.5', null, content, container);
        createInput('Text Color', 'textColorText', 'color', '#333333', null, content, container);
        createInput('Text Align', 'textAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, container);
        createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, content, container);
    }
});