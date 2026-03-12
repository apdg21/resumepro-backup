SectionRegistry.register('image-only', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            imageUrl: 'https://placehold.co/600x300/3a86ff/ffffff?text=Full+Width+Image',
            altText: 'Full Width Image',
            link: '#',
            imageAlign: 'center',
            imageWidth: '100%',
            maxWidth: '600px',
            caption: '',
            captionColor: '#666666',
            captionFontSize: '14px'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        const imageLinkUrl = content.link && content.link !== '#' ? content.link : null;
        const fullImageHtml = `
            <img src="${content.imageUrl}" alt="${escapeHtml(content.altText)}" style="display: block; width: ${content.imageWidth}; max-width: ${content.maxWidth || '100%'}; height: auto; border: 0; margin: 0 auto;" />
            ${content.caption ? `<p style="text-align: center; color: ${content.captionColor}; font-size: ${content.captionFontSize}; margin-top: 5px;">${escapeHtml(content.caption)}</p>` : ''}
        `;
        return imageLinkUrl ? `<a href="${imageLinkUrl}" style="text-decoration: none;">${fullImageHtml}</a>` : fullImageHtml;
    },

    showProperties: function(section, container) {
        const content = section.content;
        createInput('Image URL', 'imageUrl', 'text', 'https://placehold.co/600x300/3a86ff/ffffff?text=Full+Width+Image', null, content, container);
        createInput('Alt Text', 'altText', 'text', 'Full Width Image', null, content, container);
        createInput('Link URL', 'link', 'text', '#', null, content, container);
        createInput('Caption', 'caption', 'text', '', null, content, container);
        createInput('Image Width', 'imageWidth', 'text', '100%', null, content, container);
    }
});