function trapTab() {
  const capture = document.querySelector("#chartOptionsMenu");
  if (!capture) return;

  capture.setAttribute("tabindex", "-1");
  capture.focus();

  if (capture.dataset.trapAttached) {
    return;
  }
  capture.dataset.trapAttached = "true";

  capture.addEventListener("keydown", function handleKeydown(event) {
    if (event.key.toLowerCase() !== "tab") {
      return;
    }

    const buttons = Array.from(capture.querySelectorAll("button:not([disabled])"));
    if (buttons.length === 0) return;

    const target = event.target;
    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];

    if (event.shiftKey) {
      if (target === capture || target === firstButton) {
        event.preventDefault();
        lastButton?.focus();
      }
    } else {
      if (target === lastButton) {
        event.preventDefault();
        firstButton?.focus();
      }
    }
  });
}
