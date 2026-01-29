const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const itemsRouter = require('./routes/items');
const auctionService = require('./services/auctionService');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/items', itemsRouter);

// Serve static files from React app
// Serve static files from React app
const path = require('path');
const fs = require('fs');

// Production/Docker path: Current directory/public
const publicPath = path.join(__dirname, 'public');
// Local Development path: Sibling directory
const localDistPath = path.join(__dirname, '../frontend/dist');

const distPath = fs.existsSync(publicPath) ? publicPath : localDistPath;

app.use(express.static(distPath));

app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/items') || req.originalUrl.startsWith('/socket.io')) {
        return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
});

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for MVP, should be restricted in production
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send initial data (optional, but good for sync)
    socket.emit('INITIAL_DATA', {
        items: auctionService.getItems(),
        serverTime: Date.now()
    });

    socket.on('BID_PLACED', (data) => {
        const { itemId, amount } = data;
        // Basic validation
        if (!itemId || !amount) return;

        // Call service - this is synchronous and atomic in simple Node environment
        const result = auctionService.placeBid(itemId, socket.id, amount);

        if (result.success) {
            // Broadcast new bid to ALL clients
            io.emit('UPDATE_BID', {
                itemId: itemId,
                currentBid: result.item.currentBid,
                highestBidder: result.item.highestBidder
            });

            // Acknowledge to sender (useful for UI feedback locally if needed, 
            // though broadcast usually covers it, strictly 'Update' is for everyone)
            socket.emit('BID_ACCEPTED', { itemId });
        } else {
            // Send error only to the sender
            socket.emit('BID_ERROR', {
                itemId: itemId,
                message: result.message
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
