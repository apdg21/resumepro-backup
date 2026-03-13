SectionRegistry.register('customer-spotlight', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            // Outer padding
            outerPadding: '35px 30px 30px',
            
            // Label/Badge settings
            showLabel: true,
            labelText: '✨ maker spotlight ✨',
            labelFontSize: '16px',
            labelColor: '#a27f6e',
            labelLetterSpacing: '3px',
            labelUppercase: true,
            labelFontWeight: '400',
            labelMargin: '0 0 20px 0',
            labelBorderBottom: '1px solid #e1cfc0',
            labelPaddingBottom: '8px',
            labelDisplay: 'inline-block',
            
            // Quote settings
            quoteText: '"Quilting is how I piece together the fragments of our family history — one square for my grandmother\'s apron, another for my daughter\'s first dress."',
            quoteFontSize: '26px',
            quoteLineHeight: '1.4',
            quoteColor: '#3e2e28',
            quoteFontStyle: 'italic',
            quoteFontWeight: '300',
            quoteMaxWidth: '440px',
            quoteMargin: '0 auto 20px',
            
            // Author settings
            authorText: '— MARIA, BOHO MAKER',
            authorFontSize: '18px',
            authorFontWeight: '400',
            authorColor: '#8a6253',
            authorLetterSpacing: '1.5px',
            authorUppercase: true,
            authorMargin: '0 0 22px 0',
            
            // Author image settings
            showAuthorImage: true,
            authorImageUrl: 'https://app.omnisend.com/image/newsletter/69aa86388c6e68c386308c39?w=150&h=150&fit=crop&auto=format&q=80',
            authorImageAlt: 'Maria, boho maker',
            authorImageWidth: '80',
            authorImageHeight: '80',
            authorImageBorderRadius: '50%',
            authorImageBorder: '3px solid #e3d1c4',
            authorImageBoxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            authorImageMargin: '22px auto 10px',
            
            // Divider settings
            showDivider: true,
            dividerWidth: '70px',
            dividerHeight: '1px',
            dividerColor: '#dccec2',
            dividerMargin: '18px auto 0',
            
            // Mobile settings
            mobileBreakpoint: '480px',
            mobileOuterPadding: '25px 20px 20px',
            mobileLabelFontSize: '14px',
            mobileLabelLetterSpacing: '2px',
            mobileQuoteFontSize: '22px',
            mobileAuthorFontSize: '16px',
            mobileAuthorLetterSpacing: '1px',
            mobileImageWidth: '70',
            mobileImageHeight: '70',
            mobileImageBorderWidth: '2px',
            mobileDividerWidth: '50px'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        
        // Build label HTML
        const labelHtml = content.showLabel ? `
            <div class="spotlight-label" style="font-size: ${content.labelFontSize}; letter-spacing: ${content.labelLetterSpacing}; color: ${content.labelColor}; ${content.labelUppercase ? 'text-transform: uppercase;' : ''} margin-bottom: 20px; font-weight: ${content.labelFontWeight}; border-bottom: ${content.labelBorderBottom}; display: ${content.labelDisplay}; padding-bottom: ${content.labelPaddingBottom};">${escapeHtml(content.labelText)}</div>
        ` : '';
        
        // Build quote HTML
        const quoteHtml = `
            <div class="spotlight-quote" style="font-size: ${content.quoteFontSize}; line-height: ${content.quoteLineHeight}; color: ${content.quoteColor}; font-style: ${content.quoteFontStyle}; font-weight: ${content.quoteFontWeight}; max-width: ${content.quoteMaxWidth}; margin: ${content.quoteMargin};">${escapeHtml(content.quoteText)}</div>
        `;
        
        // Build author HTML
        const authorHtml = `
            <div class="spotlight-author" style="font-size: ${content.authorFontSize}; font-weight: ${content.authorFontWeight}; color: ${content.authorColor}; letter-spacing: ${content.authorLetterSpacing}; ${content.authorUppercase ? 'text-transform: uppercase;' : ''} margin: ${content.authorMargin};">${escapeHtml(content.authorText)}</div>
        `;
        
        // Build author image HTML
        const authorImageHtml = content.showAuthorImage ? `
            <div class="spotlight-image-wrapper" style="margin: ${content.authorImageMargin};">
                <img src="${content.authorImageUrl}" alt="${escapeHtml(content.authorImageAlt)}" width="${content.authorImageWidth}" height="${content.authorImageHeight}" style="display:block; margin:0 auto; width:${content.authorImageWidth}px; height:${content.authorImageHeight}px; border-radius: ${content.authorImageBorderRadius}; object-fit: cover; border: ${content.authorImageBorder}; box-shadow: ${content.authorImageBoxShadow};">
            </div>
        ` : '';
        
        // Build divider HTML
        const dividerHtml = content.showDivider ? `
            <div class="spotlight-divider" style="width: ${content.dividerWidth}; height: ${content.dividerHeight}; background: ${content.dividerColor}; margin: ${content.dividerMargin};"></div>
        ` : '';
        
        // Responsive styles
        const responsiveStyles = `
            <style>
                .spotlight-label {
                    transition: all 0.3s ease;
                }
                .spotlight-quote {
                    transition: all 0.3s ease;
                }
                .spotlight-image-wrapper img {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .spotlight-image-wrapper img:hover {
                    transform: scale(1.05);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
                }
                
                /* Mobile responsive styles */
                @media only screen and (max-width: ${content.mobileBreakpoint}) {
                    .customer-spotlight-cell {
                        padding: ${content.mobileOuterPadding} !important;
                    }
                    
                    .spotlight-label {
                        font-size: ${content.mobileLabelFontSize} !important;
                        letter-spacing: ${content.mobileLabelLetterSpacing} !important;
                    }
                    
                    .spotlight-quote {
                        font-size: ${content.mobileQuoteFontSize} !important;
                        max-width: 100% !important;
                        padding: 0 10px !important;
                    }
                    
                    .spotlight-author {
                        font-size: ${content.mobileAuthorFontSize} !important;
                        letter-spacing: ${content.mobileAuthorLetterSpacing} !important;
                    }
                    
                    .spotlight-image-wrapper img {
                        width: ${content.mobileImageWidth}px !important;
                        height: ${content.mobileImageHeight}px !important;
                        border-width: ${content.mobileImageBorderWidth} !important;
                    }
                    
                    .spotlight-divider {
                        width: ${content.mobileDividerWidth} !important;
                    }
                }
                
                /* Small mobile devices */
                @media only screen and (max-width: 360px) {
                    .spotlight-quote {
                        font-size: 20px !important;
                    }
                    
                    .spotlight-author {
                        font-size: 15px !important;
                    }
                    
                    .spotlight-image-wrapper img {
                        width: 60px !important;
                        height: 60px !important;
                    }
                }
            </style>
        `;
        
        return `
            ${responsiveStyles}
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
                <tr>
                    <td class="customer-spotlight-cell" style="padding: ${content.outerPadding};" align="center">
                        ${labelHtml}
                        ${quoteHtml}
                        ${authorHtml}
                        ${authorImageHtml}
                        ${dividerHtml}
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
        
        createInput('Cell Padding', 'outerPadding', 'text', '35px 30px 30px', null, content, outerContainer);
        
        // Label/Badge Settings
        const labelDetails = document.createElement('details');
        labelDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        labelDetails.open = true;
        const labelSummary = document.createElement('summary');
        labelSummary.textContent = 'Label/Badge';
        labelSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        labelDetails.appendChild(labelSummary);
        const labelContainer = document.createElement('div');
        labelContainer.classList.add('space-y-2');
        labelDetails.appendChild(labelContainer);
        container.appendChild(labelDetails);
        
        createCheckbox('Show Label', 'showLabel', content, labelContainer);
        if (content.showLabel) {
            createInput('Label Text', 'labelText', 'text', '✨ maker spotlight ✨', null, content, labelContainer);
            createInput('Font Size', 'labelFontSize', 'text', '16px', null, content, labelContainer);
            createInput('Color', 'labelColor', 'color', '#a27f6e', null, content, labelContainer);
            createInput('Letter Spacing', 'labelLetterSpacing', 'text', '3px', null, content, labelContainer);
            createCheckbox('Uppercase', 'labelUppercase', content, labelContainer);
            createInput('Font Weight', 'labelFontWeight', 'text', '400', null, content, labelContainer);
            createInput('Bottom Border', 'labelBorderBottom', 'text', '1px solid #e1cfc0', null, content, labelContainer);
            createInput('Padding Bottom', 'labelPaddingBottom', 'text', '8px', null, content, labelContainer);
            createInput('Display', 'labelDisplay', 'select', 'inline-block', [
                {value: 'inline-block', label: 'Inline Block'},
                {value: 'block', label: 'Block'},
                {value: 'inline', label: 'Inline'}
            ], content, labelContainer);
            createInput('Margin', 'labelMargin', 'text', '0 0 20px 0', null, content, labelContainer);
        }
        
        // Quote Settings
        const quoteDetails = document.createElement('details');
        quoteDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        quoteDetails.open = true;
        const quoteSummary = document.createElement('summary');
        quoteSummary.textContent = 'Quote';
        quoteSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        quoteDetails.appendChild(quoteSummary);
        const quoteContainer = document.createElement('div');
        quoteContainer.classList.add('space-y-2');
        quoteDetails.appendChild(quoteContainer);
        container.appendChild(quoteDetails);
        
        createInput('Quote Text', 'quoteText', 'textarea', '"Quilting is how I piece together the fragments of our family history — one square for my grandmother\'s apron, another for my daughter\'s first dress."', null, content, quoteContainer);
        createInput('Font Size', 'quoteFontSize', 'text', '26px', null, content, quoteContainer);
        createInput('Line Height', 'quoteLineHeight', 'text', '1.4', null, content, quoteContainer);
        createInput('Color', 'quoteColor', 'color', '#3e2e28', null, content, quoteContainer);
        createInput('Font Style', 'quoteFontStyle', 'select', 'italic', [
            {value: 'normal', label: 'Normal'},
            {value: 'italic', label: 'Italic'},
            {value: 'oblique', label: 'Oblique'}
        ], content, quoteContainer);
        createInput('Font Weight', 'quoteFontWeight', 'text', '300', null, content, quoteContainer);
        createInput('Max Width', 'quoteMaxWidth', 'text', '440px', null, content, quoteContainer);
        createInput('Margin', 'quoteMargin', 'text', '0 auto 20px', null, content, quoteContainer);
        
        // Author Settings
        const authorDetails = document.createElement('details');
        authorDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        authorDetails.open = true;
        const authorSummary = document.createElement('summary');
        authorSummary.textContent = 'Author';
        authorSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        authorDetails.appendChild(authorSummary);
        const authorContainer = document.createElement('div');
        authorContainer.classList.add('space-y-2');
        authorDetails.appendChild(authorContainer);
        container.appendChild(authorDetails);
        
        createInput('Author Text', 'authorText', 'text', '— MARIA, BOHO MAKER', null, content, authorContainer);
        createInput('Font Size', 'authorFontSize', 'text', '18px', null, content, authorContainer);
        createInput('Font Weight', 'authorFontWeight', 'text', '400', null, content, authorContainer);
        createInput('Color', 'authorColor', 'color', '#8a6253', null, content, authorContainer);
        createInput('Letter Spacing', 'authorLetterSpacing', 'text', '1.5px', null, content, authorContainer);
        createCheckbox('Uppercase', 'authorUppercase', content, authorContainer);
        createInput('Margin', 'authorMargin', 'text', '0 0 22px 0', null, content, authorContainer);
        
        // Author Image Settings
        const imageDetails = document.createElement('details');
        imageDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        imageDetails.open = true;
        const imageSummary = document.createElement('summary');
        imageSummary.textContent = 'Author Image';
        imageSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        imageDetails.appendChild(imageSummary);
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('space-y-2');
        imageDetails.appendChild(imageContainer);
        container.appendChild(imageDetails);
        
        createCheckbox('Show Author Image', 'showAuthorImage', content, imageContainer);
        if (content.showAuthorImage) {
            createInput('Image URL', 'authorImageUrl', 'text', 'https://app.omnisend.com/image/newsletter/69aa86388c6e68c386308c39?w=150&h=150&fit=crop&auto=format&q=80', null, content, imageContainer);
            createInput('Alt Text', 'authorImageAlt', 'text', 'Maria, boho maker', null, content, imageContainer);
            createInput('Width (px)', 'authorImageWidth', 'text', '80', null, content, imageContainer);
            createInput('Height (px)', 'authorImageHeight', 'text', '80', null, content, imageContainer);
            createInput('Border Radius', 'authorImageBorderRadius', 'text', '50%', null, content, imageContainer);
            createInput('Border', 'authorImageBorder', 'text', '3px solid #e3d1c4', null, content, imageContainer);
            createInput('Box Shadow', 'authorImageBoxShadow', 'text', '0 4px 10px rgba(0,0,0,0.05)', null, content, imageContainer);
            createInput('Margin', 'authorImageMargin', 'text', '22px auto 10px', null, content, imageContainer);
        }
        
        // Divider Settings
        const dividerDetails = document.createElement('details');
        dividerDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        dividerDetails.open = true;
        const dividerSummary = document.createElement('summary');
        dividerSummary.textContent = 'Divider';
        dividerSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        dividerDetails.appendChild(dividerSummary);
        const dividerContainer = document.createElement('div');
        dividerContainer.classList.add('space-y-2');
        dividerDetails.appendChild(dividerContainer);
        container.appendChild(dividerDetails);
        
        createCheckbox('Show Divider', 'showDivider', content, dividerContainer);
        if (content.showDivider) {
            createInput('Divider Width', 'dividerWidth', 'text', '70px', null, content, dividerContainer);
            createInput('Divider Height', 'dividerHeight', 'text', '1px', null, content, dividerContainer);
            createInput('Divider Color', 'dividerColor', 'color', '#dccec2', null, content, dividerContainer);
            createInput('Divider Margin', 'dividerMargin', 'text', '18px auto 0', null, content, dividerContainer);
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
        createInput('Cell Padding (Mobile)', 'mobileOuterPadding', 'text', '25px 20px 20px', null, content, mobileContainer);
        createInput('Label Font Size (Mobile)', 'mobileLabelFontSize', 'text', '14px', null, content, mobileContainer);
        createInput('Label Letter Spacing (Mobile)', 'mobileLabelLetterSpacing', 'text', '2px', null, content, mobileContainer);
        createInput('Quote Font Size (Mobile)', 'mobileQuoteFontSize', 'text', '22px', null, content, mobileContainer);
        createInput('Author Font Size (Mobile)', 'mobileAuthorFontSize', 'text', '16px', null, content, mobileContainer);
        createInput('Author Letter Spacing (Mobile)', 'mobileAuthorLetterSpacing', 'text', '1px', null, content, mobileContainer);
        createInput('Image Width (Mobile)', 'mobileImageWidth', 'text', '70', null, content, mobileContainer);
        createInput('Image Height (Mobile)', 'mobileImageHeight', 'text', '70', null, content, mobileContainer);
        createInput('Image Border Width (Mobile)', 'mobileImageBorderWidth', 'text', '2px', null, content, mobileContainer);
        createInput('Divider Width (Mobile)', 'mobileDividerWidth', 'text', '50px', null, content, mobileContainer);
    }
});