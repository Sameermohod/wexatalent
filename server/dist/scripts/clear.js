"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j_1 = require("../config/neo4j");
const clearDatabase = async () => {
    console.log('Clearing CognoDB/Neo4j database...');
    const session = (0, neo4j_1.getSession)();
    try {
        const result = await session.run('MATCH (n) DETACH DELETE n');
        console.log('Database cleared successfully.');
        // Check constraints and indexes
        console.log('Re-creating constraints and indexes...');
        // Developer ID constraint
        await session.run(`
      CREATE CONSTRAINT unique_developer_id IF NOT EXISTS
      FOR (d:Developer) REQUIRE d.id IS UNIQUE
    `);
        // Skill ID constraint
        await session.run(`
      CREATE CONSTRAINT unique_skill_id IF NOT EXISTS
      FOR (s:Skill) REQUIRE s.id IS UNIQUE
    `);
        // Company ID constraint
        await session.run(`
      CREATE CONSTRAINT unique_company_id IF NOT EXISTS
      FOR (c:Company) REQUIRE c.id IS UNIQUE
    `);
        // Technology ID constraint
        await session.run(`
      CREATE CONSTRAINT unique_technology_id IF NOT EXISTS
      FOR (t:Technology) REQUIRE t.id IS UNIQUE
    `);
        // Job ID constraint
        await session.run(`
      CREATE CONSTRAINT unique_job_id IF NOT EXISTS
      FOR (j:Job) REQUIRE j.id IS UNIQUE
    `);
        console.log('Constraints and indexes created.');
    }
    catch (error) {
        console.error('Error clearing database:', error);
    }
    finally {
        await session.close();
        await (0, neo4j_1.closeDriver)();
    }
};
clearDatabase();
