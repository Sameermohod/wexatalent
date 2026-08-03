"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphRepository = void 0;
const base_repository_1 = require("./base.repository");
class GraphRepository extends base_repository_1.BaseRepository {
    async getSubGraph(devId) {
        let cypher = '';
        const params = {};
        if (devId) {
            params.devId = devId;
            cypher = `
        MATCH (d:Developer {id: $devId})
        OPTIONAL MATCH (d)-[r:KNOWS|WORKED_AT|HAS_SKILL]-(neighbor)
        WITH d, collect(DISTINCT neighbor) AS neighbors, collect(DISTINCT r) AS rels
        WITH [node in [d] + neighbors WHERE node IS NOT NULL] AS allNodes, rels
        RETURN {
          nodes: [node in allNodes | {
            id: node.id, 
            name: node.name, 
            type: labels(node)[0], 
            role: node.role, 
            industry: node.industry,
            avatarUrl: node.avatarUrl,
            location: node.location
          }],
          edges: [rel in rels WHERE rel IS NOT NULL | {
            id: startNode(rel).id + "_" + endNode(rel).id + "_" + type(rel), 
            source: startNode(rel).id, 
            target: endNode(rel).id, 
            type: type(rel)
          }]
        } AS graph
      `;
        }
        else {
            // General dense network overview
            cypher = `
        MATCH (d:Developer)
        WITH d LIMIT 30
        OPTIONAL MATCH (d)-[r:KNOWS|WORKED_AT|HAS_SKILL]-(neighbor)
        WITH collect(DISTINCT d) AS devs, collect(DISTINCT neighbor) AS neighbors, collect(DISTINCT r) AS rels
        WITH [node in devs + neighbors WHERE node IS NOT NULL] AS allNodes, rels
        RETURN {
          nodes: [node in allNodes | {
            id: node.id, 
            name: node.name, 
            type: labels(node)[0], 
            role: node.role, 
            industry: node.industry,
            avatarUrl: node.avatarUrl,
            location: node.location
          }],
          edges: [rel in rels WHERE rel IS NOT NULL | {
            id: startNode(rel).id + "_" + endNode(rel).id + "_" + type(rel), 
            source: startNode(rel).id, 
            target: endNode(rel).id, 
            type: type(rel)
          }]
        } AS graph
      `;
        }
        const result = await this.runQuery(cypher, params);
        if (result.records.length === 0)
            return { nodes: [], edges: [] };
        const graph = result.records[0].get('graph');
        // Deduplicate nodes and edges
        const nodesMap = new Map();
        graph.nodes.forEach((n) => {
            if (n && n.id)
                nodesMap.set(n.id, n);
        });
        const edgesMap = new Map();
        graph.edges.forEach((e) => {
            if (e && e.source && e.target) {
                const key = `${e.source}_${e.target}_${e.type}`;
                edgesMap.set(key, e);
            }
        });
        return {
            nodes: Array.from(nodesMap.values()),
            edges: Array.from(edgesMap.values()),
        };
    }
}
exports.GraphRepository = GraphRepository;
