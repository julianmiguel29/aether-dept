
/* AETHER DEPT. - MAIN SCRIPT */

/* STORAGE */

function loadStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
}

let cart = loadStorage("commonThreadCart", []);
let wishlist = loadStorage("commonThreadWishlist", []);
let orderHistory = loadStorage("commonThreadOrders", []);

if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(wishlist)) wishlist = [];
if (!Array.isArray(orderHistory)) orderHistory = [];

function saveCart() {
    localStorage.setItem("commonThreadCart", JSON.stringify(cart));
}

function saveWishlist() {
    localStorage.setItem("commonThreadWishlist", JSON.stringify(wishlist));
}

function saveOrderHistory() {
    localStorage.setItem("commonThreadOrders", JSON.stringify(orderHistory));
}

function formatPrice(value) {
    return `₱${Number(value || 0).toFixed(2)}`;
}

/* ELEMENTS */

const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutForm = document.getElementById("checkout-form");
const orderMessage = document.getElementById("order-message");

const wishlistItems = document.getElementById("wishlist-items");
const wishlistCount = document.getElementById("wishlist-count");

const orderHistoryList = document.getElementById("order-history-list");
const orderCount = document.getElementById("order-count");

const productCards = document.querySelectorAll(".product-card");

/* PRODUCT INFORMATION */

const productDescriptions = {
    "Oversized Graphic Tee":
        "Make a statement without saying a word. An oversized everyday graphic tee designed for comfort and effortless streetwear styling.",

    "Essential Boxy Shirt":
        "A clean and versatile everyday essential. Its boxy silhouette makes it easy to style with your favorite casual pieces.",

    "Everyday Cargo Pants":
        "Built for everyday movement and utility-inspired style. These cargo pants bring a relaxed silhouette to your daily rotation.",

    "Classic Street Hoodie":
        "A comfortable streetwear staple for everyday layering. Simple, versatile, and made to complement your personal style."
};

/* SHOPPING CART */

function addToCart(name, price, size) {
    const existingItem = cart.find(item =>
        item.name === name &&
        String(item.size || "M") === String(size)
    );

    if (existingItem) {
        existingItem.quantity = Math.max(1, Number(existingItem.quantity) || 1) + 1;
    } else {
        cart.push({
            name,
            price: Number(price),
            size,
            quantity: 1
        });
    }

    updateCart();
}

function updateCart() {
    if (!cartItems || !cartCount || !cartTotal) return;

    let totalItems = 0;
    let totalPrice = 0;

    cartItems.replaceChildren();

    if (cart.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cart";
        emptyMessage.textContent = "Your cart is currently empty.";
        cartItems.appendChild(emptyMessage);
    }

    cart.forEach((item, index) => {
        const size = item.size || "M";
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const price = Number(item.price) || 0;

        item.quantity = quantity;
        item.price = price;

        totalItems += quantity;
        totalPrice += price * quantity;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        const itemInfo = document.createElement("div");
        itemInfo.className = "cart-item-info";

        const itemName = document.createElement("h3");
        itemName.textContent = item.name;

        const itemPrice = document.createElement("p");
        itemPrice.textContent = `${formatPrice(price)} each`;

        const itemSize = document.createElement("p");
        itemSize.className = "cart-item-size";
        itemSize.textContent = `Size: ${size}`;

        itemInfo.append(itemName, itemPrice, itemSize);

        const controls = document.createElement("div");
        controls.className = "cart-item-controls";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.className = "quantity-button";
        decreaseButton.textContent = "−";
        decreaseButton.dataset.action = "decrease";
        decreaseButton.dataset.index = index;
        decreaseButton.setAttribute("aria-label", "Decrease quantity");

        const quantityDisplay = document.createElement("span");
        quantityDisplay.textContent = quantity;

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.className = "quantity-button";
        increaseButton.textContent = "+";
        increaseButton.dataset.action = "increase";
        increaseButton.dataset.index = index;
        increaseButton.setAttribute("aria-label", "Increase quantity");

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-button";
        removeButton.textContent = "REMOVE";
        removeButton.dataset.action = "remove";
        removeButton.dataset.index = index;

        controls.append(
            decreaseButton,
            quantityDisplay,
            increaseButton,
            removeButton
        );

        cartItem.append(itemInfo, controls);
        cartItems.appendChild(cartItem);
    });

    cartCount.textContent = totalItems;
    cartTotal.textContent = formatPrice(totalPrice);

    saveCart();
}

