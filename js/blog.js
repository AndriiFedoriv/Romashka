fetch('blog.json')
  .then(res => res.json())
  .then(articles => {
    const container = document.getElementById('blog-articles');
    container.innerHTML = articles.map(article => `
      <article class="blog-article">
        <img src="${article.image}" alt="${article.title}" class="blog-image" loading="lazy">
        <h2>${article.title}</h2>
        <div class="blog-date">${article.date}</div>
        <p>${article.excerpt}</p>
        <details>
          <summary>Читати далі</summary>
          <div>${article.content}</div>
        </details>
      </article>
    `).join('');
  });