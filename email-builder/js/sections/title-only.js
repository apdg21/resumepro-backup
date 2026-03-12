SectionRegistry.register('title-only', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            title: 'Your Title Here',
            fontSizeTitle: '24px',
            lineHeightTitle: '1.2',
            textColorTitle: '#000000',
            textAlign: 'center'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        return `
            <h1 style="font-size: ${content.fontSizeTitle}; line-height: ${content.lineHeightTitle}; color: ${content.textColorTitle}; margin: 0; text-align: ${content.textAlign};">${escapeHtml(content.title)}</h1>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        createInput('Title', 'title', 'text', 'Your Title Here', null, content, container);
        createInput('Font Size', 'fontSizeTitle', 'text', '24px', null, content, container);
        createInput('Line Height', 'lineHeightTitle', 'text', '1.2', null, content, container);
        createInput('Text Color', 'textColorTitle', 'color', '#000000', null, content, container);
        createInput('Text Align', 'textAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, container);
        createInput('Font Family', 'fontFamily', 'select', 'Arial, Helvetica, sans-serif', fontOptions, content, container);
    }
});