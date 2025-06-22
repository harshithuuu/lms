// js/navHighlight.js

document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('#nav-mobile a');
  // Get only the filename, ignoring any query/hash
  const current = window.location.pathname.split('/').pop().split('?')[0].split('#')[0];
  navLinks.forEach(link => {
    const href = link.getAttribute('href').split('?')[0].split('#')[0];
    if (href === current) {
      link.parentElement.classList.add('active');
    }
  });
}); 