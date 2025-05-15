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
      if (productContainer) {
        const filtered = tag ? products.filter(p => p.hashtags?.includes(tag)) : products;
        renderProducts(filtered, productContainer);
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
          : products;
        if (productContainer) renderProducts(filtered, productContainer);
      });
    })
    .catch(err => console.error(err.message));
}

// Рендер списку товарів
function renderProducts(products, container) {
  container.style.opacity = "0";

  setTimeout(() => {
    container.innerHTML = products.map(product => `
      <a href="${product.url}" class="product">
        <img src="${product.img}" alt="${product.alt}">
        <p><strong>${product.name}</strong></p>
      </a>
    `).join("");

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

  detailContainer.innerHTML = `
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
}

// Налаштування модалок для фото товару
function setupModals() {
  document.querySelectorAll(".thumbnails a, .main-image a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const modalId = link.getAttribute("href").substring(1);
      document.getElementById(modalId)?.classList.add("open");
    });
  });

  document.querySelectorAll(".modal").forEach(modal => {
    modal.querySelector(".modal-overlay")?.addEventListener("click", close);
    modal.querySelector(".close")?.addEventListener("click", close);

    function close(e) {
      e.preventDefault();
      modal.classList.remove("open");
    }
  });
}

// Глобалізація функцій (якщо потрібно)
window.initProducts = initProducts;
window.renderProducts = renderProducts;
window.renderProductDetail = renderProductDetail;
window.setupModals = setupModals;