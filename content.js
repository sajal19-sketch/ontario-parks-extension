// content.js - Ontario Parks Auto-Monitor & Frontend Routing

console.log("[ON-Parks-Helper] Content script loaded.");

function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sawtooth";
    const durationSeconds = 60; // 1-minute alarm
    const now = audioCtx.currentTime;

    gainNode.gain.setValueAtTime(0.3, now);

    for (let t = 0; t < durationSeconds; t += 0.5) {
      oscillator.frequency.setValueAtTime(880, now + t);
      oscillator.frequency.setValueAtTime(660, now + t + 0.25);
    }

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(now);
    oscillator.stop(now + durationSeconds);
  } catch (err) {
    console.error("[ON-Parks-Helper] Audio play error:", err);
  }
}

function showVisualAlert(message, type = "success", durationSeconds = 5) {
  if (document.getElementById("on-parks-alert-banner")) {
    document.getElementById("on-parks-alert-banner").remove();
  }

  const banner = document.createElement("div");
  banner.id = "on-parks-alert-banner";
  banner.style.position = "fixed";
  banner.style.bottom = "85px"; 
  banner.style.right = "25px";
  banner.style.backgroundColor = type === "error" ? "#d32f2f" : "#1b5e20"; 
  banner.style.color = "#ffffff";
  banner.style.padding = "16px 24px";
  banner.style.fontSize = "16px";
  banner.style.fontWeight = "bold";
  banner.style.borderRadius = "8px";
  banner.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
  banner.style.zIndex = "2147483647";
  banner.style.fontFamily = "system-ui, -apple-system, sans-serif";
  banner.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  banner.style.opacity = "0";
  banner.style.transform = "translateY(20px)";

  banner.innerText = message;
  document.body.appendChild(banner);

  requestAnimationFrame(() => {
    banner.style.opacity = "1";
    banner.style.transform = "translateY(0)";
  });

  if (durationSeconds > 0) {
    setTimeout(() => {
      banner.style.opacity = "0";
      banner.style.transform = "translateY(20px)";
      setTimeout(() => banner.remove(), 400); 
    }, durationSeconds * 1000);
  }
}

window.playAlertSound = playAlertSound;
window.showVisualAlert = showVisualAlert;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXECUTE_CART_ADD") {
    console.log("[ON-Parks-Helper] Campsite match found! Triggering alarm & auto-clicking...");

    playAlertSound();
    
    // Remove the negative sign to search the DOM flexibly
    const cleanId = request.resourceId.replace('-', '');

    // Search the DOM for the specific campsite SVG pin or button
    const mapPin = document.querySelector(`[id*="${cleanId}"]`) || 
                   document.querySelector(`[data-resource-id="${request.resourceId}"]`) ||
                   document.querySelector(`[id*="${request.resourceId}"]`);

    if (mapPin) {
        showVisualAlert(`🚨 SITE FOUND! Auto-clicking map pin...`, "success", 0);
        
        // Simulate a physical user click on the map pin
        mapPin.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        
        // Wait 1.5 seconds for the side checkout panel to slide open, then click "Reserve"
        setTimeout(() => {
            const reserveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Reserve'));
            if (reserveBtn) {
                reserveBtn.click();
                showVisualAlert(`🚨 SITE FOUND! Auto-clicking Reserve...`, "success", 0);
                
                // Wait 1 second for the road closure alert to appear, then click "Acknowledge"
                setTimeout(() => {
                    const ackBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Acknowledge'));
                    if (ackBtn) ackBtn.click();
                }, 1000);
            }
        }, 1500);

    } else {
        // Fallback if the map pin is off-screen or hidden
        showVisualAlert(`🚨 SITE FOUND IN BACKGROUND! Click the 'List' tab to select it.`, "success", 0);
    }

    return true;
  }
});

function injectMonitorButton() {
  if (document.getElementById("on-parks-monitor-btn")) return;
  if (!document.body) return;

  const btn = document.createElement("button");
  btn.id = "on-parks-monitor-btn";
  btn.innerText = "🏕️ Auto-Monitor This Search";
  
  btn.style.position = "fixed";
  btn.style.bottom = "25px";
  btn.style.right = "25px";
  btn.style.backgroundColor = "#2e7d32";
  btn.style.color = "white";
  btn.style.padding = "14px 22px";
  btn.style.fontSize = "15px";
  btn.style.fontWeight = "bold";
  btn.style.borderRadius = "30px";
  btn.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
  btn.style.cursor = "pointer";
  btn.style.zIndex = "2147483647";
  btn.style.border = "2px solid white";

  btn.onmouseover = () => btn.style.backgroundColor = "#1b5e20";
  btn.onmouseout = () => btn.style.backgroundColor = "#2e7d32";

  btn.onclick = () => {
    const params = new URLSearchParams(window.location.search);
    const mapId = params.get('mapId');
    const resourceLocationId = params.get('resourceLocationId');
    const startDate = params.get('startDate');
    const nights = params.get('nights');

    const parkElement = document.querySelector('mat-select .mat-mdc-select-value-text') || document.querySelector('h2');
    const parkName = parkElement ? parkElement.innerText.trim() : "Selected Park";

    if (!startDate || !nights) {
      showVisualAlert("⚠️ Please run a search with dates on the reservation page first!", "error", 5);
      return;
    }

    chrome.storage.local.set({ 
      startDate: startDate, 
      nights: parseInt(nights, 10),
      targetMapIds: mapId ? [mapId] : null,
      resourceLocationId: resourceLocationId
    }, () => {
      btn.innerText = "✅ Monitoring Active!";
      btn.style.backgroundColor = "#1565c0";
      chrome.runtime.sendMessage({ action: "FORCE_POLL" });
      
      showVisualAlert(`Monitoring ${parkName} for ${nights} night(s) from ${startDate}.`, "success", 5);
    });
  };

  document.body.appendChild(btn);
}

window.injectMonitorButton = injectMonitorButton;
setInterval(injectMonitorButton, 2000);