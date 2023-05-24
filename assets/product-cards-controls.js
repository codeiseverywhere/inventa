function addProduct(event, product_id) {
  const controlsWrapper = getParentElement(event.target, "quantity-controls");
  const input = controlsWrapper.querySelector("input.value-control");
  const productImage = input.parentElement.getAttribute("image-associated");
  if (input) {
    const title = input.getAttribute("product-title");
    const quantity = parseInt(input.value);
    const stepQuantity = input.dataset.stepQuantity
      ? parseInt(input.dataset.stepQuantity)
      : 1;
    let tostrText = "adicionado";
    const formInfo = document.querySelector(`form[product-id]`);
    const inStock = input.getAttribute("instock")
    ? parseInt(input.getAttribute("instock"))
    : null;

    if (inStock) {
      if ((inStock < stepQuantity) || ((quantity + stepQuantity)  > inStock)) {
        document.getElementById('outofstock-'+product_id).style.display = 'block';
        return false;
      }
    }
    
    if (quantity == 0) {
      let min = parseInt(input.getAttribute("min"));
      if (min < stepQuantity) {
        min = stepQuantity;
      }

      addNewProductCart(product_id, min, (id, quantity) => {
        input.value = quantity;
        input.setAttribute("value", quantity);
        popupToast(productImage, `${min} adicionado`, title);
        const productInfo = document.querySelector(
          `input[data-variant-id="${id}"]`
        );

        if (productInfo) {
          const vendor = productInfo.getAttribute("data-vendor");
          const sku = productInfo.getAttribute("data-sku");
          const title = productInfo.getAttribute("data-title");
          const price = productInfo.getAttribute("data-price");
          productsEvents("addProduct", id, title, vendor, price, sku, quantity);
        }
      });
    } else {
      changeProductCart(product_id, quantity + stepQuantity, (id, quantity) => {
        input.value = quantity;
        input.setAttribute("value", quantity);
        if (stepQuantity > 1) {
          tostrText = "adicionados";
        }
        const productInfo = document.querySelector(
          `input[data-variant-id="${id}"]`
        );
        if (productInfo) {
          const vendor = productInfo.getAttribute("data-vendor");
          const sku = productInfo.getAttribute("data-sku");
          const title = productInfo.getAttribute("data-title");
          const price = productInfo.getAttribute("data-price");
          productsEvents("addProduct", id, title, vendor, price, sku, quantity);
        }
        popupToast(productImage, `${stepQuantity} ${tostrText}`, title);
      });
    }
  }
}

function lessProduct(event, product_id) {
  const controlsWrapper = getParentElement(event.target, "quantity-controls");
  const input = controlsWrapper.querySelector("input.value-control");
  const productImage = input.parentElement.getAttribute("image-associated");
  if (input) {
    const title = input.getAttribute("product-title");
    const quantity = parseInt(input.value);
    const stepQuantity = parseInt(input.dataset.stepQuantity)
      ? parseInt(input.dataset.stepQuantity)
      : 1;
    let min = parseInt(input.getAttribute("min"));
    let tostrText = "removido";

    const inStock = input.getAttribute("instock")
    ? parseInt(input.getAttribute("instock"))
    : null;

    if (inStock) {
      document.getElementById('outofstock-'+product_id).style.display = 'none';
    }
    
    if (min < stepQuantity) {
      min = stepQuantity;
    }
    if (quantity <= min && quantity > 0) {
      removeProduct(product_id);
    } else if (quantity > 0) {
      changeProductCart(product_id, quantity - stepQuantity, (id, quantity) => {
        input.value = quantity;
        input.setAttribute("value", quantity);
        if (stepQuantity > 1) {
          tostrText = "removidos";
        }
        const productInfo = document.querySelector(
          `input[data-variant-id="${id}"]`
        );
        if (productInfo) {
          const vendor = productInfo.getAttribute("data-vendor");
          const sku = productInfo.getAttribute("data-sku");
          const title = productInfo.getAttribute("data-title");
          const price = productInfo.getAttribute("data-price");
          productsEvents(
            "removeProduct",
            id,
            title,
            vendor,
            price,
            sku,
            quantity
          );
        }
        popupToast(productImage, `${stepQuantity} ${tostrText}`, title);
      });
    }
  }
}

