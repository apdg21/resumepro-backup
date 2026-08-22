let portfolioData = {};
let currentPage = 1;
let itemsPerPage = 8; // Default for desktop

const projectGrid = document.getElementById('project-grid');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfoSpan = document.getElementById('pageInfo');
const paginationContainer = document.getElementById('pagination');
const jsonUploadInput = document.getElementById('jsonUpload');
const adminControls = document.querySelector('.admin-controls');
const contactForm = document.getElementById('contactForm');
const formSuccessMessage = document.getElementById('formSuccessMessage');
const menuToggle = document.getElementById('menuToggle'); // Hamburger menu toggle
const mainNav = document.getElementById('mainNav');       // Main navigation element
const profileImageElement = document.getElementById('profileImage'); // Profile image element


// Default data if no data.json or localStorage is found
const defaultData = {
    "logo": "Video Editor Portfolio",
    "hero": {
        "title": "Crafting Stories Through Motion",
        "subtitle": "Bringing Visions to Life, Frame by Frame"
    },
    "projects": [
        {
            "title": "Dynamic Promo Video",
            "description": "Engaging promotional video for a tech startup, highlighting key features and benefits.",
            "image": "assets/sample1.jpg",
            "link": "samples/sample1.txt"
        },
        {
            "title": "Corporate Explainer",
            "description": "Animated explainer video simplifying complex corporate services for a broader audience.",
            "image": "assets/sample2.jpg",
            "link": "samples/sample2.txt"
        },
        {
            "title": "Event Highlight Reel",
            "description": "Capturing the energy and key moments of a major industry conference.",
            "image": "assets/sample3.jpg",
            "link": "samples/sample3.txt"
        },
        {
            "title": "Product Launch Cinematic",
            "description": "High-production value video for a new product, focusing on aesthetics and user experience.",
            "image": "assets/sample4.jpg",
            "link": "samples/sample4.txt"
        },
        {
            "title": "Social Media Ad Campaign",
            "description": "Series of short, punchy videos optimized for various social media platforms.",
            "image": "assets/sample5.jpg",
            "link": "samples/sample5.txt"
        },
        {
            "title": "Documentary Short",
            "description": "Compelling short documentary exploring a local community initiative.",
            "image": "assets/sample6.jpg",
            "link": "samples/sample6.txt"
        },
        {
            "title": "Music Video Production",
            "description": "Creative and visually stunning music video for an indie artist.",
            "image": "assets/sample7.jpg",
            "link": "samples/sample7.txt"
        },
        {
            "title": "Educational Content Series",
            "description": "Editing a series of educational videos for an online learning platform.",
            "image": "assets/sample8.jpg",
            "link": "samples/sample8.txt"
        },
        {
            "title": "Real Estate Walkthrough",
            "description": "Immersive video tour of a luxury property, showcasing its unique features.",
            "image": "assets/sample9.jpg",
            "link": "samples/sample9.txt"
        },
        {
            "title": "Travel Vlog Montage",
            "description": "Fast-paced and exciting montage from a travel vlog, capturing adventure.",
            "image": "assets/sample10.jpg",
            "link": "samples/sample10.txt"
        },
        {
            "title": "Fitness Training Series",
            "description": "Energetic and clear training videos for a fitness coach's online program.",
            "image": "assets/sample11.jpg",
            "link": "samples/sample11.txt"
        },
        {
            "title": "Wedding Highlight Film",
            "description": "Emotionally resonant and beautifully crafted highlight film of a wedding day.",
            "image": "assets/sample12.jpg",
            "link": "samples/sample12.txt"
        },
        {
            "title": "Game Trailer Edit",
            "description": "Dynamic trailer for an upcoming video game, building excitement and anticipation.",
            "image": "assets/sample13.jpg",
            "link": "samples/sample13.txt"
        },
        {
            "title": "Exploration of Nature",
            "description": "Calm and mesmerizing video showcasing the beauty of a natural landscape.",
            "image": "assets/sample14.jpg",
            "link": "samples/sample14.txt"
        },
        {
            "title": "Food & Recipe Series",
            "description": "Appetizing and instructional videos for a cooking channel.",
            "image": "assets/sample15.jpg",
            "link": "samples/sample15.txt"
        },
        {
            "title": "Fashion Lookbook",
            "description": "Stylish and modern video presenting a new fashion collection.",
            "image": "assets/sample16.jpg",
            "link": "samples/sample16.txt"
        },
        {
            "title": "Company Profile Video",
            "description": "Comprehensive video introducing a company, its values, and team.",
            "image": "assets/sample17.jpg",
            "link": "samples/sample17.txt"
        },
        {
            "title": "Short Film Post-Production",
            "description": "Full post-production for an independent short film, including color grading and sound design.",
            "image": "assets/sample18.jpg",
            "link": "samples/sample18.txt"
        },
        {
            "title": "Interview Series",
            "description": "Clean and professional edits for a series of expert interviews.",
            "image": "assets/sample19.jpg",
            "link": "samples/sample19.txt"
        },
        {
            "title": "Sports Action Montage",
            "description": "High-energy montage capturing peak moments from various sports events.",
            "image": "assets/sample20.jpg",
            "link": "samples/sample20.txt"
        }
    ],
    "about": {
        "text": "Hello! I'm a passionate video editor with over 8 years of experience in crafting compelling visual narratives. From dynamic promotional content to intricate documentary edits, my goal is always to bring stories to life with precision and creativity. I specialize in post-production, color grading, sound design, and motion graphics, using industry-standard software to deliver high-quality results. I believe that every frame has a purpose, and I'm dedicated to ensuring that your vision not only looks incredible but also resonates deeply with your audience. Let's create something unforgettable together!",
        "skills": ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Final Cut Pro", "Motion Graphics", "Color Grading", "Sound Design", "VFX", "Storytelling", "Video Compression"],
        "profileImage": "assets/default-profile.jpg" // Default profile image
    },
    "testimonials": [
        {
            "text": "The video editor delivered exceptional work! They perfectly captured our brand's essence and the final video exceeded all our expectations. Highly recommended!",
            "author": "Client A"
        },
        {
            "text": "An absolute professional. Their keen eye for detail and understanding of pacing transformed our raw footage into a masterpiece. We'll definitely be working with them again.",
            "author": "Client B"
        },
        {
            "text": "Outstanding creativity and technical skill. The video editor took our complex ideas and translated them into a clear, engaging, and visually stunning piece.",
            "author": "Client C"
        }
    ],
    "contact": {
        "email": "videoeditor@example.com",
        "successMessage": "Thank you for your message! I'll get back to you soon."
    },
    "footer": {
        "text": "© 2025 Video Editor Portfolio"
    },
    "social": {
        "linkedin": "https://linkedin.com/in/yourvideoeditor",
        "twitter": "https://twitter.com/yourvideoeditor",
        "github": "https://github.com/yourvideoeditor"
    }
};

