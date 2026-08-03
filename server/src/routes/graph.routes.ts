import { Router } from 'express';
import { GraphRepository } from '../repositories/graph.repository';

const router = Router();
const graphRepo = new GraphRepository();

router.get('/', async (req, res) => {
  try {
    const { devId } = req.query;
    const graphData = await graphRepo.getSubGraph(devId as string);
    return res.json(graphData);
  } catch (error) {
    console.error('Fetch graph data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
