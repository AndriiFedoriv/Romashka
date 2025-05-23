fetch('blog.json')
  .then(res => res.json())
  .then(articles => {
    const params = new URLSearchParams(window.location.search);
    const selectedTitle = params.get('article');

    if (selectedTitle) {
      const idx = articles.findIndex(a => a.title === selectedTitle);
      if (idx > -1) {
        const [selected] = articles.splice(idx, 1);
        articles.unshift(selected);
      }
    } else {
      articles = articles.sort(() => Math.random() - 0.5);
    }

    const container = document.getElementById('blog-articles');
    container.innerHTML = articles.map(article => `
      <article class="blog-article">
        <img src="${article.image}" alt="${article.title}" class="blog-image" loading="lazy">
        <h2>${article.title}</h2>
        <div class="blog-date">${article.date}</div>
        <p>${article.excerpt}</p>
        <a href="blog-post.html?title=${encodeURIComponent(article.title)}" class="read-more-link">Читати далі</a>
      </article>
    `).join('');
  });