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
          const titleParam = params.get('title');
          let idx = articles.findIndex(a => a.title === titleParam);
          if (idx === -1) idx = 0;
          const article = articles[idx];

          document.title = `${article.title} — Медова Легенда`;
          let metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', article.excerpt);

          const prevIdx = (idx - 1 + articles.length) % articles.length;
          const nextIdx = (idx + 1) % articles.length;
          const prev = articles[prevIdx];
          const next = articles[nextIdx];

          function renderArticle(article) {
            const amazonUrl = article.amazon || article.amazon_url || null;

            document.getElementById('blog-post-content').innerHTML = `
              <article class="blog-article blog-article-page">
                <img src="${article.image}" alt="${article.title}" class="blog-image" loading="lazy">
                <h1>${article.title}</h1>
                ${amazonUrl ? `
                <div class="product-actions">
                  <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer" class="honey-btn">🛒 ${lang === 'en' ? 'Buy on Amazon' : 'Купити на Amazon'}</a>
                </div>
              ` : ''}
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
                <a href="blog-post.html?title=${encodeURIComponent(prev.title)}" class="blog-arrow blog-arrow-left" aria-label="${lang === 'en' ? 'Previous article' : 'Попередня стаття'}">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <polyline points="15 18 9 12 15 6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
                <a href="blog-post.html?title=${encodeURIComponent(next.title)}" class="blog-arrow blog-arrow-right" aria-label="${lang === 'en' ? 'Next article' : 'Наступна стаття'}">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <polyline points="9 6 15 12 9 18" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
              </article>
            `;
            setupHashtagHandlers();
          }

          function renderTagList(tag) {
            const filteredArticles = articles.filter(a => a.hashtags && a.hashtags.includes(tag));
            const filteredProducts = products.filter(p => p.hashtags && p.hashtags.includes(tag));
            document.getElementById('blog-post-content').innerHTML = `
              <h2>${lang === 'en' ? 'Materials with tag' : 'Матеріали з тегом'} "${tag}"</h2>
              <div class="products-list">
                ${filteredProducts.map(product => `
                  <a href="${product.url}" class="product">
                    <img src="${product.img}" alt="${product.alt || product.name}" loading="lazy">
                    <p><strong>${product.name}</strong></p>
                  </a>
                `).join('')}
                ${filteredArticles.map(article => `
                  <a href="blog-post.html?title=${encodeURIComponent(article.title)}" class="product blog-product">
                    <img src="${article.image}" alt="${article.title}" loading="lazy">
                    <p><strong>${article.title}</strong></p>
                  </a>
                `).join('')}
              </div>
              <a href="blog.html" class="read-more-link" style="margin-top:32px;display:inline-block;">← ${lang === 'en' ? 'All articles' : 'До всіх статей'}</a>
            `;
            setupHashtagHandlers();
          }

          function setupHashtagHandlers() {
            document.querySelectorAll('.hashtag[data-tag]').forEach(link => {
              link.addEventListener('click', function(e) {
                e.preventDefault();
                const tag = this.dataset.tag;
                window.location.href = `index.html?tag=${encodeURIComponent(tag)}`;
                saveRecentTag(tag);
                renderTagList(tag);
              });
            });
          }

          // Якщо є тег у URL, показати матеріали з тегом
          const tagParam = params.get('tag');
          if (tagParam) {
            renderTagList(tagParam);
          } else {
            renderArticle(article);
          }

          // Свайп для мобільних
          let touchStartX = null;
          let swipeOnHashtags = false;
          const blogContent = document.getElementById('blog-post-content');

          blogContent.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            swipeOnHashtags = !!e.target.closest('.hashtags');
          });
          blogContent.addEventListener('touchend', function(e) {
            if (touchStartX === null || swipeOnHashtags) {
              touchStartX = null;
              swipeOnHashtags = false;
              return;
            }
            let touchEndX = e.changedTouches[0].screenX;
            if (touchEndX - touchStartX > 50) {
              window.location.href = `blog-post.html?title=${encodeURIComponent(prev.title)}`;
            } else if (touchStartX - touchEndX > 50) {
              window.location.href = `blog-post.html?title=${encodeURIComponent(next.title)}`;
            }
            touchStartX = null;
            swipeOnHashtags = false;
          });
        });
    });
}

// Для автоматичного оновлення після зміни мови:
window.renderBlogPost = renderBlogPost;

// Викликати при завантаженні сторінки
renderBlogPost();