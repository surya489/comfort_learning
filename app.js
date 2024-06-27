document.addEventListener('DOMContentLoaded', () => {
    const cart = document.querySelector('.cart');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const menuSidebar = document.querySelector('.menu-sidebar');
    const closeCart = document.querySelector('.close-cart');
    const closeMenu = document.querySelector('.close-menu');
    const cartItemsTotal = document.querySelector('.noi');
    const cartPriceTotal = document.querySelector('.total-amount');
    const cartContent = document.querySelector('.cart-content');
    const clearBtn = document.querySelector('.clear-cart-btn');
    const burgerMenu = document.querySelector('.burger');
    let Cart = [];
    let buttonsDOM = [];

    cart.addEventListener('click', function () {
        cartSidebar.style.transform = "translate(0%)";
        const bodyOverlay = document.createElement("div");
        bodyOverlay.classList.add("overlay");
        setTimeout(() => {
            document.querySelector("body").append(bodyOverlay);
        }, 300);
    });

    closeCart.addEventListener('click', function () {
        cartSidebar.style.transform = "translate(100%)";
        const bodyOverlay = document.querySelector(".overlay");
        if (bodyOverlay) {
            document.querySelector("body").removeChild(bodyOverlay);
        }
    });

    burgerMenu.addEventListener('click', function() {
        const lines = burgerMenu.querySelector('.lines');
        lines.classList.add('menuOpen');
        menuSidebar.style.transform = "translate(0%)";
        const bodyOverlay = document.createElement("div");
        bodyOverlay.classList.add("overlay");
        setTimeout(() => {
            document.querySelector("body").append(bodyOverlay);
        }, 300);
    });

    closeMenu.addEventListener('click', function () {
        const lines = burgerMenu.querySelector('.lines');
        if (lines.classList.contains('menuOpen')) {
            lines.classList.remove('menuOpen');
        }
        menuSidebar.style.transform = "translate(100%)";
        const bodyOverlay = document.querySelector(".overlay");
        if (bodyOverlay) {
            document.querySelector("body").removeChild(bodyOverlay);
        }
    });

    class Product {
        async getProduct() {
            const response = await fetch("products.json");
            const data = await response.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image };
            });
            return products;
        }
    }

    class UI {
        displayProducts(products) {
            let result = "";
            products.forEach(product => {
                const productDiv = document.createElement("div");
                productDiv.innerHTML = `<div class="product-card">
                                            <img src="${product.image}" alt="product" />
                                            <div class='add-to-cart-wrap'>
                                                <button class="add-to-cart" data-id="${product.id}">
                                                    <i class="fa fa-cart-plus fa-1x" style="margin-right: 0.1em; font-size: 1em;"></i>
                                                    Add To Cart
                                                </button>
                                            </div>
                                            <div class="product-details-wrap">
                                                <div class="product-name">${product.title}</div>
                                                <div class="product-pricing">$${product.price}</div>
                                            </div>
                                        </div>`;
                const p = document.querySelector('.product');
                productDiv.classList.add('product-card-wrap');
                p.append(productDiv);
            });
            this.updateButtonsState();
        }

        getButton() {
            const btns = document.querySelectorAll('.add-to-cart');
            buttonsDOM = [...btns];
            this.updateButtonsState();
            btns.forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    let id = e.currentTarget.dataset.id;
                    e.currentTarget.innerHTML = "In Cart";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.disabled = true;
                    let cartItem = { ...Storage.getStorageProducts(id), amount: 1 };
                    Cart.push(cartItem);
                    Storage.saveCart(Cart);
                    this.setCartValues(Cart);
                    this.addCartItem(cartItem);
                    this.updateButtonsState();
                });
            });
        }

        updateButtonsState() {
            buttonsDOM.forEach((btn) => {
                let id = btn.dataset.id;
                let inCart = Cart.find((item) => item.id === id);
                if (inCart) {
                    btn.classList.add('disabled');
                    btn.classList.remove('enabled');
                    btn.innerHTML = "In Cart";
                    btn.disabled = true;
                } else {
                    btn.classList.add('enabled');
                    btn.classList.remove('disabled');
                    btn.innerHTML = '<i class="fa fa-cart-plus"></i>Add to Cart';
                    btn.disabled = false;
                }
            });
        }

        setCartValues() {
            let tempTotal = 0;
            let itemsTotal = 0;
            Cart.forEach(item => {
                tempTotal += item.price * item.amount;
                itemsTotal += item.amount;
            });
            cartItemsTotal.innerHTML = itemsTotal;
            cartPriceTotal.innerHTML = parseFloat(tempTotal.toFixed(2));
        }

        addCartItem(cartItem) {
            let cartItemUi = document.createElement("div");
            cartItemUi.innerHTML = `<div class="cart-product">
                                        <div class="product-image">
                                            <img src="${cartItem.image}" alt="product" />
                                        </div>
                                        <div class="cart-product-content">
                                            <div class="cart-product-name">
                                                <h3>${cartItem.title}</h3>
                                            </div>
                                            <div class="cart-product-pricing">
                                                <h3>$${cartItem.price}</h3>
                                            </div>
                                            <div class="cart-product-remove" data-id="${cartItem.id}">
                                                <a href="#" style="color: red;">Remove</a>
                                            </div>
                                        </div>
                                        <div class="plus-minus">
                                            <i class="fa fa-minus reduce-amount" data-id="${cartItem.id}"></i>
                                            <span class="no-of-items">${cartItem.amount}</span>
                                            <i class="fa fa-plus add-amount" data-id="${cartItem.id}"></i>
                                        </div>
                                    </div>`;
            cartItemUi.classList.add('cart-product-wrap');
            cartContent.append(cartItemUi);
            this.updateButtonsState();
        }

        setUpApp() {
            Cart = Storage.getCart();
            this.setCartValues(Cart);
            Cart.forEach(item => {
                this.addCartItem(item);
            });
        }

        cartLogic() {
            clearBtn.addEventListener('click', () => {
                this.clearCart();
            });

            cartContent.addEventListener('click', (event) => {
                const removeBtn = event.target.closest('.cart-product-remove');
                if (removeBtn) {
                    let id = removeBtn.dataset.id;
                    this.removeItem(id);
                    removeBtn.closest(".cart-product").remove();
                } else if (event.target.classList.contains('add-amount')) {
                    let id = event.target.dataset.id;
                    let item = Cart.find((item) => item.id === id);
                    item.amount++;
                    Storage.saveCart(Cart);
                    this.setCartValues(Cart);
                    event.target.previousElementSibling.innerHTML = item.amount;
                } else if (event.target.classList.contains('reduce-amount')) {
                    let id = event.target.dataset.id;
                    let item = Cart.find((item) => item.id === id);
                    item.amount--;
                    if (item.amount > 0) {
                        Storage.saveCart(Cart);
                        this.setCartValues(Cart);
                        event.target.nextElementSibling.innerHTML = item.amount;
                    } else {
                        this.removeItem(id);
                        event.target.closest(".cart-product").remove();
                    }
                }
                this.updateButtonsState(); // Ensure updateButtonsState() is called after modifying the cart
            });
        }

        clearCart() {
            Cart = [];
            this.setCartValues(Cart);
            Storage.saveCart(Cart);
            while (cartContent.children.length > 0) {
                cartContent.removeChild(cartContent.children[0]);
            }
            buttonsDOM.forEach(button => {
                button.innerHTML = `<i class="fa fa-cart-plus"></i>Add to Cart`;
                button.disabled = false;
            });
            this.updateButtonsState(); // Ensure updateButtonsState() is called after clearing the cart
        }

        removeItem(id) {
            Cart = Cart.filter(item => item.id !== id);
            this.setCartValues(Cart);
            Storage.saveCart(Cart);
            let button = this.getSingleButton(id);
            if (button) {
                button.style.pointerEvents = 'unset';
                button.innerHTML = `<i class="fa fa-cart-plus"></i>Add to Cart`;
                button.disabled = false;
            }
            this.updateButtonsState(); // Ensure updateButtonsState() is called after removing an item
        }

        getSingleButton(id) {
            return buttonsDOM.find(button => button.dataset.id === id);
        }
    }

    class Storage {
        static saveProducts(products) {
            localStorage.setItem("products", JSON.stringify(products));
        }
        static getStorageProducts(id) {
            let products = JSON.parse(localStorage.getItem('products'));
            return products.find(item => item.id === id);
        }
        static saveCart(Cart) {
            localStorage.setItem('cart', JSON.stringify(Cart));
        }
        static getCart() {
            return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
        }
    }

    const products = new Product();
    const ui = new UI();
    ui.setUpApp();
    products.getProduct().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getButton();
        ui.cartLogic();
    });
});
