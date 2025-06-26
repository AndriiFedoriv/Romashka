document.addEventListener("DOMContentLoaded", () => {
  if (typeof insertCartModal === "function") insertCartModal();
  if (typeof initHeader === "function") initHeader();
  if (typeof initFooter === "function") initFooter();
  if (typeof highlightActiveLink === "function") highlightActiveLink();
  if (typeof initThemeSwitcher === "function") initThemeSwitcher();

  // Додаємо перемикач мови у header-actions
  const headerActions = document.querySelector('.header-actions');
  if (headerActions && !headerActions.querySelector('.lang-toggle')) {
    const langBtn = document.createElement('button');
    langBtn.className = 'lang-toggle';
    langBtn.type = 'button';
    langBtn.setAttribute('aria-label', 'Змінити мову');
    langBtn.innerHTML = '<span class="lang-icon">🇺🇦</span>';
    headerActions.appendChild(langBtn);
  }

  // Визначення мови автоматично або з localStorage
  const savedLang = localStorage.getItem("lang") || detectLanguage();
  setLanguage(savedLang, () => {
    updateLangIcon(savedLang);
    loadProducts();
  });

  // Оновлення лічильника кошика (асинхронна поява елемента)
  const tryUpdateCartCount = () => {
    const el = document.getElementById("cartCount");
    if (el && typeof updateCartCount === "function") {
      updateCartCount();
    } else {
      setTimeout(tryUpdateCartCount, 100);
    }
  };
  tryUpdateCartCount();
});

// Функція для визначення мови за налаштуваннями пристрою
function detectLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  const ukLangs = ["uk", "ru", "be", "kk", "bg"]; // список мов, для яких встановлюємо українську
  return ukLangs.some(lang => userLang.startsWith(lang)) ? "uk" : "en";
}

// Делегування для перемикача мови (працює навіть якщо кнопка з'явиться пізніше)
document.body.addEventListener('click', function(e) {
  if (e.target.closest('.lang-toggle')) {
    const current = localStorage.getItem('lang') || 'uk';
    const next = current === 'uk' ? 'en' : 'uk';
    setLanguage(next, () => {
      updateLangIcon(next);
      loadProducts();
      initProductLinks();
    });
  }
});

// Оновлення іконки мови
function updateLangIcon(lang) {
  const langBtn = document.querySelector('.lang-toggle');
  if (langBtn) {
    langBtn.querySelector('.lang-icon').textContent = lang === 'uk' ? 'укр' : 'en';
  }
}

// Перемикання мови
function setLanguage(lang, callback) {
  fetch(`lang/${lang}.json`)
    .then(res => {
      if (!res.ok) throw new Error('Language file not found');
      return res.json();
    })
    .then(dict => {
      localStorage.setItem('langDict', JSON.stringify(dict));
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key];
      });
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        if (dict[key]) el.setAttribute('aria-label', dict[key]);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.setAttribute('placeholder', dict[key]);
      });

      localStorage.setItem('lang', lang);
      document.documentElement.setAttribute('lang', lang);

      // ✅ Оновлюємо шлях до файлу товарів:
      window.productsFile = lang === 'en' ? 'products-en.json' : 'products.json';

      // ✅ Ініціалізуємо товари заново:
      if (typeof initProducts === "function") initProducts();

      // ✅ Оновлюємо інші компоненти
      if (typeof renderBlog === "function") renderBlog();
      if (typeof renderBlogPost === "function") renderBlogPost();
      if (typeof loadFooterTags === "function") loadFooterTags();

      // Викликаємо переданий колбек
      if (typeof callback === "function") callback();

    })
    .catch(err => {
      console.error('Language loading error:', err.message);
    });
}

// Завантаження товарів з урахуванням мови
function loadProducts() {
  const lang = localStorage.getItem('lang') || 'uk';
  const productsFile = lang === 'en' ? 'products-en.json' : 'products.json';
  if (typeof initProducts === "function") {
    window.productsFile = productsFile;
    initProducts();
  }
}

// Функція для збереження нещодавніх тегів
function saveRecentTag(tag) {
  let tags = JSON.parse(localStorage.getItem('recentTags') || '[]');
  tags = tags.filter(t => t !== tag);
  tags.unshift(tag);
  if (tags.length > 5) tags = tags.slice(0, 5);
  localStorage.setItem('recentTags', JSON.stringify(tags));
}

// Слухач для закриття кошика при кліку поза модалкою
document.addEventListener("click", function (e) {
  if (typeof justOpened !== "undefined" && justOpened) return;
  const overlay = document.getElementById("cartOverlay");
  const modal = document.getElementById("cartModal");
  if (
    overlay &&
    modal &&
    overlay.style.display === "block" &&
    !modal.contains(e.target)
  ) {
    if (typeof closeCart === "function") closeCart();
  }
});

// Перемикач теми (можна винести в окремий файл)
function initThemeSwitcher() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeIcon = themeBtn?.querySelector('.theme-icon');

  function setTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (theme === 'auto') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', theme);
    }
  }

  function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const initialTheme = getPreferredTheme();
  setTheme(initialTheme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  if (themeBtn) {
    themeBtn.onclick = () => {
      const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    };
  }
}
window.initThemeSwitcher = initThemeSwitcher;