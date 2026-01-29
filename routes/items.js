const express = require('express');
const router = express.Router();
const auctionService = require('../services/auctionService');

router.get('/', (req, res) => {
    const items = auctionService.getItems();
    res.json(items);
});

module.exports = router;
