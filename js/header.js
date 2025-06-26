// Завантаження header.html та ініціалізація поведінки хедера
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
        if (typeof initThemeSwitcher === "function") initThemeSwitcher();
        setupHeaderBehavior();
        initProductLinks();
      }
    })
    .catch(err => console.error(err.message));
}

// Поведінка хедера: бургер, меню, підсвітка активного посилання
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
  if (nav.classList.contains("active")) {
    hideArrows();
  } else {
    showArrows();
  }
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

function hideArrows() {
  document.querySelectorAll('.product-arrow, .blog-arrow').forEach(el => el.classList.add('hidden'));
}
function showArrows() {
  document.querySelectorAll('.product-arrow, .blog-arrow').forEach(el => el.classList.remove('hidden'));
}

// Підсвітка активного посилання меню
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

// Динамічне меню товарів у хедері
function initProductLinks() {
  const linksContainer = document.getElementById("products-links");
  const toggleButton = document.getElementById("toggle-products");
  if (!linksContainer || !toggleButton) return;

  const lang = localStorage.getItem('lang') || 'uk';
  const productsFile = lang === 'en' ? '/products-en.json' : '/products.json';

  // Завантажити продукти
  fetch(productsFile)
    .then(res => res.json())
    .then(products => {
      linksContainer.innerHTML = products.map(product => `
        <a href="${product.url}">${product.name}</a>
      `).join("");

      highlightActiveLink();
    })
    .catch(err => console.error("Не вдалося завантажити товари у меню:", err));

  // ДОДАЙТЕ ЦЕ ПІСЛЯ fetch — обробник завжди має бути актуальний
  toggleButton.onclick = () => {
    const isVisible = linksContainer.style.display === "block";
    linksContainer.style.display = isVisible ? "none" : "block";
  };
}



// Підсвітка при зміні історії браузера
window.addEventListener("popstate", highlightActiveLink);

// Глобалізація функцій (якщо потрібно)
window.initHeader = initHeader;
window.setupHeaderBehavior = setupHeaderBehavior;
window.highlightActiveLink = highlightActiveLink;
window.initProductLinks = initProductLinks;