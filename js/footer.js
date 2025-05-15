// Завантаження футера з footer.html у відповідний placeholder
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

// Глобалізація функції, якщо потрібно викликати з main.js або іншого місця
window.initFooter = initFooter;