/* ADD TO CART BUTTONS */

document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
        const card = button.closest(".product-card");
        if (!card) return;

        const name = button.dataset.name;
        const price = Number(button.dataset.price);
        const sizeSelect = card.querySelector(".product-size");

        if (!name || !Number.isFinite(price) || !sizeSelect) return;

        addToCart(name, price, sizeSelect.value);

        const originalText = "ADD TO CART";
        button.textContent = "ADDED TO CART";
        button.disabled = true;

        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 900);
    });
});

/* CART QUANTITY AND REMOVAL */

if (cartItems) {
    cartItems.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        const index = Number(button.dataset.index);
        const action = button.dataset.action;

        if (!Number.isInteger(index) || !cart[index]) return;

        if (action === "increase") {
            cart[index].quantity = (Number(cart[index].quantity) || 1) + 1;
        }

        if (action === "decrease") {
            cart[index].quantity = (Number(cart[index].quantity) || 1) - 1;

            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
        }

        if (action === "remove") {
            cart.splice(index, 1);
        }

        updateCart();
    });
}

/* WISHLIST */

function updateWishlistButtons() {
    productCards.forEach(card => {
        const nameElement = card.querySelector(".product-info h3");
        const button = card.querySelector(".wishlist-button");

        if (!nameElement || !button) return;

        const name = nameElement.textContent.trim();
        const saved = wishlist.includes(name);

        button.classList.toggle("saved", saved);
        button.textContent = saved ? "♥" : "♡";
        button.setAttribute("aria-pressed", String(saved));
        button.setAttribute(
            "aria-label",
            `${saved ? "Remove" : "Add"} ${name} ${saved ? "from" : "to"} wishlist`
        );
    });
}

