fetch('blog.json')
  .then(res => res.json())
  .then(articles => {
    // Отримати id або title з URL (наприклад, ?id=2 або ?title=...)
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const titleParam = params.get('title');
    let article;

    if (id) {
      article = articles[parseInt(id, 10)];
    } else if (titleParam) {
      article = articles.find(a => a.title === titleParam);
    } else {
      article = articles[0]; // fallback
    }

    if (!article) {
      document.getElementById('blog-post-content').innerHTML = '<p>Статтю не знайдено.</p>';
      return;
    }

    // Динамічно змінити <title> і <meta name="description">
    document.title = `${article.title} — Медова Легенда`;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', article.excerpt);

    // Вивести статтю
    document.getElementById('blog-post-content').innerHTML = `
      <article class="blog-article blog-article-page">
        <img src="${article.image}" alt="${article.title}" class="blog-image" loading="lazy">
        <h1>${article.title}</h1>
        <div class="blog-date">${article.date}</div>
        <p class="blog-excerpt">${article.excerpt}</p>
        <!-- Google AdSense блок -->
        <div style="margin:24px 0;">
          <ins class="adsbygoogle"
            style="display:block; text-align:center;"
            data-ad-client="ca-pub-5204146299086284"
            data-ad-slot="1234567890"
            data-ad-format="auto"></ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
        <div class="blog-content">${article.content.replace(/\n/g, '<br>')}</div>
      </article>
    `;
  });