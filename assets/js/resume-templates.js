// Resume Templates JavaScript - Isolated with IIFE
(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // ============ FAQ TOGGLE FUNCTIONALITY ============
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const item = this.parentElement;
                const isActive = item.classList.contains('active');
                
                // Close all other FAQs first
                document.querySelectorAll('.faq-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                    }
                });
                
                // Toggle current FAQ
                item.classList.toggle('active');
            });
        });
        
        // ============ PAGINATION FUNCTIONALITY ============
        function initPagination() {
            const pageBtns = document.querySelectorAll('.page-btn');
            const pages = document.querySelectorAll('.page');
            
            // Show only the first page initially
            pages.forEach((page, index) => {
                if (index === 0) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
            
            // Add click event to pagination buttons
            pageBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const pageNum = this.getAttribute('data-page');
                    showPage(pageNum);
                    
                    // Update active button
                    pageBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            });
        }
        
        function showPage(pageNum) {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            const targetPage = document.getElementById('page' + pageNum);
            if (targetPage) {
                targetPage.classList.add('active');
                
                // Smooth scroll to templates section
                const templatesSection = document.getElementById('templates');
                if (templatesSection) {
                    setTimeout(() => {
                        templatesSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 100);
                }
            }
        }
        
        // Initialize pagination
        initPagination();
        
        // ============ MODAL FUNCTIONALITY ============
        const modal = document.getElementById('previewModal');
        const modalContent = document.getElementById('modalContent');
        const modalIframe = document.querySelector('.modal-iframe');
        const viewBtns = document.querySelectorAll('.view-btn');
        const closeModal = document.querySelector('.close-modal');
        const previewBtns = document.querySelectorAll('.preview-btn');
        const fullscreenToggle = document.getElementById('fullscreenToggle');
        let isFullscreen = false;
        
        if (modal && previewBtns.length > 0) {
            // Open modal when preview button is clicked
            previewBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const url = this.getAttribute('data-url');
                    if (modalIframe && url) {
                        modalIframe.src = url;
                        modal.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                        document.body.classList.add('modal-open');
                        
                        // Reset to normal view when opening
                        if (modalContent) {
                            modalContent.classList.remove('fullscreen');
                        }
                        isFullscreen = false;
                        updateFullscreenIcon();
                        
                        // On mobile, default to mobile view
                        if (window.innerWidth <= 768) {
                            setView('mobile');
                        } else {
                            setView('desktop');
                        }
                    }
                });
            });
            
            // Close modal
            if (closeModal) {
                closeModal.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeModalHandler();
                });
            }
            
            // Close modal when clicking outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModalHandler();
                }
            });
            
            // View toggle functionality
            viewBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const view = this.getAttribute('data-view');
                    setView(view);
                    
                    // Update active button
                    viewBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            
            // Fullscreen toggle functionality
            if (fullscreenToggle) {
                fullscreenToggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    isFullscreen = !isFullscreen;
                    if (modalContent) {
                        modalContent.classList.toggle('fullscreen', isFullscreen);
                    }
                    updateFullscreenIcon();
                });
            }
            
            function setView(view) {
                const iframeContainer = document.querySelector('.modal-iframe-container');
                const iframe = document.querySelector('.modal-iframe');
                
                if (iframeContainer && iframe) {
                    iframeContainer.className = 'modal-iframe-container';
                    iframe.className = 'modal-iframe';
                    
                    if (view === 'mobile') {
                        iframeContainer.classList.add('mobile-view');
                        iframe.classList.add('mobile-view');
                    } else {
                        iframeContainer.classList.add('desktop-view');
                        iframe.classList.add('desktop-view');
                    }
                }
            }
            
            function updateFullscreenIcon() {
                if (!fullscreenToggle) return;
                
                const icon = fullscreenToggle.querySelector('svg');
                if (icon) {
                    if (isFullscreen) {
                        icon.innerHTML = `
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                        `;
                        fullscreenToggle.setAttribute('title', 'Exit Fullscreen');
                    } else {
                        icon.innerHTML = `
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        `;
                        fullscreenToggle.setAttribute('title', 'Enter Fullscreen');
                    }
                }
            }
            
            function closeModalHandler() {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                document.body.classList.remove('modal-open');
                
                // Reset to normal view when closing
                if (modalContent) {
                    modalContent.classList.remove('fullscreen');
                }
                isFullscreen = false;
                updateFullscreenIcon();
                
                // Clear iframe src to stop any ongoing processes
                if (modalIframe) {
                    modalIframe.src = 'about:blank';
                }
            }
            
            // Handle ESC key to exit fullscreen or close modal
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    if (isFullscreen) {
                        isFullscreen = false;
                        if (modalContent) {
                            modalContent.classList.remove('fullscreen');
                        }
                        updateFullscreenIcon();
                    } else if (modal.style.display === 'flex') {
                        closeModalHandler();
                    }
                }
            });
        }
        
        // Make functions available globally
        window.showPage = function(pageNum) {
            const pages = document.querySelectorAll('.page');
            const pageBtns = document.querySelectorAll('.page-btn');
            
            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));
            
            // Show selected page
            const targetPage = document.getElementById('page' + pageNum);
            if (targetPage) {
                targetPage.classList.add('active');
                
                // Update active button
                pageBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-page') == pageNum) {
                        btn.classList.add('active');
                    }
                });
            }
        };
    });
})();