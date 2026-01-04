const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function(event, context){
  try{
    const body = JSON.parse(event.body);
    const {cart, name, phone, address, delivery_time} = body;
    const line_items = Object.keys(cart).map(id => {
      const menu = {
        p1: {name: 'Jollof Rice & Chicken', price: 6.5},
        p2: {name: 'Fried Plantain & Beef', price: 5.0},
        p3: {name: 'Chicken Sandwich', price: 4.0},
        p4: {name: 'Vegetarian Wrap', price: 4.5}
      };
      const item = menu[id];
      return {
        price_data: {
          currency: 'usd',
          product_data: {name: item.name},
          unit_amount: Math.round(item.price*100)
        },
        quantity: cart[id]
      };
    });

    line_items.push({price_data:{currency:'usd',product_data:{name:'Delivery Fee'},unit_amount:200},quantity:1});

    const origin = event.headers.origin || 'https://your-site.example';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/food-site/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/food-site/cancel.html`,
      metadata: {name,phone,address,delivery_time,order_summary: JSON.stringify(cart)}
    });
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  }catch(err){
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};