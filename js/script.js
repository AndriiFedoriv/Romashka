// Дочекаємось, поки сторінка повністю завантажиться
window.onload = function () {

    // Вставляємо header з окремого файлу
    fetch("header.html")
      .then(res => res.text())
      .then(data => {
        document.getElementById("header-placeholder").innerHTML = data;
  
        // Після вставки хедера — вішаємо слухачі
        initHeaderBehavior();
      });
  
    function initHeaderBehavior() {
      const header = document.querySelector('header');
      let lastScrollTop = 0;
  
      window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
        if (scrollTop > lastScrollTop) {
          header.style.top = "-100px"; // Скрол вниз — ховаємо
        } else {
          header.style.top = "0"; // Скрол вгору — показуємо
        }
  
        lastScrollTop = Math.max(scrollTop, 0);
      });
  
      // Клік по бургеру
      const burger = document.getElementById('burger');
      const nav = document.getElementById('navLinks');
      const overlay = document.getElementById('overlay');
  
      burger.addEventListener('click', () => toggleMenu());
  
      function toggleMenu() {
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
        burger.classList.toggle('active');
      }
  
      // Закриття меню при кліку по пункту меню + плавний скрол
      document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', e => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
          }
          toggleMenu();
        });
      });
  
      // Клік на overlay закриває меню
      overlay.addEventListener('click', toggleMenu);
    }
  
  };
  