const io = require("socket.io-client");

const URL = "http://localhost:3001";
const ITEM_ID = 1;
const BID_AMOUNT = 150; // Ensure this is higher than starting price (100)
const NUM_CLIENTS = 10;

console.log(`Starting Concurrency Test with ${NUM_CLIENTS} clients targeting Item ${ITEM_ID} at $${BID_AMOUNT}...`);

const clients = [];
let responses = 0;
let successes = 0;
let errors = 0;

for (let i = 0; i < NUM_CLIENTS; i++) {
    const socket = io(URL, {
        transports: ["websocket"],
        forceNew: true,
    });
    clients.push(socket);

    socket.on("connect", () => {
        // Wait for all to connect? 
        // For now, we will just fire once connection is established or wait a bit.
    });

    socket.on("BID_ACCEPTED", () => {
        console.log(`Client ${i} WON the bid!`);
        successes++;
        responses++;
        checkDone();
    });

    socket.on("BID_ERROR", (data) => {
        console.log(`Client ${i} rejected: ${data.message}`);
        errors++;
        responses++;
        checkDone();
    });

    socket.on("disconnect", () => { });
}

// Wait a moment for all connections, then FIRE at once
setTimeout(() => {
    console.log("FIRING BIDS NOW!");
    clients.forEach((client) => {
        client.emit("BID_PLACED", { itemId: ITEM_ID, amount: BID_AMOUNT });
    });
}, 2000);

function checkDone() {
    if (responses === NUM_CLIENTS) {
        console.log("\n--- TEST RESULTS ---");
        console.log(`Total Bids: ${NUM_CLIENTS}`);
        console.log(`Successes: ${successes} (Should be exactly 1)`);
        console.log(`Rejections: ${errors}`);

        if (successes === 1 && errors === NUM_CLIENTS - 1) {
            console.log("✅ PASSED: Race condition handled correctly.");
        } else {
            console.log("❌ FAILED: Multiple wins or unexpected behavior.");
        }

        clients.forEach(c => c.disconnect());
        process.exit(0);
    }
}
