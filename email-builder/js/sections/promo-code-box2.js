SectionRegistry.register('promo-code-box2', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            // Outer container settings
            outerContainerMargin: '0 0 24px 0',
            outerContainerBgColor: '#fefce8',
            outerContainerBorder: '2px dashed #f59e0b',
            outerContainerBorderRadius: '12px',
            outerContainerPadding: '20px',
            
            // Left column settings
            leftColumnWidth: '60%',
            leftColumnPadding: '0 15px 0 0',
            
            // Title settings
            titleText: 'BUY 3, GET 2 FREE',
            titleFontSize: '20px',
            titleFontWeight: '800',
            titleColor: '#0f172a',
            titleMargin: '0 0 8px 0',
            titleFontFamily: 'Arial, Helvetica, sans-serif',
            
            // Description settings
            descriptionText: '*Automatically applies to 5 lowest-priced items in cart (must contain 5 items).',
            descriptionFontSize: '14px',
            descriptionColor: '#6b7280',
            descriptionMargin: '0',
            descriptionFontFamily: 'Arial, Helvetica, sans-serif',
            
            // Right column settings
            rightColumnWidth: '40%',
            rightColumnAlign: 'center',
            
            // Code box settings
            codeBoxBgColor: '#facc15',
            codeBoxPadding: '12px 20px',
            codeBoxBorder: '2px solid #eab308',
            codeBoxBorderRadius: '8px',
            codeBoxDisplay: 'inline-block',
            
            // Code text settings
            codeText: 'VIPBUNDLE',
            codeFontFamily: '\'Courier New\', monospace',
            codeFontSize: '24px',
            codeFontWeight: '700',
            codeColor: '#0f172a',
            
            // Mobile settings
            mobileBreakpoint: '480px',
            mobileOuterPadding: '15px',
            mobileLeftColumnWidth: '100%',
            mobileRightColumnWidth: '100%',
            mobileLeftColumnPadding: '0 0 15px 0',
            mobileRightColumnPadding: '0',
            mobileTitleFontSize: '18px',
            mobileDescriptionFontSize: '13px',
            mobileCodeFontSize: '20px',
            mobileCodeBoxPadding: '10px 15px',
            mobileStackGap: '15px'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        
        // Responsive styles
        const responsiveStyles = `
            <style>
                .promo-code-box2-container {
                    transition: all 0.3s ease;
                }
                .promo-code-box2-container:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .promo-code-box2-codebox {
                    transition: all 0.3s ease;
                }
                .promo-code-box2-codebox:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 8px rgba(245, 158, 11, 0.2);
                }
                
                /* Mobile responsive styles */
                @media only screen and (max-width: ${content.mobileBreakpoint}) {
                    .promo-code-box2-table {
                        width: 100% !important;
                        display: block !important;
                    }
                    
                    .promo-code-box2-row {
                        display: block !important;
                    }
                    
                    .promo-code-box2-left-col {
                        width: ${content.mobileLeftColumnWidth} !important;
                        display: block !important;
                        padding: ${content.mobileLeftColumnPadding} !important;
                        text-align: center !important;
                    }
                    
                    .promo-code-box2-right-col {
                        width: ${content.mobileRightColumnWidth} !important;
                        display: block !important;
                        padding: ${content.mobileRightColumnPadding} !important;
                        text-align: center !important;
                        margin-top: ${content.mobileStackGap} !important;
                    }
                    
                    .promo-code-box2-title {
                        font-size: ${content.mobileTitleFontSize} !important;
                    }
                    
                    .promo-code-box2-description {
                        font-size: ${content.mobileDescriptionFontSize} !important;
                    }
                    
                    .promo-code-box2-codebox {
                        padding: ${content.mobileCodeBoxPadding} !important;
                        display: inline-block !important;
                    }
                    
                    .promo-code-box2-codebox span {
                        font-size: ${content.mobileCodeFontSize} !important;
                    }
                }
            </style>
        `;
        
        return `
            ${responsiveStyles}
            <table class="promo-code-box2-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: ${content.outerContainerMargin}; background-color: ${content.outerContainerBgColor}; border: ${content.outerContainerBorder}; border-radius: ${content.outerContainerBorderRadius};">
                <tbody>
                    <tr>
                        <td style="padding: ${content.outerContainerPadding};">
                            <table class="promo-code-box2-table" width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tbody>
                                    <tr class="promo-code-box2-row">
                                        <td class="promo-code-box2-left-col" style="padding: ${content.leftColumnPadding};" width="${content.leftColumnWidth}">
                                            <p class="promo-code-box2-title" style="font-size: ${content.titleFontSize}; font-weight: ${content.titleFontWeight}; color: ${content.titleColor}; margin: ${content.titleMargin}; font-family: ${content.titleFontFamily};">${escapeHtml(content.titleText)}</p>
                                            <p class="promo-code-box2-description" style="font-size: ${content.descriptionFontSize}; color: ${content.descriptionColor}; margin: ${content.descriptionMargin}; font-family: ${content.descriptionFontFamily};">${escapeHtml(content.descriptionText)}</p>
                                        </td>
                                        <td class="promo-code-box2-right-col" align="${content.rightColumnAlign}" width="${content.rightColumnWidth}">
                                            <div class="promo-code-box2-codebox" style="background-color: ${content.codeBoxBgColor}; padding: ${content.codeBoxPadding}; border: ${content.codeBoxBorder}; border-radius: ${content.codeBoxBorderRadius}; display: ${content.codeBoxDisplay};">
                                                <span style="font-family: ${content.codeFontFamily}; font-size: ${content.codeFontSize}; font-weight: ${content.codeFontWeight}; color: ${content.codeColor};">${escapeHtml(content.codeText)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        
        // Outer Container Settings
        const outerDetails = document.createElement('details');
        outerDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        outerDetails.open = true;
        const outerSummary = document.createElement('summary');
        outerSummary.textContent = 'Outer Container';
        outerSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        outerDetails.appendChild(outerSummary);
        const outerContainer = document.createElement('div');
        outerContainer.classList.add('space-y-2');
        outerDetails.appendChild(outerContainer);
        container.appendChild(outerDetails);
        
        createInput('Margin', 'outerContainerMargin', 'text', '0 0 24px 0', null, content, outerContainer);
        createInput('Background Color', 'outerContainerBgColor', 'color', '#fefce8', null, content, outerContainer);
        createInput('Border', 'outerContainerBorder', 'text', '2px dashed #f59e0b', null, content, outerContainer);
        createInput('Border Radius', 'outerContainerBorderRadius', 'text', '12px', null, content, outerContainer);
        createInput('Inner Padding', 'outerContainerPadding', 'text', '20px', null, content, outerContainer);
        
        // Left Column Settings
        const leftDetails = document.createElement('details');
        leftDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        leftDetails.open = true;
        const leftSummary = document.createElement('summary');
        leftSummary.textContent = 'Left Column';
        leftSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        leftDetails.appendChild(leftSummary);
        const leftContainer = document.createElement('div');
        leftContainer.classList.add('space-y-2');
        leftDetails.appendChild(leftContainer);
        container.appendChild(leftDetails);
        
        createInput('Column Width', 'leftColumnWidth', 'text', '60%', null, content, leftContainer);
        createInput('Column Padding', 'leftColumnPadding', 'text', '0 15px 0 0', null, content, leftContainer);
        
        // Title Settings
        const titleDetails = document.createElement('details');
        titleDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        titleDetails.open = true;
        const titleSummary = document.createElement('summary');
        titleSummary.textContent = 'Title';
        titleSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        titleDetails.appendChild(titleSummary);
        const titleContainer = document.createElement('div');
        titleContainer.classList.add('space-y-2');
        titleDetails.appendChild(titleContainer);
        container.appendChild(titleDetails);
        
        createInput('Title Text', 'titleText', 'text', 'BUY 3, GET 2 FREE', null, content, titleContainer);
        createInput('Font Size', 'titleFontSize', 'text', '20px', null, content, titleContainer);
        createInput('Font Weight', 'titleFontWeight', 'text', '800', null, content, titleContainer);
        createInput('Color', 'titleColor', 'color', '#0f172a', null, content, titleContainer);
        createInput('Margin', 'titleMargin', 'text', '0 0 8px 0', null, content, titleContainer);
        createInput('Font Family', 'titleFontFamily', 'text', 'Arial, Helvetica, sans-serif', null, content, titleContainer);
        
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
        
        createInput('Description Text', 'descriptionText', 'textarea', '*Automatically applies to 5 lowest-priced items in cart (must contain 5 items).', null, content, descContainer);
        createInput('Font Size', 'descriptionFontSize', 'text', '14px', null, content, descContainer);
        createInput('Color', 'descriptionColor', 'color', '#6b7280', null, content, descContainer);
        createInput('Margin', 'descriptionMargin', 'text', '0', null, content, descContainer);
        createInput('Font Family', 'descriptionFontFamily', 'text', 'Arial, Helvetica, sans-serif', null, content, descContainer);
        
        // Right Column Settings
        const rightDetails = document.createElement('details');
        rightDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        rightDetails.open = true;
        const rightSummary = document.createElement('summary');
        rightSummary.textContent = 'Right Column';
        rightSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        rightDetails.appendChild(rightSummary);
        const rightContainer = document.createElement('div');
        rightContainer.classList.add('space-y-2');
        rightDetails.appendChild(rightContainer);
        container.appendChild(rightDetails);
        
        createInput('Column Width', 'rightColumnWidth', 'text', '40%', null, content, rightContainer);
        createInput('Text Align', 'rightColumnAlign', 'select', 'center', [
            {value: 'left', label: 'Left'},
            {value: 'center', label: 'Center'},
            {value: 'right', label: 'Right'}
        ], content, rightContainer);
        
        // Code Box Settings
        const codeBoxDetails = document.createElement('details');
        codeBoxDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        codeBoxDetails.open = true;
        const codeBoxSummary = document.createElement('summary');
        codeBoxSummary.textContent = 'Code Box';
        codeBoxSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        codeBoxDetails.appendChild(codeBoxSummary);
        const codeBoxContainer = document.createElement('div');
        codeBoxContainer.classList.add('space-y-2');
        codeBoxDetails.appendChild(codeBoxContainer);
        container.appendChild(codeBoxDetails);
        
        createInput('Background Color', 'codeBoxBgColor', 'color', '#facc15', null, content, codeBoxContainer);
        createInput('Padding', 'codeBoxPadding', 'text', '12px 20px', null, content, codeBoxContainer);
        createInput('Border', 'codeBoxBorder', 'text', '2px solid #eab308', null, content, codeBoxContainer);
        createInput('Border Radius', 'codeBoxBorderRadius', 'text', '8px', null, content, codeBoxContainer);
        createInput('Display', 'codeBoxDisplay', 'text', 'inline-block', null, content, codeBoxContainer);
        
        // Code Text Settings
        const codeTextDetails = document.createElement('details');
        codeTextDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        codeTextDetails.open = true;
        const codeTextSummary = document.createElement('summary');
        codeTextSummary.textContent = 'Code Text';
        codeTextSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        codeTextDetails.appendChild(codeTextSummary);
        const codeTextContainer = document.createElement('div');
        codeTextContainer.classList.add('space-y-2');
        codeTextDetails.appendChild(codeTextContainer);
        container.appendChild(codeTextDetails);
        
        createInput('Code Text', 'codeText', 'text', 'VIPBUNDLE', null, content, codeTextContainer);
        createInput('Font Family', 'codeFontFamily', 'text', '\'Courier New\', monospace', null, content, codeTextContainer);
        createInput('Font Size', 'codeFontSize', 'text', '24px', null, content, codeTextContainer);
        createInput('Font Weight', 'codeFontWeight', 'text', '700', null, content, codeTextContainer);
        createInput('Color', 'codeColor', 'color', '#0f172a', null, content, codeTextContainer);
        
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
        createInput('Outer Padding', 'mobileOuterPadding', 'text', '15px', null, content, mobileContainer);
        createInput('Left Column Width (Mobile)', 'mobileLeftColumnWidth', 'text', '100%', null, content, mobileContainer);
        createInput('Right Column Width (Mobile)', 'mobileRightColumnWidth', 'text', '100%', null, content, mobileContainer);
        createInput('Left Column Padding (Mobile)', 'mobileLeftColumnPadding', 'text', '0 0 15px 0', null, content, mobileContainer);
        createInput('Right Column Padding (Mobile)', 'mobileRightColumnPadding', 'text', '0', null, content, mobileContainer);
        createInput('Title Font Size (Mobile)', 'mobileTitleFontSize', 'text', '18px', null, content, mobileContainer);
        createInput('Description Font Size (Mobile)', 'mobileDescriptionFontSize', 'text', '13px', null, content, mobileContainer);
        createInput('Code Font Size (Mobile)', 'mobileCodeFontSize', 'text', '20px', null, content, mobileContainer);
        createInput('Code Box Padding (Mobile)', 'mobileCodeBoxPadding', 'text', '10px 15px', null, content, mobileContainer);
        createInput('Stack Gap (Mobile)', 'mobileStackGap', 'text', '15px', null, content, mobileContainer);
    }
});