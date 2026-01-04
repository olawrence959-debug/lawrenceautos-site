// Simple product listing + cart + checkout
const PRODUCTS = JSON.parse(document.getElementById('products-data').textContent);
const productsEl = document.getElementById('products');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalsEl = document.getElementById('cartTotals');
const orderSummaryInput = document.getElementById('order_summary');
let cart = {};
const DELIVERY_FEE = 2.0;

function renderProducts(){
  PRODUCTS.forEach(p => {
    const c = document.createElement('div'); c.className='card';
    c.innerHTML = `<img src="${p.img}" alt="${p.name}"><h4>${p.name}</h4><div class="price">$${p.price.toFixed(2)}</div><button data-id="${p.id}">Add</button>`;
    c.querySelector('button').addEventListener('click', ()=>{ addToCart(p.id); });
    productsEl.appendChild(c);
  });
}

function addToCart(id){
  cart[id] = (cart[id]||0)+1; renderCart();
}
function removeFromCart(id){ delete cart[id]; renderCart(); }
function qtyChange(id, amt){ cart[id] = Math.max(1,(cart[id]||0)+amt); renderCart(); }
function renderCart(){
  cartItemsEl.innerHTML='';
  let subtotal=0; Object.keys(cart).forEach(id=>{
    const p = PRODUCTS.find(x=>x.id===id);
    const qty = cart[id];
    subtotal += p.price*qty;
    const item = document.createElement('div'); item.className='item';
    item.innerHTML = `<div>${p.name} x ${qty}</div><div>$${(p.price*qty).toFixed(2)}</div>`;
    cartItemsEl.appendChild(item);
  });
  const total = subtotal + (Object.keys(cart).length?DELIVERY_FEE:0);
  cartTotalsEl.innerHTML = `<div>Subtotal: $${subtotal.toFixed(2)}</div><div>Delivery: $${Object.keys(cart).length?DELIVERY_FEE.toFixed(2):'0.00'}</div><div><strong>Total: $${total.toFixed(2)}</strong></div>`;
  orderSummaryInput.value = buildOrderSummary();
}
function buildOrderSummary(){
  return Object.keys(cart).map(id=>{
    const p = PRODUCTS.find(x=>x.id===id); return `${p.name} x ${cart[id]} ($${(p.price*cart[id]).toFixed(2)})`;
  }).join('\n') + `\nDelivery fee: $${Object.keys(cart).length?DELIVERY_FEE.toFixed(2):'0.00'}`;
}

// Pay on delivery: just fill the order summary and let user submit the form (Formspree)
document.getElementById('payOnDeliveryBtn').addEventListener('click', ()=>{
  if(!Object.keys(cart).length){ alert('Cart is empty'); return; }
  document.getElementById('order_summary').value = buildOrderSummary();
  document.getElementById('orderForm').scrollIntoView({behavior:'smooth'});
});

// Stripe Checkout (serverless function on Netlify)
document.getElementById('payNowBtn').addEventListener('click', async ()=>{
  if(!Object.keys(cart).length){ alert('Cart is empty'); return; }
  const name = document.querySelector('[name="name"]').value;
  const phone = document.querySelector('[name="phone"]').value;
  const address = document.querySelector('[name="address"]').value;
  if(!name||!phone||!address){ alert('Please fill delivery name, phone and address'); return; }
  const payload = { cart, name, phone, address, delivery_time: document.querySelector('[name="delivery_time"]').value };
  try{
    const res = await fetch('/.netlify/functions/create-checkout-session', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
    });
    const data = await res.json();
    if(data.url){ window.location = data.url; } else { alert('Checkout failed'); }
  }catch(e){ console.error(e); alert('Checkout error'); }
});

renderProducts(); renderCart();
