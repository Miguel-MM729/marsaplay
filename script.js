// MarsaPlay — Arcade Mockup
// Script principal

// En este fichero puedes añadir interacciones futuras:
// - Filtros de catálogo
// - Slider de productos
// - Animaciones de entrada (Intersection Observer)
// - Integración con API de WooCommerce
// etc.

document.addEventListener('DOMContentLoaded', () => {
  // Ejemplo: pequeña animación de entrada en las tarjetas de producto
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.prod, .cat, .card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    observer.observe(el);
  });
});
