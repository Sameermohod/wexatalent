import { BaseRepository } from './base.repository';

export class CompanyRepository extends BaseRepository {
  async findAll() {
    const query = `
      MATCH (c:Company)
      RETURN c
      ORDER BY c.name ASC
    `;
    const result = await this.runQuery(query);
    return result.records.map((record) => record.get('c').properties);
  }

  async findById(id: string) {
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
    if (result.records.length === 0) return null;

    const record = result.records[0];
    const companyProps = record.get('c').properties;

    return {
      ...companyProps,
      technologies: record.get('technologies').filter((t: any) => t !== null),
      jobs: record.get('jobs')
        .filter((j: any) => j !== null)
        .map((j: any) => j.properties),
      employees: record.get('employees').filter((e: any) => e.id !== null),
    };
  }
}