/**
 * Validates the loaded data to ensure critical parts are arrays.
 * @param {object} data - The portfolio data object.
 * @returns {object} - The validated data object.
 */
function validateData(data) {
    if (!Array.isArray(data.projects)) {
        console.error('Validation Error: data.projects is not an array. Setting to empty array.');
        data.projects = [];
    }
    if (!Array.isArray(data.testimonials)) {
        console.error('Validation Error: data.testimonials is not an array. Setting to empty array.');
        data.testimonials = [];
    }
    // Ensure about and skills exist before checking Array.isArray
    if (!data.about) {
        data.about = {};
    }
    if (!Array.isArray(data.about.skills)) {
        console.error('Validation Error: data.about.skills is not an array. Setting to empty array.');
        data.about.skills = [];
    }
    return data;
}

/**
 * Loads portfolio data from various sources with a priority system.
 * 1. Checks sessionStorage for 'justUploaded' flag to use localStorage.
 * 2. Attempts to fetch data.json from the server.
 * 3. Falls back to localStorage if fetch fails.
 * 4. Uses defaultData as a final fallback.
 * @returns {Promise<void>} A promise that resolves when data is loaded and rendered.
 */
async function loadDataAndDisplay() {
    let dataToUse = null;
    const justUploaded = sessionStorage.getItem('justUploaded');

    if (justUploaded) {
        // Priority 1: Use localStorage if a recent upload occurred
        const storedData = localStorage.getItem('portfolioData');
        if (storedData) {
            try {
                dataToUse = validateData(JSON.parse(storedData));
                console.log('Loaded data from localStorage (justUploaded flag):', dataToUse);
            } catch (e) {
                console.error('Error parsing localStorage data:', e);
            }
        }
        // Clear flag after use to allow normal fetch/fallback on next load
        sessionStorage.removeItem('justUploaded');
    }

    if (!dataToUse) {
        // Priority 2: Attempt to fetch data.json
        try {
            // Cache-busting to ensure fresh data.json
            const response = await fetch(`data.json?t=${new Date().getTime()}`);
            if (!response.ok) {
                // Check for 404 specifically for a more targeted message
                if (response.status === 404) {
                    console.warn('data.json not found on server. Falling back to localStorage or default data.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } else {
                const fetchedData = await response.json();
                dataToUse = validateData(fetchedData);
                console.log('Loaded data from data.json:', dataToUse);
                // If data.json is successfully fetched, clear localStorage if no recent upload
                if (!justUploaded) {
                    localStorage.removeItem('portfolioData');
                    console.log('localStorage cleared as data.json was successfully fetched.');
                }
            }
        } catch (error) {
            console.warn('Could not fetch data.json:', error); // Generic error for fetch issues
            // Priority 3: Fallback to localStorage
            const storedData = localStorage.getItem('portfolioData');
            if (storedData) {
                try {
                    dataToUse = validateData(JSON.parse(storedData));
                    console.log('Loaded data from localStorage (fallback):', dataToUse);
                } catch (e) {
                    console.error('Error parsing localStorage fallback data:', e);
                }
            }
        }
    }

    // Priority 4: Use defaultData if all else fails
    if (!dataToUse) {
        dataToUse = validateData(defaultData);
        console.log('Using default dataset.');
    }

    portfolioData = dataToUse;
    renderPortfolio();
    // After rendering, check Font Awesome status
    checkFontAwesome();
}

/**
 * Renders the portfolio content based on the loaded data.
 */
function renderPortfolio() {
    // Update basic text content
    document.getElementById('pageTitle').textContent = portfolioData.logo || defaultData.logo;
    document.getElementById('portfolioLogo').textContent = portfolioData.logo || defaultData.logo;
    document.getElementById('heroTitle').textContent = portfolioData.hero.title || defaultData.hero.title;
    document.getElementById('heroSubtitle').textContent = portfolioData.hero.subtitle || defaultData.hero.subtitle;
    document.getElementById('aboutText').textContent = portfolioData.about.text || defaultData.about.text;
    document.getElementById('footerText').textContent = portfolioData.footer.text || defaultData.footer.text;

    // Profile Image
    if (portfolioData.about && portfolioData.about.profileImage && profileImageElement) {
        profileImageElement.src = portfolioData.about.profileImage;
        profileImageElement.onerror = () => {
            console.warn("Failed to load profile image. Using placeholder.");
            profileImageElement.src = 'assets/placeholder-profile.jpg';
        };
    } else if (profileImageElement) {
        profileImageElement.src = 'assets/placeholder-profile.jpg';
    }


    // About Skills
    const aboutSkillsList = document.getElementById('aboutSkills');
    aboutSkillsList.innerHTML = '';
    (portfolioData.about.skills || []).forEach(skill => {
        const li = document.createElement('li');
        li.textContent = skill;
        aboutSkillsList.appendChild(li);
    });

    // Testimonials
    const testimonialsContainer = document.getElementById('testimonialsContainer');
    testimonialsContainer.innerHTML = '';
    if (portfolioData.testimonials && portfolioData.testimonials.length > 0) {
        portfolioData.testimonials.forEach(testimonial => {
            const testimonialCard = document.createElement('div');
            testimonialCard.className = 'testimonial-card';
            testimonialCard.innerHTML = `
                <p>"${testimonial.text}"</p>
                <div class="author">- ${testimonial.author}</div>
            `;
            testimonialsContainer.appendChild(testimonialCard);
        });
    } else {
        testimonialsContainer.innerHTML = '<p>No testimonials available.</p>';
    }

    // Contact Form Email
    document.getElementById('formEmail').value = portfolioData.contact.email || defaultData.contact.email;
    contactForm.action = `https://formsubmit.co/${portfolioData.contact.email || defaultData.contact.email}`;


    // Social Links
    const socialLinksContainer = document.getElementById('socialLinks');
    socialLinksContainer.innerHTML = '';
    const socialPlatforms = ['linkedin', 'twitter', 'github'];
    socialPlatforms.forEach(platform => {
        if (portfolioData.social && portfolioData.social[platform]) {
            const a = document.createElement('a');
            a.href = portfolioData.social[platform];
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.className = "social-icon"; // Added for CSS targeting
            a.setAttribute('aria-label', platform.charAt(0).toUpperCase() + platform.slice(1));

            const icon = document.createElement('i');
            icon.className = `fab fa-${platform}`; // Using fab for brand icons
            a.appendChild(icon);

            const fallbackText = document.createElement('span');
            fallbackText.className = 'fallback-text';
            fallbackText.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
            a.appendChild(fallbackText);

            socialLinksContainer.appendChild(a);
        }
    });

    // Render projects after all other main content, as it depends on itemsPerPage.
    renderProjects();
}

/**
 * Checks if Font Awesome icons are loading and applies 'no-fontawesome' class if not.
 */
function checkFontAwesome() {
    // Create a temporary element to test Font Awesome rendering
    const testElement = document.createElement('i');
    testElement.className = 'fas fa-check'; // A common Font Awesome icon
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px'; // Hide it off-screen
    testElement.style.fontSize = '1px'; // Make it tiny to not affect layout
    document.body.appendChild(testElement);

    // Give browser a moment to render the icon (important for computed styles)
    setTimeout(() => {
        // Check if the element has rendered a non-zero width/height,
        // which would indicate the icon font loaded.
        const isFontAwesomeLoaded = testElement.offsetWidth > 0 && testElement.offsetHeight > 0;
        document.body.removeChild(testElement); // Clean up the test element

        if (!isFontAwesomeLoaded) {
            // Font Awesome probably failed to load
            console.warn("Font Awesome icons are not loading. Showing fallback text.");
            document.querySelectorAll('.social-icon').forEach(link => {
                link.classList.add('no-fontawesome'); // Add class to trigger fallback CSS
            });
        } else {
            // Font Awesome loaded successfully
            console.log("Font Awesome icons loaded successfully.");
            document.querySelectorAll('.social-icon').forEach(link => {
                link.classList.remove('no-fontawesome'); // Ensure class is removed if it was there
            });
        }
    }, 100); // Small delay to allow CSS to apply and font to load
}


/**
 * Adjusts items per page based on screen width.
 */
function updateItemsPerPage() {
    console.log('updateItemsPerPage called. InnerWidth:', window.innerWidth);
    const oldItemsPerPage = itemsPerPage;

    if (window.innerWidth <= 768) {
        itemsPerPage = 4; // Mobile/smaller view
    } else {
        itemsPerPage = 8; // Desktop/larger view
    }

    // Only re-render projects if itemsPerPage actually changed
    // or if the total number of projects changed (e.g., after data load)
    const newTotalPages = getTotalPages();
    const oldTotalPages = Math.ceil((portfolioData.projects ? portfolioData.projects.length : 0) / oldItemsPerPage);

    if (itemsPerPage !== oldItemsPerPage || newTotalPages !== oldTotalPages) {
        console.log(`itemsPerPage changed from ${oldItemsPerPage} to ${itemsPerPage} or total pages changed. Re-rendering projects.`);
        // Reset to first page if current page becomes invalid after resize
        if (currentPage > getTotalPages() || currentPage < 1) { // Also handle currentPage < 1 case
            currentPage = 1;
        }
        renderProjects(); // Re-render projects with new item count
    } else {
        console.log('itemsPerPage and total pages are the same. No project re-render needed by updateItemsPerPage.');
    }
}

/**
 * Calculates total pages for pagination.
 * @returns {number} Total number of pages.
 */
function getTotalPages() {
    if (!portfolioData.projects || portfolioData.projects.length === 0) {
        return 0;
    }
    return Math.ceil(portfolioData.projects.length / itemsPerPage);
}

/**
 * Renders projects for the current page.
 */
function renderProjects() {
    projectGrid.innerHTML = '';
    if (!portfolioData.projects || portfolioData.projects.length === 0) {
        projectGrid.innerHTML = '<p>No projects available.</p>';
        paginationContainer.classList.add('hidden');
        return;
    }

    const totalPages = getTotalPages();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const projectsToDisplay = portfolioData.projects.slice(start, end);

    projectsToDisplay.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <img src="${project.image || 'assets/placeholder.jpg'}" alt="${project.title}">
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link-button">View Sample</a>
            </div>
        `;
        projectGrid.appendChild(projectCard);
    });

    // Update pagination controls
    pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    if (totalPages <= 1) {
        paginationContainer.classList.add('hidden');
    } else {
        paginationContainer.classList.remove('hidden');
    }
}

// Pagination Event Listeners
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderProjects();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < getTotalPages()) {
        currentPage++;
        renderProjects();
    }
});

// JSON File Upload
jsonUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const uploadedData = JSON.parse(e.target.result);
            portfolioData = validateData(uploadedData); // Validate uploaded data
            localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
            sessionStorage.setItem('justUploaded', 'true'); // Set flag
            console.log('JSON uploaded and saved to localStorage:', portfolioData);
            alert('Portfolio data successfully uploaded and saved!');
            currentPage = 1; // Reset to first page after upload
            renderPortfolio(); // Re-render immediately (this will also call renderProjects and checkFontAwesome)
            updateItemsPerPage(); // Ensure item count is correct after new data
        } catch (error) {
            console.error('Error parsing uploaded JSON:', error);
            alert('Failed to parse JSON file. Please ensure it is valid.');
        }
    };
    reader.readAsText(file);
});

// Contact Form Submission
contactForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const emailInput = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailInput.value)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Perform the actual submission using fetch
    const formData = new FormData(this);
    fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            formSuccessMessage.textContent = portfolioData.contact.successMessage || defaultData.contact.successMessage;
            formSuccessMessage.classList.remove('hidden');
            contactForm.reset();
            setTimeout(() => {
                formSuccessMessage.classList.add('hidden');
            }, 5000);
        } else {
            alert('There was an error sending your message. Please try again.');
        }
    })
    .catch(error => {
        console.error('Form submission error:', error);
        alert('There was an error sending your message. Please try again later.');
    });
});


// Admin Controls Visibility
function setAdminControlsVisibility() {
    // Check if the protocol is http or https (meaning it's served by a web server)
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        adminControls?.classList.add('hidden');
        console.log('Admin controls hidden in online mode.');
    } else {
        // If it's file:// protocol, show controls (for local file system development)
        adminControls?.classList.remove('hidden');
        console.log('Admin controls visible in offline mode.');
    }
}

// Hamburger menu toggle logic
menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
});

// Close mobile menu when a navigation link is clicked
mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) { // Only close if in mobile view
            mainNav.classList.remove('active');
        }
    });
});


// Event listener for window resize
window.addEventListener('resize', updateItemsPerPage);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    setAdminControlsVisibility();
    // Load data first, then after it's loaded, update items per page and render projects correctly.
    loadDataAndDisplay().then(() => {
        updateItemsPerPage(); // This will now run AFTER portfolioData is populated.
    });
});