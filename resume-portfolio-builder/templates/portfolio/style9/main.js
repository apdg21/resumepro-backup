let portfolioData = {};
let currentPage = 1;
const projectsPerPage = 6;

// ====================== Core Functions ======================
function loadData(data) {
    if (!data) {
        console.error("No data provided to load");
        return;
    }
    
    console.log("Loading data:", data); // Debug log
    portfolioData = data;
    
    // Update site details
    if (data.siteDetails) {
        document.getElementById('siteLogo').textContent = data.siteDetails.logo || '';
        document.getElementById('heroText').textContent = data.siteDetails.heroText || '';
        document.getElementById('footerText').textContent = data.siteDetails.footer || '';
        
        const homeSection = document.getElementById('home');
        if (data.siteDetails.backgroundType === 'image') {
            homeSection.style.backgroundImage = `url(${data.siteDetails.backgroundValue || ''})`;
            homeSection.style.backgroundColor = 'transparent';
        } else {
            homeSection.style.backgroundImage = 'none';
            homeSection.style.backgroundColor = data.siteDetails.backgroundValue || '#e6f0fa';
        }
    }

    // Update about section
    if (data.about) {
        document.getElementById('aboutText').textContent = data.about.text || '';
        document.getElementById('profileImage').src = data.about.profileImage || 'https://via.placeholder.com/200';
        document.getElementById('skillsList').innerHTML = data.about.skills?.map(skill => `<li>${skill}</li>`).join('') || '';
    }

    // Update testimonials
    if (data.testimonials) {
        document.getElementById('testimonialList').innerHTML = data.testimonials.map(t => `
            <div class="testimonial">
                <p>"${t.text}"</p>
                <p><strong>- ${t.author}</strong></p>
            </div>
        `).join('');
    }

    // Update social links
    if (data.socialLinks) {
        document.getElementById('socialLinks').innerHTML = Object.entries(data.socialLinks)
            .filter(([_, url]) => url)
            .map(([platform, url]) => `<a href="${url}" target="_blank"><i class="fab fa-${platform.toLowerCase()}"></i></a>`)
            .join('');
    }

    renderProjects();
}

function renderProjects() {
    if (!portfolioData.projects || !portfolioData.projects.length) {
        console.warn("No projects to render");
        document.getElementById('projectGrid').innerHTML = '<p>No projects found</p>';
        return;
    }
    
    const start = (currentPage - 1) * projectsPerPage;
    const end = start + projectsPerPage;
    const projects = portfolioData.projects.slice(start, end);
    
    document.getElementById('projectGrid').innerHTML = projects.map(project => `
        <div class="project-card">
            <img src="${project.image || 'https://via.placeholder.com/300'}" 
                 alt="${project.title || 'Project'}" 
                 onerror="this.src='https://via.placeholder.com/300'">
            <h3>${project.title || 'Untitled Project'}</h3>
            <p>${project.description || ''}</p>
            ${project.linkToCopy ? `<a href="${project.linkToCopy}" target="_blank">Read Article</a>` : ''}
        </div>
    `).join('');
    
    renderPagination();
}

function renderPagination() {
    if (!portfolioData.projects || !portfolioData.projects.length) {
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    const totalPages = Math.ceil(portfolioData.projects.length / projectsPerPage);
    document.getElementById('pagination').innerHTML = Array.from({length: totalPages}, (_, i) => 
        `<button onclick="changePage(${i + 1})" ${i + 1 === currentPage ? 'disabled' : ''}>${i + 1}</button>`
    ).join('');
}

// ====================== Data Loading ======================
async function fetchData() {
    console.log("Attempting to fetch data.json"); // Debug log
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched data:", data); // Debug log
        localStorage.setItem('portfolioData', JSON.stringify(data));
        loadData(data);
    } catch (error) {
        console.error("Failed to fetch data.json:", error);
        const cachedData = localStorage.getItem('portfolioData');
        if (cachedData) {
            try {
                console.log("Attempting to load cached data"); // Debug log
                loadData(JSON.parse(cachedData));
            } catch (parseError) {
                console.error("Failed to parse cached data:", parseError);
                document.getElementById('projectGrid').innerHTML = 
                    '<p>Failed to load data. Please check your data.json file.</p>';
            }
        } else {
            document.getElementById('projectGrid').innerHTML = 
                '<p>No data available. Please load a data file.</p>';
        }
    }
}

function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            console.log("Loaded data from file:", data); // Debug log
            localStorage.setItem('portfolioData', JSON.stringify(data));
            loadData(data);
            alert('Data loaded successfully!');
        } catch (error) {
            console.error("Error parsing JSON file:", error);
            alert('Invalid JSON file. Please check the format.');
        }
    };
    reader.onerror = () => {
        console.error("Error reading file");
        alert('Error reading file. Please try again.');
    };
    reader.readAsText(file);
}

// ====================== UI Controls ======================
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function checkEnvironment() {
    const isDeployed = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    const loadButton = document.getElementById('loadButtonContainer');
    
    if (loadButton) {
        loadButton.style.display = isDeployed ? 'none' : 'block';
    }
    
    if (isDeployed) {
        console.log("Running on HTTP/HTTPS - attempting to fetch data");
        fetchData();
    } else {
        console.log("Running locally - checking for cached data");
        const cachedData = localStorage.getItem('portfolioData');
        if (cachedData) {
            try {
                loadData(JSON.parse(cachedData));
            } catch (error) {
                console.error("Error loading cached data:", error);
            }
        }
    }
}

// ====================== Initialization ======================
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded"); // Debug log
    
    // Set theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Set up file input listener
    const fileInput = document.getElementById('dataFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileLoad);
    } else {
        console.error("Could not find file input element");
    }
    
    // Initialize environment check
    checkEnvironment();
});