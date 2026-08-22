document.addEventListener('DOMContentLoaded', () => {
    // Default dataset to use when fetch and localStorage fail
    const defaultData = {
        logo: 'Default Portfolio',
        hero: {
            title: 'Welcome to My Portfolio',
            subtitle: 'Showcasing my creative work'
        },
        projects: [
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
        about: {
            text: 'I am a passionate designer creating impactful visuals.',
            skills: ['Graphic Design', 'UI/UX', 'Branding']
        },
        testimonials: [
            {
                text: 'Amazing work, highly recommended!',
                author: 'Jane Doe'
            }
        ],
        contact: {
            email: 'default@example.com',
            successMessage: 'Thank you for your message!'
        },
        footer: {
            text: '© 2025 Default Portfolio'
        },
        social: {
            linkedin: 'https://linkedin.com',
            twitter: 'https://twitter.com',
            github: 'https://github.com'
        }
    };

    // Hide admin controls when deployed online
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        document.querySelector('.admin-controls')?.classList.add('hidden');
    }

    let currentPage = 1;
    let projectsPerPage = window.innerWidth <= 768 ? 4 : 8;
    let portfolioData = null; // Store loaded data

    // Update projects per page on resize
    window.addEventListener('resize', () => {
        const newProjectsPerPage = window.innerWidth <= 768 ? 4 : 8;
        if (newProjectsPerPage !== projectsPerPage) {
            projectsPerPage = newProjectsPerPage;
            renderProjects(portfolioData || defaultData);
        }
    });

    function renderProjects(data) {
        const projectGrid = document.getElementById('projects');
        projectGrid.innerHTML = ''; // Clear existing projects
        const projects = Array.isArray(data.projects) ? data.projects : [];
        const startIndex = (currentPage - 1) * projectsPerPage;
        const endIndex = startIndex + projectsPerPage;
        const projectsToShow = projects.slice(startIndex, endIndex);

        if (projectsToShow.length === 0) {
            projectGrid.innerHTML = '<p>No projects available.</p>';
        }

        projectsToShow.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <a href="${project.link || '#'}" target="_blank" class="project-link">
                    <img src="${project.image || 'images/placeholder.jpg'}" alt="${project.title || 'Project'}">
                    <h3>${project.title || 'Untitled'}</h3>
                    <p>${project.description || 'No description available.'}</p>
                </a>
            `;
            projectGrid.appendChild(projectCard);
        });

        // Update pagination controls
        const totalPages = Math.ceil(projects.length / projectsPerPage) || 1;
        document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage === totalPages;

        // Show or hide pagination
        const pagination = document.querySelector('.pagination');
        pagination.style.display = projects.length > projectsPerPage ? 'flex' : 'none';
    }

    function loadContent(data) {
        portfolioData = data; // Store data for resize events
        console.log('Loaded data:', data); // Debug log

        // Logo
        document.getElementById('logo').textContent = data.logo || 'Portfolio';

        // Hero
        document.getElementById('hero-title').textContent = data.hero?.title || 'Welcome';
        document.getElementById('hero-subtitle').textContent = data.hero?.subtitle || 'Explore my work';

        // Projects
        renderProjects(data);

        // About
        document.getElementById('about-text').textContent = data.about?.text || 'No description available.';
        const skillsList = document.getElementById('skills-list');
        skillsList.innerHTML = '';
        const skills = Array.isArray(data.about?.skills) ? data.about.skills : [];
        skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill || 'Unknown skill';
            skillsList.appendChild(li);
        });

        // Testimonials
        const testimonialGrid = document.getElementById('testimonials-list');
        testimonialGrid.innerHTML = '';
        const testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
        testimonials.forEach(testimonial => {
            const testimonialCard = document.createElement('div');
            testimonialCard.className = 'testimonial-card';
            testimonialCard.innerHTML = `
                <p>"${testimonial.text || 'No testimonial text'}"</p>
                <h4>- ${testimonial.author || 'Anonymous'}</h4>
            `;
            testimonialGrid.appendChild(testimonialCard);
        });

        // Contact
        document.getElementById('contact-form').action = `https://formsubmit.co/${data.contact?.email || 'default@example.com'}`;
        document.getElementById('form-success').textContent = data.contact?.successMessage || 'Thank you!';

        // Footer
        document.getElementById('footer-text').textContent = data.footer?.text || '© 2025 Portfolio';
        const socialLinks = document.getElementById('social-links');
        socialLinks.innerHTML = '';
        const social = data.social || {};
        if (social.linkedin) {
            socialLinks.innerHTML += `<a href="${social.linkedin}" target="_blank" class="social-icon" aria-label="LinkedIn"><i class="fab fa-linkedin"></i><span class="fallback-text">LinkedIn</span></a>`;
        }
        if (social.twitter) {
            socialLinks.innerHTML += `<a href="${social.twitter}" target="_blank" class="social-icon" aria-label="Twitter"><i class="fab fa-twitter"></i><span class="fallback-text">Twitter</span></a>`;
        }
        if (social.github) {
            socialLinks.innerHTML += `<a href="${social.github}" target="_blank" class="social-icon" aria-label="GitHub"><i class="fab fa-github"></i><span class="fallback-text">GitHub</span></a>`;
        }

        // Check if Font Awesome loaded, apply fallback if not
        if (typeof window.FontAwesome === 'undefined') {
            document.querySelectorAll('.social-icon').forEach(link => {
                link.classList.add('no-fontawesome');
            });
        }

        // Pagination controls
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProjects(data);
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil((data.projects || []).length / projectsPerPage) || 1;
            if (currentPage < totalPages) {
                currentPage++;
                renderProjects(data);
            }
        });
    }

    // Load data (adapted from first template)
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
                console.log('Using recently uploaded data from localStorage:', fetchedData);
                sessionStorage.removeItem('justUploaded'); // Clear upload flag
            } else {
                // Attempt to fetch from data.json
                console.log('Attempting to fetch data.json...');
                const response = await fetch(`data.json?t=${new Date().getTime()}`);
                if (!response.ok) {
                    if (localData) {
                        fetchedData = JSON.parse(localData);
                        console.log('Failed to fetch data.json, but loaded from localStorage:', fetchedData);
                    } else {
                        console.warn('No data in localStorage. Using default dataset.');
                        fetchedData = defaultData;
                    }
                } else {
                    fetchedData = await response.json();
                    console.log('Loaded data from data.json:', fetchedData);
                    localStorage.setItem('portfolioData', JSON.stringify(fetchedData));
                }
            }

            // Validate projects array
            if (!Array.isArray(fetchedData.projects)) {
                console.warn('Data has no valid projects array. Using empty array.');
                fetchedData.projects = [];
            }

            loadContent(fetchedData);

        } catch (error) {
            console.error('Error loading portfolio data:', error);
            console.warn('Using default dataset.');
            loadContent(defaultData);
        }
    }

    // Load JSON file (only available offline via file://)
    document.getElementById('load-json')?.addEventListener('click', () => {
        document.getElementById('json-file')?.click();
    });

    document.getElementById('json-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    console.log('Uploaded JSON data:', data);
                    if (!Array.isArray(data.projects)) {
                        console.warn('Uploaded JSON has no valid projects array. Using empty array.');
                        data.projects = [];
                    }
                    portfolioData = data; // Directly update portfolioData
                    localStorage.setItem('portfolioData', JSON.stringify(data));
                    sessionStorage.setItem('justUploaded', 'true'); // Flag to indicate recent upload
                    alert('JSON loaded successfully!');
                    loadContent(data); // Re-render immediately
                } catch (error) {
                    alert('Invalid JSON file.');
                    console.error('Error parsing JSON:', error);
                }
            };
            reader.readAsText(file);
        }
    });

    // Form validation and success message handling
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('form-success');
    form.addEventListener('submit', (e) => {
        const name = form.querySelector('input[name="name"]').value;
        const email = form.querySelector('input[name="email"]').value;
        const subject = form.querySelector('input[name="subject"]').value;
        const message = form.querySelector('textarea[name="message"]').value;

        if (!name || !email || !subject || !message) {
            e.preventDefault();
            alert('Please fill out all fields.');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.preventDefault();
            alert('Please enter a valid email address.');
        } else {
            setTimeout(() => {
                successMessage.classList.remove('hidden');
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                }, 5000);
            }, 1000);
        }
    });

    // Initialize
    loadDataAndDisplay();
});