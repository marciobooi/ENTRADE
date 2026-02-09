function trapTab() {

  const capture = document.querySelector("#chartOptionsMenu");
  if (capture) {
    capture.setAttribute("tabindex", "-1");
    capture.focus();

    capture.addEventListener("keydown", function handleKeydown(event) {
      if (event.key.toLowerCase() !== "tab") {
        return;
      }

      const buttons = Array.from(capture.querySelectorAll("button"));
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

  document.addEventListener("mouseup", function (e) {
    const container = document.querySelector("#chartOptionsMenu");
    const menuBtn = document.querySelector("#menu");
  
    // Check if the click is outside the container or on the menu button
    if (container && !container.contains(e.target)) {
      container.classList.add('toggleMenu');
    }
  });
  
  // Handle click on the menu button
  const menuBtn = document.querySelector("#menu");
  if (menuBtn) {
    menuBtn.addEventListener("click", function() {
      const container = document.querySelector("#chartOptionsMenu");
      if (container) {
        container.classList.toggle('toggleMenu');
      }
    });
  }
}






}