function removeProduct(product_id) {
  changeProductCart(product_id, 0, () => {
    const input = document.querySelector(
      `[product-id="${product_id}"] input.value-control`
    );
    const productImage = input.parentElement.getAttribute("image-associated");
    if (input) {
      const title = input.getAttribute("product-title");
      input.setAttribute("old-value", 0);
      input.value = 0;
      input.setAttribute("value", 0);
      popupToast(productImage, "Produto eliminado", title);
    }
    const productInfo = document.querySelector(
      `input[data-variant-id="${product_id}"]`
    );
    if (productInfo) {
      const vendor = productInfo.getAttribute("data-vendor");
      const sku = productInfo.getAttribute("data-sku");
      const title = productInfo.getAttribute("data-title");
      const price = productInfo.getAttribute("data-price");
      productsEvents("removeProduct", product_id, title, vendor, price, sku, 0);
    }
  });
}

function changeVariantOption() {
  const selectContainer = document.querySelector(".variantSelector");

  if (selectContainer) {
    setTimeout(function () {
      const variantId = selectContainer.value;
      const btnAddToCartContainer = document.querySelector("form.add-product");
      const quantityControls = document.querySelector(".quantity-controls");
      const hiddenVariantId = document.querySelector(".hiddenVariantId");
      const btnLess = document.querySelector(".less-product");
      const btnAdd = document.querySelector("button.add-product");
      const inputQuantity = document.querySelector(".value-control");

      hiddenVariantId.value = variantId;
      btnAddToCartContainer.setAttribute("product-id", variantId);
      quantityControls.setAttribute("product-id", variantId);
      btnLess.setAttribute("onClick", `lessProduct(event, '${variantId}')`);
      btnAdd.setAttribute("onClick", `addProduct(event, '${variantId}')`);
      inputQuantity.setAttribute("onChange", `changeInput(event, '${variantId}')`);
      inputQuantity.value = 0;
    }, 200);
  }
}

function changeInput(event, product_id) {
  const input = event.target;
  const productImage = input.parentElement.getAttribute("image-associated");
  if (input) {
    const title = input.getAttribute("product-title");
    let quantity = parseInt(input.value);
    const old_value = parseInt(input.getAttribute("old-value"));
    const min = parseInt(input.getAttribute("min"));
    const maxQty = parseInt(input.getAttribute("max"));
    const stepQuantity = parseInt(input.dataset.stepQuantity)
      ? parseInt(input.dataset.stepQuantity)
      : 1;
    const quantityModule = quantity % stepQuantity;
    const formInfo = document.querySelector(`form[product-id]`);
    const inStock = input.getAttribute("instock")
    ? parseInt(input.getAttribute("instock"))
    : null;

    if (inStock) {
      if ((inStock < stepQuantity) || ((quantity + stepQuantity)  > inStock)) {
        document.getElementById('outofstock-'+product_id).style.display = 'block';
        return false;
      }
    }

    if (quantity == 0) {
      removeProduct(product_id);
      return;
    }
    if (old_value > 0) {
      if (quantity > old_value) {
        if (quantityModule > 0) {
          quantity = quantity - quantityModule + stepQuantity;
        }
      } else {
        quantity = quantity - (quantity % stepQuantity);
      }
      if (maxQty) {
        quantity = (quantity > maxQty)? maxQty : quantity;
      }
      const productInfo = document.querySelector(
        `input[data-variant-id="${product_id}"]`
      );
      if (productInfo) {
        const vendor = productInfo.getAttribute("data-vendor");
        const sku = productInfo.getAttribute("data-sku");
        const title = productInfo.getAttribute("data-title");
        const price = productInfo.getAttribute("data-price");
        productsEvents(
          quantity > old_value ? "addProduct" : "removeProduct",
          product_id,
          title,
          vendor,
          price,
          sku,
          quantity
        );
      }
      changeProductCart(
        product_id,
        quantity > min ? quantity : min,
        (id, quantity) => {
          input.value = quantity;
          input.setAttribute("value", quantity);
          const quantityText = quantity > 1 ? "adicionados" : "adicionado";
          input.setAttribute("old-value", `${quantity}`);

          if (quantity > min || quantity == maxQty) {
            popupToast(productImage, `${quantity} ${quantityText}`, title);
          } else {
            popupToast(
              productImage,
              `Mínimo de ${quantity} ${quantityText}`,
              title
            );
          }
        }
      );
    } else {
      if (quantityModule > 0) {
        quantity = quantity - quantityModule + stepQuantity;
      }
      if (maxQty) {
        quantity = (quantity > maxQty)? maxQty : quantity;
      }
      addNewProductCart(
        product_id,
        quantity > min ? quantity : min,
        (id, quantity) => {
          input.value = quantity;
          input.setAttribute("value", quantity);
          const quantityText = quantity > 1 ? "adicionados" : "adicionado";
          input.setAttribute("old-value", `${quantity}`);

          if (quantity > min || quantity == maxQty) {
            popupToast(productImage, `${quantity} ${quantityText}`, title);
          } else {
            popupToast(
              productImage,
              `Mínimo de ${quantity} ${quantityText}`,
              title
            );
          }
        }
      );
    }
  }
}

