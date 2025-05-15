window.justOpened = false;

// Вставка HTML модального кошика
function insertCartModal() {
  const cartHTML = `
    <div id="cartOverlay" class="cart-overlay">
      <div id="cartModal" class="cartmodal">
        <h2>🛒 Ваш кошик</h2>
        <div id="cartItems" class="cart-items"></div>
        <p class="cart-total"><span id="totalPrice">0 грн</span></p>
        <hr>
        <h3>📦 Інформація про замовника</h3>
        <form id="orderForm" autocomplete="on">
          <input type="text" id="customerName" placeholder="Ім’я та Прізвище" required>
          <input type="tel" id="customerPhone" placeholder="Номер телефону" required pattern="^\\+?[\\d\\s\\-]{10,15}$">
          <input type="text" id="customerCity" placeholder="Місто" required>
          <input type="text" id="customerAddress" placeholder="Номер відділення" required>
          <div class="cart-buttons">
            <button type="button" class="honey-btn" onclick="sendOrder()">🍯 Замовити</button>
            <button type="button" class="honey-btn cancel" onclick="closeCart()">❌ Закрити</button>
          </div>    
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", cartHTML);

  // Відновлення даних форми після вставки HTML
  restoreFormData();

  // Додаємо автозбереження при зміні полів
  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    orderForm.addEventListener("input", saveFormData);
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
  const cartItems = document.getElementById("cartItems");
  const totalPriceEl = document.getElementById("totalPrice");

  if (!cartOverlay || !cartItems || !totalPriceEl) {
    console.error("Кошик: відсутні необхідні елементи в DOM");
    return;
  }

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    cartItems.innerHTML += `
      <div>
        <strong>${item.name}</strong> — ${item.price} грн × ${item.quantity} = ${itemTotal} грн
        <button onclick="decreaseQuantity(${i})">➖</button>
        <button onclick="increaseQuantity(${i})">➕</button>
        <button onclick="removeItem(${i})">🗑️</button>
      </div>`;
  });

  totalPriceEl.textContent = `Разом: ${total} грн`;
  cartOverlay.style.display = "block";
}

// Закриття кошика
function closeCart() {
  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) {
    cartOverlay.style.display = "none";
  }
}

// Додавання товару до кошика
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const existingIndex = cart.findIndex(p => p.name === product.name);

  if (existingIndex !== -1) {
    cart[existingIndex].quantity++;
  } else {
    product.quantity = 1;
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showToast("Додано до кошика!");
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
  if (!cart.length) return showToast("Кошик порожній!");

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const city = document.getElementById("customerCity").value.trim();
  const address = document.getElementById("customerAddress").value.trim();

  if (!name || !phone || !city || !address) {
    showToast("Будь ласка, заповніть всі поля.");
    return;
  }

  let message = `Замовлення від ${name}\n📞 ${phone}\n🏙️ ${city}, 📦 ${address}\n\n`;
  let total = 0;

  cart.forEach(p => {
    const itemTotal = p.price * p.quantity;
    message += `• ${p.name} — ${p.price} грн × ${p.quantity} = ${itemTotal} грн\n`;
    total += itemTotal;
  });
  message += `\nРазом: ${total} грн`;

  const mail = `mailto:dima.soltus1998@gmail.com?subject=Замовлення&body=${encodeURIComponent(message)}`;
  window.open(mail, "_blank");

  localStorage.removeItem("cart");
  localStorage.removeItem("orderForm"); // ОЧИЩЕННЯ ДАНИХ ФОРМИ
  updateCartCount();
  closeCart();
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
    } else {
      counter.textContent = "";
      counter.style.display = "none";
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