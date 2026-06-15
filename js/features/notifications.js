(function (window) {
  const WorkTrack = window.WorkTrack = window.WorkTrack || {};
  let pendingLockScreenNotification = null;

  function createPushContainer() {
    let container = document.getElementById("pushContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "pushContainer";
      container.className = "push-container";
      
      const shell = document.getElementById("app");
      if (shell) {
        shell.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
    }
    return container;
  }

  function show(type, isLockScreen = false) {
    if (isLockScreen) {
      renderLockScreenOverlay(type);
      return;
    }

    const container = createPushContainer();
    const t = WorkTrack.i18n.t;
    
    let timeKey = "pushAppNameNow";
    let titleKey = "";
    let bodyKey = "";
    let redirectUrl = "vault.html";

    if (type === "paycheck") {
      titleKey = "pushPaycheckTitle";
      bodyKey = "pushPaycheckBody";
    } else if (type === "passport") {
      timeKey = "pushAppName1h";
      titleKey = "pushPassportTitle";
      bodyKey = "pushPassportBody";
    }

    const html = `
      <div class="push-header">
        <div class="push-icon">W</div>
        <div class="push-meta">${t(timeKey)}</div>
      </div>
      <div class="push-title">${t(titleKey)}</div>
      <div class="push-body">${t(bodyKey)}</div>
    `;

    const notification = document.createElement("div");
    notification.className = "push-notification";
    notification.innerHTML = html;
    
    notification.addEventListener("click", () => {
      window.location.href = redirectUrl;
    });

    container.appendChild(notification);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notification.classList.add("show");
      });
    });

    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.remove("show");
        setTimeout(() => {
          if (notification.parentNode) notification.remove();
        }, 400);
      }
    }, 8000);
  }

  function renderLockScreenOverlay(type) {
    // This creates a full-screen iOS lock screen overlay over the app
    let overlay = document.getElementById("mockLockScreenOverlay");
    if (overlay) overlay.remove();

    overlay = document.createElement("div");
    overlay.id = "mockLockScreenOverlay";
    
    // Inject the lock screen CSS directly
    const style = document.createElement("style");
    style.innerHTML = `
      #mockLockScreenOverlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: linear-gradient(to bottom, #112a46, #1c458c);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 60px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        animation: fadeIn 0.3s ease forwards;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .lock-time { font-size: 80px; font-weight: 200; line-height: 1; margin-bottom: 10px; }
      .lock-date { font-size: 20px; font-weight: 500; margin-bottom: 40px; }
      #lockNotificationContainer { width: 90%; max-width: 400px; display: flex; flex-direction: column; gap: 8px; z-index: 10; }
      .lock-notification {
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 16px;
        color: black;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        text-align: left;
      }
      .lock-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; justify-content: center; align-items: center; font-size: 18px; background: #eee; }
      .paycheck-icon { background: #e0f2e9; }
      .passport-icon { background: #e0f0ff; }
      .unlock-text { position: absolute; bottom: 40px; font-size: 14px; font-weight: 600; opacity: 0.8; cursor: pointer; padding: 20px; }
      .home-indicator { position: absolute; bottom: 10px; width: 130px; height: 5px; background: white; border-radius: 5px; left: 50%; transform: translateX(-50%); }
    `;
    overlay.appendChild(style);

    const t = WorkTrack.i18n.t;
    let timeKey = "pushAppNameNow";
    let titleKey = "";
    let bodyKey = "";
    let redirectUrl = "vault.html";
    let iconHTML = `<div class="push-icon">W</div>`;

    if (type === "paycheck") {
      titleKey = "pushPaycheckTitle";
      bodyKey = "pushPaycheckBody";
      iconHTML = `<div class="lock-icon paycheck-icon">💵</div>`;
    } else if (type === "passport") {
      timeKey = "pushAppName1h";
      titleKey = "pushPassportTitle";
      bodyKey = "pushPassportBody";
      iconHTML = `<div class="lock-icon passport-icon">🌐</div>`;
    }

    const html = `
      <div class="lock-date">Wednesday, May 13</div>
      <div class="lock-time">9:41</div>
      <div id="lockNotificationContainer">
        <div class="lock-notification" id="lockNotifCard">
          <div class="push-header">
            ${iconHTML}
            <div class="push-meta">${t(timeKey)}</div>
          </div>
          <div class="push-title">${t(titleKey)}</div>
          <div class="push-body">${t(bodyKey)}</div>
        </div>
      </div>
      <div class="unlock-text" id="unlockScreenBtn">Swipe up to unlock</div>
      <div class="home-indicator"></div>
    `;

    overlay.insertAdjacentHTML('beforeend', html);
    document.body.appendChild(overlay);

    document.getElementById("lockNotifCard").addEventListener("click", () => {
      overlay.remove();
      window.location.href = redirectUrl;
    });

    document.getElementById("unlockScreenBtn").addEventListener("click", () => {
      overlay.remove();
    });
  }

  function schedule(type, delayMs = 10000) {
    setTimeout(() => {
      // If the document is hidden (phone is locked or tab backgrounded), set the flag
      if (document.hidden) {
        pendingLockScreenNotification = type;
      } else {
        // Otherwise, just show the normal dropdown
        show(type, false);
      }
    }, delayMs);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && pendingLockScreenNotification) {
      // The user unlocked the phone / returned to the app
      const type = pendingLockScreenNotification;
      pendingLockScreenNotification = null;
      // Show the lock screen overlay immediately
      show(type, true);
    }
  });

  WorkTrack.notifications = { show, schedule };
})(window);
