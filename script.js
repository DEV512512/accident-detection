let bleDevice, bleCharacteristic;

async function connectToESP32() {
    try {
        console.log("🔗 Requesting Bluetooth Device...");
        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'ESP32' }],
            optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
        });

        console.log("🔗 Connecting to GATT Server...");
        const server = await bleDevice.gatt.connect();
        
        bleDevice.addEventListener('gattserverdisconnected', onDisconnected); // Auto-reconnect

        const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
        bleCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

        await bleCharacteristic.startNotifications();
        bleCharacteristic.addEventListener('characteristicvaluechanged', handleNotification);

        console.log("✅ Connected to ESP32 BLE");

    } catch (err) {
        console.error("❌ Bluetooth Error:", err);
    }
}

function onDisconnected() {
    console.warn("⚠️ ESP32 Disconnected. Reconnecting...");
    setTimeout(() => connectToESP32(), 3000); // Auto-reconnect after 3 sec
}

function handleNotification(event) {
    const decoder = new TextDecoder('utf-8');
    const msg = decoder.decode(event.target.value);
    console.log("📥 Received from ESP32:", msg);
}
