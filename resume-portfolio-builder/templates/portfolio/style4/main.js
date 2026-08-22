// ===== Globals =====
let currentPage = 1;
let samplesPerPage = window.innerWidth <= 768 ? 4 : 8;
let data = {};

// ===== Load JSON Content =====
async function loadContent() {
  try {
    const response = await fetch('data.json');
    data = await response.json();
    renderPortfolio();
  } catch (err) {
    console.error('Failed to load JSON', err);
  }
}

// ===== Render Portfolio Sections =====
function renderPortfolio() {
  document.getElementById('logo').textContent = data.logo;
  document.getElementById('hero').innerHTML = `<p>${data.hero}</p>`;
  document.getElementById('about').innerHTML = `
    <img src="assets/profile.jpg" alt="Profile Image" class="profile-img">
    <p>${data.about}</p>
  `;
  document.getElementById('footer-text').textContent = data.footer;
  
  renderSamples();
  renderTestimonials();
  renderSocialLinks();
}

// ===== Render Samples with Pagination =====
function renderSamples() {
  const grid = document.getElementById('samples-grid');
  grid.innerHTML = '';
  samplesPerPage = window.innerWidth <= 768 ? 4 : 9;
  const start = (currentPage - 1) * samplesPerPage;
  const paginated = data.samples.slice(start, start + samplesPerPage);

  paginated.forEach(sample => {
    const card = document.createElement('div');
    card.className = 'sample-card';
    card.innerHTML = `
      <img src="assets/${sample.image}" alt="${sample.title}" loading="lazy" />
      <h3>${sample.title}</h3>
      <p>${sample.description}</p>
    `;
    card.addEventListener('click', () => {
      window.open(`samples/${sample.link}`, '_blank');
    });
    grid.appendChild(card);
  });

  const totalPages = Math.ceil(data.samples.length / samplesPerPage);
  document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prev').disabled = currentPage === 1;
  document.getElementById('next').disabled = currentPage === totalPages;
  document.querySelector('.pagination').style.display = totalPages <= 1 ? 'none' : 'flex';
}

// ===== Testimonials =====
function renderTestimonials() {
  const container = document.getElementById('testimonial-list');
  container.innerHTML = '';
  data.testimonials.forEach(t => {
    const div = document.createElement('div');
    div.className = 'testimonial';
    div.innerHTML = `<blockquote>${t.quote}</blockquote><p>- ${t.author}</p>`;
    container.appendChild(div);
  });
}

// ===== Social Links =====
function renderSocialLinks() {
  const container = document.getElementById('social-links');
  container.innerHTML = '';
  const platforms = ['linkedin', 'twitter', 'github'];
  platforms.forEach(p => {
    if (data.social[p]) {
      const a = document.createElement('a');
      a.href = data.social[p];
      a.setAttribute('aria-label', `${p} profile`);
      a.target = '_blank';
      a.innerHTML = `<i class="fab fa-${p}"></i>`;
      container.appendChild(a);
    }
  });
}

// ===== Pagination Events =====
document.getElementById('prev').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderSamples();
  }
});

document.getElementById('next').addEventListener('click', () => {
  const totalPages = Math.ceil(data.samples.length / samplesPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderSamples();
  }
});

// ===== Hamburger Menu Toggle =====
document.querySelector('.hamburger').addEventListener('click', () => {
  document.querySelector('nav').classList.toggle('active');
});

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const targetId = anchor.getAttribute('href').substring(1);
    document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    document.querySelector('nav').classList.remove('active'); // Close menu on click
  });
});

// ===== Resize Listener =====
window.addEventListener('resize', () => {
  const newPerPage = window.innerWidth <= 768 ? 4 : 8;
  if (newPerPage !== samplesPerPage) {
    samplesPerPage = newPerPage;
    currentPage = 1;
    renderSamples();
  }
});

// ===== Form Success Feedback =====
document.querySelector('form')?.addEventListener('submit', e => {
  e.preventDefault();
  const msg = document.getElementById('success-msg');
  if (msg) {
    msg.style.opacity = '1';
    msg.hidden = false;
    setTimeout(() => {
      msg.style.transition = 'opacity 0.5s ease';
      msg.style.opacity = '0';
      setTimeout(() => msg.hidden = true, 500);
    }, 3000);
  }
});

// ===== Load JSON File (Offline Only) =====
document.getElementById('load-json')?.addEventListener('click', () => {
  document.getElementById('json-file').click();
});

document.getElementById('json-file')?.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      data = JSON.parse(e.target.result);
      currentPage = 1;
      renderPortfolio();
    } catch (err) {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
});

// ===== Hide Admin Buttons Online =====
function hideAdminOnline() {
  const admin = document.querySelector('.admin');
  if (!admin) {
    console.error('Admin element not found');
    return;
  }
  // Simple fetch to test online status
  fetch('data.json', { method: 'HEAD' })
    .then(() => {
      console.log('Online: Hiding admin buttons');
      admin.classList.remove('offline');
    })
    .catch(() => {
      console.log('Offline: Showing admin buttons');
      admin.classList.add('offline');
    });
}

// Initialize
hideAdminOnline();
loadContent();
