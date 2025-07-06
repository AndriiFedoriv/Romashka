function renderBlogPost() {
  const lang = localStorage.getItem('lang') || 'uk';
  const blogFile = lang === 'en' ? 'blog-en.json' : 'blog.json';
  const productsFile = lang === 'en' ? 'products-en.json' : 'products.json';

  fetch(blogFile)
    .then(res => res.json())
    .then(articles => {
      fetch(productsFile)
        .then(res => res.json())
        .then(products => {
          const params = new URLSearchParams(window.location.search);
          const idParam = params.get('id');

          let idx = idParam
            ? articles.findIndex(a => a.id === idParam)
            : 0;

          if (idx === -1) idx = 0;
          const article = articles[idx];

          document.title = `${article.title} — Медова Легенда`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', article.excerpt);

          const prevIdx = (idx - 1 + articles.length) % articles.length;
          const nextIdx = (idx + 1) % articles.length;
          const prev = articles[prevIdx];
          const next = articles[nextIdx];

          const amazonUrl = article.amazon || article.amazon_url || null;

          document.getElementById('blog-post-content').innerHTML = `
            <article class="blog-article blog-article-page">
              <img src="${article.image}" alt="${article.title}" class="blog-image" loading="lazy">
              <h1>${article.title}</h1>
              ${amazonUrl ? `
                <div class="product-actions" style="margin-bottom: 1em;">
                  <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer" class="honey-btn">
                    🛒 ${lang === 'en' ? 'Buy on Amazon' : 'Купити на Amazon'}
                  </a>
                </div>` : ""}
              <div class="blog-date">${article.date}</div>
              <p class="blog-excerpt">${article.excerpt}</p>
              <div class="blog-content">${article.content.replace(/\n/g, '<br>')}</div>
              ${article.hashtags ? `
                <div class="hashtags">
                  ${article.hashtags.map(tag => `
                    <a href="#" class="hashtag" data-tag="${tag}">${tag}</a>
                  `).join('')}
                </div>
              ` : ""}
              <a href="blog-post.html?id=${encodeURIComponent(prev.id)}" class="blog-arrow blog-arrow-left" aria-label="${lang === 'en' ? 'Previous article' : 'Попередня стаття'}">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <polyline points="15 18 9 12 15 6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a href="blog-post.html?id=${encodeURIComponent(next.id)}" class="blog-arrow blog-arrow-right" aria-label="${lang === 'en' ? 'Next article' : 'Наступна стаття'}">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <polyline points="9 6 15 12 9 18" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </article>
          `;

          setupHashtagHandlers();

          // Свайп для мобільних
          let touchStartX = null;
          let swipeOnHashtags = false;
          const blogContent = document.getElementById('blog-post-content');

          blogContent.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            swipeOnHashtags = !!e.target.closest('.hashtags');
          });
          blogContent.addEventListener('touchend', e => {
            if (touchStartX === null || swipeOnHashtags) {
              touchStartX = null;
              swipeOnHashtags = false;
              return;
            }
            let touchEndX = e.changedTouches[0].screenX;
            if (touchEndX - touchStartX > 50) {
              window.location.href = `blog-post.html?id=${encodeURIComponent(prev.id)}`;
            } else if (touchStartX - touchEndX > 50) {
              window.location.href = `blog-post.html?id=${encodeURIComponent(next.id)}`;
            }
            touchStartX = null;
            swipeOnHashtags = false;
          });

          function setupHashtagHandlers() {
            document.querySelectorAll('.hashtag[data-tag]').forEach(link => {
              link.addEventListener('click', function(e) {
                e.preventDefault();
                const tag = this.dataset.tag;
                window.location.href = `index.html?tag=${encodeURIComponent(tag)}`;
              });
            });
          }
        });
    });
}

window.renderBlogPost = renderBlogPost;
renderBlogPost();