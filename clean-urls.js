function cleanUrl() {
    const currentUrl = window.location.pathname;
    if (currentUrl.endsWith('.html')) {
        const cleanPath = currentUrl.replace(/\.html$/, '');
        history.replaceState(null, '', cleanPath);
    }
}

function attachEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.toggle('active');
        });
    }

    document.querySelectorAll('.dropdown .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = link.closest('.dropdown');
            dropdown.classList.toggle('active');
        });
    });

    document.querySelectorAll('.nav-item:not(.dropdown) .nav-link, .dropdown-item').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.remove('active');
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
    });

    document.querySelectorAll('.nav-link, .dropdown-item, .footer-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('http')) {
                e.preventDefault();
                const targetUrl = href.endsWith('.html') ? href : `${href}.html`;
                fetch(targetUrl)
                    .then(response => {
                        if (!response.ok) throw new Error(`Failed to load ${targetUrl}`);
                        return response.text();
                    })
                    .then(html => {
                        document.documentElement.innerHTML = html;
                        history.pushState(null, '', href);
                        cleanUrl();
                        attachEventListeners();
                    })
                    .catch(error => console.error('Error navigating:', error));
            }
        });
    });
}

fetch('header.html')
    .then(response => {
        if (!response.ok) throw new Error('Failed to load header');
        return response.text();
    })
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
        attachEventListeners();
    })
    .catch(error => console.error('Error loading header:', error));

window.addEventListener('load', cleanUrl);

window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    const targetUrl = path.endsWith('.html') ? path : `${path}.html`;
    fetch(targetUrl)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${targetUrl}`);
            return response.text();
        })
        .then(html => {
            document.documentElement.innerHTML = html;
            attachEventListeners();
            cleanUrl();
        })
        .catch(error => console.error('Error on popstate:', error));
});
