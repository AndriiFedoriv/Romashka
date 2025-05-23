fetch('blog.json')
  .then(res => res.json())
  .then(articles => {
    // Отримати параметр article з URL
    const params = new URLSearchParams(window.location.search);
    const selectedTitle = params.get('article');

    // Якщо є параметр, знайти цю статтю
    if (selectedTitle) {
      const idx = articles.findIndex(a => a.title === selectedTitle);
      if (idx > -1) {
        // Витягнути і поставити першою
        const [selected] = articles.splice(idx, 1);
        articles.unshift(selected);
      }
    } else {
      // Якщо немає параметра — перемішати
      articles = articles.sort(() => Math.random() - 0.5);
    }

    const container = document.getElementById('blog-articles');
    container.innerHTML = articles.map(article => `
      <article class="blog-article">
        <img src="${article.image}" alt="${article.title}" class="blog-image" loading="lazy">
        <h2>${article.title}</h2>
        <div class="blog-date">${article.date}</div>
        <p>${article.excerpt}</p>
        <details>
          <summary>Читати далі</summary>
          <div>${article.content.replace(/\n/g, '<br>')}</div>
        </details>
      </article>
    `).join('');
  });