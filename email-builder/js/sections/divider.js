SectionRegistry.register('divider', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            height: '1px',
            color: '#cccccc',
            style: 'solid',
            align: 'center',
            width: '100%'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        return `
            <hr style="border: none; height: ${content.height}; width: ${content.width}; background-color: ${content.color}; border-top: ${content.height} ${content.style} ${content.color}; margin: 0 auto;" />
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        createInput('Height', 'height', 'text', '1px', null, content, container);
        createInput('Color', 'color', 'color', '#cccccc', null, content, container);
        createInput('Style', 'style', 'select', 'solid', [
            {value: 'solid', label: 'Solid'},
            {value: 'dashed', label: 'Dashed'},
            {value: 'dotted', label: 'Dotted'}
        ], content, container);
        createInput('Width', 'width', 'text', '100%', null, content, container);
        createInput('Align', 'align', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, container);
    }
});