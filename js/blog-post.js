fetch('blog.json')
  .then(res => res.json())
  .then(articles => {
    fetch('products.json')
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
          document.getElementById('blog-post-content').innerHTML = `
            <article class="blog-article blog-article-page">
              <img src="${article.image}" alt="${article.title}" class="blog-image" loading="lazy">
              <h1>${article.title}</h1>
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
              <a href="blog-post.html?title=${encodeURIComponent(prev.title)}" class="blog-arrow blog-arrow-left" aria-label="Попередня стаття">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <polyline points="15 18 9 12 15 6" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a href="blog-post.html?title=${encodeURIComponent(next.title)}" class="blog-arrow blog-arrow-right" aria-label="Наступна стаття">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <polyline points="9 6 15 12 9 18" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </article>
          `;
          setupHashtagHandlers();
        }
        // рендеримо і товари, і статті за тегом
          function renderTagList(tag) {
            const filteredArticles = articles.filter(a => a.hashtags && a.hashtags.includes(tag));
            const filteredProducts = products.filter(p => p.hashtags && p.hashtags.includes(tag));
            document.getElementById('blog-post-content').innerHTML = `
              <h2>Матеріали з тегом "${tag}"</h2>
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
              <a href="blog.html" class="read-more-link" style="margin-top:32px;display:inline-block;">← До всіх статей</a>
            `;
            setupHashtagHandlers();
          }

          function setupHashtagHandlers() {
            document.querySelectorAll('.hashtag[data-tag]').forEach(link => {
              link.addEventListener('click', function(e) {
                e.preventDefault();
                const tag = this.dataset.tag;
                saveRecentTag(tag);
                window.location.href = `index.html?tag=${encodeURIComponent(tag)}`;
              });
            });
          }

        renderArticle(article);

        // Свайп для мобільних
        let touchStartX = null;
        document.getElementById('blog-post-content').addEventListener('touchstart', function(e) {
          touchStartX = e.changedTouches[0].screenX;
        });
        document.getElementById('blog-post-content').addEventListener('touchend', function(e) {
          if (touchStartX === null) return;
          let touchEndX = e.changedTouches[0].screenX;
          if (touchEndX - touchStartX > 50) {
            window.location.href = `blog-post.html?title=${encodeURIComponent(prev.title)}`;
          } else if (touchStartX - touchEndX > 50) {
            window.location.href = `blog-post.html?title=${encodeURIComponent(next.title)}`;
          }
          touchStartX = null;
        });
      });
  });