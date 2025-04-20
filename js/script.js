// Скрипт для приховування/показу хедера при скролі
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', function () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    header.style.top = "-100px"; // Скрол вниз — ховаємо
  } else {
    header.style.top = "0"; // Скрол вгору — показуємо
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Скрипт для бургер-меню та плавного скролу
function toggleMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('navLinks');
    const overlay = document.getElementById('overlay');
  
    const isOpen = nav.classList.contains('active');
  
    if (isOpen) {
      nav.classList.remove('active');
      overlay.classList.remove('active');
      burger.classList.remove('active');
    } else {
      nav.classList.add('active');
      overlay.classList.add('active');
      burger.classList.add('active');
    }
}

// Закриття меню при кліку на пункт + плавний скролл
document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    }
    toggleMenu();
  });
});