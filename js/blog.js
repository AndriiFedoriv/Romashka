function renderBlog() {
  const lang = localStorage.getItem('lang') || 'uk';
  const blogFile = lang === 'en' ? 'blog-en.json' : 'blog.json';

  fetch(blogFile)
    .then(res => res.json())
    .then(articles => {
      const container = document.getElementById('blog-articles');
      container.innerHTML = articles.map(article => `
        <article class="blog-article" data-id="${article.id}">
          <img src="${article.image}" alt="${article.title}" class="blog-image" loading="lazy">
          <h2>${article.title}</h2>
          <div class="blog-date">${article.date}</div>
          <p>${article.excerpt}</p>
          <a href="blog-post.html?id=${encodeURIComponent(article.id)}" class="read-more-link">${lang === 'en' ? 'Read more' : 'Читати далі'}</a>
        </article>
      `).join('');
    });
}


renderBlog();