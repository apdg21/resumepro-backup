SectionRegistry.register('header-image', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            imageUrl: 'https://placehold.co/600x200/3a86ff/ffffff?text=Company+Logo',
            altText: 'Company Logo',
            link: '#',
            imageAlign: 'center',
            imageWidth: '100%',
            maxWidth: '600px'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        const imageLink = content.link && content.link !== '#' ? content.link : null;
        const imageHtml = `
            <img src="${content.imageUrl}" alt="${escapeHtml(content.altText)}" style="display: block; width: ${content.imageWidth}; max-width: ${content.maxWidth}; height: auto; border: 0; margin: 0 auto;" />
        `;
        return imageLink ? `<a href="${imageLink}" style="text-decoration: none;">${imageHtml}</a>` : imageHtml;
    },

    showProperties: function(section, container) {
        const content = section.content;
        createInput('Image URL', 'imageUrl', 'text', 'https://placehold.co/600x200/3a86ff/ffffff?text=Company+Logo', null, content, container);
        createInput('Alt Text', 'altText', 'text', 'Company Logo', null, content, container);
        createInput('Link URL', 'link', 'text', '#', null, content, container);
        createInput('Image Width', 'imageWidth', 'text', '100%', null, content, container);
        createInput('Max Width', 'maxWidth', 'text', '600px', null, content, container);
        createInput('Image Align', 'imageAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, container);
    }
});