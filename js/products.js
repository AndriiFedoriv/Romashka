// Ініціалізація товарів: рендер, фільтрація, деталі, хештеги, модалки
function initProducts() {
  const productContainer = document.getElementById("products-placeholder");
  const productDetail = document.getElementById("product-detail");
  const relatedContainer = document.getElementById("related-products");
  const modalsPlaceholder = document.getElementById("modals-placeholder");

  const urlParams = new URLSearchParams(window.location.search);
  const tag = urlParams.get("tag");
  const currentPage = decodeURIComponent(location.pathname.split("/").pop());

  if (productDetail && tag) {
    const redirectUrl = `index.html?tag=${encodeURIComponent(tag)}`;
    window.location.href = redirectUrl;
    return;
  }

  fetch("/products.json")
    .then(res => {
      if (!res.ok) throw new Error("Помилка завантаження products.json");
      return res.json();
    })
    .then(products => {
      fetch("/blog.json")
        .then(res => res.json())
        .then(articles => {
          const randomArticle = articles[Math.floor(Math.random() * articles.length)];
          const insertIndex = Math.floor(Math.random() * (products.length + 1));
          const blogCard = {
            isBlog: true,
            title: randomArticle.title,
            date: randomArticle.date,
            image: randomArticle.image,
            excerpt: randomArticle.excerpt,
            content: randomArticle.content
          };
          const productsWithBlog = [...products];
          productsWithBlog.splice(insertIndex, 0, blogCard);

          if (productContainer) {
            let filtered;
            if (tag) {
              // Фільтруємо і товари, і статті
              const filteredProducts = products.filter(p => p.hashtags?.includes(tag));
              const filteredArticles = articles
                .filter(a => a.hashtags?.includes(tag))
                .map(article => ({
                  isBlog: true,
                  title: article.title,
                  date: article.date,
                  image: article.image,
                  excerpt: article.excerpt,
                  content: article.content
                }));
              filtered = [...filteredProducts, ...filteredArticles];
            } else {
              filtered = productsWithBlog;
            }
            renderProducts(filtered, productContainer, blogCard);
          }

          if (productDetail) {
            const product = products.find(p => p.url === currentPage);
            if (product) renderProductDetail(product, productDetail, modalsPlaceholder);
          }

          if (relatedContainer) {
            const others = products.filter(p => p.url !== currentPage);
            const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
            renderProducts(shuffled, relatedContainer);
          }

          // Обробка кліків по хештегах
          document.addEventListener("click", e => {
            if (e.target.classList.contains("hashtag")) {
              // Якщо є data-tag (тобто це не футер, а картка товару/статті)
              if (e.target.hasAttribute("data-tag")) {
                e.preventDefault();
                let selectedTag = e.target.dataset.tag;
                saveRecentTag(selectedTag);

                // Якщо на сторінці детального перегляду товару — редірект на index.html
                if (document.getElementById("product-detail")) {
                  window.location.href = `index.html?tag=${encodeURIComponent(selectedTag)}`;
                } else {
                  // SPA-фільтрація на index.html
                  const filteredProducts = products.filter(p => (p.hashtags || []).includes(selectedTag));
                  const filteredArticles = articles
                    .filter(a => (a.hashtags || []).includes(selectedTag))
                    .map(article => ({
                      isBlog: true,
                      title: article.title,
                      date: article.date,
                      image: article.image,
                      excerpt: article.excerpt,
                      content: article.content
                    }));
                  const filtered = [...filteredProducts, ...filteredArticles];
                  if (productContainer) renderProducts(filtered, productContainer);
                  history.pushState({ tag: selectedTag }, "", `?tag=${encodeURIComponent(selectedTag)}`);
                }
              }
              // Якщо це футер (немає data-tag) — стандартний перехід, але збережемо тег для "останні використані"
              else {
                let selectedTag = e.target.textContent.replace(/^#/, '').trim();
                selectedTag = '#' + selectedTag;
                saveRecentTag(selectedTag);
                // Не викликаємо e.preventDefault() — стандартний перехід!
              }
            }
          });

          window.addEventListener("popstate", e => {
            const poppedTag = e.state?.tag;
            if (poppedTag) {
              const filteredProducts = products.filter(p => p.hashtags?.includes(poppedTag));
              const filteredArticles = articles
                .filter(a => a.hashtags?.includes(poppedTag))
                .map(article => ({
                  isBlog: true,
                  title: article.title,
                  date: article.date,
                  image: article.image,
                  excerpt: article.excerpt,
                  content: article.content
                }));
              const filtered = [...filteredProducts, ...filteredArticles];
              if (productContainer) renderProducts(filtered, productContainer, blogCard);
            } else {
              if (productContainer) renderProducts(productsWithBlog, productContainer, blogCard);
            }
          });
        });
    });
}

// Рендер списку товарів/статей
function renderProducts(products, container, blogCard) {
  container.style.opacity = "0";
  setTimeout(() => {
    container.innerHTML = products.map(product => {
      if (product.isBlog) {
        // Блог-картка у стилі товару
        return `
         <a href="blog-post.html?title=${encodeURIComponent(product.title)}" class="product blog-product">
          <img src="${product.image}" alt="${product.title}" loading="lazy">
          <p><strong>${product.title}</strong></p>
        </a>
        `;
      } else {
        // Звичайний товар
        return `
          <a href="${product.url}" class="product">
            <img src="${product.img}" alt="${product.alt}" loading="lazy">
            <p><strong>${product.name}</strong></p>
          </a>
        `;
      }
    }).join("");
  // Плавне поетапне появлення
  const productEls = container.querySelectorAll('.product');
  productEls.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 120 * i); // 120мс затримка між товарами, можна змінити
  });
}, 100); // Затримка перед рендером, щоб уникнути мерехтіння
  container.style.opacity = "1";

  // Якщо це контейнер для товарів, то додаємо клас для стилізації
  if (container.id === "products-placeholder") {
    container.classList.add("products-grid");
  }

  // Якщо це контейнер для статей, то додаємо клас для стилізації
  if (container.id === "related-products" && blogCard) {
    const blogCardHtml = `
      <div class="blog-card">
        <img src="${blogCard.image}" alt="${blogCard.title}" loading="lazy">
        <h3>${blogCard.title}</h3>
        <p>${blogCard.excerpt}</p>
        <a href="blog-post.html?title=${encodeURIComponent(blogCard.title)}" class="read-more">Читати далі</a>
      </div>
    `;
    container.innerHTML += blogCardHtml;
  }
}

