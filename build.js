// build.js - Run this before deploying
const fs = require('fs');
const path = require('path');

console.log('📦 Building pages with included header...');

// Read header template
const header = fs.readFileSync('header.html', 'utf8');
console.log('✅ Header loaded');

// List of all pages to process (add your actual pages)
const pages = [
    'index.html',
    'contact.html', 
    'about.html',
    'resume-templates.html',
    'portfolio-templates.html',
    'android-applications.html',
    'family-connection-tools.html',
    'portfolio-best-practices.html',
    'portfolio-maintenance.html',
    'online-job-sites.html',
    'email-marketing.html',
    'mobile-optimization.html',
    'email-list-failure.html',
    'email-builder-previews.html',
    'why-less-is-more.html',
    'klaviyo-analytics.html',
    'email-builder.html',
    'privacy.html',
    'terms.html',
    'guide.html'
];

// Create dist folder if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
    console.log('📁 Created dist folder');
}

// Also copy any assets (CSS, JS, images) to dist folder
const assetsToCopy = [
    'favicon.svg',
    'style.css', // if you have a separate CSS file
    'script.js'  // if you have a separate JS file
];

// Copy assets
assetsToCopy.forEach(asset => {
    if (fs.existsSync(asset)) {
        fs.copyFileSync(asset, `dist/${asset}`);
        console.log(`✅ Copied ${asset}`);
    }
});

// Process each page
pages.forEach(page => {
    if (!fs.existsSync(page)) {
        console.log(`⚠️ ${page} not found, skipping`);
        return;
    }
    
    let content = fs.readFileSync(page, 'utf8');
    
    // Check if this page already has the placeholder
    if (content.includes('<!-- HEADER_PLACEHOLDER -->')) {
        // Replace placeholder with actual header
        content = content.replace('<!-- HEADER_PLACEHOLDER -->', header);
    } else {
        // Find where to insert the header (after opening body tag)
        const bodyTagMatch = content.match(/<body[^>]*>/);
        if (bodyTagMatch) {
            const bodyTag = bodyTagMatch[0];
            const afterBodyTag = content.indexOf(bodyTag) + bodyTag.length;
            
            // Insert header right after body tag
            content = content.slice(0, afterBodyTag) + '\n' + header + '\n' + content.slice(afterBodyTag);
        } else {
            console.log(`❌ Could not find <body> tag in ${page}`);
            return;
        }
    }
    
    // Remove any JavaScript header loading code
    const headerLoadingRegex = /<script[\s\S]*?fetch.*?header\.html[\s\S]*?<\/script>/gi;
    content = content.replace(headerLoadingRegex, '');
    
    // Remove header placeholder div if present
    content = content.replace(/<div id="header-placeholder"><\/div>/g, '');
    
    // Add necessary JavaScript for mobile menu functionality
    // Only add if not already present
    if (!content.includes('hamburger.addEventListener')) {
        const mobileMenuScript = `
    <script>
        // Mobile menu functionality
        document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.querySelector('.hamburger');
            if (hamburger) {
                hamburger.addEventListener('click', () => {
                    document.querySelector('.nav-menu').classList.toggle('active');
                });
            }
            
            // Toggle dropdown on mobile
            document.querySelectorAll('.dropdown .nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const dropdown = link.closest('.dropdown');
                    dropdown.classList.toggle('active');
                });
            });
            
            // Close menu when clicking a non-dropdown nav link or dropdown item
            document.querySelectorAll('.nav-item:not(.dropdown) .nav-link, .dropdown-item').forEach(link => {
                link.addEventListener('click', () => {
                    document.querySelector('.nav-menu').classList.remove('active');
                    document.querySelectorAll('.dropdown').forEach(dropdown => {
                        dropdown.classList.remove('active');
                    });
                });
            });
            
            // Close dropdowns when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.dropdown') && !e.target.closest('.hamburger')) {
                    document.querySelectorAll('.dropdown').forEach(dropdown => {
                        dropdown.classList.remove('active');
                    });
                }
            });
        });
    </script>`;
        
        // Insert script before closing body tag
        const bodyCloseIndex = content.lastIndexOf('</body>');
        if (bodyCloseIndex !== -1) {
            content = content.slice(0, bodyCloseIndex) + mobileMenuScript + '\n' + content.slice(bodyCloseIndex);
        }
    }
    
    // Write to dist folder
    fs.writeFileSync(`dist/${page}`, content);
    console.log(`✅ Built ${page}`);
});

console.log('\n🎉 All pages built successfully!');
console.log('📂 Output files are in the "dist" folder');
console.log('\n📋 Next steps:');
console.log('1. Deploy the "dist" folder to your hosting');
console.log('2. When you update header.html, run: node build.js');
console.log('3. Re-deploy the "dist" folder');
