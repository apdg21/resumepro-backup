SectionRegistry.register('promo-code-box', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            // Outer padding (now just for the inner table)
            outerPadding: '0 40px',
            
            // Container settings
            containerBgColor: '#FBF3F0',
            containerBorderColor: '#e7d7cf',
            containerBorderWidth: '1px',
            containerBorderStyle: 'solid',
            containerBorderRadius: '24px',
            containerBoxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            containerPadding: '30px 25px',
            
            // Discount percent
            percentText: '20% OFF',
            percentFontSize: '38px',
            percentFontWeight: '300',
            percentColor: '#7B5A4F',
            percentLetterSpacing: '1px',
            percentMargin: '0 0 12px 0',
            
            // Subtitle
            showSubtitle: true,
            subtitleText: 'site-wide',
            subtitleFontSize: '20px',
            subtitleFontWeight: '400',
            subtitleColor: '#9B7A6B',
            subtitleUppercase: true,
            subtitleLetterSpacing: '2px',
            subtitleMargin: '0 0 20px 0',
            
            // Description
            showDescription: true,
            descriptionText: 'To honor the creators in our community, enjoy special savings on everything you need for your next masterpiece.',
            descriptionFontSize: '16px',
            descriptionColor: '#4b3f3a',
            descriptionMargin: '0 0 20px 0',
            descriptionLineHeight: '1.6',
            
            // Promo code box
            codeBoxBgColor: '#ffffff',
            codeBoxBorderColor: '#B18F81',
            codeBoxBorderStyle: 'dashed',
            codeBoxBorderWidth: '2px',
            codeBoxBorderRadius: '40px',
            codeBoxPadding: '14px 36px',
            codeBoxMargin: '10px 0 12px',
            
            // Promo code
            codeText: 'WOMEN20',
            codeFontSize: '26px',
            codeFontWeight: '500',
            codeColor: '#5C403B',
            codeLetterSpacing: '4px',
            
            // Button
            showButton: true,
            buttonText: '⚡ shop the celebration',
            buttonLink: '#',
            buttonBgColor: '#8B6B5D',
            buttonTextColor: '#ffffff',
            buttonHoverBgColor: '#7b5a4f',
            buttonPadding: '18px 35px',
            buttonFontSize: '16px',
            buttonFontWeight: '400',
            buttonBorderRadius: '50px',
            buttonUppercase: true,
            buttonLetterSpacing: '1.5px',
            buttonBorder: '1px solid #7b5a4f',
            buttonMargin: '20px 0 5px',
            
            // Footer note
            showFooterNote: true,
            footerNote: '*Offer valid March 7–9, 2026 · 11:59 PM PST',
            footerNoteFontSize: '12px',
            footerNoteColor: '#8c7a70',
            footerNoteFontStyle: 'italic',
            footerNoteMargin: '20px 0 0 0',
            footerNoteBorder: '1px solid #e3d2ca',
            footerNotePadding: '16px 0 0 0',
            
            // Mobile settings
            mobileBreakpoint: '480px',
            mobileOuterPadding: '0 20px',
            mobileContainerPadding: '25px 20px',
            mobilePercentFontSize: '32px',
            mobileSubtitleFontSize: '18px',
            mobileDescriptionFontSize: '15px',
            mobileCodeFontSize: '22px',
            mobileCodeBoxPadding: '12px 25px',
            mobileButtonPadding: '15px 25px',
            mobileButtonFontSize: '15px',
            mobileFooterNoteFontSize: '11px'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        
        // Build subtitle HTML
        const subtitleHtml = content.showSubtitle ? `
            <div style="font-size: ${content.subtitleFontSize}; font-weight: ${content.subtitleFontWeight}; color: ${content.subtitleColor}; ${content.subtitleUppercase ? 'text-transform: uppercase;' : ''} letter-spacing: ${content.subtitleLetterSpacing}; margin-bottom: 20px;">${escapeHtml(content.subtitleText)}</div>
        ` : '';
        
        // Build description HTML
        const descriptionHtml = content.showDescription ? `
            <p style="font-size: ${content.descriptionFontSize}; color: ${content.descriptionColor}; margin: ${content.descriptionMargin}; line-height: ${content.descriptionLineHeight};">${escapeHtml(content.descriptionText)}</p>
        ` : '';
        
        // Build promo code box HTML
        const codeBoxHtml = `
            <div style="display: inline-block; background: ${content.codeBoxBgColor}; border: ${content.codeBoxBorderWidth} ${content.codeBoxBorderStyle} ${content.codeBoxBorderColor}; border-radius: ${content.codeBoxBorderRadius}; padding: ${content.codeBoxPadding}; margin: ${content.codeBoxMargin};">
                <span style="font-size: ${content.codeFontSize}; font-weight: ${content.codeFontWeight}; letter-spacing: ${content.codeLetterSpacing}; color: ${content.codeColor};">${escapeHtml(content.codeText)}</span>
            </div>
        `;
        
        // Build button HTML
        const buttonHtml = content.showButton ? `
            <a href="${content.buttonLink}" class="promo-button" style="background-color: ${content.buttonBgColor}; color: ${content.buttonTextColor}; padding: ${content.buttonPadding}; text-decoration: none; font-weight: ${content.buttonFontWeight}; border-radius: ${content.buttonBorderRadius}; display: inline-block; ${content.buttonUppercase ? 'text-transform: uppercase;' : ''} letter-spacing: ${content.buttonLetterSpacing}; font-size: ${content.buttonFontSize}; margin: ${content.buttonMargin}; border: ${content.buttonBorder}; transition: all 0.2s ease;">${escapeHtml(content.buttonText)}</a>
        ` : '';
        
        // Build footer note HTML
        const footerNoteHtml = content.showFooterNote ? `
            <div style="font-size: ${content.footerNoteFontSize}; color: ${content.footerNoteColor}; font-style: ${content.footerNoteFontStyle}; margin-top: ${content.footerNoteMargin}; border-top: ${content.footerNoteBorder}; padding-top: ${content.footerNotePadding};">${escapeHtml(content.footerNote)}</div>
        ` : '';
        
        // Responsive styles
        const responsiveStyles = `
            <style>
                .promo-button {
                    transition: all 0.3s ease;
                }
                .promo-button:hover {
                    background-color: ${content.buttonHoverBgColor} !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                /* Mobile responsive styles */
                @media only screen and (max-width: ${content.mobileBreakpoint}) {
                    .promo-code-outer {
                        padding: ${content.mobileOuterPadding} !important;
                    }
                    
                    .promo-code-inner {
                        padding: ${content.mobileContainerPadding} !important;
                    }
                    
                    .promo-code-inner .percent-text {
                        font-size: ${content.mobilePercentFontSize} !important;
                    }
                    
                    .promo-code-inner .subtitle-text {
                        font-size: ${content.mobileSubtitleFontSize} !important;
                    }
                    
                    .promo-code-inner p {
                        font-size: ${content.mobileDescriptionFontSize} !important;
                    }
                    
                    .promo-code-box {
                        padding: ${content.mobileCodeBoxPadding} !important;
                        width: auto !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    
                    .promo-code-box span {
                        font-size: ${content.mobileCodeFontSize} !important;
                        letter-spacing: 2px !important;
                        word-break: break-all !important;
                    }
                    
                    .promo-button {
                        padding: ${content.mobileButtonPadding} !important;
                        font-size: ${content.mobileButtonFontSize} !important;
                        width: auto !important;
                        min-width: 200px !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                        white-space: normal !important;
                        word-wrap: break-word !important;
                    }
                    
                    .footer-note {
                        font-size: ${content.mobileFooterNoteFontSize} !important;
                    }
                }
                
                /* Small mobile devices */
                @media only screen and (max-width: 360px) {
                    .percent-text {
                        font-size: 28px !important;
                    }
                    
                    .promo-code-box {
                        padding: 10px 20px !important;
                    }
                    
                    .promo-code-box span {
                        font-size: 20px !important;
                        letter-spacing: 1px !important;
                    }
                    
                    .promo-button {
                        min-width: 160px !important;
                        padding: 12px 20px !important;
                    }
                }
            </style>
        `;
        
        // Now return a proper table row with a single cell containing the promo box
        return `
            ${responsiveStyles}
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                <tr>
                    <td class="promo-code-outer" style="padding: ${content.outerPadding};">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background: ${content.containerBgColor}; border-radius: ${content.containerBorderRadius}; border: ${content.containerBorderWidth} ${content.containerBorderStyle} ${content.containerBorderColor}; box-shadow: ${content.containerBoxShadow};">
                            <tr>
                                <td class="promo-code-inner" style="padding: ${content.containerPadding};" align="center">
                                    <div class="percent-text" style="font-size: ${content.percentFontSize}; font-weight: ${content.percentFontWeight}; color: ${content.percentColor}; letter-spacing: ${content.percentLetterSpacing}; line-height: 1.2; margin-bottom: 12px;">
                                        ${escapeHtml(content.percentText)}
                                    </div>
                                    ${subtitleHtml}
                                    ${descriptionHtml}
                                    <div class="promo-code-box" style="display: inline-block; background: ${content.codeBoxBgColor}; border: ${content.codeBoxBorderWidth} ${content.codeBoxBorderStyle} ${content.codeBoxBorderColor}; border-radius: ${content.codeBoxBorderRadius}; padding: ${content.codeBoxPadding}; margin: ${content.codeBoxMargin};">
                                        <span style="font-size: ${content.codeFontSize}; font-weight: ${content.codeFontWeight}; letter-spacing: ${content.codeLetterSpacing}; color: ${content.codeColor};">${escapeHtml(content.codeText)}</span>
                                    </div>
                                    <br>
                                    ${buttonHtml}
                                    <div class="footer-note" style="font-size: ${content.footerNoteFontSize}; color: ${content.footerNoteColor}; font-style: ${content.footerNoteFontStyle}; margin-top: ${content.footerNoteMargin}; border-top: ${content.footerNoteBorder}; padding-top: ${content.footerNotePadding};">
                                        ${escapeHtml(content.footerNote)}
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        
        // Outer Padding
        const outerDetails = document.createElement('details');
        outerDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        outerDetails.open = true;
        const outerSummary = document.createElement('summary');
        outerSummary.textContent = 'Outer Padding';
        outerSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        outerDetails.appendChild(outerSummary);
        const outerContainer = document.createElement('div');
        outerContainer.classList.add('space-y-2');
        outerDetails.appendChild(outerContainer);
        container.appendChild(outerDetails);
        
        createInput('Outer Padding', 'outerPadding', 'text', '0 40px', null, content, outerContainer);
        
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
        container.appendChild(containerDetails);
        
        createInput('Background Color', 'containerBgColor', 'color', '#FBF3F0', null, content, containerContainer);
        createInput('Border Color', 'containerBorderColor', 'color', '#e7d7cf', null, content, containerContainer);
        createInput('Border Width', 'containerBorderWidth', 'text', '1px', null, content, containerContainer);
        createInput('Border Style', 'containerBorderStyle', 'select', 'solid', [
            {value: 'solid', label: 'Solid'},
            {value: 'dashed', label: 'Dashed'},
            {value: 'dotted', label: 'Dotted'},
            {value: 'none', label: 'None'}
        ], content, containerContainer);
        createInput('Border Radius', 'containerBorderRadius', 'text', '24px', null, content, containerContainer);
        createInput('Box Shadow', 'containerBoxShadow', 'text', '0 2px 6px rgba(0,0,0,0.02)', null, content, containerContainer);
        createInput('Inner Padding', 'containerPadding', 'text', '30px 25px', null, content, containerContainer);
        
        // Percent Settings
        const percentDetails = document.createElement('details');
        percentDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        percentDetails.open = true;
        const percentSummary = document.createElement('summary');
        percentSummary.textContent = 'Discount Percent';
        percentSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        percentDetails.appendChild(percentSummary);
        const percentContainer = document.createElement('div');
        percentContainer.classList.add('space-y-2');
        percentDetails.appendChild(percentContainer);
        container.appendChild(percentDetails);
        
        createInput('Percent Text', 'percentText', 'text', '20% OFF', null, content, percentContainer);
        createInput('Font Size', 'percentFontSize', 'text', '38px', null, content, percentContainer);
        createInput('Font Weight', 'percentFontWeight', 'text', '300', null, content, percentContainer);
        createInput('Color', 'percentColor', 'color', '#7B5A4F', null, content, percentContainer);
        createInput('Letter Spacing', 'percentLetterSpacing', 'text', '1px', null, content, percentContainer);
        createInput('Margin', 'percentMargin', 'text', '0 0 12px 0', null, content, percentContainer);
        
        // Subtitle Settings
        const subtitleDetails = document.createElement('details');
        subtitleDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        subtitleDetails.open = true;
        const subtitleSummary = document.createElement('summary');
        subtitleSummary.textContent = 'Subtitle';
        subtitleSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        subtitleDetails.appendChild(subtitleSummary);
        const subtitleContainer = document.createElement('div');
        subtitleContainer.classList.add('space-y-2');
        subtitleDetails.appendChild(subtitleContainer);
        container.appendChild(subtitleDetails);
        
        createCheckbox('Show Subtitle', 'showSubtitle', content, subtitleContainer);
        if (content.showSubtitle) {
            createInput('Subtitle Text', 'subtitleText', 'text', 'site-wide', null, content, subtitleContainer);
            createInput('Font Size', 'subtitleFontSize', 'text', '20px', null, content, subtitleContainer);
            createInput('Font Weight', 'subtitleFontWeight', 'text', '400', null, content, subtitleContainer);
            createInput('Color', 'subtitleColor', 'color', '#9B7A6B', null, content, subtitleContainer);
            createCheckbox('Uppercase', 'subtitleUppercase', content, subtitleContainer);
            createInput('Letter Spacing', 'subtitleLetterSpacing', 'text', '2px', null, content, subtitleContainer);
            createInput('Margin', 'subtitleMargin', 'text', '0 0 20px 0', null, content, subtitleContainer);
        }
        
        // Description Settings
        const descDetails = document.createElement('details');
        descDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        descDetails.open = true;
        const descSummary = document.createElement('summary');
        descSummary.textContent = 'Description';
        descSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        descDetails.appendChild(descSummary);
        const descContainer = document.createElement('div');
        descContainer.classList.add('space-y-2');
        descDetails.appendChild(descContainer);
        container.appendChild(descDetails);
        
        createCheckbox('Show Description', 'showDescription', content, descContainer);
        if (content.showDescription) {
            createInput('Description Text', 'descriptionText', 'textarea', 'To honor the creators in our community, enjoy special savings on everything you need for your next masterpiece.', null, content, descContainer);
            createInput('Font Size', 'descriptionFontSize', 'text', '16px', null, content, descContainer);
            createInput('Color', 'descriptionColor', 'color', '#4b3f3a', null, content, descContainer);
            createInput('Line Height', 'descriptionLineHeight', 'text', '1.6', null, content, descContainer);
            createInput('Margin', 'descriptionMargin', 'text', '0 0 20px 0', null, content, descContainer);
        }
        
        // Promo Code Box Settings
        const codeBoxDetails = document.createElement('details');
        codeBoxDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        codeBoxDetails.open = true;
        const codeBoxSummary = document.createElement('summary');
        codeBoxSummary.textContent = 'Promo Code Box';
        codeBoxSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        codeBoxDetails.appendChild(codeBoxSummary);
        const codeBoxContainer = document.createElement('div');
        codeBoxContainer.classList.add('space-y-2');
        codeBoxDetails.appendChild(codeBoxContainer);
        container.appendChild(codeBoxDetails);
        
        createInput('Box Background', 'codeBoxBgColor', 'color', '#ffffff', null, content, codeBoxContainer);
        createInput('Box Border Color', 'codeBoxBorderColor', 'color', '#B18F81', null, content, codeBoxContainer);
        createInput('Box Border Style', 'codeBoxBorderStyle', 'select', 'dashed', [
            {value: 'solid', label: 'Solid'},
            {value: 'dashed', label: 'Dashed'},
            {value: 'dotted', label: 'Dotted'},
            {value: 'double', label: 'Double'},
            {value: 'none', label: 'None'}
        ], content, codeBoxContainer);
        createInput('Box Border Width', 'codeBoxBorderWidth', 'text', '2px', null, content, codeBoxContainer);
        createInput('Box Border Radius', 'codeBoxBorderRadius', 'text', '40px', null, content, codeBoxContainer);
        createInput('Box Padding', 'codeBoxPadding', 'text', '14px 36px', null, content, codeBoxContainer);
        createInput('Box Margin', 'codeBoxMargin', 'text', '10px 0 12px', null, content, codeBoxContainer);
        
        // Promo Code Text Settings
        const codeTextDetails = document.createElement('details');
        codeTextDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        codeTextDetails.open = true;
        const codeTextSummary = document.createElement('summary');
        codeTextSummary.textContent = 'Promo Code Text';
        codeTextSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        codeTextDetails.appendChild(codeTextSummary);
        const codeTextContainer = document.createElement('div');
        codeTextContainer.classList.add('space-y-2');
        codeTextDetails.appendChild(codeTextContainer);
        container.appendChild(codeTextDetails);
        
        createInput('Code Text', 'codeText', 'text', 'WOMEN20', null, content, codeTextContainer);
        createInput('Font Size', 'codeFontSize', 'text', '26px', null, content, codeTextContainer);
        createInput('Font Weight', 'codeFontWeight', 'text', '500', null, content, codeTextContainer);
        createInput('Color', 'codeColor', 'color', '#5C403B', null, content, codeTextContainer);
        createInput('Letter Spacing', 'codeLetterSpacing', 'text', '4px', null, content, codeTextContainer);
        
        // Button Settings
        const buttonDetails = document.createElement('details');
        buttonDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        buttonDetails.open = true;
        const buttonSummary = document.createElement('summary');
        buttonSummary.textContent = 'Button';
        buttonSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        buttonDetails.appendChild(buttonSummary);
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('space-y-2');
        buttonDetails.appendChild(buttonContainer);
        container.appendChild(buttonDetails);
        
        createCheckbox('Show Button', 'showButton', content, buttonContainer);
        if (content.showButton) {
            createInput('Button Text', 'buttonText', 'text', '⚡ shop the celebration', null, content, buttonContainer);
            createInput('Button Link', 'buttonLink', 'text', '#', null, content, buttonContainer);
            createInput('Button Background', 'buttonBgColor', 'color', '#8B6B5D', null, content, buttonContainer);
            createInput('Button Hover Background', 'buttonHoverBgColor', 'color', '#7b5a4f', null, content, buttonContainer);
            createInput('Button Text Color', 'buttonTextColor', 'color', '#ffffff', null, content, buttonContainer);
            createInput('Button Font Size', 'buttonFontSize', 'text', '16px', null, content, buttonContainer);
            createInput('Button Font Weight', 'buttonFontWeight', 'text', '400', null, content, buttonContainer);
            createInput('Button Padding', 'buttonPadding', 'text', '18px 35px', null, content, buttonContainer);
            createInput('Button Border Radius', 'buttonBorderRadius', 'text', '50px', null, content, buttonContainer);
            createInput('Button Border', 'buttonBorder', 'text', '1px solid #7b5a4f', null, content, buttonContainer);
            createCheckbox('Uppercase', 'buttonUppercase', content, buttonContainer);
            createInput('Letter Spacing', 'buttonLetterSpacing', 'text', '1.5px', null, content, buttonContainer);
            createInput('Button Margin', 'buttonMargin', 'text', '20px 0 5px', null, content, buttonContainer);
        }
        
        // Footer Note Settings
        const footerDetails = document.createElement('details');
        footerDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        footerDetails.open = true;
        const footerSummary = document.createElement('summary');
        footerSummary.textContent = 'Footer Note';
        footerSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        footerDetails.appendChild(footerSummary);
        const footerContainer = document.createElement('div');
        footerContainer.classList.add('space-y-2');
        footerDetails.appendChild(footerContainer);
        container.appendChild(footerDetails);
        
        createCheckbox('Show Footer Note', 'showFooterNote', content, footerContainer);
        if (content.showFooterNote) {
            createInput('Footer Text', 'footerNote', 'text', '*Offer valid March 7–9, 2026 · 11:59 PM PST', null, content, footerContainer);
            createInput('Font Size', 'footerNoteFontSize', 'text', '12px', null, content, footerContainer);
            createInput('Color', 'footerNoteColor', 'color', '#8c7a70', null, content, footerContainer);
            createInput('Font Style', 'footerNoteFontStyle', 'select', 'italic', [
                {value: 'normal', label: 'Normal'},
                {value: 'italic', label: 'Italic'},
                {value: 'oblique', label: 'Oblique'}
            ], content, footerContainer);
            createInput('Top Border', 'footerNoteBorder', 'text', '1px solid #e3d2ca', null, content, footerContainer);
            createInput('Top Padding', 'footerNotePadding', 'text', '16px 0 0 0', null, content, footerContainer);
            createInput('Top Margin', 'footerNoteMargin', 'text', '20px 0 0 0', null, content, footerContainer);
        }
        
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
        container.appendChild(mobileDetails);
        
        createInput('Mobile Breakpoint', 'mobileBreakpoint', 'text', '480px', null, content, mobileContainer);
        createInput('Outer Padding (Mobile)', 'mobileOuterPadding', 'text', '0 20px', null, content, mobileContainer);
        createInput('Container Padding (Mobile)', 'mobileContainerPadding', 'text', '25px 20px', null, content, mobileContainer);
        createInput('Percent Font Size (Mobile)', 'mobilePercentFontSize', 'text', '32px', null, content, mobileContainer);
        createInput('Subtitle Font Size (Mobile)', 'mobileSubtitleFontSize', 'text', '18px', null, content, mobileContainer);
        createInput('Description Font Size (Mobile)', 'mobileDescriptionFontSize', 'text', '15px', null, content, mobileContainer);
        createInput('Code Font Size (Mobile)', 'mobileCodeFontSize', 'text', '22px', null, content, mobileContainer);
        createInput('Code Box Padding (Mobile)', 'mobileCodeBoxPadding', 'text', '12px 25px', null, content, mobileContainer);
        createInput('Button Padding (Mobile)', 'mobileButtonPadding', 'text', '15px 25px', null, content, mobileContainer);
        createInput('Button Font Size (Mobile)', 'mobileButtonFontSize', 'text', '15px', null, content, mobileContainer);
        createInput('Footer Note Font Size (Mobile)', 'mobileFooterNoteFontSize', 'text', '11px', null, content, mobileContainer);
    }
});