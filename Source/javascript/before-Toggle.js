document.addEventListener("DOMContentLoaded", () => {
  const btn   = document.getElementById("menuToggle");
  const panel = document.getElementById("before");
  const scrim = document.getElementById("scrim");   // ないなら作らなくてOK
  if(!btn || !panel) return;

  const mq = window.matchMedia("(max-width: 1024px)");
  const firstFocusable = () => panel.querySelector("a, button, input, [tabindex]:not([tabindex='-1'])");

  function openPanel(){
    panel.classList.add("open");
    document.body.classList.add("sidebar-open");
    btn.setAttribute("aria-expanded","true");
    if(scrim){ scrim.setAttribute("aria-hidden","false"); scrim.removeAttribute("hidden"); }
    // フォーカス移動（アクセシビリティ）
    const t = firstFocusable(); t && t.focus({preventScroll:true});
    // 状態保持（任意）
    try{ localStorage.setItem("beforeOpen","1"); }catch{}
  }
  function closePanel(){
    panel.classList.remove("open");
    document.body.classList.remove("sidebar-open");
    btn.setAttribute("aria-expanded","false");
    if(scrim){ scrim.setAttribute("aria-hidden","true"); }
    // フォーカスをボタンへ戻す
    btn.focus({preventScroll:true});
    try{ localStorage.setItem("beforeOpen","0"); }catch{}
  }
  function toggle(){ panel.classList.contains("open") ? closePanel() : openPanel(); }

  // ボタンで開閉
  btn.addEventListener("click", toggle);

  // オーバーレイクリックで閉じる
  scrim && scrim.addEventListener("click", closePanel);

  // パネル内クリックがオーバーレイへバブリングしないように（保険）
  panel.addEventListener("click", e => e.stopPropagation());

  // Escで閉じる（開いている時のみ）
  document.addEventListener("keydown", e => {
    if(e.key === "Escape" && panel.classList.contains("open")) closePanel();
  });

  // ビューポートがPC幅になったら強制クローズ＆状態リセット
  mq.addEventListener("change", (e) => {
    if(!e.matches){ closePanel(); }
  });

  // 初期状態（任意：前回状態を復元／モバイル時のみ）
  try{
    if(mq.matches && localStorage.getItem("beforeOpen")==="1"){ openPanel(); }
  }catch{}
});