function addNewProductCart(id, quantity, callback) {
  const form = document.querySelector(`form.add-product[product-id="${id}"]`);
  const state = form.querySelector('[name="properties[_estado]"]');
  fetch("".concat(window.routes.cartAddUrl, ".js"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      id: `${id}`,
      quantity: quantity,
      properties: {
        _estado: state.value || "",
      },
    }),
  }).then((res) => {
    if (res.status == 200) {
      document.documentElement.dispatchEvent(
        new CustomEvent("cart:refresh", {
          bubbles: true,
        })
      );

      if (typeof callback == "function") callback(id, quantity);

      const productInfo = document.querySelector(
        `input[data-variant-id="${id}"]`
      );
      if (productInfo) {
        const vendor = productInfo.getAttribute("data-vendor");
        const sku = productInfo.getAttribute("data-sku");
        const title = productInfo.getAttribute("data-title");
        const price = productInfo.getAttribute("data-price");
        productsEvents("addProduct", id, title, vendor, price, sku, quantity);
      }
    }
  });
}

function serialize(data) {
  let obj = {};
  for (let [key, value] of data) {
    if (obj[key] !== undefined) {
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

function changeProductCart(id, quantity, callback) {
  fetch("/cart/change.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: `${id}`,
      quantity,
    }),
  }).then((res) => {
    if (res.status == 200) {
      document.documentElement.dispatchEvent(
        new CustomEvent("cart:refresh", {
          bubbles: true,
        })
      );

      if (typeof callback == "function") callback(id, quantity);
    }
  });
}

function popupToast(image, title, message) {
  const toastImage = document.querySelector(".toast .toast-image");
  const toastTitle = document.querySelector(".toast .toast-body .title");
  const toastBody = document.querySelector(".toast .toast-body .content");
  const myToastEl = document.querySelector('.toast');
  const myToast = bootstrap.Toast.getOrCreateInstance(myToastEl);
  if (toastImage && toastBody && toastTitle) {
    toastImage.innerHTML = `<img src="${image}" />`;
    toastTitle.innerText = title;
    toastBody.innerText = message;
    myToast.show();
  }
}

function productsEvents(event, id, title, vendor, price, sku, quantity) {
  if (driver) {
    driver.pushEvent(event, {
      url: window.location.href,
      quantity,
      variant_id: id,
      title,
      vendor,
      price,
      sku,
    });
  }
}

function getParentElement(element, targetClass) {
  const parent = element.parentElement;
  if (parent && parent.classList.contains(targetClass)) {
    return parent;
  } else if (parent) {
    return getParentElement(parent, targetClass);
  } else {
    return null;
  }
}
