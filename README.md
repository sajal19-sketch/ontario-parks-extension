# Ontario Parks Multi-Park & Site Helper

A Manifest V3 Google Chrome extension that monitors the Ontario Parks reservation system, alerts you to cancellations, and automatically adds available campsites to your cart.

## Features
* **Multi-Park Polling:** Checks availability across multiple parks every minute via the reservation API.
* **Auto-Carting:** Instantly secures an available site by utilizing your active session token to send a direct cart request.
* **Audio Alarm:** Plays a 1-minute synthesized alarm when a campsite is found and carted.

## Installation
1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the folder containing these files.

## Configuration
Before running the extension, you must set your desired camping parameters in the code.
1. Open `background.js` in a text editor.
2. Modify the `startDate` (format: YYYY-MM-DD) and `nights` variables to match your trip.
3. (Optional) Adjust the `targetMapIds` array to monitor different parks, or add specific site numbers to the `targetSiteIds` array.
4. Save the file and click the **Refresh** icon on the extension card in `chrome://extensions/`.

## Usage
1. Log into your account on the Ontario Parks reservation website.
2. Keep the browser open. The extension will run in the background, polling the API every minute.
3. When a site is found, it will trigger a Chrome notification, play a continuous audio alarm, and automatically add the site to your cart. 
4. You will receive an alert stating the site is secured. You then have 15 minutes to complete the checkout process manually.