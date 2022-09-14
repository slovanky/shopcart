let cart = [];

const getProductsElement = document.getElementById('items-list');
const getCartCountElement = document.getElementById('cart-btn-count');
const getCartListElement = document.getElementById('cart-list');
const getCartTotalPriceElement = document.getElementById('cart-total-price');
const getClearCartBtn = document.getElementById('clear-cart-btn');
const getCartBtnElement = document.getElementById('cart-btn');

let getaddBtnsDOM = [];

class Products {
  async getProducts() {
    try {
      let result = await fetch('https://api.escuelajs.co/api/v1/products');
      let data = await result.json();

      let products = data.slice(0, 20);

      products = products.map((item) => {
        const id = item.id;
        const title = item.title;
        const price = item.price;
        const image = item.images[0];

        return { id, title, price, image };
      });

      // return data.slice(0, 20);
      console.log(products);
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

class UI {
  getAddBtns() {
    const buttons = [...document.querySelectorAll('.add-to-cart-btn')];

    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);

      if (inCart) {
        button.disabled = true;
      } else {
        button.addEventListener('click', (event) => {
          event.target.disabled = true;

          // get product from local storage
          let cartItem = { ...Storage.getProduct(id), count: 1 };

          // add the product to the cart
          cart = [...cart, cartItem];

          // save cart in local storage
          Storage.saveCart(cart);

          // set cart values
          this.setCartValues(cart);

          // add cart item
          this.addCartItem(cartItem);

          // show the cart
          // 2:38
        });
      }
    });

    getaddBtnsDOM = buttons;
  }

  getSingleAddBtn(id) {
    return getaddBtnsDOM.find((item) => item.dataset.id == id);
  }

  displayProducts(products) {
    let result = '';

    products.forEach((product) => {
      result += `
        <div class="item-outer">
          <div class='item'>
            <div class='item-img'>
              <img src="${product.image}" alt="${product.title}">
              <span class='item-price'>${product.price} EGP</span>
            </div>
            <div class="item-detail">
              <p class='item-title'  title='${product.title}'>${product.title.slice(0, 20)}${product.title.length - 20 > 0 ? '...' : ''}</p>
              <button class='add-to-cart-btn' data-id=${product.id}>ADD +</button>
            </div>
          </div>
        </div>
      `;

      getProductsElement.innerHTML = result;
    });
  }

  setCartValues(cart) {
    let totalPrice = 0;
    let totalCount = 0;

    cart.map((item) => {
      totalPrice += item.price * item.count;
      totalCount += item.count;
    });

    getCartCountElement.innerText = totalCount;
    getCartTotalPriceElement.innerText = parseFloat(totalPrice).toFixed(2) + ' EGP';
    +' EGP';
  }

  addCartItem(item) {
    const element = document.createElement('div');

    element.classList.add('cart-item');

    element.innerHTML = `
      <div class='cart-item-img'>
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class='cart-item-body'>
        <p class='cart-item-title'>${item.title.slice(0, 20)}${item.title.length - 20 > 0 ? '...' : ''}</p>
        <div class='cart-item-details'>
          <span>${item.price} EGP</span>
          <div class='cart-item-count'>
            <button class='cart-remove-piece-btn' data-id=${item.id}>-</button>
            <span class='cart-item-count-value'>${item.count}</span>
            <button class='cart-add-piece-btn' data-id=${item.id}>+</button>
            <button class='cart-remove-item-btn' data-id=${item.id}>X</button>
          </div>
        </div>
      </div>
    `;

    getCartListElement.appendChild(element);
  }

  startApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.publishCart(cart);
  }

  publishCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  cartEvents() {
    // clear cart button
    getClearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });

    // cart functionality
    getCartListElement.addEventListener('click', (event) => {
      if (event.target.classList.contains('cart-remove-item-btn')) {
        let id = event.target.dataset.id;
        console.log(id);
        this.removeItem(id);
        getCartListElement.removeChild(event.target.parentElement.parentElement.parentElement.parentElement);
      } else if (event.target.classList.contains('cart-add-piece-btn')) {
        let clicked = event.target;
        let id = clicked.dataset.id;
        let updateItem = cart.find((item) => item.id == id);
        updateItem.count = updateItem.count + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        clicked.previousElementSibling.innerText = updateItem.count;
      } else if (event.target.classList.contains('cart-remove-piece-btn')) {
        let clicked = event.target;
        let id = clicked.dataset.id;
        let updateItem = cart.find((item) => item.id == id);
        if (updateItem.count > 1) {
          updateItem.count = updateItem.count - 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          clicked.nextElementSibling.innerText = updateItem.count;
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));

    while (getCartListElement.children.length > 0) {
      getCartListElement.removeChild(getCartListElement.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id != id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    this.getSingleAddBtn(id).disabled = false;
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }

  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id == id);
  }

  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const products = new Products();
  const ui = new UI();

  products
    .getProducts()
    .then((products) => {
      ui.startApp();
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getAddBtns();
      ui.cartEvents();
    });
});
