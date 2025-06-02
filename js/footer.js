function initFooter() {
  fetch("footer.html")
    .then(res => {
      if (!res.ok) throw new Error("Помилка завантаження footer.html");
      return res.text();
    })
    .then(html => {
      const footerPlaceholder = document.getElementById("footer-placeholder");
      if (footerPlaceholder) {
        footerPlaceholder.innerHTML = html;
        loadFooterTags(); // Викликаємо після вставки футера
      }
    })
    .catch(err => console.error(err.message));
}

// Динамічне завантаження популярних тегів з товарів і статей
function loadFooterTags() {
  (async function() {
    try {
      const lang = localStorage.getItem('lang') || 'uk';
      const productsFile = lang === 'en' ? 'products-en.json' : 'products.json';
      const blogFile = lang === 'en' ? 'blog-en.json' : 'blog.json';

      const [products, articles] = await Promise.all([
        fetch(productsFile).then(r => r.json()),
        fetch(blogFile).then(r => r.json())
      ]);
      const tagsCount = {};
      products.forEach(p => (p.hashtags || []).forEach(tag => tagsCount[tag] = (tagsCount[tag] || 0) + 1));
      articles.forEach(a => (a.hashtags || []).forEach(tag => tagsCount[tag] = (tagsCount[tag] || 0) + 1));
      // Популярні теги за кількістю
      const popularTags = Object.entries(tagsCount)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);

      // Останні використані
      let recentTags = [];
      try {
        recentTags = JSON.parse(localStorage.getItem('recentTags') || '[]');
      } catch {}
      // Зміксований список: спочатку останні, потім популярні, без повторів
      const mixedTags = [...recentTags, ...popularTags.filter(tag => !recentTags.includes(tag))].slice(0, 8);

      const tagsList = document.getElementById('footer-tags-list');
      if (tagsList) {
        tagsList.innerHTML = mixedTags
          .map(tag => {
            let cleanTag = tag && typeof tag === 'string' ? tag.replace(/^#+/, '').trim() : '';
            if (!cleanTag) return '';
            const tagWithHash = `#${cleanTag}`;
            return `<a href="/index.html?tag=${encodeURIComponent(tagWithHash)}" class="hashtag">${tagWithHash}</a>`;
          })
          .filter(Boolean)
          .join(' ');
      }
    } catch (e) {
      const tagsList = document.getElementById('footer-tags-list');
      if (tagsList) {
        tagsList.innerHTML = [
          lang === 'en' ? '#honey' : '#мед',
          lang === 'en' ? '#nuts' : '#горіхи',
          lang === 'en' ? "#health" : "#здоров'я",
          lang === 'en' ? '#recipes' : '#рецепти'
        ].map(tag => {
          const cleanTag = tag.replace(/^#+/, '');
          const tagWithHash = `#${cleanTag}`;
          return cleanTag.length > 0
            ? `<a href="index.html?tag=${encodeURIComponent(tagWithHash)}" class="hashtag">${tagWithHash}</a>`
            : '';
        }).join(' ');
      }
    }
  })();
}

// Глобалізація функції, якщо потрібно викликати з main.js або іншого місця
window.initFooter = initFooter;