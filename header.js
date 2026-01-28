// Header JavaScript - Mobile menu and dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Toggle hamburger icon
            if (hamburger.textContent === '☰') {
                hamburger.textContent = '✕';
            } else {
                hamburger.textContent = '☰';
            }
        });
    }
    
    // Toggle dropdown on mobile when clicking dropdown link
    document.querySelectorAll('.dropdown .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = link.closest('.dropdown');
                dropdown.classList.toggle('active');
                
                // Rotate dropdown icon
                const dropdownIcon = link.querySelector('.dropdown-icon');
                if (dropdownIcon) {
                    if (dropdown.classList.contains('active')) {
                        dropdownIcon.style.transform = 'rotate(180deg)';
                    } else {
                        dropdownIcon.style.transform = 'rotate(0deg)';
                    }
                }
            }
        });
    });
    
    // Close menu when clicking a non-dropdown nav link
    document.querySelectorAll('.nav-item:not(.dropdown) .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                hamburger.textContent = '☰';
            }
        });
    });
    
    // Close menu when clicking a dropdown item
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                hamburger.textContent = '☰';
                
                // Reset all dropdowns
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
                
                // Reset dropdown icons
                document.querySelectorAll('.dropdown-icon').forEach(icon => {
                    icon.style.transform = 'rotate(0deg)';
                });
            }
        });
    });
    
    // Close dropdowns when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!e.target.closest('.dropdown') && !e.target.closest('.hamburger')) {
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
                
                // Reset dropdown icons
                document.querySelectorAll('.dropdown-icon').forEach(icon => {
                    icon.style.transform = 'rotate(0deg)';
                });
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Reset mobile menu on desktop
            navMenu.classList.remove('active');
            hamburger.textContent = '☰';
            
            // Reset dropdowns
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            
            // Reset dropdown icons
            document.querySelectorAll('.dropdown-icon').forEach(icon => {
                icon.style.transform = '';
            });
        }
    });
    
    // Smooth scroll for anchor links within the same page
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only process internal anchor links
            if (href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    // Close mobile menu if open
                    if (window.innerWidth <= 768) {
                        navMenu.classList.remove('active');
                        hamburger.textContent = '☰';
                    }
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Account for fixed header
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Add active class to current page nav item
    function setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === currentPage || 
                (currentPage === '' && linkHref === 'index.html') ||
                (linkHref && linkHref.includes(currentPage.replace('.html', '')))) {
                link.classList.add('active');
                
                // Also highlight parent dropdown if this is a dropdown item
                const parentDropdown = link.closest('.dropdown');
                if (parentDropdown) {
                    const dropdownLink = parentDropdown.querySelector('.nav-link');
                    if (dropdownLink) {
                        dropdownLink.classList.add('active');
                    }
                }
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Set active nav item on page load
    setActiveNavItem();
    
    // Optional: Add scroll effect to header
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
            header.style.transition = 'transform 0.3s ease';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        // Add shadow when scrolled
        if (scrollTop > 10) {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
});