// Рендер детальної сторінки товару
function renderProductDetail(product, detailContainer, modalsPlaceholder) {
  const mainImage = product.images?.[0] || product.img;
  const additionalImages = product.images?.slice(1) || [];
  const allImages = [product.img, ...(product.images || [])];

  fetch('/products.json')
    .then(res => res.json())
    .then(products => {
      const idx = products.findIndex(p => p.url === product.url);
      const prevIdx = (idx - 1 + products.length) % products.length;
      const nextIdx = (idx + 1) % products.length;
      const prev = products[prevIdx];
      const next = products[nextIdx];

      detailContainer.innerHTML = `
        <a href="${prev.url}" class="product-arrow product-arrow-left" aria-label="Попередній товар">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <polyline points="15 18 9 12 15 6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <a href="${next.url}" class="product-arrow product-arrow-right" aria-label="Наступний товар">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <polyline points="9 6 15 12 9 18" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <div><h1 class="container-title">${product.name}</h1></div>
        <div class="container">
          <div class="main-image">
            <a href="#modal1">
              <img src="${mainImage}" alt="${product.alt}" />
            </a>
            <div class="thumbnails">
              ${additionalImages.map((img, i) => `
                <a href="#modal${i + 2}">
                  <img src="${img}" alt="thumb ${i + 2}" loading="lazy">
                </a>
              `).join("")}
            </div>
          </div>
          <div class="text">
            <p><strong>Вага:</strong> ${product.weight || "470"} <i>грамів</i></p>
            <p><strong>Склад:</strong> ${product.ingredients || "Натуральний мед, горішки"}</p>
            <p><strong>Опис:</strong> ${product.description}</p>
            <h3>Переваги:</h3>
            <ul>
              ${(product.benefits || [
                "Натуральний продукт",
                "Підтримка імунітету",
                "Енергетична цінність і користь",
                "Гарний смак + горішки"
              ]).map(b => `<li>${b}</li>`).join("")}
            </ul>
            ${product.hashtags ? `
              <div class="hashtags">
                ${product.hashtags.map(tag => `
                  <a href="#" class="hashtag" data-tag="${tag}">${tag}</a>
                `).join('')}
              </div>
            ` : ""}

            <div class="price-section">
              ${product.oldPrice ? `
                <p class="price">
                  <span class="old-price">${product.oldPrice} грн</span>
                  <span class="new-price">${product.price} грн</span>
                </p>
              ` : `
                <p class="price">
                  <span class="new-price">${product.price} грн</span>
                </p>
              `}
              <div class="product-actions">
                <button class="honey-btn" onclick='addToCart({name: "${product.name}", price: "${product.price}"})'>Додати до кошика</button>
                <button class="honey-btn secondary" onclick='openCart()'>Відкрити кошик</button>
              </div>
            </div>
            <p>
              <a href="${product.buyLink || 'https://rozetka.com.ua/'}" class="rozetka-button" target="_blank">
                <img src="img/rozetkaSmile.webp" alt="Купити на Rozetka" loading="lazy">
                Купити на Rozetka
              </a>
            </p>
            <p>
              <a href="${product.instagram || 'https://instagram.com/'}" class="instagram-button" target="_blank">
                <img src="img/Instagram_icon.webp" alt="Ми в Instagram" loading="lazy">
                Ми в Instagram
              </a>
            </p>
          </div>
        </div>
      `;

      if (modalsPlaceholder) {
        modalsPlaceholder.innerHTML = allImages.map((img, i) => `
          <div id="modal${i + 1}" class="modal">
            <div class="modal-overlay"></div>
            <div class="modal-content-wrapper">
              <a href="#" class="close">&times;</a>
              <img class="modal-content" src="${img}" alt="Фото ${i + 1}" loading="lazy">
            </div>
          </div>
        `).join("");
        setupModals();
      }

      // --- Свайп для мобільних ---
      let touchStartX = null;
      detailContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
      });
      detailContainer.addEventListener('touchend', function(e) {
        if (touchStartX === null) return;
        let touchEndX = e.changedTouches[0].screenX;
        if (touchEndX - touchStartX > 50) {
          window.location.href = prev.url;
        } else if (touchStartX - touchEndX > 50) {
          window.location.href = next.url;
        }
        touchStartX = null;
      });
      // --- кінець свайпу ---
    });
}

