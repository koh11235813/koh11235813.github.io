document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("menu-Toggle");
  const before = document.getElementById("before");

  toggleBtn.setAttribute("aria-controls", "before");
  toggleBtn.setAttribute("aria-expanded", "false");

  if (toggleBtn && before) {
    toggleBtn.addEventListener("click", () => {
      before.classList.toggle("open");
    });
  }
});
