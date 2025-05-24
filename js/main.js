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
