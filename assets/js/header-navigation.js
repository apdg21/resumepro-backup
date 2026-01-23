// /assets/js/header-navigation.js
// COMPLETE HEADER NAVIGATION - Include this on ALL pages

(function() {
    'use strict';
    
    function initHeaderNavigation() {
        console.log('🔄 Header navigation initializing...');
        
        // Get elements
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const dropdownItems = document.querySelectorAll('[data-dropdown]');
        
        if (!hamburger || !navMenu) {
            console.error('❌ Header elements not found');
            return;
        }
        
        console.log(`✅ Found ${dropdownItems.length} dropdown items`);
        
        // ===== 1. MOBILE MENU TOGGLE =====
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('📱 Hamburger clicked');
            
            // Toggle mobile menu
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            // Close all dropdowns when opening menu
            if (!navMenu.classList.contains('active')) {
                dropdownItems.forEach(item => {
                    item.removeAttribute('data-dropdown-active');
                });
            }
        });
        
        // ===== 2. DROPDOWN TOGGLE =====
        dropdownItems.forEach(item => {
            const trigger = item.querySelector('.nav-link');
            
            if (trigger) {
                trigger.addEventListener('click', function(e) {
                    // On mobile: prevent default to open dropdown
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                    }
                    e.stopPropagation();
                    
                    const isActive = item.hasAttribute('data-dropdown-active');
                    
                    // Close other dropdowns
                    dropdownItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.removeAttribute('data-dropdown-active');
                        }
                    });
                    
                    // Toggle this dropdown
                    if (isActive) {
                        item.removeAttribute('data-dropdown-active');
                    } else {
                        item.setAttribute('data-dropdown-active', 'true');
                    }
                });
            }
        });
        
        // ===== 3. CLOSE WHEN CLICKING OUTSIDE =====
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-container')) {
                // Close mobile menu
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
                
                // Close dropdowns
                dropdownItems.forEach(item => {
                    item.removeAttribute('data-dropdown-active');
                });
            }
        });
        
        // ===== 4. CLOSE MOBILE MENU ON LINK CLICK =====
        document.querySelectorAll('.nav-link[href], .dropdown-item').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    document.body.classList.remove('menu-open');
                    dropdownItems.forEach(item => {
                        item.removeAttribute('data-dropdown-active');
                    });
                }
            });
        });
        
        // ===== 5. HANDLE WINDOW RESIZE =====
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        console.log('✅ Header navigation ready');
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeaderNavigation);
    } else {
        initHeaderNavigation();
    }
})();
