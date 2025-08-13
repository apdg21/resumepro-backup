function cleanUrl() {
    const currentUrl = window.location.pathname;
    if (currentUrl.endsWith('.html')) {
        const cleanPath = currentUrl.replace(/\.html$/, '');
        history.replaceState(null, '', cleanPath);
    }
}

window.addEventListener('load', cleanUrl);
