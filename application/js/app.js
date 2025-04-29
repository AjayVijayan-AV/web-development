var cart = JSON.parse(localStorage.getItem('cart') || '{}');

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(id, title, price) {
  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = { title: title, price: price, qty: 1 };
  }
  saveCart();
  alert(title + ' added to cart');
}

function removeFromCart(id) {
  if (cart[id]) {
    delete cart[id];
    saveCart();
  }
}

function updateCartQty(id, qty) {
  if (cart[id]) {
    cart[id].qty = qty;
    if (cart[id].qty <= 0) {
      removeFromCart(id);
    } else {
      saveCart();
    }
  }
}

function clearCart() {
  cart = {};
  saveCart();
}

function getCartItems() {
  return cart;
}

function fetchProducts(callback) {
  fetch('https://fakestoreapi.com/products')
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(function(data) {
      callback(data);
    })
    .catch(function() {
      alert('Failed to load products');
    });
}

function validateForm(formId) {
  var form = document.getElementById(formId);
  var inputs = form.querySelectorAll('input[required]');
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    if (!input.value) {
      alert('Please fill the ' + input.name + ' field');
      return false;
    }
  }
  return true;
}

function isLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

function setLoggedIn(value) {
  localStorage.setItem('isLoggedIn', value ? 'true' : 'false');
}

document.addEventListener('DOMContentLoaded', function() {
  var page = document.body.id;

  if (page === 'products') {
    var container = document.getElementById('products-list');
    fetchProducts(function(products) {
      container.innerHTML = '';
      products.forEach(function(p) {
        var productDiv = document.createElement('div');
        productDiv.className = 'product';

        var img = document.createElement('img');
        img.src = p.image;
        img.alt = p.title;
        productDiv.appendChild(img);

        var infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        var h3 = document.createElement('h3');
        h3.textContent = p.title;
        infoDiv.appendChild(h3);

        var priceP = document.createElement('p');
        priceP.textContent = '$' + p.price.toFixed(2);
        infoDiv.appendChild(priceP);

        var btn = document.createElement('button');
        btn.className = 'add';
        btn.textContent = 'Add to Cart';
        btn.dataset.id = p.id;
        btn.dataset.title = p.title;
        btn.dataset.price = p.price;
        btn.addEventListener('click', function() {
          addToCart(this.dataset.id, this.dataset.title, parseFloat(this.dataset.price));
        });
        infoDiv.appendChild(btn);

        productDiv.appendChild(infoDiv);
        container.appendChild(productDiv);
      });
    });
  }

  if (page === 'cart') {
    var container = document.getElementById('cart-items');
    container.innerHTML = '';
    var items = getCartItems();
    var total = 0;
    for (var id in items) {
      if (items.hasOwnProperty(id)) {
        var item = items[id];
        var itemTotal = item.price * item.qty;
        total += itemTotal;

        var itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.dataset.id = id;

        var nameSpan = document.createElement('span');
        nameSpan.className = 'cart-item-name';
        nameSpan.textContent = item.title;
        itemDiv.appendChild(nameSpan);

        var qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'cart-item-qty';
        qtyInput.value = item.qty;
        qtyInput.min = 1;
        qtyInput.addEventListener('change', function() {
          var id = this.parentElement.dataset.id;
          var qty = parseInt(this.value);
          if (qty > 0) {
            updateCartQty(id, qty);
            location.reload();
          }
        });
        itemDiv.appendChild(qtyInput);

        var priceSpan = document.createElement('span');
        priceSpan.textContent = '$' + itemTotal.toFixed(2);
        itemDiv.appendChild(priceSpan);

        var removeBtn = document.createElement('button');
        removeBtn.className = 'remove';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', function() {
          var id = this.parentElement.dataset.id;
          removeFromCart(id);
          location.reload();
        });
        itemDiv.appendChild(removeBtn);

        container.appendChild(itemDiv);
      }
    }

    var totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.textContent = 'Total: $' + total.toFixed(2);
    container.appendChild(totalDiv);

    var clearBtn = document.getElementById('clear-cart');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        clearCart();
        location.reload();
      });
    }

    var checkoutBtn = document.getElementById('checkoutbtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        window.location.href = 'checkout.html';
      });
    }
  }

  if (page === 'signup' || page === 'login') {
    var form = document.getElementById('form');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm('form')) {
          setLoggedIn(true);
          alert(page.charAt(0).toUpperCase() + page.slice(1) + ' successful!');
          window.location.href = 'index.html';
        }
      });
    }
  }

  if (page === 'checkout') {
    var checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!isLoggedIn()) {
          alert('Please login or signup before placing the order.');
          window.location.href = 'login.html';
          return;
        }
        if (validateForm('checkout-form')) {
          alert('Order placed successfully!');
          clearCart();
          window.location.href = 'index.html';
        }
      });
    }
  }
});
