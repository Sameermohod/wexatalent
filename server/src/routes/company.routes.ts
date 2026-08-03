import { Router } from 'express';
import { CompanyRepository } from '../repositories/company.repository';

const router = Router();
const companyRepo = new CompanyRepository();

router.get('/', async (req, res) => {
  try {
    const companies = await companyRepo.findAll();
    return res.json(companies);
  } catch (error) {
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
  } catch (error) {
    console.error('Fetch company error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
