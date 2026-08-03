import { Router } from 'express';
import { JobRepository } from '../repositories/job.repository';

const router = Router();
const jobRepo = new JobRepository();

router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    const jobs = await jobRepo.findAll(query as string);
    return res.json(jobs);
  } catch (error) {
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
  } catch (error) {
    console.error('Fetch job error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
