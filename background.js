// background.js - Multi-Park & Individual Site Poller

chrome.alarms.create("pollCampsites", { periodInMinutes: 0.5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pollCampsites") {
    checkMultiParkAvailability();
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "FORCE_POLL") {
    checkMultiParkAvailability();
  }
});

const targetMapIds = [
  "-2147483428", // Killbear
  "-2147483483", // Grundy Lake
  "-2147483630", // Arrowhead
  "-2147483415"  // Kiosk
];

const targetSiteIds = []; 

async function checkMultiParkAvailability() {
  chrome.storage.local.get(['startDate', 'nights', 'targetMapIds', 'resourceLocationId'], async (settings) => {
    const startDate = settings.startDate || "2026-10-18"; 
    const nights = parseInt(settings.nights || 1, 10);
    const activeMapIds = settings.targetMapIds || targetMapIds;
    const resourceLocationId = settings.resourceLocationId || "-2147483646";

    const [year, month, day] = startDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    dateObj.setDate(dateObj.getDate() + nights);
    const endDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    for (const mapId of activeMapIds) {
      const params = new URLSearchParams({
        resourceLocationId: resourceLocationId,
        mapId: mapId,
        searchTabGroupId: "0",
        bookingCategoryId: "0",
        startDate: startDate,
        endDate: endDate,
        nights: nights.toString(),
        isReserving: "true",
        equipmentId: "-32768",
        subEquipmentId: "-32768",
        partySize: "1"
      });

      const url = `https://reservations.ontarioparks.ca/api/availability/map?${params.toString()}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.resourceAvailabilities) continue;

        const availableSites = [];
        
        // Loop through the dictionary to grab both the Site ID (key) and the Availability Array (value)
        for (const [resId, dayArray] of Object.entries(data.resourceAvailabilities)) {
          // Verify every night requested is available (0)
          if (dayArray && dayArray.every(day => day.availability === 0)) {
            availableSites.push({ resourceId: resId });
          }
        }

        let matchedSite = null;

        if (targetSiteIds.length > 0) {
          matchedSite = availableSites.find(site => targetSiteIds.includes(String(site.resourceId)));
        } else {
          matchedSite = availableSites[0];
        }

        if (matchedSite) {
          console.log(`[ON-Parks-Helper] Target available! Park Map: ${mapId}, Site: ${matchedSite.resourceId}`);

          chrome.notifications.create({
            type: "basic",
            iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            title: "🚨 CAMPSITE FOUND!",
            message: `Site ${matchedSite.resourceId} is available! Carting now...`
          });

          const [tab] = await chrome.tabs.query({ url: "https://reservations.ontarioparks.ca/*" });
          if (tab) {
            chrome.tabs.sendMessage(tab.id, {
              action: "EXECUTE_CART_ADD",
              resourceId: matchedSite.resourceId,
              startDate,
              nights,
              mapId
            });
          }
          break; 
        }
      } catch (err) {
        console.error(`[ON-Parks-Helper] Error querying map ${mapId}:`, err);
      }
    }
  });
}