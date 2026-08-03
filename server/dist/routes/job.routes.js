"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const job_repository_1 = require("../repositories/job.repository");
const router = (0, express_1.Router)();
const jobRepo = new job_repository_1.JobRepository();
router.get('/', async (req, res) => {
    try {
        const { query } = req.query;
        const jobs = await jobRepo.findAll(query);
        return res.json(jobs);
    }
    catch (error) {
        console.error('List jobs error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const job = await jobRepo.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        return res.json(job);
    }
    catch (error) {
        console.error('Fetch job error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