// Налаштування модалок для фото товару
function setupModals() {
  document.querySelectorAll(".thumbnails a, .main-image a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const modalId = link.getAttribute("href").substring(1);
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add("open");
        hideArrows();
      }
    });
  });

  document.querySelectorAll(".modal").forEach(modal => {
    modal.querySelector(".modal-overlay")?.addEventListener("click", close);
    modal.querySelector(".close")?.addEventListener("click", close);

    // Додаємо закриття по кліку на фон (сам .modal)
    modal.addEventListener("click", function(e) {
      if (e.target === modal) {
        close(e);
      }
    });

    function close(e) {
      e.preventDefault();
      modal.classList.remove("open");
      showArrows();
    }
  });
}

document.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    document.querySelectorAll('.modal.open').forEach(modal => {
      modal.classList.remove('open');
      showArrows();
    });
  }
});

function hideArrows() {
  document.querySelectorAll('.product-arrow, .blog-arrow').forEach(el => el.classList.add('hidden'));
}
function showArrows() {
  document.querySelectorAll('.product-arrow, .blog-arrow').forEach(el => el.classList.remove('hidden'));
}

// Глобалізація функцій (якщо потрібно)
window.initProducts = initProducts;
window.renderProducts = renderProducts;
window.renderProductDetail = renderProductDetail;
window.setupModals = setupModals;
window.hideArrows = hideArrows;
window.showArrows = showArrows;