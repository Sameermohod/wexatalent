import { BaseRepository } from './base.repository';

export class RecommendationRepository extends BaseRepository {
  // 1. Find developers with React AND GraphQL
  async findReactAndGraphQLDevs(limit = 20) {
    const query = `
      MATCH (d:Developer)
      WHERE (d)-[:HAS_SKILL]->(:Skill {id: "react"}) 
        AND (d)-[:HAS_SKILL]->(:Skill {id: "graphql"})
      RETURN d
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { limit });
    return result.records.map((r) => {
      const props = r.get('d').properties;
      delete props.password;
      return props;
    });
  }

  // 2. Recommend developers through mutual connections
  async recommendByMutuals(devId: string, limit = 5) {
    const query = `
      MATCH (d1:Developer {id: $devId})-[:KNOWS]-(mutual:Developer)-[:KNOWS]-(d2:Developer)
      WHERE d1 <> d2 AND NOT (d1)-[:KNOWS]-(d2)
      RETURN d2, count(mutual) as mutualCount, collect(mutual.name) as mutualNames
      ORDER BY mutualCount DESC
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { devId, limit });
    return result.records.map((r) => {
      const dev = r.get('d2').properties;
      delete dev.password;
      return {
        developer: dev,
        mutualCount: r.get('mutualCount').toNumber(),
        mutualNames: r.get('mutualNames'),
      };
    });
  }

  // 3. Find shortest path between two developers
  async findShortestPath(devId1: string, devId2: string) {
    const query = `
      MATCH path = shortestPath((d1:Developer {id: $devId1})-[r:KNOWS|COLLABORATED_WITH*..6]-(d2:Developer {id: $devId2}))
      RETURN [node in nodes(path) | {id: node.id, label: labels(node)[0], name: node.name, role: node.role, avatarUrl: node.avatarUrl}] as nodes,
             [rel in relationships(path) | {source: startNode(rel).id, target: endNode(rel).id, type: type(rel)}] as edges
    `;
    const result = await this.runQuery(query, { devId1, devId2 });
    if (result.records.length === 0) return { nodes: [], edges: [] };

    const record = result.records[0];
    return {
      nodes: record.get('nodes'),
      edges: record.get('edges'),
    };
  }

  // 4. Suggest mentors based on shared technologies
  async suggestMentors(devId: string, limit = 5) {
    const query = `
      MATCH (d:Developer {id: $devId})-[:USES]->(t:Technology)<-[:USES]-(mentor:Developer)
      WHERE mentor.experienceYears > d.experienceYears
      RETURN mentor, count(t) as sharedTechCount, collect(t.name) as sharedTechnologies
      ORDER BY sharedTechCount DESC
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { devId, limit });
    return result.records.map((r) => {
      const mentor = r.get('mentor').properties;
      delete mentor.password;
      return {
        mentor,
        sharedTechCount: r.get('sharedTechCount').toNumber(),
        sharedTechnologies: r.get('sharedTechnologies'),
      };
    });
  }

  // 5. Find companies hiring people with similar skills (Job matching)
  async recommendJobs(devId: string, limit = 5) {
    const query = `
      MATCH (d:Developer {id: $devId})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES]-(j:Job)<-[:POSTED]-(c:Company)
      RETURN c, j, count(s) as matchingSkillsCount, collect(s.name) as matchingSkills
      ORDER BY matchingSkillsCount DESC
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { devId, limit });
    return result.records.map((r) => {
      return {
        company: r.get('c').properties,
        job: r.get('j').properties,
        matchingSkillsCount: r.get('matchingSkillsCount').toNumber(),
        matchingSkills: r.get('matchingSkills'),
      };
    });
  }

  // 6. Recommend projects based on existing interests
  async recommendProjects(devId: string, limit = 5) {
    const query = `
      MATCH (d:Developer {id: $devId})-[:USES|INTERESTED_IN]->(t:Technology)<-[:USES]-(p:Project)
      WHERE NOT (d)-[:CONTRIBUTED_TO]->(:Repository)-[:USES]->(t)
      RETURN p, count(t) as matchingTechCount, collect(t.name) as matchingTech
      ORDER BY matchingTechCount DESC
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { devId, limit });
    return result.records.map((r) => {
      return {
        project: r.get('p').properties,
        matchingTechCount: r.get('matchingTechCount').toNumber(),
        matchingTech: r.get('matchingTech'),
      };
    });
  }

  // 7. Discover communities connected through shared members
  async recommendCommunities(communityId: string, limit = 5) {
    const query = `
      MATCH (c1:Community {id: $communityId})<-[:MEMBER_OF]-(d:Developer)-[:MEMBER_OF]->(c2:Community)
      WHERE c1 <> c2
      RETURN c2, count(d) as sharedMembersCount
      ORDER BY sharedMembersCount DESC
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { communityId, limit });
    return result.records.map((r) => {
      return {
        community: r.get('c2').properties,
        sharedMembersCount: r.get('sharedMembersCount').toNumber(),
      };
    });
  }

  // 8. Multi-hop traversal (Friend -> Worked At -> Technology -> Job)
  async multiHopJobTraversal(devId: string, limit = 5) {
    const query = `
      MATCH (d:Developer {id: $devId})-[:KNOWS]-(friend:Developer)-[:WORKED_AT]->(c:Company)-[:USES]->(t:Technology)<-[:REQUIRES]-(j:Job)
      RETURN friend, c, t, j
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { devId, limit });
    return result.records.map((r) => {
      const friend = r.get('friend').properties;
      delete friend.password;
      return {
        friend,
        company: r.get('c').properties,
        technology: r.get('t').properties,
        job: r.get('j').properties,
      };
    });
  }

  // 9. Complex recommendation: Jaccard Skill Similarity + Centrality Rank
  async getComplexRecommendations(devId: string, limit = 5) {
    const query = `
      MATCH (d1:Developer {id: $devId})-[:HAS_SKILL]->(s:Skill)<-[:HAS_SKILL]-(d2:Developer)
      WHERE d1 <> d2
      WITH d1, d2, count(s) as intersection

      MATCH (d1)-[:HAS_SKILL]->(s1:Skill)
      WITH d1, d2, intersection, count(s1) as set1Size

      MATCH (d2)-[:HAS_SKILL]->(s2:Skill)
      WITH d2, intersection, set1Size, count(s2) as set2Size

      WITH d2, intersection, (set1Size + set2Size - intersection) as union
      WITH d2, (toFloat(intersection) / union) as jaccardSimilarity

      OPTIONAL MATCH (d2)-[r:KNOWS]-()
      WITH d2, jaccardSimilarity, count(r) as degreeCentrality

      RETURN d2, jaccardSimilarity, degreeCentrality,
             (jaccardSimilarity * 0.7 + (toFloat(degreeCentrality) / 50.0) * 0.3) as recommendationScore
      ORDER BY recommendationScore DESC
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { devId, limit });
    return result.records.map((r) => {
      const dev = r.get('d2').properties;
      delete dev.password;
      return {
        developer: dev,
        similarity: r.get('jaccardSimilarity'),
        degree: r.get('degreeCentrality').toNumber(),
        score: r.get('recommendationScore'),
      };
    });
  }

  // 10. Bonus: Top Connected Developers
  async getTopConnectedDevelopers(limit = 10) {
    const query = `
      MATCH (d:Developer)-[r:KNOWS]-()
      RETURN d, count(r) as connectionCount
      ORDER BY connectionCount DESC
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { limit });
    return result.records.map((r) => {
      const dev = r.get('d').properties;
      delete dev.password;
      return {
        ...dev,
        connectionCount: r.get('connectionCount').toNumber(),
      };
    });
  }

  // 10. Bonus: Trending Skills
  async getTrendingSkills(limit = 10) {
    const query = `
      MATCH (d:Developer)-[:HAS_SKILL]->(s:Skill)
      RETURN s, count(d) as devCount
      ORDER BY devCount DESC
      LIMIT toInteger($limit)
    `;
    const result = await this.runQuery(query, { limit });
    return result.records.map((r) => {
      return {
        skill: r.get('s').properties,
        count: r.get('devCount').toNumber(),
      };
    });
  }

  // 10. Bonus: Relationship Heatmap (Worked At aggregations)
  async getRelationshipHeatmap() {
    const query = `
      MATCH (d:Developer)-[r:WORKED_AT]->(c:Company)
      RETURN c.industry as industry, d.location as location, count(r) as value
      ORDER BY value DESC
      LIMIT 50
    `;
    const result = await this.runQuery(query);
    return result.records.map((r) => ({
      group: r.get('industry'),
      variable: r.get('location'),
      value: r.get('value').toNumber(),
    }));
  }
}
