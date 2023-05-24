window.addEventListener("load", () => {
  if (window.dataLayer) {
    window.dataLayer.push({
      checkoutID: Shopify.Checkout.token,
    });

    const step = document.querySelector("div.step").getAttribute("data-step");
    /* window.dataLayer.push({
            event: 'stepViewed',
            data: JSON.stringify({ step })
        }); */
    driver.pushEvent("stepViewed", { data: JSON.stringify({ step }) });
    const nextStepBtn = document.getElementById("continue_button");
    if (nextStepBtn) {
      nextStepBtn.addEventListener("click", () => {
        window.sessionStorage.setItem("previousStep", step);
        if (step == "payment_method") {
          driver.pushEvent("placeOrder", {
            value: document
              .querySelector(".payment-due__price")
              .getAttribute("data-checkout-payment-due-target"),
            shipping: document
              .querySelector(
                ".total-line.total-line--shipping [data-checkout-total-shipping-target]"
              )
              .getAttribute("data-checkout-total-shipping-target"),
            coupon: document.querySelector(
              ".reduction-code .reduction-code__text"
            )
              ? document.querySelector(".reduction-code .reduction-code__text")
                  .innerText
              : "",
            products: window.sessionStorage.getItem("validCart")? JSON.parse(window.sessionStorage.getItem("validCart"))
              .items : [],
          });
          /* window.dataLayer.push({
                        event: 'placeOrder',
                        data: JSON.stringify({
                            value: document.querySelector('.payment-due__price').getAttribute('data-checkout-payment-due-target'),
                            shipping: document.querySelector('.total-line.total-line--shipping [data-checkout-total-shipping-target]').getAttribute('data-checkout-total-shipping-target'),
                            coupon: document.querySelector('.reduction-code .reduction-code__text') ? document.querySelector('.reduction-code .reduction-code__text').innerText : "",
                            products: JSON.parse(window.sessionStorage.getItem('validCart')).items
                        })
                    }) */
        }
      });
    }
    const previousStep = window.sessionStorage.getItem("previousStep");
    if (step == "thank_you" && previousStep == "payment_method") {
      /* window.dataLayer.push({
                event: 'orderFinished'
            }) */
      driver.pushEvent("orderFinished", {});
    }
    if (previousStep && previousStep != step) {
      window.sessionStorage.removeItem("previousStep");
      /* window.dataLayer.push({
                event: 'stepCompleted',
                data: JSON.stringify({ step: previousStep })
            }); */
      driver.pushEvent("stepCompleted", { step: previousStep });
    }
    const returnBtn = document.querySelector(".step__footer__previous-link");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => {
        window.sessionStorage.setItem("returnedFrom", step);
      });
    }
    const returnStep = window.sessionStorage.getItem("returnedFrom");
    if (returnStep && returnStep != step) {
      window.sessionStorage.removeItem("returnedFrom");
      /* window.dataLayer.push({
                event: 'returnStep',
                data: JSON.stringify({ step: returnStep })
            }); */
      driver.pushEvent("returnStep", { step: returnStep });
    }

    const alterarBtns = document.querySelectorAll(".review-block__link a");
    for (let i = 0; i < alterarBtns.length; i++) {
      alterarBtns[i].addEventListener("click", () => {
        /* window.dataLayer.push({
                    event: 'updateField'
                }) */
        driver.pushEvent("updateField", {});
      });
    }
  }
});
