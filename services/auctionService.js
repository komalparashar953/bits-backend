const items = [
    {
        id: 1,
        title: "Vintage Camera",
        startingPrice: 100,
        currentBid: 100,
        highestBidder: null,
        endTime: Date.now() + 1000 * 60 * 5, // 5 minutes from now
        imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 2,
        title: "Rare Vinyl Record",
        startingPrice: 50,
        currentBid: 50,
        highestBidder: null,
        endTime: Date.now() + 1000 * 60 * 3, // 3 minutes
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 3,
        title: "Antique Watch",
        startingPrice: 200,
        currentBid: 200,
        highestBidder: null,
        endTime: Date.now() + 1000 * 60 * 10, // 10 minutes
        imageUrl: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    {
        id: 4,
        title: "Retro Console",
        startingPrice: 150,
        currentBid: 150,
        highestBidder: null,
        endTime: Date.now() + 1000 * 60 * 7, // 7 minutes
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    }
];

const getItems = () => {
    // Demo Logic: Auto-reset expired items so the site stays "alive"
    const now = Date.now();
    items.forEach(item => {
        if (now > item.endTime + 5000) { // 5 seconds after end
            item.endTime = now + 1000 * 60 * 5; // Reset to 5 mins
            item.currentBid = item.startingPrice;
            item.highestBidder = null;
        }
    });
    return items;
};

const getItemById = (id) => {
    return items.find(item => item.id === parseInt(id));
};

/**
 * Attempts to place a bid.
 * Returns { success: boolean, message: string, item: object }
 * This function is synchronous to ensure atomicity in Node.js event loop.
 */
const placeBid = (itemId, userId, amount) => {
    const item = getItemById(itemId);

    if (!item) {
        return { success: false, message: "Item not found" };
    }

    const now = Date.now();
    if (now > item.endTime) {
        return { success: false, message: "Auction ended" };
    }

    // Check if amount is greater than current bid
    // Note: If no bids yet, first bid must be at least starting price + increment? 
    // Requirement says: "Validate it is higher than the current bid".
    // Let's assume minimum increment is 1 or just stricly higher.
    // The UI says "Bid +$10", so we expect inputs to be current + 10.
    // We will trust the amount sent but verify it is > currentBid.

    if (amount <= item.currentBid) {
        return { success: false, message: "Bid must be higher than current bid" };
    }

    // Atomic Update
    item.currentBid = amount;
    item.highestBidder = userId;

    return { success: true, item: item };
};

module.exports = {
    getItems,
    getItemById,
    placeBid
};
