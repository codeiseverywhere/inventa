/* window.addEventListener('load', function() {
    const quantityInputs = document.querySelectorAll('.quantity-selector__value');

    setTimeout(() => {
        for(var i = 0; i < quantityInputs.length; i++){
            const min = quantityInputs[i].getAttribute('min');
            const quantity = quantityInputs[i].value;
            if(quantity < min) {
                const id = quantityInputs[i].id.split('-')[1];
                const productLine = document.getElementById(id);
                productLine.style.backgroundColor = 'rgba(255, 99, 71, 0.4)';
                productLine.setAttribute('no-min', true);
                console.log(productLine);
            }
            console.log("Antes events")
    
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
                console.log("Holahola")
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
                }, 1500);
                }
            }
            console.log("Despues events")
        }
    }, 1000);
}) */