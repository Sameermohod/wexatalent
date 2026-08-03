"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const company_repository_1 = require("../repositories/company.repository");
const router = (0, express_1.Router)();
const companyRepo = new company_repository_1.CompanyRepository();
router.get('/', async (req, res) => {
    try {
        const companies = await companyRepo.findAll();
        return res.json(companies);
    }
    catch (error) {
        console.error('List companies error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const company = await companyRepo.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        return res.json(company);
    }
    catch (error) {
        console.error('Fetch company error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
