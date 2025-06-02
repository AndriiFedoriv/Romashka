window.justOpened = false;

// Вставка HTML модального кошика
function insertCartModal() {
  const cartHTML = `
    <div id="cartOverlay" class="cart-overlay">
      <div id="cartModal" class="cart-modal">
        <button class="close" onclick="closeCart()">&times;</button>
        <h2 data-i18n="cart_title">🛒 Ваш кошик</h2>
        <div id="cartItems" class="cart-items"></div>
        <p class="cart-total"><span id="totalPrice"><span data-i18n="cart_total">Разом:</span> 0 <span data-i18n="currency">грн</span></span></p>
        <hr>
        <h3 data-i18n="cart_customer_info">📦 Інформація про замовника</h3>
        <form id="orderForm" autocomplete="on">
        <input type="text" id="customerName" placeholder="Ім’я та Прізвище" data-i18n-placeholder="cart_name" required>
        <input type="tel" id="customerPhone" placeholder="Номер телефону" data-i18n-placeholder="cart_phone" required pattern="^\\+?[\\d\\s\\-]{10,15}$">
        <input type="text" id="customerCity" placeholder="Місто" data-i18n-placeholder="cart_city" required>
        <input type="text" id="customerAddress" placeholder="Номер відділення" data-i18n-placeholder="cart_address" required>
        <div class="cart-buttons">
            <button type="button" class="honey-btn" onclick="sendOrder()" data-i18n="cart_order_btn">🍯 Замовити</button>
            <button type="button" class="honey-btn cancel" onclick="closeCart()" data-i18n="cart_close_btn">❌ Закрити</button>
          </div>    
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", cartHTML);

  restoreFormData();

  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    orderForm.addEventListener("input", saveFormData);
  }

  // Закриття по кліку на overlay
  document.getElementById("cartOverlay").addEventListener("click", function(e) {
    if (e.target === this) closeCart();
  });
}

// Отримати переклад з langDict у localStorage
function getTranslation(key, fallback = "") {
  try {
    const dict = JSON.parse(localStorage.getItem('langDict') || '{}');
    return dict[key] || fallback;
  } catch {
    return fallback;
  }
}

// Відновлення даних форми
function restoreFormData() {
  const saved = JSON.parse(localStorage.getItem("orderForm") || "{}");
  if (saved.name) document.getElementById("customerName").value = saved.name;
  if (saved.phone) document.getElementById("customerPhone").value = saved.phone;
  if (saved.city) document.getElementById("customerCity").value = saved.city;
  if (saved.address) document.getElementById("customerAddress").value = saved.address;
}

// Відкриття кошика
function openCart() {
  window.justOpened = true;
  setTimeout(() => window.justOpened = false, 200);

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartModal = document.getElementById("cartModal");
  const cartItems = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");

  if (!cartOverlay || !cartModal || !cartItems || !totalPriceEl) {
    console.error("Кошик: відсутні необхідні елементи в DOM");
    return;
  }

  // Підтягуємо актуальні назви з products.json/products-en.json
  fetch(window.productsFile || "products.json")
    .then(res => res.json())
    .then(products => {
      cartItems.innerHTML = "";
      let total = 0;
      const currency = getTranslation('currency', 'грн');

      cart.forEach((item, i) => {
        const prod = products.find(p => p.url === item.url);
        const name = prod ? prod.name : getTranslation('cart_unknown', 'Товар');
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartItems.innerHTML += `
          <div>
            <strong>${name}</strong> — ${item.price} ${currency} × ${item.quantity} = ${itemTotal} ${currency}
            <span class="cart-actions">
              <button onclick="decreaseQuantity(${i})">➖</button>
              <button onclick="increaseQuantity(${i})">➕</button>
              <button onclick="removeItem(${i})">🗑️</button>
            </span>
          </div>`;
      });

      totalPriceEl.innerHTML = `<span data-i18n="cart_total">${getTranslation('cart_total', 'Разом:')}</span> ${total} <span data-i18n="currency">${currency}</span>`;

      cartOverlay.classList.add("open");
      cartModal.classList.add("open");
      hideArrows();
    });
}

// Закриття кошика
function closeCart() {
  const cartOverlay = document.getElementById("cartOverlay");
  const cartModal = document.getElementById("cartModal");
  if (cartOverlay && cartModal) {
    cartOverlay.classList.remove("open");
    cartModal.classList.remove("open");
  }
  showArrows();
}

// Додавання товару до кошика
function addToCart({ url, price }) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existingIndex = cart.findIndex(p => p.url === url);
  if (existingIndex !== -1) {
    cart[existingIndex].quantity++;
  } else {
    cart.push({ url, price, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showToast(getTranslation("cart_added", "Додано до кошика!"));
}

// Видалення товару з кошика
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  openCart();
}

// Збільшення кількості товару
function increaseQuantity(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart[index].quantity++;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  openCart();
}

// Зменшення кількості товару
function decreaseQuantity(index) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  openCart();
}

// Оформлення замовлення
function sendOrder() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (!cart.length) return showToast(getTranslation("cart_empty_msg", "Кошик порожній!"));

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const city = document.getElementById("customerCity").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  if (!name || !phone || !city || !address) {
    showToast(getTranslation("cart_fill_all", "Будь ласка, заповніть всі поля."));
    return;
  }

  fetch(window.productsFile || "products.json")
    .then(res => res.json())
    .then(products => {
      let message = `${getTranslation('order_from', 'Замовлення від')} ${name}\n📞 ${phone}\n🏙️ ${city}, 📦 ${address}\n\n`;
      let total = 0;
      const currency = getTranslation('currency', 'грн');

      cart.forEach(p => {
        const prod = products.find(prod => prod.url === p.url);
        const prodName = prod ? prod.name : getTranslation('cart_unknown', 'Товар');
        const itemTotal = p.price * p.quantity;
        message += `• ${prodName} — ${p.price} ${currency} × ${p.quantity} = ${itemTotal} ${currency}\n`;
        total += itemTotal;
      });
      message += `\n${getTranslation('cart_total', 'Разом:')} ${total} ${currency}`;

      const mail = `mailto:dima.soltus1998@gmail.com?subject=${encodeURIComponent(getTranslation('order_subject', 'Замовлення'))}&body=${encodeURIComponent(message)}`;
      window.open(mail, "_blank");

      localStorage.removeItem("cart");
      localStorage.removeItem("orderForm");
      updateCartCount();
      closeCart();
    });
}

// Оновлення лічильника кошика
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const counter = document.getElementById("cartCount");
  if (counter) {
    if (count > 0) {
      counter.textContent = count;
      counter.style.display = "inline-block";
      counter.parentElement.classList.add("cart-has-items");
    } else {
      counter.textContent = "";
      counter.style.display = "none";
      counter.parentElement.classList.remove("cart-has-items");
    }
  }
}

// Збереження даних форми замовлення
function saveFormData() {
  const formData = {
    name: document.getElementById("customerName").value,
    phone: document.getElementById("customerPhone").value,
    city: document.getElementById("customerCity").value,
    address: document.getElementById("customerAddress").value
  };
  localStorage.setItem("orderForm", JSON.stringify(formData));
}

// Показ повідомлення
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function hideArrows() {
  document.querySelectorAll('.product-arrow, .blog-arrow').forEach(el => el.classList.add('hidden'));
}
function showArrows() {
  document.querySelectorAll('.product-arrow, .blog-arrow').forEach(el => el.classList.remove('hidden'));
}

// Глобалізація функцій для доступу з HTML
window.openCart = openCart;
window.closeCart = closeCart;
window.addToCart = addToCart;
window.removeItem = removeItem;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.sendOrder = sendOrder;
window.saveFormData = saveFormData;
window.updateCartCount = updateCartCount;
window.insertCartModal = insertCartModal;
window.showToast = showToast;
window.restoreFormData = restoreFormData;