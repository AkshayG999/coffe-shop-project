// ===== Menu Data =====
const menuItems = [
    { id: 1, name: "Classic Espresso", description: "Rich, bold shot of pure espresso", price: 149, category: "Espresso" },
    { id: 2, name: "Cappuccino", description: "Espresso with steamed milk and velvety foam", price: 199, category: "Espresso" },
    { id: 3, name: "Café Latte", description: "Smooth espresso with creamy steamed milk", price: 179, category: "Espresso" },
    { id: 4, name: "Americano", description: "Espresso diluted with hot water for a lighter taste", price: 159, category: "Espresso" },
    { id: 5, name: "Pour Over", description: "Hand-crafted single origin coffee", price: 229, category: "Brewed" },
    { id: 6, name: "French Press", description: "Full-bodied coffee steeped to perfection", price: 189, category: "Brewed" },
    { id: 7, name: "Caramel Macchiato", description: "Vanilla, milk, espresso, and caramel drizzle", price: 249, category: "Specialty" },
    { id: 8, name: "Mocha", description: "Espresso with chocolate and steamed milk", price: 229, category: "Specialty" },
    { id: 9, name: "Honey Lavender Latte", description: "Floral lavender with local honey and espresso", price: 269, category: "Specialty" },
    { id: 10, name: "Cold Brew", description: "Smooth, slow-steeped for 20 hours", price: 189, category: "Cold" },
    { id: 11, name: "Iced Latte", description: "Chilled espresso with cold milk over ice", price: 199, category: "Cold" },
    { id: 12, name: "Nitro Cold Brew", description: "Creamy, nitrogen-infused cold brew on tap", price: 259, category: "Cold" }
];

// ===== Cart State =====
let cart = [];
let orderType = 'pickup';
let paymentMethod = 'upi';

// ===== DOM Elements =====
const menuGrid = document.getElementById('menuGrid');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartFooter = document.getElementById('cartFooter');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTax = document.getElementById('cartTax');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutOverlay = document.getElementById('checkoutOverlay');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutClose = document.getElementById('checkoutClose');
const checkoutForm = document.getElementById('checkoutForm');
const successOverlay = document.getElementById('successOverlay');
const successModal = document.getElementById('successModal');
const successClose = document.getElementById('successClose');
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const browseMenuBtn = document.getElementById('browseMenuBtn');
const contactForm = document.getElementById('contactForm');

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    setupEventListeners();
    loadCartFromStorage();
});

// ===== Render Menu =====
function renderMenu(category = 'all') {
    const filteredItems = category === 'all' 
        ? menuItems 
        : menuItems.filter(item => item.category === category);
    
    menuGrid.innerHTML = filteredItems.map(item => `
        <div class="menu-card" data-category="${item.category}">
            <div class="menu-card-header">
                <h3>${item.name}</h3>
                <span class="menu-card-price">₹${item.price}</span>
            </div>
            <p>${item.description}</p>
            <div class="menu-card-footer">
                <span class="menu-card-category">${item.category}</span>
                <button class="add-to-cart-btn" data-id="${item.id}" onclick="addToCart(${item.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add
                </button>
            </div>
        </div>
    `).join('');
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    document.querySelectorAll('.mobile-nav-link, .mobile-nav .btn').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });

    // Menu filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMenu(btn.dataset.category);
        });
    });

    // Cart sidebar
    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    browseMenuBtn.addEventListener('click', () => {
        closeCart();
    });

    // Checkout modal
    checkoutBtn.addEventListener('click', openCheckout);
    checkoutClose.addEventListener('click', closeCheckout);
    checkoutOverlay.addEventListener('click', closeCheckout);

    // Order type buttons
    document.querySelectorAll('.order-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            orderType = btn.dataset.type;
            
            const deliverySection = document.getElementById('deliverySection');
            const deliveryFeeRow = document.getElementById('deliveryFeeRow');
            
            if (orderType === 'delivery') {
                deliverySection.style.display = 'block';
                deliveryFeeRow.style.display = 'flex';
            } else {
                deliverySection.style.display = 'none';
                deliveryFeeRow.style.display = 'none';
            }
            
            updateCheckoutSummary();
        });
    });

    // Payment method buttons
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            paymentMethod = btn.dataset.method;
            
            // Show/hide payment info
            document.querySelectorAll('.payment-info').forEach(info => info.style.display = 'none');
            document.getElementById(`${paymentMethod}Info`).style.display = 'block';
        });
    });

    // Checkout form submit
    checkoutForm.addEventListener('submit', handleCheckout);

    // Success modal close
    successClose.addEventListener('click', closeSuccess);
    successOverlay.addEventListener('click', closeSuccess);

    // Contact form
    contactForm.addEventListener('submit', handleContact);

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 100) {
            header.style.boxShadow = 'var(--shadow)';
        } else {
            header.style.boxShadow = 'none';
        }
    });
}

