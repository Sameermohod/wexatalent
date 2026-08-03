"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRepository = void 0;
const base_repository_1 = require("./base.repository");
class JobRepository extends base_repository_1.BaseRepository {
    async findAll(query) {
        const params = {};
        let whereClause = '';
        if (query) {
            whereClause = 'WHERE toLower(j.title) CONTAINS toLower($query) OR toLower(j.description) CONTAINS toLower($query)';
            params.query = query;
        }
        const cypher = `
      MATCH (c:Company)-[:POSTED]->(j:Job)
      ${whereClause}
      OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
      OPTIONAL MATCH (j)-[:REQUIRES]->(t:Technology)
      RETURN j, c, 
             collect(DISTINCT s.name) AS skills,
             collect(DISTINCT t.name) AS technologies
      ORDER BY j.id DESC
    `;
        const result = await this.runQuery(cypher, params);
        return result.records.map((record) => {
            const jobProps = record.get('j').properties;
            const companyProps = record.get('c').properties;
            return {
                ...jobProps,
                company: {
                    id: companyProps.id,
                    name: companyProps.name,
                    logoUrl: companyProps.logoUrl,
                    location: companyProps.location,
                },
                skills: record.get('skills').filter((s) => s !== null),
                technologies: record.get('technologies').filter((t) => t !== null),
            };
        });
    }
    async findById(id) {
        const cypher = `
      MATCH (c:Company)-[:POSTED]->(j:Job {id: $id})
      OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
      OPTIONAL MATCH (j)-[:REQUIRES]->(t:Technology)
      RETURN j, c, 
             collect(DISTINCT s.name) AS skills,
             collect(DISTINCT t.name) AS technologies
    `;
        const result = await this.runQuery(cypher, { id });
        if (result.records.length === 0)
            return null;
        const record = result.records[0];
        const jobProps = record.get('j').properties;
        const companyProps = record.get('c').properties;
        return {
            ...jobProps,
            company: companyProps,
            skills: record.get('skills').filter((s) => s !== null),
            technologies: record.get('technologies').filter((t) => t !== null),
        };
    }
}
exports.JobRepository = JobRepository;
