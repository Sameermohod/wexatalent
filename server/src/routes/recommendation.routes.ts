import { Router } from 'express';
import { RecommendationRepository } from '../repositories/recommendation.repository';

const router = Router();
const recRepo = new RecommendationRepository();

// React + GraphQL Devs
router.get('/react-graphql', async (req, res) => {
  try {
    const devs = await recRepo.findReactAndGraphQLDevs();
    return res.json(devs);
  } catch (error) {
    console.error('Fetch React & GraphQL devs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommend by Mutual Connections
router.get('/mutuals/:devId', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const recommendations = await recRepo.recommendByMutuals(req.params.devId, limit);
    return res.json(recommendations);
  } catch (error) {
    console.error('Fetch mutual recommendations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Shortest Path between two developers
router.get('/shortest-path', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing parameters: from and to' });
    }
    const path = await recRepo.findShortestPath(from as string, to as string);
    return res.json(path);
  } catch (error) {
    console.error('Find shortest path error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Suggest Mentors
router.get('/mentors/:devId', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const mentors = await recRepo.suggestMentors(req.params.devId, limit);
    return res.json(mentors);
  } catch (error) {
    console.error('Fetch mentor recommendations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommend Jobs
router.get('/jobs/:devId', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const jobs = await recRepo.recommendJobs(req.params.devId, limit);
    return res.json(jobs);
  } catch (error) {
    console.error('Fetch job recommendations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommend Projects
router.get('/projects/:devId', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const projects = await recRepo.recommendProjects(req.params.devId, limit);
    return res.json(projects);
  } catch (error) {
    console.error('Fetch project recommendations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommend Communities
router.get('/communities/:communityId', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const communities = await recRepo.recommendCommunities(req.params.communityId, limit);
    return res.json(communities);
  } catch (error) {
    console.error('Fetch community recommendations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Multi-hop Traversal
router.get('/multi-hop/:devId', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const hops = await recRepo.multiHopJobTraversal(req.params.devId, limit);
    return res.json(hops);
  } catch (error) {
    console.error('Fetch multi-hop job traversal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Complex recommendation (Jaccard + Centrality)
router.get('/complex/:devId', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
    const recommendations = await recRepo.getComplexRecommendations(req.params.devId, limit);
    return res.json(recommendations);
  } catch (error) {
    console.error('Fetch complex recommendation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics: Top Connected Developers
router.get('/analytics/top-connected', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const devs = await recRepo.getTopConnectedDevelopers(limit);
    return res.json(devs);
  } catch (error) {
    console.error('Fetch top connected devs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics: Trending Skills
router.get('/analytics/trending-skills', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const skills = await recRepo.getTrendingSkills(limit);
    return res.json(skills);
  } catch (error) {
    console.error('Fetch trending skills error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics: Heatmap
router.get('/analytics/heatmap', async (req, res) => {
  try {
    const heatmap = await recRepo.getRelationshipHeatmap();
    return res.json(heatmap);
  } catch (error) {
    console.error('Fetch relationship heatmap error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
