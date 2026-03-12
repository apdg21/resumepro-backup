SectionRegistry.register('hero', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            backgroundType: 'image',
            backgroundImage: 'https://placehold.co/600x400/1a1a1a/ffffff?text=Hero+Background',
            backgroundColor: '#1a1a1a',
            overlayColor: 'rgba(0,0,0,0.5)',
            overlayTitle: 'Hero Title',
            overlayText: 'Hero description text goes here. You can edit this content.',
            overlayTextColor: '#ffffff',
            overlayAlign: 'center',
            showOverlayButton: true,
            overlayButtonText: 'Learn More',
            overlayButtonLink: '#',
            overlayButtonBackground: '#ffffff',
            overlayButtonColor: '#000000',
            overlayButtonAlign: 'center',
            overlayButtonWidth: 'auto',
            overlayButtonFontSize: '16px',
            overlayButtonPadding: '12px 24px',
            overlayButtonBorderRadius: '4px',
            overlayButtonBorderWidth: '0px',
            overlayButtonBorderStyle: 'solid',
            overlayButtonBorderColor: '#000000',
            titleFontSize: '36px',
            textFontSize: '18px',
            lineHeightTitle: '1.2',
            lineHeightText: '1.5'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        const overlayStyle = `
            background-image: linear-gradient(${content.overlayColor}, ${content.overlayColor}), url(${content.backgroundImage});
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        `;
        
        let heroContent = `
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="height: 100%;">
                <tr>
                    <td align="${content.overlayAlign}" style="padding: 40px 20px;">
                        <h1 style="font-size: ${content.titleFontSize}; line-height: ${content.lineHeightTitle}; color: ${content.overlayTextColor}; margin: 0 0 15px 0;">${escapeHtml(content.overlayTitle)}</h1>
                        <p style="font-size: ${content.textFontSize}; line-height: ${content.lineHeightText}; color: ${content.overlayTextColor}; margin: 0 0 20px 0;">${escapeHtml(content.overlayText)}</p>
        `;
        
        if (content.showOverlayButton) {
            heroContent += `
                <table cellpadding="0" cellspacing="0" border="0" align="${content.overlayButtonAlign}" style="margin: 0 auto;">
                    <tr>
                        <td style="background-color: ${content.overlayButtonBackground}; border: ${content.overlayButtonBorderWidth} ${content.overlayButtonBorderStyle} ${content.overlayButtonBorderColor}; border-radius: ${content.overlayButtonBorderRadius};">
                            <a href="${content.overlayButtonLink}" style="font-size: ${content.overlayButtonFontSize}; color: ${content.overlayButtonColor}; padding: ${content.overlayButtonPadding}; display: inline-block; text-decoration: none;">${escapeHtml(content.overlayButtonText)}</a>
                        </td>
                    </tr>
                </table>
            `;
        }
        
        heroContent += `</td></tr></table>`;
        
        return `<div style="${overlayStyle}">${heroContent}</div>`;
    },

    showProperties: function(section, container) {
        const content = section.content;
        createInput('Background Image', 'backgroundImage', 'text', 'https://placehold.co/600x400/1a1a1a/ffffff?text=Hero+Background', null, content, container);
        createInput('Overlay Color', 'overlayColor', 'text', 'rgba(0,0,0,0.5)', null, content, container);
        createInput('Title', 'overlayTitle', 'text', 'Hero Title', null, content, container);
        createInput('Title Font Size', 'titleFontSize', 'text', '36px', null, content, container);
        createInput('Text', 'overlayText', 'textarea', 'Hero description text.', null, content, container);
        createInput('Text Font Size', 'textFontSize', 'text', '18px', null, content, container);
        createInput('Text Color', 'overlayTextColor', 'color', '#ffffff', null, content, container);
        createInput('Alignment', 'overlayAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, container);
        createCheckbox('Show Button', 'showOverlayButton', content, container);
        if (content.showOverlayButton) {
            createInput('Button Text', 'overlayButtonText', 'text', 'Learn More', null, content, container);
            createInput('Button Link', 'overlayButtonLink', 'text', '#', null, content, container);
            createInput('Button Background', 'overlayButtonBackground', 'color', '#ffffff', null, content, container);
            createInput('Button Color', 'overlayButtonColor', 'color', '#000000', null, content, container);
        }
    }
});