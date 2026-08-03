"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRepository = void 0;
const base_repository_1 = require("./base.repository");
class CompanyRepository extends base_repository_1.BaseRepository {
    async findAll() {
        const query = `
      MATCH (c:Company)
      RETURN c
      ORDER BY c.name ASC
    `;
        const result = await this.runQuery(query);
        return result.records.map((record) => record.get('c').properties);
    }
    async findById(id) {
        const query = `
      MATCH (c:Company {id: $id})
      OPTIONAL MATCH (c)-[:USES]->(t:Technology)
      OPTIONAL MATCH (c)-[:POSTED]->(j:Job)
      OPTIONAL MATCH (d:Developer)-[w:WORKED_AT]->(c)
      RETURN c, 
             collect(DISTINCT t.name) AS technologies,
             collect(DISTINCT j) AS jobs,
             collect(DISTINCT { id: d.id, name: d.name, role: w.role, avatarUrl: d.avatarUrl }) AS employees
    `;
        const result = await this.runQuery(query, { id });
        if (result.records.length === 0)
            return null;
        const record = result.records[0];
        const companyProps = record.get('c').properties;
        return {
            ...companyProps,
            technologies: record.get('technologies').filter((t) => t !== null),
            jobs: record.get('jobs')
                .filter((j) => j !== null)
                .map((j) => j.properties),
            employees: record.get('employees').filter((e) => e.id !== null),
        };
    }
}
exports.CompanyRepository = CompanyRepository;
