let bleDevice, bleCharacteristic;

async function connectToESP32() {
    try {
        console.log("🔗 Requesting Bluetooth Device...");
        document.getElementById("status").innerText = "🔗 Searching for ESP32...";

        bleDevice = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'ESP32' }],
            optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e']
        });

        console.log("🔗 Connecting to GATT Server...");
        document.getElementById("status").innerText = "🔗 Connecting to ESP32...";

        const server = await bleDevice.gatt.connect();
        document.getElementById("status").innerText = "✅ Connected!";

        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);

        const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
        bleCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

        await bleCharacteristic.startNotifications();
        bleCharacteristic.addEventListener('characteristicvaluechanged', handleNotification);

        console.log("✅ Connected to ESP32 BLE");
        document.getElementById("status").innerText = "✅ Waiting for messages...";

    } catch (err) {
        console.error("❌ Bluetooth Error:", err);
        document.getElementById("status").innerText = "❌ Error: " + err.message;
    }
}

function onDisconnected() {
    console.warn("⚠️ ESP32 Disconnected. Reconnecting...");
    document.getElementById("status").innerText = "⚠️ ESP32 Disconnected. Reconnecting...";
    setTimeout(() => connectToESP32(), 3000);
}

function handleNotification(event) {
    const decoder = new TextDecoder('utf-8');
    const msg = decoder.decode(event.target.value);
    console.log("📥 Received from ESP32:", msg);
    document.getElementById("log").innerHTML += `<p>📥 ${msg}</p>`;
}

document.getElementById("connectBtn").addEventListener("click", connectToESP32);
