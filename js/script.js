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
      if (!headerPlaceholder) return;
      headerPlaceholder.innerHTML = html;
      setupHeaderBehavior();
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
    // Якщо ми на сторінці продукту і є параметр tag — перенаправляємо на головну
    const redirectUrl = `index.html?tag=${encodeURIComponent(tag)}`;
    window.location.href = redirectUrl;
    return; // Важливо! Щоб далі код не продовжував виконуватись
  }

  fetch("/products.json")
    .then(res => res.json())
    .then(products => {
      const urlParams = new URLSearchParams(window.location.search);
      const tag = urlParams.get("tag");

      if (productContainer) {
        const filtered = tag
          ? products.filter(p => p.hashtags?.includes(tag))
          : products;
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
            // Ми на сторінці продукту: потрібно редіректнути на головну
            window.location.href = `index.html?tag=${encodeURIComponent(selectedTag)}`;
          } else {
            // Ми на index.html: просто фільтруємо продукти без перезавантаження
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
  container.innerHTML = products.map(product => `
    <a href="${product.url}" class="product">
      <img src="${product.img}" alt="${product.alt}">
      <p><strong>${product.name}</strong></p>
    </a>
  `).join("");
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
        <p><strong>Вага:</strong> ${product.weight || "470 г"}</p>
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
