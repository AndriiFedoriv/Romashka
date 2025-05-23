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

// ...існуючий код...
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
          const filtered = tag
            ? products.filter(p => p.hashtags?.includes(tag))
            : productsWithBlog;
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

        document.addEventListener("click", e => {
          if (e.target.classList.contains("hashtag")) {
            e.preventDefault();
            const selectedTag = e.target.dataset.tag;
            if (document.getElementById("product-detail")) {
              window.location.href = `index.html?tag=${encodeURIComponent(selectedTag)}`;
            } else {
              const filtered = products.filter(p => p.hashtags?.includes(selectedTag));
              if (productContainer) renderProducts(filtered, productContainer);
              history.pushState({ tag: selectedTag }, "", `?tag=${encodeURIComponent(selectedTag)}`);
            }
          }
        });

        window.addEventListener("popstate", e => {
          const poppedTag = e.state?.tag;
          const filtered = poppedTag
            ? products.filter(p => p.hashtags?.includes(poppedTag))
            : productsWithBlog;
          if (productContainer) renderProducts(filtered, productContainer, blogCard);
        });
      });
  })
  .catch(err => console.error(err.message));

// Рендер списку товарів
function renderProducts(products, container, blogCard) {
  container.style.opacity = "0";

  setTimeout(() => {
    container.innerHTML = products.map(product => {
      if (product.isBlog) {
        // Блог-картка у стилі товару
        return `
         <a href="blog.html?article=${encodeURIComponent(product.title)}" class="product blog-product">
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

    setTimeout(() => {
      container.style.opacity = "1";
    }, 50);
  }, 300);
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
        <a href="${prev.url}" class="product-arrow product-arrow-left" aria-label="Попередній товар">🔙</a>
        <a href="${next.url}" class="product-arrow product-arrow-right" aria-label="Наступний товар">🔜</a>
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
                <img src="img/rozetkaSmile.png" alt="Купити на Rozetka" loading="lazy">
                Купити на Rozetka
              </a>
            </p>
            <p>
              <a href="${product.instagram || 'https://instagram.com/'}" class="instagram-button" target="_blank">
                <img src="img/Instagram_icon.png" alt="Ми в Instagram" loading="lazy">
                Ми в Instagram
              </a>
            </p>
          </div>
        </div>
      `;

      if (products.length <= 1) {
        detailContainer.querySelector('.product-arrow-left').classList.add('hidden');
        detailContainer.querySelector('.product-arrow-right').classList.add('hidden');
      } else {
        if (idx === 0) {
          detailContainer.querySelector('.product-arrow-left').classList.add('hidden');
        }
        if (idx === products.length - 1) {
          detailContainer.querySelector('.product-arrow-right').classList.add('hidden');
        }
      }

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
        hideArrows(); // Ховаємо стрілки одразу при відкритті
      }
    });
  });

  document.querySelectorAll(".modal").forEach(modal => {
    modal.querySelector(".modal-overlay")?.addEventListener("click", close);
    modal.querySelector(".close")?.addEventListener("click", close);

    function close(e) {
      e.preventDefault();
      modal.classList.remove("open");
      showArrows(); // Показуємо стрілки одразу при закритті
    }
  });
}

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
}
