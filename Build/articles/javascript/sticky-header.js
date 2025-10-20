(function(){
  const KEY = 'pref:stickyHeader';
  const chk = document.getElementById('toggleStickyHeader');
  const header = document.querySelector('.site-header');

  // 初期状態：保存値がなければ true（追従）に
  const saved = localStorage.getItem(KEY);
  const on = saved === null ? true : JSON.parse(saved);
  chk.checked = on;

  function applyStickyHeader(enabled){
    document.body.classList.toggle('header-sticky', enabled);
    document.body.classList.toggle('header-static', !enabled);
    updateHeaderOffset(); // オフセット更新
    localStorage.setItem(KEY, JSON.stringify(enabled));
  }

  function updateHeaderOffset(){
    // ヘッダー追従なら高さ分を --header-offset に反映、しないなら 0
    const enabled = document.body.classList.contains('header-sticky');
    const px = enabled && header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--header-offset', px + 'px');
  }

  // 監視：リサイズやウェブフォント適用で高さが変わる場合に追従
  const ro = new ResizeObserver(updateHeaderOffset);
  if (header) ro.observe(header);

  window.addEventListener('load', updateHeaderOffset);
  window.addEventListener('resize', updateHeaderOffset);

  chk.addEventListener('change', (e)=> applyStickyHeader(e.target.checked));

  // 初期適用
  applyStickyHeader(on);
})();
)