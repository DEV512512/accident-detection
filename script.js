let bleDevice, bleCharacteristic;
const logDiv = document.getElementById('log');
const smsNumber = "9910779677"; // <-- Change this if needed

document.getElementById('connectBtn').addEventListener('click', async () => {
    try {
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'ESP32' }],
            optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
        });

        if (!bleDevice) {
            log('⚠️ No device selected. Please try again.');
            return;
        }

        log('🔗 Connecting to ESP32 BLE...');
        const server = await bleDevice.gatt.connect();
        const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
        bleCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

        bleCharacteristic.startNotifications();
        bleCharacteristic.addEventListener('characteristicvaluechanged', handleNotification);

        log('✅ Connected to ESP32 BLE');
    } catch (err) {
        if (err.name === "NotFoundError") {
            log('⚠️ No device selected. Please try again.');
            alert("No device selected. Please try again.");
        } else {
            log('❌ ' + err.message);
        }
    }
});

function handleNotification(event) {
    const decoder = new TextDecoder('utf-8');
    const msg = decoder.decode(event.target.value);
    log('📥 ' + msg);

    if (msg.includes("ACCIDENT")) {
        sendSMSWithLocation(msg);
    }
}

function log(message) {
    const p = document.createElement('div');
    p.className = 'msg';
    p.textContent = message;
    logDiv.prepend(p);
}

function sendSMSWithLocation(accidentMsg) {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const locationURL = `https://maps.google.com/?q=${lat},${lon}`;
        const smsBody = encodeURIComponent(`🚨 ALERT: ${accidentMsg} detected!\nLocation: ${locationURL}`);
        const smsLink = `sms:${smsNumber}?body=${smsBody}`;
        window.location.href = smsLink;

        setTimeout(() => {
            autoCall();
        }, 1500);
    }, err => {
        log('⚠️ Location error: ' + err.message);
        const smsBody = encodeURIComponent(`🚨 ALERT: ${accidentMsg} detected! Location unavailable.`);
        const smsLink = `sms:${smsNumber}?body=${smsBody}`;
        window.location.href = smsLink;

        setTimeout(() => {
            autoCall();
        }, 1500);
    });
}

function autoCall() {
    const callLink = `tel:${smsNumber}`;
    window.location.href = callLink;
    log('📞 Auto-calling ' + smsNumber);
}
