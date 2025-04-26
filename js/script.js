// === HEADER + FOOTER ===
window.onload = function () {
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
      overlay.addEventListener('click', toggleMenu);
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
  }

  fetch('footer.html')
    .then(res => res.text())
    .then(data => {
      const el = document.getElementById('footer-placeholder');
      if (el) el.innerHTML = data;
    });

  // === ВСЕ ПРОДУКТИ + МОДАЛКИ ===
  fetch('/products.json')
    .then(res => res.json())
    .then(products => {
      const productContainer = document.getElementById('products-placeholder');
      const productDetail = document.getElementById('product-detail');
      const relatedContainer = document.getElementById('related-products');
      const modalsPlaceholder = document.getElementById('modals-placeholder');
      const currentPage = decodeURIComponent(location.pathname.split('/').pop());

      if (productContainer) {
        productContainer.innerHTML = products.map(p => `
          <a href="${p.url}" class="product">
            <img src="${p.img}" alt="${p.alt}">
            <p><strong>${p.name}</strong></p>
          </a>
        `).join('');
      }

      if (productDetail) {
        const product = products.find(p => p.url === currentPage);
        if (!product) return;

        const mainImage = product.images?.[0] || product.img;
        const additionalImages = product.images?.slice(1) || [];

        productDetail.innerHTML = `
          <div><h1 class="container-title">${product.name}</h1></div>
          <div class="container">

            <div class="main-image">
              <a href="#modal1">
                <img src="${mainImage}" alt="${product.alt}" />
              </a>

              <div class="thumbnails">
                ${additionalImages.length ? additionalImages.map((img, i) => `
                  <a href="#modal${i + 2}"><img src="${img}" alt="thumb${i + 2}"></a>
                `).join('') : ''}
              </div>
            </div>

            <div class="text">
              <p><strong>Вага:</strong> ${product.weight || '470 г'}</p>
              <p><strong>Склад:</strong> ${product.ingredients || 'Натуральний мед, горішки'}</p>
              <p><strong>Опис:</strong> ${product.description}</p>

              <h3>Переваги:</h3>
              <ul>
                ${(product.benefits || [
                  'Натуральний продукт',
                  'Підтримка імунітету',
                  'Енергетична цінність і користь',
                  'Гарний смак + горішки'
                ]).map(b => `<li>${b}</li>`).join('')}
              </ul>

              <p>
                <a href="${product.buyLink || 'https://rozetka.com.ua/'}" class="rozetka-button" target="_blank">
                  <img src="img/rozetkaSmile.png" alt="Купити на Rozetka">
                  Купити на Rozetka
                </a>
              </p>

              <p>
                <a href="${product.instagram || 'https://instagram.com/твій_профіль'}" class="instagram-button" target="_blank">
                  <img src="img/Instagram_icon.png" alt="Ми в Instagram">
                  Ми в Instagram
                </a>
              </p>
            </div>
          </div>
        `;

        // Генерація модалок
        const images = [product.img, ...(product.images || [])];
        const modalsHTML = images.map((img, i) => `
          <div id="modal${i + 1}" class="modal">
            <div class="modal-overlay"></div>
            <div class="modal-content-wrapper">
              <a href="#" class="close">&times;</a>
              <img class="modal-content" src="${img}" alt="Фото ${i + 1}">
            </div>
          </div>
        `).join('');
        if (modalsPlaceholder) modalsPlaceholder.innerHTML = modalsHTML;

        // Підключаємо логіку відкриття/закриття
        document.querySelectorAll('.thumbnails a, .main-image a').forEach(link => {
          link.addEventListener('click', e => {
            e.preventDefault();
            const modalId = link.getAttribute('href').replace('#', '');
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.add('open');
          });
        });

        document.querySelectorAll('.modal').forEach(modal => {
          const overlay = modal.querySelector('.modal-overlay');
          const closeBtn = modal.querySelector('.close');
          [overlay, closeBtn].forEach(el => {
            el.addEventListener('click', e => {
              e.preventDefault();
              modal.classList.remove('open');
            });
          });
        });
      }

      if (relatedContainer) {
        const others = products.filter(p => p.url !== currentPage);
        const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
        relatedContainer.innerHTML = shuffled.map(p => `
          <a href="${p.url}" class="product">
            <img src="${p.img}" alt="${p.alt}">
            <p><strong>${p.name}</strong></p>
          </a>
        `).join('');
      }
    });
};