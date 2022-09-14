const myCart = document.getElementById('cart');

document.getElementById('cart-btn').addEventListener('click', (event) => {
  if (myCart.classList.contains('cart-closed')) {
    myCart.classList.remove('cart-closed');
    myCart.classList.add('cart-opened');
  } else if (myCart.classList.contains('cart-opened')) {
    myCart.classList.remove('cart-opened');
    myCart.classList.add('cart-closed');
  }
});
