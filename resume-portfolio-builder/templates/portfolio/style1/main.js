const DATA_PATH = 'data.json'; // Path to your data.json file
let portfolioData = {}; // Will store the loaded JSON data
let currentPage = 1; // For pagination
let itemsPerPage = window.innerWidth > 768 ? 8 : 4; // Responsive items per page

// Default dataset to use when fetch and localStorage fail
const defaultData = {
    logo: 'Default Portfolio',
    hero: {
        title: 'Welcome to My Portfolio',
        subtitle: 'Showcasing my work',
        buttonText: 'View Work'
    },
    about: {
        title: 'About Me',
        description: 'I am a graphic designer with a passion for creating stunning visuals.',
        profileImage: 'images/default-profile.jpg' // Ensure this image exists
    },
    samples: [
        {
            title: 'Sample Project 1',
            description: 'A sample project description.',
            image: 'images/sample1.jpg', // Ensure this image exists
            link: '#'
        },
        {
            title: 'Sample Project 2',
            description: 'Another sample project description.',
            image: 'images/sample2.jpg', // Ensure this image exists
            link: '#'
        }
    ],
    testimonials: [
        {
            text: 'Great work on the project!',
            author: 'John Doe'
        }
    ],
    contact: {
        title: 'Get in Touch',
        formEmail: 'default@example.com'
    },
    footer: {
        copyright: '© 2025 Default Portfolio',
    },
    social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        github: 'https://github.com'
    }
};

// DOM Elements for Hamburger Menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// --- HAMBURGER MENU FUNCTIONALITY ---
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close the menu when a navigation link is clicked (useful for single-page sites)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// --- MAIN DATA LOADING FUNCTION ---
async function loadDataAndDisplay() {
    // Only clear localStorage if no recent upload has occurred
    if (!sessionStorage.getItem('justUploaded')) {
        localStorage.removeItem('portfolioData');
        console.log('localStorage cleared for portfolioData to ensure fresh load.');
    }

    try {
        let fetchedData;

        // Check if data was just uploaded
        const localData = localStorage.getItem('portfolioData');
        if (sessionStorage.getItem('justUploaded') && localData) {
            fetchedData = JSON.parse(localData);
            console.log('Using recently uploaded data from localStorage.');
            sessionStorage.removeItem('justUploaded'); // Clear upload flag
        } else {
            // Attempt to fetch from data.json
            console.log('Attempting to fetch data.json...');
            const response = await fetch(`${DATA_PATH}?t=${new Date().getTime()}`);
            if (!response.ok) {
                if (localData) {
                    fetchedData = JSON.parse(localData);
                    console.log('Failed to fetch data.json, but loaded from Local Storage as fallback.');
                } else {
                    console.warn('No data in localStorage. Using default dataset.');
                    fetchedData = defaultData;
                }
            } else {
                fetchedData = await response.json();
                console.log('Loaded data from data.json successfully.');
                localStorage.setItem('portfolioData', JSON.stringify(fetchedData));
            }
        }

        portfolioData = fetchedData;
        renderPage();
        document.getElementById('portfolio-content-wrapper').classList.remove('hidden');

    } catch (error) {
        console.error('An error occurred while loading portfolio data:', error);
        console.warn('Using default dataset.');
        portfolioData = defaultData;
        renderPage();
        document.getElementById('portfolio-content-wrapper').classList.remove('hidden');
    }
}

// --- RENDER FUNCTIONS ---
function renderPage() {
    if (!portfolioData || Object.keys(portfolioData).length === 0) {
        console.warn("Portfolio data is empty or not loaded yet. Using defaults.");
    }

    // General
    document.getElementById('logo').textContent = portfolioData.logo || 'Portfolio';
    document.title = `${portfolioData.logo || 'Graphic Designer'} Portfolio`;

    // Hero Section
    document.getElementById('hero-title').textContent = portfolioData.hero?.title || 'Welcome';
    document.getElementById('hero-subtitle').textContent = portfolioData.hero?.subtitle || 'Explore my work';
    const heroButton = document.getElementById('hero-button');
    heroButton.textContent = portfolioData.hero?.buttonText || 'View Work';
    heroButton.href = '#work';

    // About Section
    document.getElementById('about-title').textContent = portfolioData.about?.title || 'About';
    document.getElementById('about-description').textContent = portfolioData.about?.description || 'No description available.';
    document.getElementById('about-image').src = portfolioData.about?.profileImage || 'images/placeholder.jpg';

    // Work Samples Section
    renderSamples();
    setupPagination();

    // Testimonials Section
    renderTestimonials();

    // Contact Section
    document.getElementById('contact-title').textContent = portfolioData.contact?.title || 'Contact';
    document.getElementById('contact-form').action = `https://formsubmit.co/${portfolioData.contact?.formEmail || 'default@example.com'}`;

    // Footer Section
    renderFooter();

    // Setup Admin Controls
    setupAdminControls();
}

