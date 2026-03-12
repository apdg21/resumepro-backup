SectionRegistry.register('custom-html', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            html: '<p>Your custom HTML here</p>'
        };
    },

    generateContent: function(section) {
        return sanitizeHtml(section.content.html);
    },

    showProperties: function(section, container) {
        createInput('Custom HTML', 'html', 'textarea', '<p>Your custom HTML here</p>', null, section.content, container);
    }
});