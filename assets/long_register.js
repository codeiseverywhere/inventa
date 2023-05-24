function registerLong_Driver(form_element, rules = []) {
  if (!form_element) return null;
  if (!Array.isArray(rules)) return null;
  const steps = [];
  const _ = {};
  let current_step = 0;
  window.addEventListener("cf:ready", () => {
    if (form_element && typeof form_element == "string")
      _.form = document.querySelector(form_element);
    else _.form = form_element;
    rules.map((rule) => addRule(rule));
    const progress_bar = document.querySelectorAll(
      ".long-register_progress-bar"
    );
    for (let i = 0; i < progress_bar.length; i++)
      progress_bar[i].style.width = `${
        (100 * (current_step + 1)) / _.totalSteps()
      }%`;
    const register_start = document.querySelector(".register-long_start");
    if (register_start) register_start.classList.add("loaded");
    _.form.addEventListener("cf:step_changed", (e) => {
      current_step = e.detail.toIndex;
      changeDomStep(current_step);
    });
    _.form.addEventListener("cf:form_submission_failed", (e) => {
      registerLong_loaderButtonsToggle(false);
      const fields = e.detail.errors;
      const step_info = steps.find((e) => e.step == current_step);
      for (const field in fields) {
        if (step_info.fields.some((e) => e.name == field)) {
          let error = " já foi utilizado";
          switch (field) {
            case "phone":
              error = "Telefone" + error;
              break;
            case "email":
              error = "Email" + error;
              break;
            default:
              error =
                field.charAt(0).toUpperCase() +
                field.slice(1).toLowerCase() +
                error;
              break;
          }
          errorField(error, field);
        }
      }
    });
  });

  function goToShopText() {
    const isDesktop = window.innerWidth < 500;
    return isDesktop ? "Navegar para o site" : "Ir para a loja";
  }

  function changeDomStep(step) {
    const buttons = document.querySelectorAll(
      ".long-register_continue-button .not-loading"
    );
    for (let i = 0; i < buttons.length; i++)
      buttons[i].innerText =
        step + 1 == _.totalSteps() ? goToShopText() : "Avançar";

    const progress_bar = document.querySelectorAll(
      ".long-register_progress-bar"
    );
    for (let i = 0; i < progress_bar.length; i++) {
      progress_bar[i].style.width = `${
        (100 * (current_step + 1)) / _.totalSteps()
      }%`;
    }
    const current_count = document.querySelectorAll(
      ".long-register_step-count .step_current"
    );
    for (let i = 0; i < current_count.length; i++)
      current_count[i].innerText = current_step + 1;

    const steps = document.querySelectorAll("[data-step]");
    for (let i = 0; i < steps.length; i++) {
      const dataStep = steps[i].getAttribute("data-step");
      if (parseInt(dataStep) == step) {
        setTimeout(() => {
          steps[i].classList.remove("d-none");
          steps[i].classList.add("show");
        }, 800);
      } else {
        if (steps[i].classList.contains("show")) {
          steps[i].classList.remove("show");
          setTimeout(() => {
            steps[i].classList.add("d-none");
          }, 750);
        }
      }
    }
  }

  function addRule(data) {
    const { type, settings } = data;
    switch (type) {
      case "general":
        const count = document.querySelectorAll(
          ".long-register_step-count .step_total"
        );
        for (let i = 0; i < count.length; i++)
          count[i].innerText = settings.steps;
        _.totalSteps = () => settings.steps;
        break;
      case "step":
        steps.push({
          step: data.step,
          fields: [...settings.fields],
        });
        break;
    }
  }

  _.submitForm = () => {
    const submit = document.querySelector(
      "[type=submit].cf-submit-form.cf-button"
    );
    if (submit) {
      submit.click();
      registerLong_loaderButtonsToggle(true);
    }
  };

  _.initRegister = () => {
    window.scroll(0, 0);
    registerLong_init();
  };

  _.nextStep = async () => {
    registerLong_loaderButtonsToggle(true);
    const fields = steps[current_step].fields;
    let wrong_step = false;
    for (let i = 0; i < fields.length; i++) {
      if (await checkField(fields[i])) wrong_step = true;
    }
    registerLong_loaderButtonsToggle(false);

    if (!wrong_step) {
      if (current_step + 1 == _.totalSteps()) _.submitForm();
      else _.form.cfForm.goToNextStep(true);
    }
  };
  _.previousStep = () => {
    if (current_step > 0) _.form.cfForm.goToPreviousStep();
    else registerLong_reset();
  };

  _.updateField = async (value, field, step) => {
    const step_data = steps.find((e) => e.step == step);
    if (step_data) {
      const field_data = step_data.fields.find((e) => e.name == field);
      if (field_data) {
        if (field_data.startsWith && !value.startsWith(field_data.startsWith)) {
          value = field_data.startsWith + value;
          const element = document.querySelector(
            `[data-register="${field}"] input`
          );
          if (element) {
            element.value = value;
            element.setAttribute("value", value);
          }
        }
        if (field_data.type == "checkbox") {
          if (value == "true" || value == true) _.resetErrorField(field);
          else if (field_data.required) errorField(field_data.error, field);
          updateCF(field, value);
          return;
        }
        if (field_data.type == "multiple-choice") {
          if (Array.isArray(value) && value.length) _.resetErrorField(field);
          else if (field_data.required) errorField(field_data.error, field);
          updateCF(field, Array.isArray(value) ? value : []);
          return;
        }
        if (
          field_data.validation &&
          typeof field_data.validation == "function"
        ) {
          const res = await field_data.validation(value);
          if (res.ok) {
            _.resetErrorField(field);
            updateCF(field, value);
          }
          if (res.error) {
            errorField(res.error, field);
          }
        } else if (!value.trim() && field_data.required && field_data.error) {
          errorField(field_data.error, field);
        } else {
          updateCF(field, value);
        }
      }
    }
  };

  async function checkField(field_data) {
    const element = document.querySelector(
      `[data-register="${field_data.name}"] input`
    );
    let value;
    switch (field_data.type) {
      case "input":
        value = element.value;
        break;
      case "checkbox":
        value = element.checked;
        break;
      case "multiple-choice":
        value = JSON.parse(element.value);
        break;
      case "option-choice":
        value = document.querySelector(
          `[data-register="${field_data.name}"] select`
        ).value;
        break;
    }
    if (field_data.type == "multiple-choice") {
      if (Array.isArray(value) && value.length)
        _.resetErrorField(field_data.name);
      else if (field_data.required) {
        errorField(field_data.error, field_data.name);
        return true;
      }
      return;
    }
    if (field_data.type == "checkbox") {
      if (value == "true" || value == true) _.resetErrorField(field_data.name);
      else if (field_data.required) {
        errorField(field_data.error, field_data.name);
        return true;
      }
      return;
    }
    if (field_data.validation && typeof field_data.validation == "function") {
      const res = await field_data.validation(value);
      if (res.ok) {
        _.resetErrorField(field_data.name);
        return;
      }
      if (res.error) {
        errorField(res.error, field_data.name);
        return true;
      }
    } else if (!value.trim() && field_data.required && field_data.error) {
      errorField(field_data.error, field_data.name);
      return true;
    }
    return;
  }

  function updateCF(field, value) {
    _.form.cfForm.setFieldValue(field, value);
  }

  function errorField(error, field) {
    const element = document.querySelector(
      `[data-step="${current_step}"] [data-register="${field}"]`
    );
    if (element) {
      element.classList.add("invalid");
      if (!element.querySelector(".error_element")) {
        const error_element = document.createElement("p");
        error_element.classList.add("error_element");
        error_element.innerText = error;
        element.append(error_element);
      }
    }
  }
  _.resetErrorField = (field) => {
    const element = document.querySelector(
      `[data-step="${current_step}"] [data-register="${field}"]`
    );
    if (element) {
      element.classList.remove("invalid");
      const error_element = element.querySelector(".error_element");
      if (error_element) error_element.parentElement.removeChild(error_element);
    }
  };

  return _;
}

