let bleDevice;
let bleCharacteristic;

document.getElementById("connectBtn").addEventListener("click", connectToESP32);

async function connectToESP32() {
    try {
        console.log("Requesting Bluetooth Device...");
        bleDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] // Replace with your ESP32's service UUID
        });

        document.getElementById("status").textContent = "🟡 Connecting...";
        const server = await bleDevice.gatt.connect();
        console.log("🔗 Connected to GATT Server");

        const service = await server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
        bleCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');

        document.getElementById("status").textContent = "🟢 Connected to ESP32 BLE";

        await bleCharacteristic.startNotifications();
        bleCharacteristic.addEventListener("characteristicvaluechanged", handleNotification);

        console.log("✅ Notifications started!");
    } catch (error) {
        console.error("❌ Bluetooth Error:", error);
        document.getElementById("status").textContent = "❌ Connection Failed!";
    }
}

function handleNotification(event) {
    const decoder = new TextDecoder('utf-8');
    const msg = decoder.decode(event.target.value);
    console.log("📥 Received from ESP32:", msg);  // <-- Add this debug log
    log('📥 ' + msg);

    if (msg.includes("ACCIDENT")) {
        sendSMSWithLocation(msg);
    }
}