function updateWishlist() {
    if (!wishlistItems || !wishlistCount) return;

    wishlistItems.replaceChildren();
    wishlistCount.textContent = `${wishlist.length} SAVED`;

    if (wishlist.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cart";
        emptyMessage.textContent = "You haven't saved any products yet.";
        wishlistItems.appendChild(emptyMessage);
    }

    wishlist.forEach(name => {
        const card = [...productCards].find(product => {
            const heading = product.querySelector(".product-info h3");
            return heading && heading.textContent.trim() === name;
        });

        if (!card) return;

        const price = Number(card.querySelector(".add-to-cart")?.dataset.price) || 0;

        const wishlistCard = document.createElement("div");
        wishlistCard.className = "wishlist-card";

        const title = document.createElement("h3");
        title.textContent = name;

        const priceText = document.createElement("p");
        priceText.textContent = formatPrice(price);

        const actions = document.createElement("div");
        actions.className = "wishlist-card-actions";

        const shopButton = document.createElement("button");
        shopButton.type = "button";
        shopButton.className = "wishlist-add";
        shopButton.textContent = "SHOP NOW";

        shopButton.addEventListener("click", () => {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            card.querySelector(".product-size")?.focus();
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "wishlist-remove";
        removeButton.textContent = "REMOVE";

        removeButton.addEventListener("click", () => {
            wishlist = wishlist.filter(item => item !== name);
            saveWishlist();
            updateWishlist();
        });

        actions.append(shopButton, removeButton);
        wishlistCard.append(title, priceText, actions);
        wishlistItems.appendChild(wishlistCard);
    });

    saveWishlist();
    updateWishlistButtons();
}

document.querySelectorAll(".wishlist-button").forEach(button => {
    button.addEventListener("click", () => {
        const card = button.closest(".product-card");
        const heading = card?.querySelector(".product-info h3");

        if (!heading) return;

        const name = heading.textContent.trim();

        if (wishlist.includes(name)) {
            wishlist = wishlist.filter(item => item !== name);
        } else {
            wishlist.push(name);
        }

        updateWishlist();
    });
});

/* PRODUCT DETAILS MODAL */

const productModal = document.getElementById("product-modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalImage = document.getElementById("modal-image");
const modalName = document.getElementById("modal-name");
const modalPrice = document.getElementById("modal-price");
const modalDescription = document.getElementById("modal-description");
const modalSize = document.getElementById("modal-size");
const modalShopButton = document.getElementById("modal-shop-button");

let selectedProduct = null;

const modalElementsExist = Boolean(
    productModal &&
    modalOverlay &&
    modalClose &&
    modalImage &&
    modalName &&
    modalPrice &&
    modalDescription &&
    modalSize &&
    modalShopButton
);

function closeProductModal() {
    if (!productModal) return;

    productModal.hidden = true;
    document.body.classList.remove("modal-open");
    selectedProduct = null;
}

function openProductModal(card) {
    if (!modalElementsExist || !card) return;

    const nameElement = card.querySelector(".product-info h3");
    const addButton = card.querySelector(".add-to-cart");
    const image = card.querySelector(".product-image img");
    const sizeSelect = card.querySelector(".product-size");

    if (!nameElement || !addButton || !image || !sizeSelect) return;

    selectedProduct = card;

    const name = nameElement.textContent.trim();
    const price = Number(addButton.dataset.price);

    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modalName.textContent = name;
    modalPrice.textContent = formatPrice(price);
    modalDescription.textContent = productDescriptions[name] || "";

    modalSize.replaceChildren();

    Array.from(sizeSelect.options).forEach(option => {
        const newOption = document.createElement("option");
        newOption.value = option.value;
        newOption.textContent = option.textContent;
        newOption.selected = option.value === sizeSelect.value;
        modalSize.appendChild(newOption);
    });

    productModal.hidden = false;
    document.body.classList.add("modal-open");
    modalClose.focus();
}

if (modalElementsExist) {
    document.querySelectorAll(".view-details").forEach(button => {
        button.addEventListener("click", () => {
            openProductModal(button.closest(".product-card"));
        });
    });

    modalClose.addEventListener("click", closeProductModal);
    modalOverlay.addEventListener("click", closeProductModal);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !productModal.hidden) {
            closeProductModal();
        }
    });

    modalShopButton.addEventListener("click", () => {
        if (!selectedProduct) return;

        const name = selectedProduct.querySelector(".product-info h3")?.textContent.trim();
        const price = Number(selectedProduct.querySelector(".add-to-cart")?.dataset.price);
        const size = modalSize.value;

        if (!name || !Number.isFinite(price)) return;

        const cardSize = selectedProduct.querySelector(".product-size");
        if (cardSize) cardSize.value = size;

        addToCart(name, price, size);

        modalShopButton.textContent = "ADDED TO CART";
        modalShopButton.disabled = true;

        setTimeout(() => {
            modalShopButton.textContent = "ADD TO CART";
            modalShopButton.disabled = false;
            closeProductModal();
        }, 700);
    });
}

/* ORDER HISTORY */

function updateOrderHistory() {
    if (!orderHistoryList || !orderCount) return;

    orderHistoryList.replaceChildren();
    orderCount.textContent = `${orderHistory.length} ORDERS`;

    if (orderHistory.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cart";
        emptyMessage.textContent = "Your order history will appear here.";
        orderHistoryList.appendChild(emptyMessage);
        return;
    }

    orderHistory.slice().reverse().forEach(order => {
        const orderCard = document.createElement("div");
        orderCard.className = "order-history-card";

        const top = document.createElement("div");
        top.className = "order-history-top";

        const orderInfo = document.createElement("div");

        const orderTitle = document.createElement("h3");
        orderTitle.textContent = `ORDER ${order.id}`;

        const orderDate = document.createElement("p");
        orderDate.textContent = order.date;

        orderInfo.append(orderTitle, orderDate);

        const orderStatus = document.createElement("p");
        orderStatus.textContent = "PLACED";

        top.append(orderInfo, orderStatus);

        const products = document.createElement("div");
        products.className = "order-history-products";

        (order.items || []).forEach(item => {
            const product = document.createElement("p");
            product.textContent =
                `${item.name} — Size: ${item.size || "M"} × ${item.quantity}`;
            products.appendChild(product);
        });

        const payment = document.createElement("p");
        payment.textContent = `Payment: ${order.payment}`;

        const total = document.createElement("p");
        total.className = "order-history-total";
        total.textContent = `Total: ${formatPrice(order.total)}`;

        orderCard.append(top, products, payment, total);
        orderHistoryList.appendChild(orderCard);
    });
}

