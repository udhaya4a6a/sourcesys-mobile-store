// ================= PRODUCTS =================
const products = [
  { id: 1, name: "iPhone 15", price: 80000, img: "images/Apple Iphone 15.jpg" },
  { id: 2, name: "iphone 14", price: 75000, img: "images/apple iphone 14.jpg" },
  { id: 3, name: "iphone 17 Pro Max", price: 60000, img: "images/apple iphone 17 pro max.jpg" },
  { id: 4, name: "Samsung S25 Ultra", price: 72000, img: "images/Samsung S25 Ultra.jpg" },
  { id: 5, name: "vivo X200 ultra", price: 68000, img: "images/vivo X200 ultra.jpg" },
  { id: 6, name: "OnePlus 11R", price: 45000, img: "images/onePlus 11R.jpg" },
  { id: 7, name: "Redmi Note 13 Pro", price: 28000, img: "images/Redmi Note 13 Pro.jpg" },
  { id: 8, name: "Realme GT Neo 3", price: 32000, img: "images/Realme GT Neo 3.jpg" },
  { id: 9, name: "Google Pixel 8", price: 70000, img: "images/Google Pixel 8.jpg" },
  { id: 10, name: "iQOO Neo 9 Pro", price: 36000, img: "images/iQOO Neo 9 Pro.jpg" },
  { id: 11, name: "Vivo X100 Pro", price: 89000, img: "images/Vivo X100 Pro.jpg" },
  { id: 12, name: "Oppo Reno 11", price: 42000, img: "images/Oppo Reno 11.jpg" },
  { id: 13, name: "Nothing Phone 2", price: 45000, img: "images/Nothing Phone 2.jpg" },
  { id: 14, name: "Motorola Edge 40", price: 30000, img: "images/Motorola Edge 40.jpg" },
  { id: 15, name: "Asus ROG Phone 7", price: 74000, img: "images/Asus ROG Phone 7.jpg" },
  { id: 16, name: "Sony Xperia 1 V", price: 98000, img: "images/Sony Xperia 1 V.jpg" },
  { id: 17, name: "Infinix Zero 30", price: 23000, img: "images/Infinix Zero 30.jpg" },
  { id: 18, name: "Tecno Phantom X2", price: 39000, img: "images/Tecno Phantom X2.jpg" },
  { id: 19, name: "Lava Agni 2", price: 20000, img: "images/Lava Agni 2.jpg" },
  { id: 20, name: "Samsung Galaxy A55", price: 35000, img: "images/Samsung Galaxy A55.jpg" }
];

// ================= CART =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = document.getElementById("cart-count");

function updateCartCount() {
  if (cartCount) cartCount.innerText = cart.length;
}
updateCartCount();

// ================= RENDER PRODUCTS =================
const productContainer = document.getElementById("products");

function renderProducts(list) {
  if (!productContainer) return;

  productContainer.innerHTML = "";

  list.forEach(p => {
    productContainer.innerHTML += `
      <div class="card">
        <img src="${p.img}" alt="${p.name}"
          onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">

        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <button onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="details-btn"
          onclick="openDetails(${JSON.stringify(p).replace(/"/g,'&quot;')})">
          View Details
        </button>
      </div>
    `;
  });
}

renderProducts(products);

// ================= ADD TO CART =================
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// ================= SEARCH =================
const searchInput = document.getElementById("search");

if (searchInput) {
  searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(value)
    );
    renderProducts(filtered);
  });
}

// ================= NAVBAR SCROLL =================
const navbar = document.querySelector(".navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  });
}

// ================= HERO BUTTON =================
function goToShop() {
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

// ================= DETAILS MODAL =================
function openDetails(product) {
  document.getElementById("detailsImg").src = product.img;
  document.getElementById("detailsName").innerText = product.name;
  document.getElementById("detailsPrice").innerText = "₹" + product.price;
  document.getElementById("detailsModal").style.display = "flex";
}

function closeDetails() {
  document.getElementById("detailsModal").style.display = "none";
}

// ================= CART PAGE =================
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");

function renderCartPage() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    cartItemsContainer.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}">
        <h4>${item.name}</h4>
        <p>₹${item.price}</p>

        <div class="cart-actions">
          <button onclick="removeFromCart(${index})">❌ Remove</button>
        </div>
      </div>
    `;
  });

  cartTotalEl.innerText = total;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCartPage();
}

// Auto load when cart.html opens
renderCartPage();
