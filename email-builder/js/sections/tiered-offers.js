SectionRegistry.register('tiered-offers', {
    getDefaultContent: function(commonStyles) {
        return {
            ...commonStyles,
            // Tier 1
            tier1Percent: '10% OFF',
            tier1Desc: 'any single pattern',
            tier1Code: 'MAKER10',
            tier1Featured: false,
            
            // Tier 2
            tier2Percent: '20% OFF',
            tier2Desc: '3+ patterns',
            tier2Code: 'MAKER20',
            tier2Featured: false,
            
            // Tier 3
            tier3Percent: '30% OFF',
            tier3Desc: '5+ patterns',
            tier3Code: 'MAKER30',
            tier3Featured: true,
            
            // Colors & Styling
            tierBgColor: '#f9f5f0',
            tierBorderColor: '#e8d9cc',
            tierBorderRadius: '12px',
            featuredBgColor: '#f0e6d8',
            featuredBorderColor: '#c9b6a2',
            
            percentColor: '#b28b5e',
            percentFontSize: '28px',
            descColor: '#5f4c3b',
            descFontSize: '16px',
            codeBgColor: '#e8d9cc',
            codeColor: '#5f4c3b',
            codeFontSize: '14px',
            codeBorderRadius: '20px',
            
            // Button
            buttonText: 'Claim My Savings',
            buttonLink: '#',
            buttonBgColor: '#b28b5e',
            buttonTextColor: '#ffffff',
            buttonHoverBgColor: '#9a764d',
            buttonFontSize: '16px',
            buttonPadding: '14px 30px',
            buttonBorderRadius: '30px',
            
            // Footer note
            showFooterNote: true,
            footerNote: '✦ Offer expires March 15th at midnight PST ✦',
            footerNoteColor: '#8A9A5B',
            footerNoteFontSize: '13px',
            
            // Spacing
            tierGap: '15px',
            tierPadding: '25px 15px',
            wrapperPadding: '30px 20px',
            
            // Mobile settings
            mobileBreakpoint: '480px',
            mobileStackGap: '20px',
            mobileTierPadding: '20px 15px',
            mobilePercentFontSize: '24px',
            mobileDescFontSize: '14px',
            mobileButtonPadding: '12px 24px',
            mobileButtonFontSize: '15px'
        };
    },

    generateContent: function(section) {
        const content = section.content;
        
        // Build tier cells
        const tiers = [
            {
                percent: content.tier1Percent,
                desc: content.tier1Desc,
                code: content.tier1Code,
                featured: content.tier1Featured
            },
            {
                percent: content.tier2Percent,
                desc: content.tier2Desc,
                code: content.tier2Code,
                featured: content.tier2Featured
            },
            {
                percent: content.tier3Percent,
                desc: content.tier3Desc,
                code: content.tier3Code,
                featured: content.tier3Featured
            }
        ];
        
        // Build table rows with mobile responsive styles
        let tiersHtml = '';
        tiers.forEach((tier, index) => {
            const featuredClass = tier.featured ? 'featured' : '';
            const bgColor = tier.featured ? content.featuredBgColor : content.tierBgColor;
            const borderColor = tier.featured ? content.featuredBorderColor : content.tierBorderColor;
            
            tiersHtml += `
                <td class="tier-cell ${featuredClass}" style="padding: ${content.tierPadding}; background-color: ${bgColor}; border: 2px solid ${borderColor}; border-radius: ${content.tierBorderRadius}; text-align: center; vertical-align: top; display: table-cell;">
                    <div class="tier-percent" style="font-size: ${content.percentFontSize}; font-weight: bold; color: ${content.percentColor}; margin-bottom: 10px; line-height: 1.2;">${escapeHtml(tier.percent)}</div>
                    <div class="tier-desc" style="font-size: ${content.descFontSize}; color: ${content.descColor}; margin-bottom: 15px; line-height: 1.4;">${escapeHtml(tier.desc)}</div>
                    <span class="tier-code" style="display: inline-block; background-color: ${content.codeBgColor}; color: ${content.codeColor}; font-size: ${content.codeFontSize}; font-weight: 600; padding: 8px 16px; border-radius: ${content.codeBorderRadius}; letter-spacing: 0.5px;">${escapeHtml(tier.code)}</span>
                </td>
            `;
        });
        
        // Comprehensive responsive styles
        const responsiveStyles = `
            <style>
			    /* Base styles to prevent overflow */
.tier-table {
    width: 100% !important;
    border-collapse: separate !important;
    border-spacing: ${content.tierGap} !important;
    table-layout: fixed !important; /* This helps with equal column widths */
}
                /* Tier cell hover effects */
                .tier-cell {
                    transition: all 0.3s ease;
                    cursor: default;
                }
                .tier-cell:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.08);
                    border-color: ${content.featuredBorderColor} !important;
                }
                .tier-cell.featured:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.12);
                }
                
                /* Button hover effects */
                .button-primary {
                    transition: all 0.3s ease;
                    display: inline-block;
                    text-decoration: none;
                }
                .button-primary:hover {
                    background-color: ${content.buttonHoverBgColor} !important;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
                }
                
                /* Mobile responsive styles */
                @media only screen and (max-width: ${content.mobileBreakpoint}) {
                    .tier-table,
                    .tier-table tr,
                    .tier-table tbody {
                        width: 100% !important;
                        display: block !important;
                    }
                    
                    .tier-cell {
                        width: 100% !important;
                        display: block !important;
                        padding: ${content.mobileTierPadding} !important;
                        margin-bottom: ${content.mobileStackGap} !important;
                        box-sizing: border-box !important;
                    }
                    
                    .tier-cell:last-child {
                        margin-bottom: 0 !important;
                    }
                    
                    .tier-percent {
                        font-size: ${content.mobilePercentFontSize} !important;
                    }
                    
                    .tier-desc {
                        font-size: ${content.mobileDescFontSize} !important;
                    }
                    
                    .button-primary {
                        padding: ${content.mobileButtonPadding} !important;
                        font-size: ${content.mobileButtonFontSize} !important;
                        width: 100% !important;
                        max-width: 280px !important;
                    }
                    
                    .tiers-wrapper {
                        padding: 20px 15px !important;
                    }
                }
                
                /* Small mobile devices */
                @media only screen and (max-width: 360px) {
                    .tier-cell {
                        padding: 15px 12px !important;
                    }
                    
                    .tier-percent {
                        font-size: 22px !important;
                    }
                    
                    .tier-code {
                        font-size: 13px !important;
                        padding: 6px 12px !important;
                    }
                }
				/* Fix button overflow on mobile */
@media only screen and (max-width: ${content.mobileBreakpoint}) {
    .button-primary {
        padding: ${content.mobileButtonPadding} !important;
        font-size: ${content.mobileButtonFontSize} !important;
        width: auto !important;  /* Change from 100% to auto */
        min-width: 200px !important;  /* Minimum width */
        max-width: 90% !important;  /* Maximum width 90% of container */
        box-sizing: border-box !important;
        white-space: normal !important;
        word-wrap: break-word !important;
        line-height: 1.4 !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }
}
            </style>
        `;
        
        const footerNote = content.showFooterNote ? 
            `<p style="text-align: center; font-size: ${content.footerNoteFontSize}; color: ${content.footerNoteColor}; margin-top: 22px; letter-spacing: 0.2px;">${escapeHtml(content.footerNote)}</p>` : '';
        
        return `
            ${responsiveStyles}
            <div class="tiers-wrapper" style="padding: ${content.wrapperPadding};">
                <table class="tier-table" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: separate; border-spacing: ${content.tierGap}; width: 100%;">
                    <tr>
                        ${tiersHtml}
                    </tr>
                </table>
                
                <div class="cta-wrap" style="text-align: center; margin-top: 30px;">
                    <a href="${content.buttonLink}" class="button-primary" style="display: inline-block; background-color: ${content.buttonBgColor}; color: ${content.buttonTextColor}; font-size: ${content.buttonFontSize}; padding: ${content.buttonPadding}; border-radius: ${content.buttonBorderRadius}; text-decoration: none; font-weight: 600; letter-spacing: 0.5px;">${escapeHtml(content.buttonText)}</a>
                </div>
                
                ${footerNote}
            </div>
        `;
    },

    showProperties: function(section, container) {
        const content = section.content;
        
        // Tier 1 Settings
        const tier1Details = document.createElement('details');
        tier1Details.classList.add('mb-3', 'border', 'rounded', 'p-2');
        tier1Details.open = true;
        const tier1Summary = document.createElement('summary');
        tier1Summary.textContent = 'Tier 1 Settings';
        tier1Summary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        tier1Details.appendChild(tier1Summary);
        const tier1Container = document.createElement('div');
        tier1Container.classList.add('space-y-2');
        tier1Details.appendChild(tier1Container);
        container.appendChild(tier1Details);
        
        createInput('Percent Text', 'tier1Percent', 'text', '10% OFF', null, content, tier1Container);
        createInput('Description', 'tier1Desc', 'text', 'any single pattern', null, content, tier1Container);
        createInput('Code', 'tier1Code', 'text', 'MAKER10', null, content, tier1Container);
        createCheckbox('Featured (Highlighted)', 'tier1Featured', content, tier1Container);
        
        // Tier 2 Settings
        const tier2Details = document.createElement('details');
        tier2Details.classList.add('mb-3', 'border', 'rounded', 'p-2');
        tier2Details.open = true;
        const tier2Summary = document.createElement('summary');
        tier2Summary.textContent = 'Tier 2 Settings';
        tier2Summary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        tier2Details.appendChild(tier2Summary);
        const tier2Container = document.createElement('div');
        tier2Container.classList.add('space-y-2');
        tier2Details.appendChild(tier2Container);
        container.appendChild(tier2Details);
        
        createInput('Percent Text', 'tier2Percent', 'text', '20% OFF', null, content, tier2Container);
        createInput('Description', 'tier2Desc', 'text', '3+ patterns', null, content, tier2Container);
        createInput('Code', 'tier2Code', 'text', 'MAKER20', null, content, tier2Container);
        createCheckbox('Featured (Highlighted)', 'tier2Featured', content, tier2Container);
        
        // Tier 3 Settings
        const tier3Details = document.createElement('details');
        tier3Details.classList.add('mb-3', 'border', 'rounded', 'p-2');
        tier3Details.open = true;
        const tier3Summary = document.createElement('summary');
        tier3Summary.textContent = 'Tier 3 Settings';
        tier3Summary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        tier3Details.appendChild(tier3Summary);
        const tier3Container = document.createElement('div');
        tier3Container.classList.add('space-y-2');
        tier3Details.appendChild(tier3Container);
        container.appendChild(tier3Details);
        
        createInput('Percent Text', 'tier3Percent', 'text', '30% OFF', null, content, tier3Container);
        createInput('Description', 'tier3Desc', 'text', '5+ patterns', null, content, tier3Container);
        createInput('Code', 'tier3Code', 'text', 'MAKER30', null, content, tier3Container);
        createCheckbox('Featured (Highlighted)', 'tier3Featured', content, tier3Container);
        
        // Colors & Styling
        const styleDetails = document.createElement('details');
        styleDetails.classList.add('mb-3', 'border', 'rounded', 'p-2');
        styleDetails.open = true;
        const styleSummary = document.createElement('summary');
        styleSummary.textContent = 'Colors & Styling';
        styleSummary.classList.add('font-medium', 'cursor-pointer', 'mb-2');
        styleDetails.appendChild(styleSummary);
        const styleContainer = document.createElement('div');
        styleContainer.classList.add('space-y-2');
        styleDetails.appendChild(styleContainer);
        container.appendChild(styleDetails);
        
        createInput('Regular Tier BG Color', 'tierBgColor', 'color', '#f9f5f0', null, content, styleContainer);
        createInput('Regular Tier Border', 'tierBorderColor', 'color', '#e8d9cc', null, content, styleContainer);
        createInput('Featured Tier BG Color', 'featuredBgColor', 'color', '#f0e6d8', null, content, styleContainer);
        createInput('Featured Tier Border', 'featuredBorderColor', 'color', '#c9b6a2', null, content, styleContainer);
        createInput('Border Radius', 'tierBorderRadius', 'text', '12px', null, content, styleContainer);
        createInput('Percent Color', 'percentColor', 'color', '#b28b5e', null, content, styleContainer);
        createInput('Percent Font Size', 'percentFontSize', 'text', '28px', null, content, styleContainer);
        createInput('Description Color', 'descColor', 'color', '#5f4c3b', null, content, styleContainer);
        createInput('Description Font Size', 'descFontSize', 'text', '16px', null, content, styleContainer);
        createInput('Code Background', 'codeBgColor', 'color', '#e8d9cc', null, content, styleContainer);
        createInput('Code Text Color', 'codeColor', 'color', '#5f4c3b', null, content, styleContainer);
        createInput('Code Font Size', 'codeFontSize', 'text', '14px', null, content, styleContainer);
        createInput('Code Border Radius', 'codeBorderRadius', 'text', '20px', null, content, styleContainer);
        createInput('Tier Gap', 'tierGap', 'text', '15px', null, content, styleContainer);
        createInput('Tier Padding', 'tierPadding', 'text', '25px 15px', null, content, styleContainer);
        createInput('Wrapper Padding', 'wrapperPadding', 'text', '30px 20px', null, content, styleContainer);
        
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
        createInput('Stack Gap', 'mobileStackGap', 'text', '20px', null, content, mobileContainer);
        createInput('Tier Padding (Mobile)', 'mobileTierPadding', 'text', '20px 15px', null, content, mobileContainer);
        createInput('Percent Font Size (Mobile)', 'mobilePercentFontSize', 'text', '24px', null, content, mobileContainer);
        createInput('Description Font Size (Mobile)', 'mobileDescFontSize', 'text', '14px', null, content, mobileContainer);
        createInput('Button Padding (Mobile)', 'mobileButtonPadding', 'text', '12px 24px', null, content, mobileContainer);
        createInput('Button Font Size (Mobile)', 'mobileButtonFontSize', 'text', '15px', null, content, mobileContainer);
        
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
        
        createInput('Button Text', 'buttonText', 'text', 'Claim My Savings', null, content, buttonContainer);
        createInput('Button Link', 'buttonLink', 'text', '#', null, content, buttonContainer);
        createInput('Button BG Color', 'buttonBgColor', 'color', '#b28b5e', null, content, buttonContainer);
        createInput('Button Hover BG', 'buttonHoverBgColor', 'color', '#9a764d', null, content, buttonContainer);
        createInput('Button Text Color', 'buttonTextColor', 'color', '#ffffff', null, content, buttonContainer);
        createInput('Button Font Size', 'buttonFontSize', 'text', '16px', null, content, buttonContainer);
        createInput('Button Padding', 'buttonPadding', 'text', '14px 30px', null, content, buttonContainer);
        createInput('Button Border Radius', 'buttonBorderRadius', 'text', '30px', null, content, buttonContainer);
        
        // Footer Note
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
            createInput('Footer Text', 'footerNote', 'text', '✦ Offer expires March 15th at midnight PST ✦', null, content, footerContainer);
            createInput('Footer Color', 'footerNoteColor', 'color', '#8A9A5B', null, content, footerContainer);
            createInput('Footer Font Size', 'footerNoteFontSize', 'text', '13px', null, content, footerContainer);
        }
    }
});