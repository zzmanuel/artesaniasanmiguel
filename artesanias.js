const WHATSAPP_NUMBER = "50376889089";

const storeAbout =
  "Raíces SV reúne artesanía salvadoreña elaborada por manos locales. Trabajamos para impulsar a los artesanos y preservar las técnicas tradicionales de cada comunidad.";

const products = [
  {
    id: 1,
    name: "Miniatura de casa colonial",
    category: "Cerámica",
    origin: "Ilobasco, Cabañas",
    price: 18,
    image: "miniatura colonial.jpg",
    description: "Representación artesanal de una vivienda tradicional, pintada a mano con detalles de la arquitectura salvadoreña.",
    fact: "Ilobasco es reconocida por su tradición ceramista y sus pequeñas figuras conocidas como miniaturas."
  },
  {
    id: 2,
    name: "Vajilla de barro pintada",
    category: "Cerámica",
    origin: "La Campana, La Libertad",
    price: 32,
    image: "valliga.jpg",
    description: "Juego de platos y recipiente decorados con motivos vegetales inspirados en la artesanía local.",
    fact: "El barro cocido ha acompañado la vida cotidiana salvadoreña desde tiempos precolombinos."
  },
  {
    id: 3,
    name: "Manta tejida con tintes naturales",
    category: "Textiles",
    origin: "Nahuizalco, Sonsonate",
    price: 28,
    image: "manta tejida.jpg",
    description: "Manta suave elaborada en telar con patrones geométricos y tonos inspirados en la naturaleza.",
    fact: "Los telares tradicionales combinan diseños heredados con la creatividad de cada familia artesana."
  },
  {
    id: 4,
    name: "Bolsa artesanal de fibra",
    category: "Fibras naturales",
    origin: "San Sebastián, San Vicente",
    price: 22,
    image: "bolsa artesanal.jpg",
    description: "Bolsa resistente tejida a mano, con asas reforzadas y acabados naturales para uso diario.",
    fact: "El tejido en fibras naturales aprovecha materiales renovables y técnicas transmitidas por generaciones."
  },
  {
    id: 5,
    name: "Cofre tallado en madera",
    category: "Madera",
    origin: "Concepción de Ataco, Ahuachapán",
    price: 45,
    image: "Cofre tallado en madera.jpg",
    description: "Cofre decorativo tallado a mano, ideal para guardar recuerdos y pequeños objetos especiales.",
    fact: "Los detalles tallados suelen tomar referencias de la flora, fauna y paisajes de la región."
  },
  {
    id: 6,
    name: "Juguete de madera pintado",
    category: "Otros",
    origin: "Ilobasco, Cabañas",
    price: 12,
    image: "Juguete de madera pintado.jpg",
    description: "Figura infantil pintada a mano con colores alegres y acabados resistentes.",
    fact: "Los juguetes tradicionales de Ilobasco son una expresión lúdica de la cerámica y la cultura local."
  }
];

const grid = document.querySelector("#grid");
const empty = document.querySelector("#empty");
const searchInput = document.querySelector("#search");
const filterButtons = [...document.querySelectorAll(".filter")];
const productDialog = document.querySelector("#productDialog");
const cartDialog = document.querySelector("#cartDialog");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");

let activeCategory = "Todas";
let selectedProductId = null;
let cart = loadCart();

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem("raices-sv-cart"));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("raices-sv-cart", JSON.stringify(cart));
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function productImage(product) {
  if (product.image) {
    return `<img class="card-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">`;
  }

  const symbols = { Cerámica: "◉", Textiles: "▧", Madera: "▤", "Fibras naturales": "◇", Otros: "✦" };
  return `<div class="image-placeholder" role="img" aria-label="${escapeHtml(product.name)}">${symbols[product.category] || "✦"}</div>`;
}