/* CHECKOUT */

if (checkoutForm) {
    checkoutForm.addEventListener("submit", event => {
        event.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty. Please add a product before checking out.");
            return;
        }

        if (!checkoutForm.reportValidity()) return;

        const customerName = document.getElementById("customer-name")?.value.trim();
        const customerEmail = document.getElementById("customer-email")?.value.trim();
        const customerPhone = document.getElementById("customer-phone")?.value.trim();
        const customerAddress = document.getElementById("customer-address")?.value.trim();
        const paymentMethod = document.getElementById("payment-method")?.value;

        if (
            !customerName ||
            !customerEmail ||
            !customerPhone ||
            !customerAddress ||
            !paymentMethod
        ) {
            alert("Please complete all checkout details.");
            return;
        }

        const orderItems = cart.map(item => ({
            name: item.name,
            price: Number(item.price),
            size: item.size || "M",
            quantity: Math.max(1, Number(item.quantity) || 1)
        }));

        const orderTotal = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const orderId = "CT-" + Date.now().toString().slice(-8);

        const orderDate = new Date().toLocaleString("en-PH", {
            dateStyle: "medium",
            timeStyle: "short"
        });

        const order = {
            id: orderId,
            date: orderDate,
            customer: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
            items: orderItems,
            total: orderTotal,
            payment: paymentMethod
        };

        orderHistory.push(order);
        saveOrderHistory();

        if (orderMessage) {
            const heading = document.createElement("h3");
            heading.textContent = "ORDER CONFIRMED!";

            const greeting = document.createElement("p");
            greeting.textContent =
                `Thank you, ${customerName}! Your order has been successfully placed.`;

            const number = document.createElement("p");
            number.textContent = `Order Number: ${orderId}`;

            const itemsHeading = document.createElement("strong");
            itemsHeading.textContent = "YOUR ORDER";

            const itemsContainer = document.createElement("div");
            itemsContainer.className = "order-items";
            itemsContainer.appendChild(itemsHeading);

            orderItems.forEach(item => {
                const details = document.createElement("p");
                details.textContent =
                    `${item.name} — Size: ${item.size} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`;
                itemsContainer.appendChild(details);
            });

            const total = document.createElement("p");
            total.textContent = `Order Total: ${formatPrice(orderTotal)}`;

            const payment = document.createElement("p");
            payment.textContent = `Payment Method: ${paymentMethod}`;

            const motivation = document.createElement("p");
            motivation.className = "order-motivation";
            motivation.textContent =
                "KEEP SHOWING UP AS YOU. Your style is your own. Wear what makes you feel confident, move at your own pace, and never be afraid to stand apart. Thank you for being part of AETHER DEPT.";

            orderMessage.replaceChildren(
                heading,
                greeting,
                number,
                itemsContainer,
                total,
                payment,
                motivation
            );

            orderMessage.hidden = false;
        }

        cart = [];
        saveCart();
        updateCart();
        updateOrderHistory();

        checkoutForm.reset();

        if (orderMessage) {
            orderMessage.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        } else {
            alert(`Order ${orderId} successfully placed!`);
        }
    });
} else {
    console.error("Checkout form not found. Check that index.html contains id='checkout-form'.");
}

/* INITIALIZE WEBSITE */

updateCart();
updateWishlist();
updateOrderHistory();

console.log("AETHER DEPT. website initialized successfully.");
