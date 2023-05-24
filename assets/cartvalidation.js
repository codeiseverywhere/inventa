var missingMinimumMoney = "O mínimo não é atingido, estão faltando ";
function checkMinsTags(vendors){
    const founds = document.querySelectorAll('.min-tag-reach');
      //document.getElementById('general-nomin-error').style.display = 'block';
      for(let i = 0; i < founds.length; i++){
        var vendor = founds[i].id.replace('min-to-reach_', '');
        var { minimum_purchase } = vendors.find(({seller_store_name}) => seller_store_name.toLowerCase().replace(/ /g, '_') == vendor);
        
        var errorElement = document.createElement('p');
        errorElement.classList.add('text-danger');
        errorElement.classList.add('d-none');
        errorElement.id = `${vendor.toLowerCase().replace(/ /g, '_')}-nomin-error`;
        const subtotalElement = document.getElementById(`${vendor}-subtotal`);
        subtotalElement.prepend(errorElement);
      }
}
  window.addEventListener('load', async function(){
    document.getElementById('general-checkout').onclick = (event) => {
      window.location.replace('https://inventa.shop/checkout');
    };
    const { mins: {seller_detail}, cart } = await getMultivendorAmounts();
    const vendors = [];
    Object.entries(seller_detail).map(seller => {
      const { minimum_purchase, seller_store_name } = Object.entries(seller[1])[0][1];
      vendors.push({ minimum_purchase: parseFloat(`${`${minimum_purchase}`.slice(0, -2)}.${`${minimum_purchase}`.slice(-2)}`), seller_store_name });
    })
    vendors.forEach(({ minimum_purchase, seller_store_name }) => {
      const vendor = seller_store_name.toLowerCase().replace(/ /g, "_");;
      const minToReach = document.createElement('span');
      const subtotalElement = document.getElementById(`${vendor}-subtotal`);
      if(subtotalElement){
        minToReach.classList.add('d-none');
        minToReach.classList.add('min-tag-reach');
        minToReach.id = `min-to-reach_${vendor.toLowerCase().replace(/ /g, '_')}`;
        minToReach.setAttribute('minToReach', minimum_purchase);
        subtotalElement.append(minToReach);
      }
    })

    try {
      const allGood = checkMinsTags(vendors);
      checkProductsMins(allGood);
      updateCart(cart);
    } catch (error) { console.log(error) }
  });
  window.addEventListener('load', function(e){
    var removes = document.getElementsByClassName('line-item__quantity-remove');
    var buttons = document.getElementsByClassName('quantity-selector__button');
    for(var i = 0; i < removes.length; i++){
      removes[i].addEventListener('click', changeQuantityEvent);
    }
    for(var i = 0; i < buttons.length; i++){
      buttons[i].addEventListener('click', changeQuantityEvent);
    }

    var quantityInputs = document.getElementsByClassName('quantity-selector__value');
    for(var i = 0; i < quantityInputs.length; i++){
      const min = quantityInputs[i].getAttribute('min');
      const quantity = quantityInputs[i].value;
      const id = quantityInputs[i].id.split('-')[1];
      if(quantity < min) {
        const productLine = document.getElementById(id);
        productLine.style.backgroundColor = 'rgba(255, 99, 71, 0.4)';
        productLine.setAttribute('no-min', true);
      }


      quantityInputs[i].onchange = (event) => {
        var min = event.target.getAttribute('min');
        var quantity = event.target.value;
        if(quantity < min) quantity = min;
        var id = event.target.id.split('-')[1];
        const productLine = document.getElementById(id);
        if(productLine.getAttribute('no-min')) {
          productLine.style.backgroundColor = 'transparent';
          productLine.setAttribute('no-min', false);
        }
        postNewQuantity(id, quantity).then(res => res.json())
        .then(res => {
          updateCart(res);
        });
      };
      let timer;
      quantityInputs[i].onkeydown = (event) => {
        const newChar = event.key;
        let validKey = false;
        switch(newChar){
          case 'Backspace':
          case 'ArrowRight':
          case 'ArrowLeft':
          case 'Delete':
          case 'Tab':
            validKey = true;
            break;
        }
        if(isNaN(newChar) && !validKey){
          event.preventDefault();
        }
      }
      quantityInputs[i].onkeyup = (event) => {
        clearTimeout(timer);
        var min = event.target.getAttribute('min');
        var newValue = event.target.value;
        if(parseInt(newValue) < parseInt(min)) {
          timer = setTimeout(() => {
            event.target.value = parseInt(min);
            document.getElementById(id).style.backgroundColor = 'transparent';
          }, 1500);
        }
      }
    }

    function changeQuantityEvent(event){
      var action = event.target.id.split('-')[0];
      var id = event.target.id.split('-')[1];
      var inputQuantity = document.getElementById(`quantity-${id}`);
      var quantity = inputQuantity.value;
      switch(action){
        case "add":
          if((parseInt(quantity) + 1) >= parseInt(inputQuantity.getAttribute('min'))) {
            const productLine = document.getElementById(id);
            productLine.style.backgroundColor = 'transparent';
            productLine.setAttribute('no-min', false);
          }
          quantity++;
          break;
        case "less":
          if(quantity > parseInt(inputQuantity.getAttribute('min'))) quantity--;
          else if(quantity == 1) {
            removeCartLine(id);
            quantity = 0;
          }
          break;
        case "remove":
          try {
            event.preventDefault();
          } catch (error){}
          removeCartLine(id);
          quantity = 0;
          break;
      }
      if(inputQuantity.value != quantity){
        inputQuantity.value = quantity;
        postNewQuantity(id, quantity).then(res => res.json())
        .then(res => {
          updateCart(res);
        });
      }
    }
  });

  function removeCartLine(id){
    var item = document.getElementById(id);
    var tableBody = item.parentElement;
    tableBody.removeChild(item);
    var vendor = tableBody.id.split('-')[1];
    var items = document.getElementsByClassName(`item-${vendor}`);
    if(!items.length){
      var table = document.getElementById(`table-${vendor}`);
      table.parentElement.removeChild(table);
    }
  }

  function postNewQuantity(id, quantity){
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id,
        quantity
      })
    });
  }

  function updateCart(data){
    var items = data.items;
    if(!items.length){
      window.location.reload();
    }
    var total_price = data.total_price;
    document.getElementById('total-price').innerHTML = formatPrice(total_price);
    var itemsQuantity = 0;
    var vendors = [];
    for(var i = 0; i < items.length; i++){
      var vendor = items[i].vendor;
      if(!vendors.includes(vendor)) vendors.push(vendor);
      document.getElementById(`lineprice-${items[i].variant_id}`).innerHTML = formatPrice(items[i].final_line_price);
      itemsQuantity += items[i].quantity;
    }
    document.getElementsByClassName('header__cart-count')[0].innerText = itemsQuantity;
    for(var i = 0; i < vendors.length; i++){
      var total = 0;
      for(var j = 0; j < items.length; j++){
        if(items[j].vendor === vendors[i]) total += items[j].final_line_price;
      }
      const minTag = document.getElementById(`min-to-reach_${vendors[i].toLowerCase().replace(/ /g, '_')}`);
      if(minTag) {
        const vendorMin = minTag.getAttribute('mintoreach');
        const error = document.getElementById(`${vendors[i].toLowerCase().replace(/ /g, '_')}-nomin-error`)
        if(parseFloat(`${`${total}`.slice(0, -2)},${`${total}`.slice(-2)}`) >= parseFloat(vendorMin)) error.classList.add('d-none');
        else {
          error.innerText = `${missingMinimumMoney} R$${parseFloat(vendorMin) - parseFloat(`${`${total}`.slice(0, -2)},${`${total}`.slice(-2)}`)}`;
          error.classList.remove('d-none')
        };
      }
      document.getElementsByClassName(`subtotal-${vendors[i].split(' ').join('')}`)[0].innerHTML = formatPrice(total);
    }
    const allGood = checkVendorMins();
    const allowed = checkProductsMins(allGood);
    if(allowed) {
      window.localStorage.setItem('validCart', true);
      return true;
    }
    else window.localStorage.setItem('validCart', false);
  }

  function checkVendorMins() {
    const tagsCreated = document.querySelectorAll('span.min-tag-reach');
    let minsReached = true;
    for(var i = 0; i < tagsCreated.length; i++){
      const min = parseFloat(tagsCreated[i].getAttribute('mintoreach'));
      const vendor = tagsCreated[i].id.replace('min-to-reach_', '');
      let subtotal = document.getElementById(`${vendor}-subtotal`).querySelector('div span[data-wk_slot_subtotal=wk_slot]').innerText;
      subtotal = parseFloat(subtotal.replace('R$ ', '').replace(',', '.').trim());
      if(subtotal < min) minsReached = false;
    }
    if(!minsReached) {
      document.getElementById('general-nomin-error').style.display = 'block';
      document.getElementById('general-checkout').disabled = true;
      return false;
    } else {
      document.getElementById('general-nomin-error').style.display = 'none';
      document.getElementById('general-checkout').disabled = false;
      return true;
    }
  }

  function checkProductsMins(available){
    const noMinReached = document.querySelectorAll('tr[no-min=true]');
    if(noMinReached.length){
      document.getElementById('general-checkout').disabled = true;
      return false;
    }else if(available){
      document.getElementById('general-checkout').disabled = false;
      return true;
    }
  }

  function formatPrice(number){
    var coin = 'R$';
    var intPart = `${number}`.slice(0, -2);
    var floatPart = `${number}`.slice(-2);
    return `${coin} ${intPart},${floatPart}`;
  }


async function getMultivendorAmounts(){
  const promise = await fetch('/cart.json');
  const response = await promise.json();
  const { token, items } = response;
  const arrayItems = [];
  for(let i = 0; i < items.length; i++){
    const {product_id, quantity, variant_id, title, price, properties} = items[i];
    const product = {
      product_title: title,
      title: '',
      quantity,
      product_id,
      variant_id,
      price,
      properties
    }
    arrayItems.push(product);
  }

  return ({
    mins: await $.ajax({
      url: "https://sp-seller.webkul.com/index.php?p=ajax_minimum_purchase",
      type: "POST",
      crossDomain: true,
      dataType: "json",
      data: {
        shop: "inventa1.myshopify.com",
        cart_details: arrayItems,
        cart_token: token,
        selected_tag: '',
        pay_what_you_want: false,
        wk_addon_count: 0,
        route_insurance: 0,
        wk_preorder_count: 0,
        callback: "getMinimumPurchase"
      }
    }),
    cart: response
  })
}