function renderCatalog() {
  const search = searchInput.value.trim().toLocaleLowerCase("es");
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "Todas" || product.category === activeCategory;
    const searchableText = `${product.name} ${product.category} ${product.origin}`.toLocaleLowerCase("es");
    return matchesCategory && searchableText.includes(search);
  });

  grid.innerHTML = visibleProducts.map((product) => `
    <article class="card">
      ${productImage(product)}
      <div class="card-body">
        <span class="tag">${escapeHtml(product.category)}</span>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="origin">${escapeHtml(product.origin)}</p>
        <p class="card-description">${escapeHtml(product.description)}</p>
        <p class="price">${formatPrice(product.price)}</p>
        <div class="card-actions">
          <button class="details" type="button" data-details="${product.id}">Ver detalles</button>
          <button class="button" type="button" data-add="${product.id}">Agregar</button>
        </div>
      </div>
    </article>
  `).join("");

  empty.hidden = visibleProducts.length !== 0;
}

function openProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  selectedProductId = product.id;
  document.querySelector("#dialogCategory").textContent = product.category;
  document.querySelector("#productDialogTitle").textContent = product.name;
  document.querySelector("#dialogOrigin").textContent = product.origin;
  document.querySelector("#dialogDescription").textContent = product.description;
  document.querySelector("#dialogFact").textContent = product.fact;
  document.querySelector("#dialogPrice").textContent = formatPrice(product.price);
  productDialog.showModal();
}

function addToCart(id) {
  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function changeQuantity(id, change) {
  const item = cart.find((cartItem) => cartItem.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((cartItem) => cartItem.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find((catalogProduct) => catalogProduct.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartCount.textContent = quantity;
  cartTotal.textContent = formatPrice(total);
  document.querySelector("#clearCart").disabled = cart.length === 0;
  document.querySelector("#checkout").disabled = cart.length === 0;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
    return;
  }

  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((catalogProduct) => catalogProduct.id === item.id);
    if (!product) return "";

    return `
      <div class="cart-row">
        <div>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${formatPrice(product.price)} c/u</p>
          <div class="quantity-controls" aria-label="Cantidad de ${escapeHtml(product.name)}">
            <button type="button" data-minus="${product.id}" aria-label="Reducir cantidad">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-plus="${product.id}" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-remove="${product.id}">Eliminar</button>
      </div>
    `;
  }).join("");
}

function checkout() {
  if (cart.length === 0) return;

  const lines = cart.map((item) => {
    const product = products.find((catalogProduct) => catalogProduct.id === item.id);
    return product ? `- ${product.name} x${item.quantity}: ${formatPrice(product.price * item.quantity)}` : "";
  }).filter(Boolean);

  const total = cart.reduce((sum, item) => {
    const product = products.find((catalogProduct) => catalogProduct.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const message = `Hola, quiero realizar este pedido en Raíces SV:\n\n${lines.join("\n")}\n\nTotal: ${formatPrice(total)}\nNombre: \nDirección o punto de entrega: `;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach((filter) => {
      const isActive = filter === button;
      filter.classList.toggle("active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });
    renderCatalog();
  });
});

searchInput.addEventListener("input", renderCatalog);
grid.addEventListener("click", (event) => {
  const detailsButton = event.target.closest("[data-details]");
  const addButton = event.target.closest("[data-add]");
  if (detailsButton) openProduct(Number(detailsButton.dataset.details));
  if (addButton) addToCart(Number(addButton.dataset.add));
});

cartItems.addEventListener("click", (event) => {
  const minusButton = event.target.closest("[data-minus]");
  const plusButton = event.target.closest("[data-plus]");
  const removeButton = event.target.closest("[data-remove]");
  if (minusButton) changeQuantity(Number(minusButton.dataset.minus), -1);
  if (plusButton) changeQuantity(Number(minusButton.dataset.plus), 1);
  if (removeButton) removeFromCart(Number(removeButton.dataset.remove));
});

document.querySelector("#openCart").addEventListener("click", () => cartDialog.showModal());
document.querySelector("#closeProduct").addEventListener("click", () => productDialog.close());
document.querySelector("#closeCart").addEventListener("click", () => cartDialog.close());
document.querySelector("#dialogAdd").addEventListener("click", () => {
  addToCart(selectedProductId);
  productDialog.close();
});
document.querySelector("#clearCart").addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
});
document.querySelector("#checkout").addEventListener("click", checkout);
[productDialog, cartDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelector("#storeAbout").textContent = storeAbout;
document.querySelector("#year").textContent = new Date().getFullYear();
renderCatalog();
renderCart();