function renderSamples() {
    const grid = document.getElementById('sample-grid');
    grid.innerHTML = ''; // Clear existing samples
    const samples = portfolioData.samples || [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageSamples = samples.slice(startIndex, endIndex);

    pageSamples.forEach(sample => {
        const card = document.createElement('div');
        card.className = 'sample-card';
        card.innerHTML = `
            <img src="${sample.image}" alt="${sample.title}">
            <div class="sample-card-content">
                <h3>${sample.title}</h3>
                <p>${sample.description}</p>
            </div>
        `;
        card.addEventListener('click', () => {
            if (sample.link) {
                window.open(sample.link, '_blank');
            } else {
                console.warn(`No link defined for sample: ${sample.title}`);
            }
        });
        grid.appendChild(card);
    });
}

function renderTestimonials() {
    const container = document.getElementById('testimonial-container');
    container.innerHTML = '';

    const testimonials = portfolioData.testimonials || [];

    testimonials.forEach(testimonial => {
        const div = document.createElement('div');
        div.className = 'testimonial';
        div.innerHTML = `
            <p>"${testimonial.text}"</p>
            <p class="author">- ${testimonial.author}</p>
        `;
        container.appendChild(div);
    });
}

function renderFooter() {
    const socialContainer = document.getElementById('social-links');
    socialContainer.innerHTML = '';
    const social = portfolioData.social || {};

    if (social.linkedin) {
        socialContainer.innerHTML += `<a href="${social.linkedin}" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i><span class="sr-only">LinkedIn</span></a>`;
    }
    if (social.twitter) {
        socialContainer.innerHTML += `<a href="${social.twitter}" target="_blank" aria-label="Twitter"><i class="fab fa-twitter"></i><span class="sr-only">Twitter</span></a>`;
    }
    if (social.github) {
        socialContainer.innerHTML += `<a href="${social.github}" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i><span class="sr-only">GitHub</span></a>`;
    }

    document.getElementById('footer-copyright').textContent = portfolioData.footer?.copyright || '© 2025 Portfolio';
}

// --- PAGINATION FUNCTIONALITY ---
function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    const samples = portfolioData.samples || [];
    const totalPages = Math.ceil(samples.length / itemsPerPage);

    if (totalPages <= 1 || samples.length === 0) {
        paginationContainer.classList.add('hidden');
        return;
    }
    paginationContainer.classList.remove('hidden');

    paginationContainer.innerHTML = `
        <button id="prev-page" class="btn">Previous</button>
        <span id="page-info">Page ${currentPage} of ${totalPages}</span>
        <button id="next-page" class="btn">Next</button>
    `;

    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderSamples();
            setupPagination();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderSamples();
            setupPagination();
        }
    });
}

// --- GLOBAL EVENT LISTENERS ---
window.addEventListener('resize', () => {
    const newItemsPerPage = window.innerWidth > 768 ? 8 : 4;
    if (newItemsPerPage !== itemsPerPage) {
        itemsPerPage = newItemsPerPage;
        currentPage = 1;
        if (Object.keys(portfolioData).length > 0) {
            renderSamples();
            setupPagination();
        }
    }
});

// Contact form submission logic
const contactForm = document.getElementById('contact-form');
const successMessage = document.getElementById('success-message');

if (contactForm && successMessage) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                contactForm.reset();
                successMessage.classList.remove('hidden');
                setTimeout(() => successMessage.classList.add('hidden'), 5000);
            } else {
                const errorData = await response.json();
                alert(`There was an error sending your message: ${errorData.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            alert('There was an error sending your message. Please check your internet connection.');
        }
    });
}

// --- ADMIN CONTROLS FUNCTIONALITY ---
function setupAdminControls() {
    const adminControls = document.getElementById('admin-controls');
    const loadJsonBtn = document.getElementById('load-json-btn');
    const jsonUpload = document.getElementById('json-upload');

    if (window.location.protocol === 'file:') {
        if (adminControls) adminControls.classList.remove('hidden');
    } else {
        if (adminControls) adminControls.classList.add('hidden');
    }

    if (loadJsonBtn && jsonUpload) {
        loadJsonBtn.addEventListener('click', () => jsonUpload.click());

        jsonUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const json = JSON.parse(e.target.result);
                        portfolioData = json; // Directly update portfolioData
                        localStorage.setItem('portfolioData', JSON.stringify(json)); // Save to localStorage
                        sessionStorage.setItem('justUploaded', 'true'); // Flag to indicate recent upload
                        alert('JSON data loaded successfully! Applying changes.');
                        renderPage(); // Re-render immediately with new data
                        document.getElementById('portfolio-content-wrapper').classList.remove('hidden');
                    } catch (err) {
                        alert('Error parsing JSON file. Please check the file format.');
                        console.error('JSON Parse Error:', err);
                    }
                };
                reader.readAsText(file);
            }
        });
    } else {
        console.warn('Admin control elements (load-json-btn or json-upload) not found.');
    }
}

// --- INITIALIZATION ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    loadDataAndDisplay();
    setupAdminControls();
});