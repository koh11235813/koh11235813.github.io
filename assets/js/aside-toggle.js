/**
 * Mobile TOC trigger: toggles #panel-wrapper visibility on small screens.
 * Also syncs #mode-toggle-topbar with Chirpy's #mode-toggle in the sidebar.
 */
(function () {
  'use strict';

  /* ---- TOC panel toggle ---- */
  const tocTrigger = document.getElementById('toc-trigger');
  const panelWrapper = document.getElementById('panel-wrapper');

  if (tocTrigger && panelWrapper) {
    // Create scrim overlay if not already present
    let scrim = document.getElementById('panel-scrim');
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.id = 'panel-scrim';
      document.body.appendChild(scrim);
    }

    const openToc = () => {
      panelWrapper.classList.add('toc-open');
      scrim.classList.add('active');
      tocTrigger.setAttribute('aria-expanded', 'true');
    };

    const closeToc = () => {
      panelWrapper.classList.remove('toc-open');
      scrim.classList.remove('active');
      tocTrigger.setAttribute('aria-expanded', 'false');
    };

    tocTrigger.addEventListener('click', () => {
      if (panelWrapper.classList.contains('toc-open')) {
        closeToc();
      } else {
        openToc();
      }
    });

    scrim.addEventListener('click', closeToc);
  }

  /* ---- Sync topbar mode-toggle with Chirpy's sidebar mode-toggle ---- */
  const modeToggleTopbar = document.getElementById('mode-toggle-topbar');
  const modeToggleSidebar = document.getElementById('mode-toggle');

  if (modeToggleTopbar && modeToggleSidebar) {
    modeToggleTopbar.addEventListener('click', () => {
      modeToggleSidebar.click();
    });
  } else if (modeToggleTopbar) {
    // Fallback: directly toggle data-mode on html element
    modeToggleTopbar.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-mode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (current === 'dark' || (!current && prefersDark)) {
        html.setAttribute('data-mode', 'light');
        localStorage.setItem('chirpy-theme', 'light');
      } else {
        html.setAttribute('data-mode', 'dark');
        localStorage.setItem('chirpy-theme', 'dark');
      }
    });
  }
})();
