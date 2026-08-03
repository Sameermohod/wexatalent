"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const graph_repository_1 = require("../repositories/graph.repository");
const router = (0, express_1.Router)();
const graphRepo = new graph_repository_1.GraphRepository();
router.get('/', async (req, res) => {
    try {
        const { devId } = req.query;
        const graphData = await graphRepo.getSubGraph(devId);
        return res.json(graphData);
    }
    catch (error) {
        console.error('Fetch graph data error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
