// Header functionality for mobile navigation
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const dropdownLinks = document.querySelectorAll('.dropdown .nav-link');
    const allNavLinks = document.querySelectorAll('.nav-item:not(.dropdown) .nav-link, .dropdown-item');
    
    // Toggle mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', 
                hamburger.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });
    }
    
    // Toggle dropdowns on mobile
    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdown = link.closest('.dropdown');
                dropdown.classList.toggle('active');
                
                // Close other dropdowns
                document.querySelectorAll('.dropdown').forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });
            }
        });
    });
    
    // Close menu when clicking on regular links (mobile)
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Close menu when clicking outside (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const isClickInside = document.querySelector('.nav-container').contains(e.target);
            if (!isClickInside && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
                hamburger.setAttribute('aria-expanded', 'false');
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Reset mobile menu state on desktop
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
    
    // Close dropdowns with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navMenu.classList.remove('active');
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Keyboard navigation for dropdowns
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(item => {
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });
});
