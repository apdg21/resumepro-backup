SectionRegistry.register('promo-code', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            // Container settings
            containerBgColor: '#f9f7f2',
            containerBorderColor: '#C5A059',
            containerBorderStyle: 'dashed',
            containerBorderWidth: '2px',
            containerPadding: '30px',
            containerMargin: '30px 0',
            containerBorderRadius: '8px',
            containerAlign: 'center',
            
            // Pretext settings
            showPretext: true,
            pretextText: 'Use Code at Checkout',
            pretextFontSize: '12px',
            pretextColor: '#6b7280',
            pretextLetterSpacing: '2px',
            pretextUppercase: true,
            pretextMargin: '0 0 10px 0',
            
            // Code settings
            codeText: 'GARDEN20',
            codeFontFamily: '\'Courier New\', monospace',
            codeFontSize: '48px',
            codeFontWeight: 'bold',
            codeColor: '#2D4B37',
            codeMargin: '0 0 5px 0',
            codeLineHeight: '1.2',
            
            // Expiry text settings
            showExpiry: true,
            expiryText: 'Expires at 11:59 PM Tonight',
            expiryFontSize: '14px',
            expiryColor: '#D68C8C',
            expiryFontStyle: 'italic',
            expiryMargin: '0',
            
            // Mobile settings
            mobileContainerPadding: '20px',
            mobileCodeFontSize: '36px',
            mobilePretextFontSize: '11px',
            mobileExpiryFontSize: '13px',
            mobileMargin: '20px 0'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        
        // Build container style
        const containerStyle = `
            background-color: ${content.containerBgColor};
            border: ${content.containerBorderWidth} ${content.containerBorderStyle} ${content.containerBorderColor};
            padding: ${content.containerPadding};
            margin: ${content.containerMargin};
            text-align: ${content.containerAlign};
            border-radius: ${content.containerBorderRadius};
        `;
        
        // Build pretext HTML
        const pretextHtml = content.showPretext ? `
            <p style="font-size: ${content.pretextFontSize}; ${content.pretextUppercase ? 'text-transform: uppercase;' : ''} letter-spacing: ${content.pretextLetterSpacing}; color: ${content.pretextColor}; margin: ${content.pretextMargin};">${escapeHtml(content.pretextText)}</p>
        ` : '';
        
        // Build code HTML
        const codeHtml = `
            <p style="font-family: ${content.codeFontFamily}; font-size: ${content.codeFontSize}; font-weight: ${content.codeFontWeight}; color: ${content.codeColor}; margin: ${content.codeMargin}; line-height: ${content.codeLineHeight};" class="offer-code">${escapeHtml(content.codeText)}</p>
        `;
        
        // Build expiry HTML
        const expiryHtml = content.showExpiry ? `
            <p style="font-size: ${content.expiryFontSize}; color: ${content.expiryColor}; ${content.expiryFontStyle ? 'font-style: ' + content.expiryFontStyle + ';' : ''} margin: ${content.expiryMargin};">${escapeHtml(content.expiryText)}</p>
        ` : '';
        
        // Responsive styles
        const responsiveStyles = `
            <style>
                .promo-code-container {
                    transition: all 0.3s ease;
                    box-sizing: border-box !important;
                }
                
                .promo-code-container:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                
                .offer-code {
                    transition: all 0.3s ease;
                }
                
                .offer-code:hover {
                    transform: scale(1.05);
                }
                
                /* Mobile responsive styles */
                @media only screen and (max-width: 480px) {
                    .promo-code-container {
                        padding: ${content.mobileContainerPadding} !important;
                        margin: ${content.mobileMargin} !important;
                    }
                    
                    .promo-code-container .offer-code {
                        font-size: ${content.mobileCodeFontSize} !important;
                    }
                    
                    .promo-code-container p:first-of-type {
                        font-size: ${content.mobilePretextFontSize} !important;
                    }
                    
                    .promo-code-container p:last-of-type {
                        font-size: ${content.mobileExpiryFontSize} !important;
                    }
                }
                
                /* Small mobile devices */
                @media only screen and (max-width: 360px) {
                    .promo-code-container .offer-code {
                        font-size: 30px !important;
                    }
                    
                    .promo-code-container {
                        padding: 15px !important;
                    }
                }
            </style>
        `;
        
        return `
            ${responsiveStyles}
            <div class="promo-code-container" style="${containerStyle}">
                ${pretextHtml}
                ${codeHtml}
                ${expiryHtml}
            </div>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        
        // Container Settings
        const containerDetails = document.createElement('details');
        containerDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        containerDetails.open = true;
        const containerSummary = document.createElement('summary');
        containerSummary.textContent = 'Container Settings';
        containerSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        containerDetails.appendChild(containerSummary);
        const containerContainer = document.createElement('div');
        containerContainer.classList.add('space-y-2');
        containerDetails.appendChild(containerContainer);
        
        createInput('Background Color', 'containerBgColor', 'color', '#f9f7f2', null, content, containerContainer);
        createInput('Border Color', 'containerBorderColor', 'color', '#C5A059', null, content, containerContainer);
        createInput('Border Style', 'containerBorderStyle', 'select', 'dashed', [
            {value: 'solid', label: 'Solid'},
            {value: 'dashed', label: 'Dashed'},
            {value: 'dotted', label: 'Dotted'},
            {value: 'double', label: 'Double'},
            {value: 'none', label: 'None'}
        ], content, containerContainer);
        createInput('Border Width', 'containerBorderWidth', 'text', '2px', null, content, containerContainer);
        createInput('Padding', 'containerPadding', 'text', '30px', null, content, containerContainer);
        createInput('Margin', 'containerMargin', 'text', '30px 0', null, content, containerContainer);
        createInput('Border Radius', 'containerBorderRadius', 'text', '8px', null, content, containerContainer);
        createInput('Text Alignment', 'containerAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, containerContainer);
        
        container.appendChild(containerDetails);
        
        // Pretext Settings
        const pretextDetails = document.createElement('details');
        pretextDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        pretextDetails.open = true;
        const pretextSummary = document.createElement('summary');
        pretextSummary.textContent = 'Pretext Settings (Top Text)';
        pretextSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        pretextDetails.appendChild(pretextSummary);
        const pretextContainer = document.createElement('div');
        pretextContainer.classList.add('space-y-2');
        pretextDetails.appendChild(pretextContainer);
        
        createCheckbox('Show Pretext', 'showPretext', content, pretextContainer);
        if (content.showPretext) {
            createInput('Pretext Text', 'pretextText', 'text', 'Use Code at Checkout', null, content, pretextContainer);
            createInput('Font Size', 'pretextFontSize', 'text', '12px', null, content, pretextContainer);
            createInput('Color', 'pretextColor', 'color', '#6b7280', null, content, pretextContainer);
            createInput('Letter Spacing', 'pretextLetterSpacing', 'text', '2px', null, content, pretextContainer);
            createCheckbox('Uppercase', 'pretextUppercase', content, pretextContainer);
            createInput('Margin', 'pretextMargin', 'text', '0 0 10px 0', null, content, pretextContainer);
        }
        
        container.appendChild(pretextDetails);
        
        // Code Settings
        const codeDetails = document.createElement('details');
        codeDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        codeDetails.open = true;
        const codeSummary = document.createElement('summary');
        codeSummary.textContent = 'Code Settings';
        codeSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        codeDetails.appendChild(codeSummary);
        const codeContainer = document.createElement('div');
        codeContainer.classList.add('space-y-2');
        codeDetails.appendChild(codeContainer);
        
        createInput('Code Text', 'codeText', 'text', 'GARDEN20', null, content, codeContainer);
        createInput('Font Family', 'codeFontFamily', 'text', '\'Courier New\', monospace', null, content, codeContainer);
        createInput('Font Size', 'codeFontSize', 'text', '48px', null, content, codeContainer);
        createInput('Font Weight', 'codeFontWeight', 'text', 'bold', null, content, codeContainer);
        createInput('Color', 'codeColor', 'color', '#2D4B37', null, content, codeContainer);
        createInput('Margin', 'codeMargin', 'text', '0 0 5px 0', null, content, codeContainer);
        createInput('Line Height', 'codeLineHeight', 'text', '1.2', null, content, codeContainer);
        
        container.appendChild(codeDetails);
        
        // Expiry Text Settings
        const expiryDetails = document.createElement('details');
        expiryDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        expiryDetails.open = true;
        const expirySummary = document.createElement('summary');
        expirySummary.textContent = 'Expiry Text Settings (Bottom Text)';
        expirySummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        expiryDetails.appendChild(expirySummary);
        const expiryContainer = document.createElement('div');
        expiryContainer.classList.add('space-y-2');
        expiryDetails.appendChild(expiryContainer);
        
        createCheckbox('Show Expiry Text', 'showExpiry', content, expiryContainer);
        if (content.showExpiry) {
            createInput('Expiry Text', 'expiryText', 'text', 'Expires at 11:59 PM Tonight', null, content, expiryContainer);
            createInput('Font Size', 'expiryFontSize', 'text', '14px', null, content, expiryContainer);
            createInput('Color', 'expiryColor', 'color', '#D68C8C', null, content, expiryContainer);
            createInput('Font Style', 'expiryFontStyle', 'select', 'italic', [
                {value: 'normal', label: 'Normal'},
                {value: 'italic', label: 'Italic'},
                {value: 'oblique', label: 'Oblique'}
            ], content, expiryContainer);
            createInput('Margin', 'expiryMargin', 'text', '0', null, content, expiryContainer);
        }
        
        container.appendChild(expiryDetails);
        
        // Mobile Settings
        const mobileDetails = document.createElement('details');
        mobileDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        mobileDetails.open = true;
        const mobileSummary = document.createElement('summary');
        mobileSummary.textContent = 'Mobile Settings';
        mobileSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        mobileDetails.appendChild(mobileSummary);
        const mobileContainer = document.createElement('div');
        mobileContainer.classList.add('space-y-2');
        mobileDetails.appendChild(mobileContainer);
        
        createInput('Mobile Container Padding', 'mobileContainerPadding', 'text', '20px', null, content, mobileContainer);
        createInput('Mobile Margin', 'mobileMargin', 'text', '20px 0', null, content, mobileContainer);
        createInput('Mobile Code Font Size', 'mobileCodeFontSize', 'text', '36px', null, content, mobileContainer);
        createInput('Mobile Pretext Font Size', 'mobilePretextFontSize', 'text', '11px', null, content, mobileContainer);
        createInput('Mobile Expiry Font Size', 'mobileExpiryFontSize', 'text', '13px', null, content, mobileContainer);
        
        container.appendChild(mobileDetails);
    }
});