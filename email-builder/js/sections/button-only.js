SectionRegistry.register('button-only', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            buttonText: 'Click Me',
            buttonLink: '#',
            buttonBackground: '#007bff',
            buttonColor: '#ffffff',
            buttonFontSize: '16px',
            buttonPadding: '12px 24px',
            buttonBorderRadius: '4px',
            buttonAlign: 'center',
            buttonWidth: 'auto',
            buttonBorderWidth: '0px',
            buttonBorderColor: '#000000',
            buttonBorderStyle: 'solid'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        return `
            <table cellpadding="0" cellspacing="0" border="0" align="${content.buttonAlign}" style="margin: 0 auto;">
                <tr>
                    <td style="background-color: ${content.buttonBackground}; border: ${content.buttonBorderWidth} ${content.buttonBorderStyle} ${content.buttonBorderColor}; border-radius: ${content.buttonBorderRadius};">
                        <a href="${content.buttonLink}" target="_blank" style="font-size: ${content.buttonFontSize}; color: ${content.buttonColor}; padding: ${content.buttonPadding}; display: block; text-decoration: none; text-align: center;">${escapeHtml(content.buttonText)}</a>
                    </td>
                </tr>
            </table>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        createInput('Button Text', 'buttonText', 'text', 'Click Me', null, content, container);
        createInput('Button Link', 'buttonLink', 'text', '#', null, content, container);
        createInput('Button Color', 'buttonColor', 'color', '#ffffff', null, content, container);
        createInput('Button Background', 'buttonBackground', 'color', '#007bff', null, content, container);
        createInput('Font Size', 'buttonFontSize', 'text', '16px', null, content, container);
        createInput('Padding', 'buttonPadding', 'text', '12px 24px', null, content, container);
        createInput('Border Radius', 'buttonBorderRadius', 'text', '4px', null, content, container);
        createInput('Align', 'buttonAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, container);
    }
});