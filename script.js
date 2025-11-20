document.addEventListener('DOMContentLoaded', () => {
    console.log('Site T.E.A carregado com sucesso!');

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // --- Lógica para destacar o link ativo na navegação ---
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href').split('/').pop();
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });

    // --- Lógica para Animações de Scroll ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // A animação começa quando 10% do elemento está visível
    });

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => observer.observe(el));
});
