// javascript/before-Toggle.js （直書き読み込みのままでOK）
document.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("before");
  const scrim = document.getElementById("scrim");
  if (!panel) return;

  const open = () => {
    panel.classList.add("open");
    document.body.classList.add("sidebar-open");
    if (scrim) { scrim.setAttribute("aria-hidden","false"); scrim.removeAttribute("hidden"); }
    const btn = document.querySelector('#menu-Toggle, #menuToggle');
    btn && btn.setAttribute("aria-expanded","true");
  };
  const close = () => {
    panel.classList.remove("open");
    document.body.classList.remove("sidebar-open");
    scrim && scrim.setAttribute("aria-hidden","true");
    const btn = document.querySelector('#menu-Toggle, #menuToggle');
    btn && btn.setAttribute("aria-expanded","false");
  };

  // ★イベント“委任”で拾う：IDが menu-Toggle / menuToggle どちらでもOK
  document.addEventListener("click", (e) => {
    const btn = e.target.closest('#menu-Toggle, #menuToggle');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    panel.classList.contains("open") ? close() : open();
  });

  // オーバーレイで閉じる（任意）
  scrim && scrim.addEventListener("click", close);

  // Escで閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) close();
  });
});
