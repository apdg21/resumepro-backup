SectionRegistry.register('hero-last-call', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            // Background settings
            bgColor: '#2D4B37',
            bgImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKEAlk8CPYCZUtB5UyDdzZqUI7JD80Obs5bGGZLlAr_Aw5cghaIcUvKW7t6wbTLZ3a9fedCY2kJzAUiWXjQj7U73-srCrLra-AOaBqi05s9HsCz2hh8F2HfxU5Ld7Fs51hdz5SXgpx1z-wnP3ssWVyFT8_lD4Jnwn6DSzuTtNzRgOMezHvYkpAxse1PF1fu8P-8VdK-qwo-B3V8v4SKff9ysoHrOXeZGQOB5zQCJw9AftgM8y3TeOUYQCR2A2QnG5HJWHv3eNb2Bex',
            bgPosition: 'center center',
            bgSize: 'cover',
            
            // Overlay settings
            overlayEnabled: true,
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            overlayPadding: '60px 30px 50px 30px',
            overlayAlign: 'left',
            
            // Badge settings
            showBadge: true,
            badgeText: 'Final 12 Hours',
            badgeBgColor: '#D68C8C',
            badgeTextColor: '#ffffff',
            badgeFontSize: '12px',
            badgePadding: '5px 12px',
            badgeLetterSpacing: '2px',
            badgeMargin: '0 0 20px 0',
            
            // Title settings
            titleText: 'Last Call',
            titleFontFamily: 'Georgia, serif',
            titleFontSize: '56px',
            titleColor: '#ffffff',
            titleLineHeight: '1.1',
            titleMargin: '0 0 10px 0',
            titleFontStyle: 'italic',
            
            // Subtitle/Paragraph settings
            showSubtitle: true,
            subtitleText: 'Don\'t let the season pass you by.',
            subtitleFontSize: '18px',
            subtitleColor: '#ffffff',
            subtitleOpacity: '0.9',
            subtitleMargin: '0 0 25px 0',
            
            // Button settings
            showButton: true,
            buttonText: 'Shop the Collection',
            buttonLink: '#',
            buttonBgColor: '#D68C8C',
            buttonTextColor: '#ffffff',
            buttonFontSize: '14px',
            buttonPadding: '12px 30px',
            buttonBorderRadius: '50px',
            buttonLetterSpacing: '1px',
            buttonTextTransform: 'uppercase',
            
            // Mobile settings
            mobileTitleFontSize: '42px',
            mobileSubtitleFontSize: '16px',
            mobilePadding: '40px 20px 30px 20px',
            mobileButtonPadding: '10px 20px'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        
        // Build background style
        let bgStyle = `background-color: ${content.bgColor};`;
        if (content.bgImage) {
            bgStyle += ` background-image: url('${content.bgImage}'); background-position: ${content.bgPosition}; background-size: ${content.bgSize};`;
        }
        
        // Build overlay cell style
        const cellStyle = `background: ${content.overlayColor}; padding: ${content.overlayPadding}; text-align: ${content.overlayAlign};`;
        
        // Build badge HTML
        const badgeHtml = content.showBadge ? `
            <span style="display: inline-block; padding: ${content.badgePadding}; background-color: ${content.badgeBgColor}; color: ${content.badgeTextColor}; font-size: ${content.badgeFontSize}; font-weight: bold; text-transform: uppercase; letter-spacing: ${content.badgeLetterSpacing}; margin-bottom: 20px;">${escapeHtml(content.badgeText)}</span>
        ` : '';
        
        // Build title HTML
        const titleHtml = `
            <h1 style="font-family: ${content.titleFontFamily}; font-size: ${content.titleFontSize}; margin: ${content.titleMargin}; color: ${content.titleColor}; line-height: ${content.titleLineHeight}; font-style: ${content.titleFontStyle};">${escapeHtml(content.titleText)}</h1>
        `;
        
        // Build subtitle HTML
        const subtitleHtml = content.showSubtitle ? `
            <p style="font-size: ${content.subtitleFontSize}; color: ${content.subtitleColor}; opacity: ${content.subtitleOpacity}; margin: ${content.subtitleMargin};">${escapeHtml(content.subtitleText)}</p>
        ` : '';
        
        // Build button HTML
        const buttonHtml = content.showButton ? `
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" bgcolor="${content.buttonBgColor}" style="border-radius: ${content.buttonBorderRadius};">
                        <a href="${content.buttonLink}" class="hero-cta" style="display: inline-block; padding: ${content.buttonPadding}; background-color: ${content.buttonBgColor}; color: ${content.buttonTextColor}; font-weight: bold; text-decoration: none; border-radius: ${content.buttonBorderRadius}; font-size: ${content.buttonFontSize}; letter-spacing: ${content.buttonLetterSpacing}; text-transform: ${content.buttonTextTransform};">${escapeHtml(content.buttonText)}</a>
                    </td>
                </tr>
            </table>
        ` : '';
        
        // Comprehensive responsive styles
        const responsiveStyles = `
            <style>
                /* Base styles */
                .hero-table {
                    width: 100% !important;
                }
                
                .hero-cell {
                    box-sizing: border-box !important;
                }
                
                .hero-cta {
                    transition: all 0.3s ease;
                    display: inline-block;
                    text-decoration: none;
                }
                
                .hero-cta:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                
                /* Mobile responsive styles */
                @media only screen and (max-width: 480px) {
                    .hero-cell {
                        padding: ${content.mobilePadding} !important;
                        text-align: center !important;
                    }
                    
                    .hero-cell h1 {
                        font-size: ${content.mobileTitleFontSize} !important;
                    }
                    
                    .hero-cell p {
                        font-size: ${content.mobileSubtitleFontSize} !important;
                    }
                    
                    .hero-cta {
                        padding: ${content.mobileButtonPadding} !important;
                        width: auto !important;
                        min-width: 200px !important;
                        max-width: 100% !important;
                        box-sizing: border-box !important;
                        white-space: normal !important;
                        word-wrap: break-word !important;
                    }
                    
                    /* Center badge and button on mobile */
                    .hero-cell span,
                    .hero-cell table {
                        margin-left: auto !important;
                        margin-right: auto !important;
                    }
                }
                
                /* Small mobile devices */
                @media only screen and (max-width: 360px) {
                    .hero-cell h1 {
                        font-size: 32px !important;
                    }
                    
                    .hero-cta {
                        min-width: 160px !important;
                        padding: 8px 16px !important;
                        font-size: 13px !important;
                    }
                }
            </style>
        `;
        
        return `
            ${responsiveStyles}
            <table class="hero-table" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="${bgStyle}">
                <tr>
                    <td class="hero-cell" style="${cellStyle}">
                        ${badgeHtml}
                        ${titleHtml}
                        ${subtitleHtml}
                        ${buttonHtml}
                    </td>
                </tr>
            </table>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        
        // Background Settings
        const bgDetails = document.createElement('details');
        bgDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        bgDetails.open = true;
        const bgSummary = document.createElement('summary');
        bgSummary.textContent = 'Background Settings';
        bgSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        bgDetails.appendChild(bgSummary);
        const bgContainer = document.createElement('div');
        bgContainer.classList.add('space-y-2');
        bgDetails.appendChild(bgContainer);
        container.appendChild(bgDetails);
        
        createInput('Background Color', 'bgColor', 'color', '#2D4B37', null, content, bgContainer);
        createInput('Background Image URL', 'bgImage', 'text', '', null, content, bgContainer);
        createInput('Background Position', 'bgPosition', 'text', 'center center', null, content, bgContainer);
        createInput('Background Size', 'bgSize', 'text', 'cover', null, content, bgContainer);
        
        // Overlay Settings
        const overlayDetails = document.createElement('details');
        overlayDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        overlayDetails.open = true;
        const overlaySummary = document.createElement('summary');
        overlaySummary.textContent = 'Overlay Settings';
        overlaySummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        overlayDetails.appendChild(overlaySummary);
        const overlayContainer = document.createElement('div');
        overlayContainer.classList.add('space-y-2');
        overlayDetails.appendChild(overlayContainer);
        container.appendChild(overlayDetails);
        
        createCheckbox('Enable Overlay', 'overlayEnabled', content, overlayContainer);
        if (content.overlayEnabled) {
            createInput('Overlay Color', 'overlayColor', 'text', 'rgba(0, 0, 0, 0.4)', null, content, overlayContainer);
            createInput('Overlay Padding', 'overlayPadding', 'text', '60px 30px 50px 30px', null, content, overlayContainer);
            createInput('Text Alignment', 'overlayAlign', 'select', 'left', [
                {value: 'left', label: 'Left'},
                {value: 'center', label: 'Center'},
                {value: 'right', label: 'Right'}
            ], content, overlayContainer);
        }
        
        // Badge Settings
        const badgeDetails = document.createElement('details');
        badgeDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        badgeDetails.open = true;
        const badgeSummary = document.createElement('summary');
        badgeSummary.textContent = 'Badge Settings';
        badgeSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        badgeDetails.appendChild(badgeSummary);
        const badgeContainer = document.createElement('div');
        badgeContainer.classList.add('space-y-2');
        badgeDetails.appendChild(badgeContainer);
        container.appendChild(badgeDetails);
        
        createCheckbox('Show Badge', 'showBadge', content, badgeContainer);
        if (content.showBadge) {
            createInput('Badge Text', 'badgeText', 'text', 'Final 12 Hours', null, content, badgeContainer);
            createInput('Badge Background', 'badgeBgColor', 'color', '#D68C8C', null, content, badgeContainer);
            createInput('Badge Text Color', 'badgeTextColor', 'color', '#ffffff', null, content, badgeContainer);
            createInput('Badge Font Size', 'badgeFontSize', 'text', '12px', null, content, badgeContainer);
            createInput('Badge Padding', 'badgePadding', 'text', '5px 12px', null, content, badgeContainer);
            createInput('Badge Letter Spacing', 'badgeLetterSpacing', 'text', '2px', null, content, badgeContainer);
            createInput('Badge Margin', 'badgeMargin', 'text', '0 0 20px 0', null, content, badgeContainer);
        }
        
        // Title Settings
        const titleDetails = document.createElement('details');
        titleDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        titleDetails.open = true;
        const titleSummary = document.createElement('summary');
        titleSummary.textContent = 'Title Settings';
        titleSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        titleDetails.appendChild(titleSummary);
        const titleContainer = document.createElement('div');
        titleContainer.classList.add('space-y-2');
        titleDetails.appendChild(titleContainer);
        container.appendChild(titleDetails);
        
        createInput('Title Text', 'titleText', 'text', 'Last Call', null, content, titleContainer);
        createInput('Title Font Family', 'titleFontFamily', 'text', 'Georgia, serif', null, content, titleContainer);
        createInput('Title Font Size', 'titleFontSize', 'text', '56px', null, content, titleContainer);
        createInput('Title Color', 'titleColor', 'color', '#ffffff', null, content, titleContainer);
        createInput('Title Line Height', 'titleLineHeight', 'text', '1.1', null, content, titleContainer);
        createInput('Title Margin', 'titleMargin', 'text', '0 0 10px 0', null, content, titleContainer);
        createInput('Title Font Style', 'titleFontStyle', 'text', 'italic', null, content, titleContainer);
        
        // Subtitle Settings
        const subtitleDetails = document.createElement('details');
        subtitleDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        subtitleDetails.open = true;
        const subtitleSummary = document.createElement('summary');
        subtitleSummary.textContent = 'Subtitle Settings';
        subtitleSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        subtitleDetails.appendChild(subtitleSummary);
        const subtitleContainer = document.createElement('div');
        subtitleContainer.classList.add('space-y-2');
        subtitleDetails.appendChild(subtitleContainer);
        container.appendChild(subtitleDetails);
        
        createCheckbox('Show Subtitle', 'showSubtitle', content, subtitleContainer);
        if (content.showSubtitle) {
            createInput('Subtitle Text', 'subtitleText', 'text', 'Don\'t let the season pass you by.', null, content, subtitleContainer);
            createInput('Subtitle Font Size', 'subtitleFontSize', 'text', '18px', null, content, subtitleContainer);
            createInput('Subtitle Color', 'subtitleColor', 'color', '#ffffff', null, content, subtitleContainer);
            createInput('Subtitle Opacity', 'subtitleOpacity', 'text', '0.9', null, content, subtitleContainer);
            createInput('Subtitle Margin', 'subtitleMargin', 'text', '0 0 25px 0', null, content, subtitleContainer);
        }
        
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
            createInput('Button Text', 'buttonText', 'text', 'Shop the Collection', null, content, buttonContainer);
            createInput('Button Link', 'buttonLink', 'text', '#', null, content, buttonContainer);
            createInput('Button Background', 'buttonBgColor', 'color', '#D68C8C', null, content, buttonContainer);
            createInput('Button Text Color', 'buttonTextColor', 'color', '#ffffff', null, content, buttonContainer);
            createInput('Button Font Size', 'buttonFontSize', 'text', '14px', null, content, buttonContainer);
            createInput('Button Padding', 'buttonPadding', 'text', '12px 30px', null, content, buttonContainer);
            createInput('Button Border Radius', 'buttonBorderRadius', 'text', '50px', null, content, buttonContainer);
            createInput('Button Letter Spacing', 'buttonLetterSpacing', 'text', '1px', null, content, buttonContainer);
            createInput('Button Text Transform', 'buttonTextTransform', 'select', 'uppercase', [
                {value: 'none', label: 'None'},
                {value: 'uppercase', label: 'Uppercase'},
                {value: 'lowercase', label: 'Lowercase'},
                {value: 'capitalize', label: 'Capitalize'}
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
        
        createInput('Mobile Title Font Size', 'mobileTitleFontSize', 'text', '42px', null, content, mobileContainer);
        createInput('Mobile Subtitle Font Size', 'mobileSubtitleFontSize', 'text', '16px', null, content, mobileContainer);
        createInput('Mobile Padding', 'mobilePadding', 'text', '40px 20px 30px 20px', null, content, mobileContainer);
        createInput('Mobile Button Padding', 'mobileButtonPadding', 'text', '10px 20px', null, content, mobileContainer);
    }
});