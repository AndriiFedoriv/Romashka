window.onload = () => {
  initHeader();
  initFooter();
  initProducts();
};

function initHeader() {
  fetch("header.html")
    .then(res => res.text())
    .then(html => {
      const headerPlaceholder = document.getElementById("header-placeholder");
      if (headerPlaceholder) {
        headerPlaceholder.innerHTML = html;
        setupHeaderBehavior();
        initProductLinks();
      }
    });
}

function setupHeaderBehavior() {
  const header = document.querySelector("header");
  const burger = document.getElementById("burger");
  const nav = document.getElementById("navLinks");
  const overlay = document.getElementById("overlay");

  if (!header) return;

  let lastScrollTop = 0;
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    header.style.top = scrollTop > lastScrollTop ? "-100px" : "0";
    lastScrollTop = Math.max(scrollTop, 0);
  });

  if (burger && nav && overlay) {
    [burger, overlay].forEach(el => el.addEventListener("click", toggleMenu));
  }

  function toggleMenu() {
    nav.classList.toggle("active");
    overlay.classList.toggle("active");
    burger.classList.toggle("active");
  }

  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (href?.startsWith("#")) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        toggleMenu();
      }
    });
  });

  highlightActiveLink(); // 👈 Додаємо підсвітку тут одразу після побудови хедера
}

function initFooter() {
  fetch("footer.html")
    .then(res => res.text())
    .then(html => {
      const footerPlaceholder = document.getElementById("footer-placeholder");
      if (footerPlaceholder) footerPlaceholder.innerHTML = html;
    });
}

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
    .then(res => res.json())
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
    .catch(err => console.error("Помилка завантаження продуктів:", err));
}

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
              <img src="${img}" alt="thumb${i + 2}">
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

              <button onclick='addToCart({name: "${product.name}", price: "${product.price}"})'>Додати до кошика</button>
              <button onclick='openCart()'>Відкрити кошик</button>

            </div>

              <p>
                <a href="${product.buyLink || 'https://rozetka.com.ua/'}" class="rozetka-button" target="_blank">
                  <img src="img/rozetkaSmile.png" alt="Купити на Rozetka">
                  Купити на Rozetka
                </a>
              </p>

              <p>
                <a href="${product.instagram || 'https://instagram.com/'}" class="instagram-button" target="_blank">
                  <img src="img/Instagram_icon.png" alt="Ми в Instagram">
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
          <img class="modal-content" src="${img}" alt="Фото ${i + 1}">
        </div>
      </div>
    `).join("");
    setupModals();
  }
}

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

function initProductLinks() {
  const linksContainer = document.getElementById("products-links");
  const toggleButton = document.getElementById("toggle-products");
  if (!linksContainer || !toggleButton) return;

  fetch("/products.json")
    .then(res => res.json())
    .then(products => {
      linksContainer.innerHTML = products.map(product => `
        <a href="${product.url}">${product.name}</a>
      `).join("");

      highlightActiveLink(); // Щоб підсвітити після завантаження
    })
    .catch(err => console.error("Не вдалося завантажити товари у меню:", err));

  toggleButton.addEventListener("click", () => {
    const isVisible = linksContainer.style.display === "block";
    linksContainer.style.display = isVisible ? "none" : "block";
  });
}

function highlightActiveLink() {
  const links = document.querySelectorAll("nav a, #products-links a");
  if (!links.length) return;

  const currentPage = location.pathname.split("/").pop() || "index.html";

  links.forEach(link => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage || linkPage === `/${currentPage}`) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
}

// Викликаємо підсвітку відразу
highlightActiveLink();

// Слухаємо зміни історії браузера (назад/вперед)
window.addEventListener("popstate", highlightActiveLink);


window.addEventListener('load', function () {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;

  if (isIOS && isSafari && !isInStandaloneMode) {
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #ffd700;
        color: #4a3b00;
        padding: 12px 16px;
        font-size: 14px;
        text-align: center;
        box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
        z-index: 9999;
      ">
        📲 Щоб зручно користуватись — додайте сайт на головний екран:<br>
        <strong>Поділіться → Додати на головний екран</strong>
        <span style="margin-left: 10px; cursor: pointer;" onclick="this.parentElement.remove()">❌</span>
      </div>
    `;
    document.body.appendChild(banner);
  }
});

function openCart() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const cartItems = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");
  let total = 0;
  cartItems.innerHTML = "";

  cart.forEach((item, i) => {
    total += +item.price;
    cartItems.innerHTML += `
      <div>
        <strong>${item.name}</strong> — ${item.price} грн
        <button onclick="removeItem(${i})">🗑️</button>
      </div>`;
  });

  totalPriceEl.textContent = total + " грн";
  document.getElementById("cartModal").style.display = "block";
}

function closeCart() {
  document.getElementById("cartModal").style.display = "none";
}

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Додано до кошика!");
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  openCart();
}

function sendOrder() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (!cart.length) return alert("Кошик порожній!");

  let message = "Замовлення:\n";
  let total = 0;
  cart.forEach(p => {
    message += `• ${p.name} — ${p.price} грн\n`;
    total += +p.price;
  });
  message += `Разом: ${total} грн`;

  const viber = `viber://chat?number=%2B380667798932&text=${encodeURIComponent(message)}`;
  const mail = `mailto:fedorivandrij@gmail.com?subject=Замовлення&body=${encodeURIComponent(message)}`;

  window.open(viber, "_blank");
  window.open(mail, "_blank");
  closeCart();
}
