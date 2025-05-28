document.addEventListener("DOMContentLoaded", () => {
  // Вставити модальне вікно кошика
  if (typeof insertCartModal === "function") insertCartModal();

  // Ініціалізувати хедер
  if (typeof initHeader === "function") initHeader();

  // Ініціалізувати футер
  if (typeof initFooter === "function") initFooter();

  // Ініціалізувати товари
  if (typeof initProducts === "function") initProducts();

  // Підсвітити активне посилання меню
  if (typeof highlightActiveLink === "function") highlightActiveLink();

  // перемикання теми
function initThemeSwitcher() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const themeIcon = themeBtn?.querySelector('.theme-icon');

  // Встановлення теми
  function setTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (theme === 'auto') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', theme);
    }
  }

  // Отримати тему (з localStorage або системи)
  function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Початкова ініціалізація
  const initialTheme = getPreferredTheme();
  setTheme(initialTheme);

  // Слухач зміни системної теми
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Клік по кнопці – перемикання теми
  if (themeBtn) {
    themeBtn.onclick = () => {
      const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    };
  }
}
window.initThemeSwitcher = initThemeSwitcher;

  // Оновити лічильник кошика, коли елемент з'явиться
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

// Додаємо слухача для закриття кошика при кліку поза модалкою
//let justOpened = false;
document.addEventListener("click", function (e) {
  if (justOpened) return;
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

// Функцію при кліку на хештег
function saveRecentTag(tag) {
  let tags = JSON.parse(localStorage.getItem('recentTags') || '[]');
  tags = tags.filter(t => t !== tag);
  tags.unshift(tag);
  if (tags.length > 5) tags = tags.slice(0, 5);
  localStorage.setItem('recentTags', JSON.stringify(tags));
}
