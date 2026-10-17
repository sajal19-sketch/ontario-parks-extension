# Ontario Parks Auto-Cart Extension

A powerful, Manifest V3 Google Chrome extension designed to monitor the Ontario Parks reservation system. It bypasses complex frontend Angular routing by combining hidden backend API polling with automated DOM manipulation to instantly secure available campsites.

## ✨ Features
* **1-Click On-Page UI:** Injects a dynamic "🏕️ Auto-Monitor This Search" button directly into the Ontario Parks webpage, automatically scraping your selected dates, nights, and specific park ID.
* **Rapid API Polling:** Runs a background service worker that queries the hidden CAMIS reservation API every 30 seconds to detect cancellations the millisecond they happen.
* **DOM Auto-Clicker:** Bypasses backend token security (`cartUid`) by physically simulating user clicks on the exact map pin, the "Reserve" button, and road closure "Acknowledge" popups.
* **Audio & Visual Alerts:** Synthesizes a native 1-minute sawtooth audio alarm and injects sleek, self-dismissing toast notifications into the browser when a site is secured.

## 🛠️ Tech Stack
* **JavaScript (ES6+)**
* **Google Chrome Extensions API (Manifest V3)**
* **DOM Manipulation & Event Dispatching**
* **Fetch API & URLSearchParams**

## 📦 Installation for Development
1. Clone this repository: `git clone https://github.com/sajal19-sketch/ontario-parks-extension.git`
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** via the toggle in the top right corner.
4. Click **Load unpacked** and select the folder containing these files.

## 🚀 How to Use
1. Visit the [Ontario Parks Reservation System](https://reservations.ontarioparks.ca/) and log into your account.
2. Search for your desired park, dates, and equipment (e.g., Single Tent, Party Size 1).
3. **Important:** Scroll down to your specific campground (e.g., Rabbit Blanket) and click the **Map** button so the individual numbered campsites are visible on your screen.
4. Click the green **"🏕️ Auto-Monitor This Search"** floating button injected in the bottom right corner of the page.
5. Leave the tab open in the background. 
6. When a site opens up, the extension will sound an alarm, automatically click the map, and lock the site. You will have 15 minutes to complete the checkout process.
