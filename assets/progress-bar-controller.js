function progressBar_update(porcentage = 100, remaining = 0, message) {
  if (!Number.isNaN(porcentage)) {
    const body = document.querySelector("body");
    if (body) {
      body.style.setProperty(
        "--progress-bar-control",
        `${porcentage <= 100 ? porcentage : 100}%`
      );
      body.style.setProperty(
        "--progress-bar-not-full",
        remaining <= 0 ? "none" : "block"
      );
      body.style.setProperty(
        "--progress-bar-full",
        remaining <= 100 ? "block" : "none"
      );
    }
    if (!Number.isNaN(remaining)) {
      const elements = document.querySelectorAll(
        ".progress-bar_remaining-number"
      );
      for (let i = 0; i < elements.length; i++)
        elements[i].setAttribute("remaining", formatPrice(remaining));
    }
    if (message) {
      const message_containers = document.querySelectorAll(
        ".progress-bar_not-full"
      );
      for (let i = 0; i < message_containers.length; i++)
        message_containers[i].innerText = message;
    }
  }
}
