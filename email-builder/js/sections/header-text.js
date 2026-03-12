SectionRegistry.register('header-text', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            title: 'Company Name',
            fontSizeTitle: '24px',
            lineHeightTitle: '1.2',
            textColorTitle: '#000000',
            textAlign: 'center',
            showSubtitle: false,
            subtitle: 'Tagline here',
            subtitleFontSize: '14px',
            subtitleColor: '#666666'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        return `
            <h1 style="font-size: ${content.fontSizeTitle}; line-height: ${content.lineHeightTitle}; color: ${content.textColorTitle}; margin: 0; text-align: ${content.textAlign};">${escapeHtml(content.title)}</h1>
            ${content.showSubtitle ? `<p style="font-size: ${content.subtitleFontSize}; color: ${content.subtitleColor}; margin-top: 5px; text-align: ${content.textAlign};">${escapeHtml(content.subtitle)}</p>` : ''}
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        createInput('Title', 'title', 'text', 'Company Name', null, content, container);
        createInput('Font Size', 'fontSizeTitle', 'text', '24px', null, content, container);
        createInput('Text Color', 'textColorTitle', 'color', '#000000', null, content, container);
        createCheckbox('Show Subtitle', 'showSubtitle', content, container);
        if (content.showSubtitle) {
            createInput('Subtitle', 'subtitle', 'text', 'Tagline', null, content, container);
            createInput('Subtitle Font Size', 'subtitleFontSize', 'text', '14px', null, content, container);
            createInput('Subtitle Color', 'subtitleColor', 'color', '#666666', null, content, container);
        }
        createInput('Text Align', 'textAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, container);
    }
});