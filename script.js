let bleDevice, bleCharacteristic;
const logDiv = document.getElementById("log");
const smsNumber = "9910779677"; // Change if needed

document.getElementById("connectBtn").addEventListener("click", async () => {
    log("🔍 Requesting Bluetooth Device...");
    
    try {
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "ESP32" }],
            optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
        });

        log("🔗 Connecting to GATT Server...");
        const server = await bleDevice.gatt.connect();
        log("✅ Connected to GATT Server!");

        const service = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
        bleCharacteristic = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");

        bleCharacteristic.startNotifications();
        bleCharacteristic.addEventListener("characteristicvaluechanged", handleNotification);

        log("📡 Listening for notifications...");
    } catch (err) {
        log("❌ Bluetooth Error: " + err.message);
    }
});

function handleNotification(event) {
    const msg = new TextDecoder("utf-8").decode(event.target.value);
    log("📥 Received: " + msg);

    if (msg.includes("ACCIDENT")) {
        sendSMSWithLocation(msg);
    }
}

function log(message) {
    console.log(message);  // Debugging
    const p = document.createElement("div");
    p.textContent = message;
    logDiv.prepend(p);
}

function sendSMSWithLocation(accidentMsg) {
    if (!navigator.geolocation) {
        log("⚠️ Geolocation not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const locationURL = `https://maps.google.com/?q=${lat},${lon}`;
        const smsBody = encodeURIComponent(`🚨 ALERT: ${accidentMsg} detected!\nLocation: ${locationURL}`);
        const smsLink = `sms:${smsNumber}?body=${smsBody}`;
        window.location.href = smsLink;

        setTimeout(autoCall, 1500);
    }, err => {
        log("⚠️ Location error: " + err.message);
        window.location.href = `sms:${smsNumber}?body=🚨 ALERT: ${accidentMsg} detected! Location unavailable.`;

        setTimeout(autoCall, 1500);
    });
}

function autoCall() {
    window.location.href = `tel:${smsNumber}`;
    log("📞 Auto-calling " + smsNumber);
}