function registerLong_loaderButtonsToggle(check = false) {
  const spinners = document.querySelectorAll(
    ".long-register_continue-button .loading"
  );
  const text = document.querySelectorAll(
    ".long-register_continue-button .not-loading"
  );
  for (let i = 0; i < spinners.length; i++) {
    !check
      ? spinners[i].classList.add("d-none")
      : spinners[i].classList.remove("d-none");
    !check
      ? text[i].classList.remove("d-none")
      : text[i].classList.add("d-none");
  }
}

function registerLong_init() {
  const current_step = document.querySelector(
    ".long-register_step-count .step_current"
  );
  if (current_step) current_step.innerText = 1;
  const navbar = document.querySelector(".long-register_navbar");
  const navbar_default = document.querySelector(".long-register_no-navbar");
  const navbar_desktop = document.querySelector(
    ".long-register_navbar.desktop"
  );
  if (navbar && navbar_default) {
    navbar_default.classList.add("d-none");
    navbar.classList.remove("d-none");
  }
  if (navbar_desktop) navbar_desktop.classList.add("show");
  const register_start = document.querySelector(".register-long_start");
  const register_firstStep = document.querySelector('[data-step="0"]');
  if (register_start && register_firstStep) {
    register_start.classList.remove("show");
    setTimeout(() => {
      register_start.classList.add("d-none");
      register_firstStep.classList.remove("d-none");
      setTimeout(() => {
        register_firstStep.classList.add("show");
      }, 50);
    }, 800);
  }
}

function registerLong_reset() {
  const navbar = document.querySelector(".long-register_navbar");
  const navbar_default = document.querySelector(".long-register_no-navbar");
  const navbar_desktop = document.querySelector(
    ".long-register_navbar.desktop"
  );
  if (navbar && navbar_default) {
    navbar.classList.add("d-none");
    navbar_default.classList.remove("d-none");
  }
  if (navbar_desktop) navbar_desktop.classList.remove("show");
  const register_start = document.querySelector(".register-long_start");
  const register_firstStep = document.querySelector('[data-step="0"]');
  if (register_start && register_firstStep) {
    register_firstStep.classList.remove("show");
    setTimeout(() => {
      register_firstStep.classList.add("d-none");
      register_start.classList.remove("d-none");
      setTimeout(() => {
        register_start.classList.add("show");
      }, 50);
    }, 800);
  }
}
