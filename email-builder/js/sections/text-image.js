SectionRegistry.register('text-image', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            imageUrl: 'https://placehold.co/300x200/3a86ff/ffffff?text=Image',
            altText: 'Content Image',
            text: 'This is some text next to an image. You can edit this content.',
            fontSize: '16px',
            lineHeight: '1.5',
            textColor: '#333333',
            textAlign: 'left',
            imagePosition: 'left',
            imageWidth: '50%',
            textWidth: '50%',
            verticalAlign: 'middle',
            
            // Image border settings
            imageBorderRadius: '0px',
            imageBorderWidth: '0px',
            imageBorderColor: '#000000',
            imageBorderStyle: 'solid',
            
            // Button settings
            showButton: false,
            buttonText: 'Learn More',
            buttonLink: '#',
            buttonBackground: '#007bff',
            buttonColor: '#ffffff',
            buttonFontSize: '14px',
            buttonPadding: '8px 16px',
            buttonBorderRadius: '4px',
            buttonAlign: 'left',
            
            // Mobile settings
            mobileBreakpoint: '480px',
            mobileStackOrder: 'image-first', // 'image-first' or 'text-first'
            mobileImageWidth: '100%',
            mobileTextWidth: '100%',
            mobileImageMargin: '0 0 20px 0',
            mobileTextMargin: '0',
            mobileImageBorderRadius: '0px',
            mobileFontSize: '15px',
            mobileButtonWidth: '100%',
            mobileButtonPadding: '10px 20px'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        const imagePosition = content.imagePosition || 'left';
        const textWidth = content.textWidth || '50%';
        const imageWidth = content.imageWidth || '50%';
        
        // Image style with border options
        const imageStyle = `
            display: block; 
            width: 100%; 
            max-width: 100%; 
            height: auto; 
            border: ${content.imageBorderWidth} ${content.imageBorderStyle} ${content.imageBorderColor};
            border-radius: ${content.imageBorderRadius};
        `;
        
        const imgHtml = `
            <img src="${content.imageUrl}" alt="${escapeHtml(content.altText)}" style="${imageStyle}" />
        `;
        
        let textHtml = `
            <p style="font-size: ${content.fontSize}; line-height: ${content.lineHeight}; color: ${content.textColor}; margin: 0; text-align: ${content.textAlign};">${escapeHtml(content.text)}</p>
        `;
        
        if (content.showButton) {
            textHtml += `
                <table cellpadding="0" cellspacing="0" border="0" align="${content.buttonAlign}" style="margin-top: 15px;">
                    <tr>
                        <td style="background-color: ${content.buttonBackground}; border-radius: ${content.buttonBorderRadius};">
                            <a href="${content.buttonLink}" style="font-size: ${content.buttonFontSize}; color: ${content.buttonColor}; padding: ${content.buttonPadding}; display: inline-block; text-decoration: none; border-radius: ${content.buttonBorderRadius};">${escapeHtml(content.buttonText)}</a>
                        </td>
                    </tr>
                </table>
            `;
        }
        
        // Build the desktop layout
        let desktopLayout = '';
        if (imagePosition === 'left') {
            desktopLayout = `
                <tr class="desktop-row">
                    <td class="image-cell" width="${imageWidth}" style="vertical-align: ${content.verticalAlign}; padding-right: 20px;">${imgHtml}</td>
                    <td class="text-cell" width="${textWidth}" style="vertical-align: ${content.verticalAlign};">${textHtml}</td>
                </tr>
            `;
        } else {
            desktopLayout = `
                <tr class="desktop-row">
                    <td class="text-cell" width="${textWidth}" style="vertical-align: ${content.verticalAlign}; padding-right: 20px;">${textHtml}</td>
                    <td class="image-cell" width="${imageWidth}" style="vertical-align: ${content.verticalAlign};">${imgHtml}</td>
                </tr>
            `;
        }
        
        // Build mobile layout based on stack order
        let mobileLayout = '';
        if (content.mobileStackOrder === 'image-first') {
            mobileLayout = `
                <tr class="mobile-row">
                    <td class="image-cell-mobile" style="display: block; width: 100%; text-align: center; margin-bottom: 20px;">${imgHtml}</td>
                </tr>
                <tr class="mobile-row">
                    <td class="text-cell-mobile" style="display: block; width: 100%;">${textHtml}</td>
                </tr>
            `;
        } else {
            mobileLayout = `
                <tr class="mobile-row">
                    <td class="text-cell-mobile" style="display: block; width: 100%; margin-bottom: 20px;">${textHtml}</td>
                </tr>
                <tr class="mobile-row">
                    <td class="image-cell-mobile" style="display: block; width: 100%; text-align: center;">${imgHtml}</td>
                </tr>
            `;
        }
        
        // Responsive styles
        const responsiveStyles = `
            <style>
                /* Desktop styles */
                .desktop-row {
                    display: table-row;
                }
                .mobile-row {
                    display: none;
                }
                
                /* Image hover effect */
                .image-cell img, .image-cell-mobile img {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .image-cell img:hover, .image-cell-mobile img:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                /* Mobile responsive styles */
                @media only screen and (max-width: ${content.mobileBreakpoint}) {
                    .desktop-row {
                        display: none !important;
                    }
                    .mobile-row {
                        display: table-row !important;
                    }
                    
                    table, tbody, tr, td {
                        width: 100% !important;
                        display: block !important;
                        box-sizing: border-box !important;
                    }
                    
                    .image-cell-mobile {
                        width: ${content.mobileImageWidth} !important;
                        margin: ${content.mobileImageMargin} !important;
                        padding: 0 !important;
                        text-align: center !important;
                    }
                    
                    .text-cell-mobile {
                        width: ${content.mobileTextWidth} !important;
                        margin: ${content.mobileTextMargin} !important;
                        padding: 0 !important;
                    }
                    
                    .image-cell-mobile img {
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        border-radius: ${content.mobileImageBorderRadius} !important;
                        margin: 0 auto !important;
                    }
                    
                    .text-cell-mobile p {
                        font-size: ${content.mobileFontSize} !important;
                        text-align: center !important;
                    }
                    
                    /* Button mobile styles */
                    .text-cell-mobile table {
                        width: 100% !important;
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                    
                    .text-cell-mobile td {
                        display: table-cell !important;
                        width: auto !important;
                    }
                    
                    .text-cell-mobile a {
                        width: ${content.mobileButtonWidth} !important;
                        padding: ${content.mobileButtonPadding} !important;
                        box-sizing: border-box !important;
                        white-space: normal !important;
                        word-wrap: break-word !important;
                        text-align: center !important;
                    }
                    
                    /* Override any inline padding-right */
                    td[style*="padding-right"] {
                        padding-right: 0 !important;
                    }
                }
                
                /* Small mobile devices */
                @media only screen and (max-width: 360px) {
                    .text-cell-mobile a {
                        font-size: 13px !important;
                        padding: 8px 16px !important;
                    }
                }
            </style>
        `;
        
        return `
            ${responsiveStyles}
            <table cellpadding="0" cellspacing="0" border="0" width="100%" class="text-image-table">
                ${desktopLayout}
                ${mobileLayout}
            </table>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        
        // Image Settings
        const imageDetails = document.createElement('details');
        imageDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        imageDetails.open = true;
        const imageSummary = document.createElement('summary');
        imageSummary.textContent = 'Image Settings';
        imageSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        imageDetails.appendChild(imageSummary);
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('space-y-2');
        imageDetails.appendChild(imageContainer);
        container.appendChild(imageDetails);
        
        createInput('Image URL', 'imageUrl', 'text', 'https://placehold.co/300x200/3a86ff/ffffff?text=Image', null, content, imageContainer);
        createInput('Alt Text', 'altText', 'text', 'Content Image', null, content, imageContainer);
        createInput('Image Position', 'imagePosition', 'select', 'left', [
            {value: 'left', label: 'Left'},
            {value: 'right', label: 'Right'}
        ], content, imageContainer);
        createInput('Image Width', 'imageWidth', 'text', '50%', null, content, imageContainer);
        createInput('Border Radius', 'imageBorderRadius', 'text', '0px', null, content, imageContainer);
        createInput('Border Width', 'imageBorderWidth', 'text', '0px', null, content, imageContainer);
        createInput('Border Color', 'imageBorderColor', 'color', '#000000', null, content, imageContainer);
        createInput('Border Style', 'imageBorderStyle', 'select', 'solid', [
            {value: 'solid', label: 'Solid'},
            {value: 'dashed', label: 'Dashed'},
            {value: 'dotted', label: 'Dotted'},
            {value: 'none', label: 'None'}
        ], content, imageContainer);
        
        // Text Settings
        const textDetails = document.createElement('details');
        textDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        textDetails.open = true;
        const textSummary = document.createElement('summary');
        textSummary.textContent = 'Text Settings';
        textSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        textDetails.appendChild(textSummary);
        const textContainer = document.createElement('div');
        textContainer.classList.add('space-y-2');
        textDetails.appendChild(textContainer);
        container.appendChild(textDetails);
        
        createInput('Text Content', 'text', 'textarea', 'This is some text next to an image.', null, content, textContainer);
        createInput('Font Size', 'fontSize', 'text', '16px', null, content, textContainer);
        createInput('Line Height', 'lineHeight', 'text', '1.5', null, content, textContainer);
        createInput('Text Color', 'textColor', 'color', '#333333', null, content, textContainer);
        createInput('Text Align', 'textAlign', 'select', 'left', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, textContainer);
        createInput('Text Width', 'textWidth', 'text', '50%', null, content, textContainer);
        createInput('Vertical Align', 'verticalAlign', 'select', 'middle', [
            {value: 'top', label: 'Top'},
            {value: 'middle', label: 'Middle'},
            {value: 'bottom', label: 'Bottom'}
        ], content, textContainer);
        
        // Button Settings
        const buttonDetails = document.createElement('details');
        buttonDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        buttonDetails.open = true;
        const buttonSummary = document.createElement('summary');
        buttonSummary.textContent = 'Button Settings';
        buttonSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        buttonDetails.appendChild(buttonSummary);
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('space-y-2');
        buttonDetails.appendChild(buttonContainer);
        container.appendChild(buttonDetails);
        
        createCheckbox('Show Button', 'showButton', content, buttonContainer);
        if (content.showButton) {
            createInput('Button Text', 'buttonText', 'text', 'Learn More', null, content, buttonContainer);
            createInput('Button Link', 'buttonLink', 'text', '#', null, content, buttonContainer);
            createInput('Button Background', 'buttonBackground', 'color', '#007bff', null, content, buttonContainer);
            createInput('Button Color', 'buttonColor', 'color', '#ffffff', null, content, buttonContainer);
            createInput('Button Font Size', 'buttonFontSize', 'text', '14px', null, content, buttonContainer);
            createInput('Button Padding', 'buttonPadding', 'text', '8px 16px', null, content, buttonContainer);
            createInput('Button Border Radius', 'buttonBorderRadius', 'text', '4px', null, content, buttonContainer);
            createInput('Button Align', 'buttonAlign', 'select', 'left', [
                {value: 'left', label: 'Left'},
                {value: 'center', label: 'Center'},
                {value: 'right', label: 'Right'}
            ], content, buttonContainer);
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
        createInput('Stack Order', 'mobileStackOrder', 'select', 'image-first', [
            {value: 'image-first', label: 'Image First, Then Text'},
            {value: 'text-first', label: 'Text First, Then Image'}
        ], content, mobileContainer);
        createInput('Image Width (Mobile)', 'mobileImageWidth', 'text', '100%', null, content, mobileContainer);
        createInput('Text Width (Mobile)', 'mobileTextWidth', 'text', '100%', null, content, mobileContainer);
        createInput('Image Margin (Mobile)', 'mobileImageMargin', 'text', '0 0 20px 0', null, content, mobileContainer);
        createInput('Text Margin (Mobile)', 'mobileTextMargin', 'text', '0', null, content, mobileContainer);
        createInput('Image Border Radius (Mobile)', 'mobileImageBorderRadius', 'text', '0px', null, content, mobileContainer);
        createInput('Font Size (Mobile)', 'mobileFontSize', 'text', '15px', null, content, mobileContainer);
        createInput('Button Width (Mobile)', 'mobileButtonWidth', 'text', '100%', null, content, mobileContainer);
        createInput('Button Padding (Mobile)', 'mobileButtonPadding', 'text', '10px 20px', null, content, mobileContainer);
    }
});