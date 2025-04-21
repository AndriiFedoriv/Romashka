window.onload = function () {
  // Вставляємо header з окремого файлу
  fetch("header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header-placeholder").innerHTML = data;
      initHeaderBehavior();
    });

  function initHeaderBehavior() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScrollTop = 0;

    window.addEventListener('scroll', function () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      header.style.top = scrollTop > lastScrollTop ? "-100px" : "0";
      lastScrollTop = Math.max(scrollTop, 0);
    });

    const burger = document.getElementById('burger');
    const nav = document.getElementById('navLinks');
    const overlay = document.getElementById('overlay');

    if (burger && nav && overlay) {
      burger.addEventListener('click', () => toggleMenu());
    }

    function toggleMenu() {
      nav.classList.toggle('active');
      overlay.classList.toggle('active');
      burger.classList.toggle('active');
    }

    document.querySelectorAll('.nav a').forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        }
        toggleMenu();
      });
    });

    if (overlay) {
      overlay.addEventListener('click', toggleMenu);
    }
  }

  // Підвантаження footer
  fetch('footer.html')
    .then(res => res.text())
    .then(data => {
      const el = document.getElementById('footer-placeholder');
      if (el) el.innerHTML = data;
    });

  // Вивід товарів з products.json
  fetch('products.json')
    .then(res => res.json())
    .then(products => {
      const productContainer = document.getElementById('products-placeholder');
      if (productContainer) {
        // Головна сторінка — показати всі товари
        productContainer.innerHTML = products.map(p => `
          <a href="${p.url}" class="product">
            <img src="${p.img}" alt="${p.alt}">
            <p><strong>${p.name}</strong></p>
          </a>
        `).join('');
      } else {
        // Якщо на сторінці товару — вивести 3 випадкових товари (крім поточного)
        const relatedContainer = document.getElementById('related-products');
        if (relatedContainer) {
          const currentPage = location.pathname.split('/').pop();
          const others = products.filter(p => p.url !== currentPage);
          const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
          relatedContainer.innerHTML = shuffled.map(p => `
            <a href="${p.url}" class="product">
              <img src="${p.img}" alt="${p.alt}">
              <p><strong>${p.name}</strong></p>
            </a>
          `).join('');
        }
      }
    });
};
