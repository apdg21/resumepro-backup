// Blog-specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for anchor links in blog posts
    document.querySelectorAll('.blog-content a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add copy code functionality for code blocks
    document.querySelectorAll('pre code').forEach(codeBlock => {
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = 'Copy code';
        
        copyButton.addEventListener('click', function() {
            const code = codeBlock.textContent;
            navigator.clipboard.writeText(code).then(() => {
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                copyButton.style.color = '#28a745';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    copyButton.style.color = '';
                }, 2000);
            });
        });
        
        const pre = codeBlock.parentElement;
        if (pre) {
            pre.style.position = 'relative';
            copyButton.style.position = 'absolute';
            copyButton.style.top = '10px';
            copyButton.style.right = '10px';
            copyButton.style.background = 'rgba(255,255,255,0.2)';
            copyButton.style.border = 'none';
            copyButton.style.color = '#f8f8f2';
            copyButton.style.padding = '5px 10px';
            copyButton.style.borderRadius = '4px';
            copyButton.style.cursor = 'pointer';
            copyButton.style.fontSize = '0.8rem';
            pre.appendChild(copyButton);
        }
    });
});