// Section Registry - Make it globally available
window.SectionRegistry = (function() {
    const sections = {
        'default': {
            getDefaultContent: function(commonStyles) {
                return commonStyles;
            },
            generateContent: function(section) {
                return `<div>Section type: ${section.type}</div>`;
            },
            showProperties: function(section, container) {
                // Default properties handled in core
            }
        }
    };

    return {
        sections: sections,

        register: function(type, handler) {
            sections[type] = handler;
            console.log('✅ Registered section:', type);
        },

        getHandler: function(type) {
            return sections[type] || sections['default'];
        },

        getAllTypes: function() {
            return Object.keys(sections);
        }
    };
})();

// Make sure it's globally available
console.log('SectionRegistry loaded:', window.SectionRegistry);