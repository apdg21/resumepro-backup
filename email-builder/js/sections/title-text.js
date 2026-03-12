SectionRegistry.register('title-text', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            title: 'Your Title Here',
            text: 'This is a paragraph of text. You can edit this.',
            fontSizeTitle: '24px',
            fontSizeText: '16px',
            lineHeightTitle: '1.2',
            lineHeightText: '1.5',
            textColorTitle: '#000000',
            textColorText: '#333333',
            textAlign: 'center'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        return `
            <h1 style="font-size: ${content.fontSizeTitle}; line-height: ${content.lineHeightTitle}; color: ${content.textColorTitle}; margin: 0 0 10px 0; text-align: ${content.textAlign};">${escapeHtml(content.title)}</h1>
            <p style="font-size: ${content.fontSizeText}; line-height: ${content.lineHeightText}; color: ${content.textColorText}; margin: 0; text-align: ${content.textAlign};">${escapeHtml(content.text)}</p>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        
        createInput('Title', 'title', 'text', 'Your Title Here', null, content, container);
        createInput('Title Font Size', 'fontSizeTitle', 'text', '24px', null, content, container);
        createInput('Title Line Height', 'lineHeightTitle', 'text', '1.2', null, content, container);
        createInput('Title Color', 'textColorTitle', 'color', '#000000', null, content, container);
        
        createInput('Text', 'text', 'textarea', 'This is a paragraph of text. You can edit this.', null, content, container);
        createInput('Text Font Size', 'fontSizeText', 'text', '16px', null, content, container);
        createInput('Text Line Height', 'lineHeightText', 'text', '1.5', null, content, container);
        createInput('Text Color', 'textColorText', 'color', '#333333', null, content, container);
        
        createInput('Text Align', 'textAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, container);
        createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, content, container);
    }
});