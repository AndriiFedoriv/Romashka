fetch('blog.json')
  .then(res => res.json())
  .then(articles => {
    const params = new URLSearchParams(window.location.search);
    const titleParam = params.get('title');
    let idx = articles.findIndex(a => a.title === titleParam);
    if (idx === -1) idx = 0;
    const article = articles[idx];

    // Динамічно змінити <title> і <meta name="description">
    document.title = `${article.title} — Медова Легенда`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', article.excerpt);

    // Визначаємо попередню і наступну статтю
    const prevIdx = (idx - 1 + articles.length) % articles.length;
    const nextIdx = (idx + 1) % articles.length;
    const prev = articles[prevIdx];
    const next = articles[nextIdx];

    document.getElementById('blog-post-content').innerHTML = `
      <article class="blog-article blog-article-page">
        <img src="${article.image}" alt="${article.title}" class="blog-image" loading="lazy">
        <h1>${article.title}</h1>
        <div class="blog-date">${article.date}</div>
        <p class="blog-excerpt">${article.excerpt}</p>
        <div class="blog-content">${article.content.replace(/\n/g, '<br>')}</div>
        <div class="blog-nav">
          <a href="blog-post.html?title=${encodeURIComponent(prev.title)}" class="blog-nav-btn prev-btn">← Попередня</a>
          <a href="blog-post.html?title=${encodeURIComponent(next.title)}" class="blog-nav-btn next-btn">Наступна →</a>
        </div>
      </article>
    `;

    // Свайп для мобільних
    let touchStartX = null;
    document.getElementById('blog-post-content').addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    });
    document.getElementById('blog-post-content').addEventListener('touchend', function(e) {
      if (touchStartX === null) return;
      let touchEndX = e.changedTouches[0].screenX;
      if (touchEndX - touchStartX > 50) {
        // свайп вправо — попередня
        window.location.href = `blog-post.html?title=${encodeURIComponent(prev.title)}`;
      } else if (touchStartX - touchEndX > 50) {
        // свайп вліво — наступна
        window.location.href = `blog-post.html?title=${encodeURIComponent(next.title)}`;
      }
      touchStartX = null;
    });
  });