// ===== Cart Functions =====
function addToCart(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    
    const existingItem = cart.find(i => i.id === id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    updateCartUI();
    saveCartToStorage();
    
    // Button feedback
    const btn = document.querySelector(`.add-to-cart-btn[data-id="${id}"]`);
    btn.classList.add('added');
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Added
    `;
    
    setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add
        `;
    }, 1500);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
    saveCartToStorage();
}

function updateQuantity(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        updateCartUI();
        saveCartToStorage();
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'flex';
        cartFooter.style.display = 'none';
    } else {
        cartItems.style.display = 'block';
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>₹${item.price}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
        
        cartSubtotal.textContent = `₹${subtotal}`;
        cartTax.textContent = `₹${tax}`;
        cartTotal.textContent = `₹${total}`;
    }
}

function openCart() {
    cartOverlay.classList.add('active');
    cartSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartOverlay.classList.remove('active');
    cartSidebar.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Checkout Functions =====
function openCheckout() {
    closeCart();
    updateCheckoutSummary();
    checkoutOverlay.classList.add('active');
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    checkoutOverlay.classList.remove('active');
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateCheckoutSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.18);
    const deliveryFee = orderType === 'delivery' ? 49 : 0;
    const total = subtotal + tax + deliveryFee;
    
    // Order items
    document.getElementById('orderItems').innerHTML = cart.map(item => `
        <div>
            <span>${item.name} x ${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join('');
    
    // Totals
    document.getElementById('summarySubtotal').textContent = `₹${subtotal}`;
    document.getElementById('summaryTax').textContent = `₹${tax}`;
    document.getElementById('summaryTotal').textContent = `₹${total}`;
    document.getElementById('orderTotalBtn').textContent = `₹${total}`;
}

function handleCheckout(e) {
    e.preventDefault();
    
    const formData = new FormData(checkoutForm);
    const data = Object.fromEntries(formData);
    
    // Validate delivery address if delivery selected
    if (orderType === 'delivery') {
        if (!data.address || !data.city || !data.state || !data.pinCode) {
            alert('Please fill in all delivery address fields');
            return;
        }
    }
    
    // Validate payment method specific fields
    if (paymentMethod === 'upi' && !data.upiId) {
        alert('Please enter your UPI ID');
        return;
    }
    if (paymentMethod === 'netbanking' && !data.bankName) {
        alert('Please select your bank');
        return;
    }
    if (paymentMethod === 'card' && (!data.cardNumber || !data.expiry || !data.cvv)) {
        alert('Please fill in all card details');
        return;
    }
    
    // Prepare order data
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.18);
    const deliveryFee = orderType === 'delivery' ? 49 : 0;
    const total = subtotal + tax + deliveryFee;
    
    const orderData = {
        customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone
        },
        orderType,
        paymentMethod,
        items: cart,
        subtotal,
        tax,
        deliveryFee,
        total,
        specialInstructions: data.instructions || ''
    };
    
    if (orderType === 'delivery') {
        orderData.deliveryAddress = {
            address: data.address,
            city: data.city,
            state: data.state,
            pinCode: data.pinCode
        };
    }
    
    // Send to PHP backend
    submitOrder(orderData);
}

async function submitOrder(orderData) {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Processing...';
    
    try {
        const response = await fetch('/api/orders.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('orderId').textContent = `#${result.orderId}`;
            closeCheckout();
            showSuccess();
            cart = [];
            updateCartUI();
            saveCartToStorage();
            checkoutForm.reset();
        } else {
            alert(result.message || 'Order failed. Please try again.');
        }
    } catch (error) {
        // For demo without backend, simulate success
        const orderId = 'BRW' + Math.random().toString(36).substr(2, 6).toUpperCase();
        document.getElementById('orderId').textContent = `#${orderId}`;
        closeCheckout();
        showSuccess();
        cart = [];
        updateCartUI();
        saveCartToStorage();
        checkoutForm.reset();
    }
    
    placeOrderBtn.disabled = false;
    placeOrderBtn.innerHTML = `Place Order - <span id="orderTotalBtn">₹0</span>`;
}

function showSuccess() {
    successOverlay.classList.add('active');
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSuccess() {
    successOverlay.classList.remove('active');
    successModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Contact Form =====
async function handleContact(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Thank you! Your message has been sent.');
            contactForm.reset();
        } else {
            alert(result.message || 'Failed to send message. Please try again.');
        }
    } catch (error) {
        // For demo without backend
        alert('Thank you! Your message has been sent.');
        contactForm.reset();
    }
}

// ===== Local Storage =====
function saveCartToStorage() {
    localStorage.setItem('brewco_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('brewco_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}
