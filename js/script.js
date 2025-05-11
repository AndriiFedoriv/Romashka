document.addEventListener("DOMContentLoaded", () => {
  insertCartModal();
  initHeader();
  initFooter();
  initProducts();
  highlightActiveLink();

  // Переконаємося, що cartCount існує перед викликом
  const tryUpdateCartCount = () => {
    const el = document.getElementById("cartCount");
    if (el) {
      updateCartCount();
    } else {
      setTimeout(tryUpdateCartCount, 100);
    }
  };
  tryUpdateCartCount();
});

function insertCartModal() {
  const cartHTML = `
    <div id="cartOverlay" class="cart-overlay">
      <div id="cartModal" class="cartmodal">
        <h2>🛒 Ваш кошик</h2>
        <div id="cartItems" class="cart-items"></div>
        <p class="cart-total"><strong>Разом: <span id="totalPrice">0 грн</span></strong></p>
        <hr>
        <h3>📦 Інформація про замовника</h3>
        <form id="orderForm" autocomplete="on">
          <input type="text" id="customerName" placeholder="Ім’я та Прізвище" required>
          <input type="tel" id="customerPhone" placeholder="Номер телефону" required pattern="^\\+?[\\d\\s\\-]{10,15}$">
          <input type="text" id="customerCity" placeholder="Місто" required>
          <input type="text" id="customerAddress" placeholder="Номер відділення" required>
          <div class="cart-buttons">
            <button type="button" class="honey-btn" onclick="sendOrder()">🍯 Замовити</button>
            <button type="button" class="honey-btn cancel" onclick="closeCart()">❌ Закрити</button>
          </div>    
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", cartHTML);
}

function initHeader() {
  fetch("header.html")
    .then(res => {
      if (!res.ok) throw new Error("Помилка завантаження header.html");
      return res.text();
    })
    .then(html => {
      const headerPlaceholder = document.getElementById("header-placeholder");
      if (headerPlaceholder) {
        headerPlaceholder.innerHTML = html;
        setupHeaderBehavior();
        initProductLinks();
      }
    })
    .catch(err => console.error(err.message));
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

  highlightActiveLink();
}

function initFooter() {
  fetch("footer.html")
    .then(res => {
      if (!res.ok) throw new Error("Помилка завантаження footer.html");
      return res.text();
    })
    .then(html => {
      const footerPlaceholder = document.getElementById("footer-placeholder");
      if (footerPlaceholder) footerPlaceholder.innerHTML = html;
    })
    .catch(err => console.error(err.message));
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
  const cartOverlay = document.getElementById("cartOverlay");
  const cartItems = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");

  if (!cartOverlay || !cartItems || !totalPriceEl) {
    console.error("Кошик: відсутні необхідні елементи в DOM");
    return;
  }

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    cartItems.innerHTML += `
      <div>
        <strong>${item.name}</strong> — ${item.price} грн × ${item.quantity} = ${itemTotal} грн
        <button onclick="decreaseQuantity(${i})">➖</button>
        <button onclick="increaseQuantity(${i})">➕</button>
        <button onclick="removeItem(${i})">🗑️</button>
      </div>`;
  });

  totalPriceEl.textContent = `Разом: ${total} грн`;
  cartOverlay.style.display = "block";
}

function closeCart() {
  console.log("Функція closeCart викликається");
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) {
    cartOverlay.style.display = "none";
  }
}

// Закриття по кліку за межами вікна
document.addEventListener("click", function (e) {
  const overlay = document.getElementById("cartOverlay");
  const modal = document.getElementById("cartModal");
  const cartBtn = document.getElementById("cartBtn");

  if (
    overlay &&
    modal &&
    overlay.style.display === "block" &&
    !modal.contains(e.target) &&
    cartBtn &&
    !cartBtn.contains(e.target)
  ) {
    closeCart();
  }
});



function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existingIndex = cart.findIndex(p => p.name === product.name);

  if (existingIndex !== -1) {
    cart[existingIndex].quantity++;
  } else {
    product.quantity = 1;
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert("Додано до кошика!");
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  openCart();
}

function increaseQuantity(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart[index].quantity++;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  openCart();
}

function decreaseQuantity(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1); // Видаляємо товар, якщо кількість = 1
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  openCart();
}

function sendOrder() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (!cart.length) return alert("Кошик порожній!");

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const city = document.getElementById("customerCity").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  if (!name || !phone || !city || !address) {
    alert("Будь ласка, заповніть всі поля.");
    return;
  }

  let message = `Замовлення від ${name}\n📞 ${phone}\n🏙️ ${city}, 📦 ${address}\n\n`;
  let total = 0;

  cart.forEach(p => {
    const itemTotal = p.price * p.quantity;
    message += `• ${p.name} — ${p.price} грн × ${p.quantity} = ${itemTotal} грн\n`;
    total += itemTotal;
  });
  message += `\nРазом: ${total} грн`;

  const mail = `mailto:dima.soltus1998@gmail.com?subject=Замовлення&body=${encodeURIComponent(message)}`;
  window.open(mail, "_blank");

  localStorage.removeItem("cart");
  updateCartCount();
  closeCart();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const counter = document.getElementById("cartCount");

  if (counter) {
    if (count > 0) {
      counter.textContent = count;
      counter.style.display = "inline-block";
    } else {
      counter.textContent = "";
      counter.style.display = "none";
    }
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/js/service-worker.js')
    .then(reg => console.log('✅ Service Worker зареєстрований:', reg.scope))
    .catch(err => console.error('❌ Service Worker не вдалося зареєструвати:', err));
}
