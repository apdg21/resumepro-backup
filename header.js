// ============================================================
// HEADER.JS — ResumePro Redesign
// Functionality: mobile menu, dropdowns, active state,
//                scroll-hide/show, scrolled class
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const header     = document.querySelector('header');
    const hamburger  = document.querySelector('.hamburger');
    const navMenu    = document.querySelector('.header-nav-menu');
    const dropdowns  = document.querySelectorAll('.header-dropdown');
    const navLinks   = document.querySelectorAll('.header-nav-link');
    const dropItems  = document.querySelectorAll('.header-dropdown-item');

    if (!header) return;

    // ── MOBILE MENU TOGGLE ────────────────────────────────
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navMenu.classList.toggle('active');
            hamburger.textContent  = isOpen ? '✕' : '☰';
            hamburger.setAttribute('aria-expanded', isOpen);
        });
    }

    // ── MOBILE DROPDOWN TOGGLES ──────────────────────────
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector(':scope > .header-nav-link');
        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
            if (window.innerWidth > 768) return; // desktop: CSS hover handles it

            e.preventDefault();
            e.stopPropagation();

            const isOpen = dropdown.classList.contains('active');

            // Close all other open dropdowns first
            dropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                    const icon = d.querySelector('.header-dropdown-icon');
                    if (icon) icon.style.transform = '';
                    const link = d.querySelector(':scope > .header-nav-link');
                    if (link) link.setAttribute('aria-expanded', 'false');
                }
            });

            dropdown.classList.toggle('active', !isOpen);
            const icon = trigger.querySelector('.header-dropdown-icon');
            if (icon) icon.style.transform = !isOpen ? 'rotate(180deg)' : '';
            trigger.setAttribute('aria-expanded', !isOpen);
        });
    });

    // ── CLOSE MENU WHEN CLICKING A PLAIN NAV LINK (MOBILE) ──
    document.querySelectorAll('.header-nav-item:not(.header-dropdown) .header-nav-link')
        .forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) closeMobileMenu();
            });
        });

    // ── CLOSE MENU WHEN CLICKING A DROPDOWN ITEM (MOBILE) ──
    dropItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) closeMobileMenu();
        });
    });

    // ── CLOSE WHEN CLICKING OUTSIDE ──────────────────────
    document.addEventListener('click', (e) => {
        // Mobile: close entire menu
        if (window.innerWidth <= 768) {
            if (!e.target.closest('header')) closeMobileMenu();
            return;
        }
        // Desktop: nothing needed (CSS hover manages dropdowns)
    });

    // ── RESIZE RESET ─────────────────────────────────────
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
            dropdowns.forEach(d => {
                d.classList.remove('active');
                const icon = d.querySelector('.header-dropdown-icon');
                if (icon) icon.style.transform = '';
                const link = d.querySelector(':scope > .header-nav-link');
                if (link) link.setAttribute('aria-expanded', 'false');
            });
        }
    });

    // ── HELPER: CLOSE MOBILE MENU ─────────────────────────
    function closeMobileMenu() {
        if (!navMenu) return;
        navMenu.classList.remove('active');
        if (hamburger) {
            hamburger.textContent = '☰';
            hamburger.setAttribute('aria-expanded', 'false');
        }
        dropdowns.forEach(d => {
            d.classList.remove('active');
            const icon = d.querySelector('.header-dropdown-icon');
            if (icon) icon.style.transform = '';
            const link = d.querySelector(':scope > .header-nav-link');
            if (link) link.setAttribute('aria-expanded', 'false');
        });
    }

    // ── ACTIVE PAGE HIGHLIGHT ─────────────────────────────
    function setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            const match =
                href === currentPage ||
                (currentPage === ''  && href === 'index.html') ||
                (href !== '#' && href !== 'index.html' && currentPage.includes(href.replace('.html', '')));

            if (match) {
                link.classList.add('active');
                // Also mark parent dropdown trigger
                const parentDropdown = link.closest('.header-dropdown');
                if (parentDropdown) {
                    const parentLink = parentDropdown.querySelector(':scope > .header-nav-link');
                    if (parentLink) parentLink.classList.add('active');
                }
            } else {
                link.classList.remove('active');
            }
        });
    }

    setActiveNavItem();

    // ── SMOOTH ANCHOR SCROLL ─────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href.startsWith('#')) return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            closeMobileMenu();

            const headerH = header.offsetHeight || 66;
            window.scrollTo({
                top: target.offsetTop - headerH - 8,
                behavior: 'smooth'
            });
        });
    });

    // ── SCROLL BEHAVIOUR ─────────────────────────────────
    // • Adds .scrolled class for a slightly stronger background
    // • Hides header on scroll-down, reveals on scroll-up
    let lastScrollY   = 0;
    let ticking       = false;
    const HIDE_OFFSET = 120; // px scrolled before auto-hide kicks in

    function onScroll() {
        const scrollY = window.scrollY;

        // .scrolled class — stronger blur/bg
        header.classList.toggle('scrolled', scrollY > 10);

        // Auto-hide on scroll down, reveal on scroll up
        if (scrollY > HIDE_OFFSET) {
            if (scrollY > lastScrollY) {
                // Scrolling down — hide header
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up — reveal header
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    // ── KEYBOARD ACCESSIBILITY ────────────────────────────
    // Close dropdowns / mobile menu with Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });

});
