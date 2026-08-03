"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeveloperRepository = void 0;
const base_repository_1 = require("./base.repository");
class DeveloperRepository extends base_repository_1.BaseRepository {
    async findAll(filters) {
        const limit = filters.limit || 20;
        const skip = filters.skip || 0;
        const params = { limit, skip };
        let matchClause = 'MATCH (d:Developer)';
        const whereClauses = [];
        if (filters.query) {
            whereClauses.push('(toLower(d.name) CONTAINS toLower($query) OR toLower(d.role) CONTAINS toLower($query) OR toLower(d.bio) CONTAINS toLower($query))');
            params.query = filters.query;
        }
        if (filters.experienceMin !== undefined) {
            whereClauses.push('d.experienceYears >= toInteger($experienceMin)');
            params.experienceMin = filters.experienceMin;
        }
        if (filters.location && filters.location !== 'All') {
            whereClauses.push('toLower(d.location) CONTAINS toLower($location)');
            params.location = filters.location;
        }
        if (filters.skills && filters.skills.length > 0) {
            // Find developers who have all of these skills
            matchClause += '-[:HAS_SKILL]->(s:Skill)';
            whereClauses.push('s.id IN $skills');
            params.skills = filters.skills;
        }
        const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        let query = '';
        if (filters.skills && filters.skills.length > 0) {
            query = `
        ${matchClause}
        ${whereStr}
        WITH d, count(DISTINCT s) as matchedSkills
        WHERE matchedSkills = toInteger($skillsCount)
        RETURN d
        ORDER BY d.experienceYears DESC
        SKIP toInteger($skip) LIMIT toInteger($limit)
      `;
            params.skillsCount = filters.skills.length;
        }
        else {
            query = `
        ${matchClause}
        ${whereStr}
        RETURN d
        ORDER BY d.experienceYears DESC
        SKIP toInteger($skip) LIMIT toInteger($limit)
      `;
        }
        const result = await this.runQuery(query, params);
        return result.records.map((record) => record.get('d').properties);
    }
    async findById(id, currentUserId) {
        const params = { id };
        let bookmarkQuery = 'OPTIONAL MATCH (curr:Developer {id: $currentUserId})-[:BOOKMARKED]->(d)';
        if (!currentUserId) {
            bookmarkQuery = 'WITH d';
        }
        else {
            params.currentUserId = currentUserId;
        }
        const query = `
      MATCH (d:Developer {id: $id})
      ${currentUserId ? `OPTIONAL MATCH (curr:Developer {id: $currentUserId}) WITH d, curr` : ''}
      OPTIONAL MATCH (d)-[r_skills:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (d)-[r_tech:USES]->(t:Technology)
      OPTIONAL MATCH (d)-[r_work:WORKED_AT]->(c:Company)
      OPTIONAL MATCH (d)-[r_contrib:CONTRIBUTED_TO]->(repo:Repository)
      OPTIONAL MATCH (d)-[:MEMBER_OF]->(comm:Community)
      OPTIONAL MATCH (d)-[:MENTORED_BY]->(m:Developer)
      ${currentUserId ? `OPTIONAL MATCH (curr)-[b:BOOKMARKED]->(d)` : ''}
      RETURN d,
             collect(DISTINCT {id: s.id, name: s.name, level: r_skills.level, category: s.category}) AS skills,
             collect(DISTINCT {id: t.id, name: t.name, years: r_tech.yearsOfExperience}) AS technologies,
             collect(DISTINCT {id: c.id, name: c.name, role: r_work.role, startDate: r_work.startDate, endDate: r_work.endDate, logoUrl: c.logoUrl}) AS experience,
             collect(DISTINCT {id: repo.id, name: repo.name, url: repo.url, commits: r_contrib.commitsCount}) AS contributions,
             collect(DISTINCT {id: comm.id, name: comm.name}) AS communities,
             m { .id, .name, .role, .avatarUrl } AS mentor,
             ${currentUserId ? 'count(b) > 0' : 'false'} AS bookmarked
    `;
        const result = await this.runQuery(query, params);
        if (result.records.length === 0)
            return null;
        const record = result.records[0];
        const devProps = record.get('d').properties;
        delete devProps.password; // Remove password from response
        return {
            ...devProps,
            skills: record.get('skills').filter((s) => s.id !== null),
            technologies: record.get('technologies').filter((t) => t.id !== null),
            experience: record.get('experience').filter((e) => e.id !== null),
            contributions: record.get('contributions').filter((c) => c.id !== null),
            communities: record.get('communities').filter((co) => co.id !== null),
            mentor: record.get('mentor'),
            bookmarked: record.get('bookmarked'),
        };
    }
    async findByEmail(email) {
        const query = `
      MATCH (d:Developer)
      WHERE d.email = $email
      RETURN d
    `;
        const result = await this.runQuery(query, { email });
        if (result.records.length === 0)
            return null;
        return result.records[0].get('d').properties;
    }
    async create(devData) {
        const query = `
      CREATE (d:Developer:Person {
        id: $id,
        name: $name,
        email: $email,
        password: $password,
        role: $role,
        bio: $bio,
        experienceYears: toInteger($experienceYears),
        avatarUrl: $avatarUrl,
        githubUrl: $githubUrl,
        linkedinUrl: $linkedinUrl,
        location: $location,
        hourlyRate: toInteger($hourlyRate),
        verified: toBoolean($verified)
      })
      RETURN d
    `;
        const result = await this.runQuery(query, devData);
        return result.records[0].get('d').properties;
    }
    async toggleBookmark(userId, targetId) {
        // Check if link exists
        const checkQuery = `
      MATCH (u:Developer {id: $userId})-[r:BOOKMARKED]->(t:Developer {id: $targetId})
      RETURN count(r) > 0 AS exists
    `;
        const checkResult = await this.runQuery(checkQuery, { userId, targetId });
        const exists = checkResult.records[0].get('exists');
        if (exists) {
            const deleteQuery = `
        MATCH (u:Developer {id: $userId})-[r:BOOKMARKED]->(t:Developer {id: $targetId})
        DELETE r
        RETURN false AS bookmarked
      `;
            const result = await this.runQuery(deleteQuery, { userId, targetId });
            return result.records[0].get('bookmarked');
        }
        else {
            const createQuery = `
        MATCH (u:Developer {id: $userId})
        MATCH (t:Developer {id: $targetId})
        CREATE (u)-[:BOOKMARKED]->(t)
        RETURN true AS bookmarked
      `;
            const result = await this.runQuery(createQuery, { userId, targetId });
            return result.records[0].get('bookmarked');
        }
    }
    async getBookmarks(userId) {
        const query = `
      MATCH (u:Developer {id: $userId})-[:BOOKMARKED]->(d:Developer)
      RETURN d
    `;
        const result = await this.runQuery(query, { userId });
        return result.records.map((record) => {
            const props = record.get('d').properties;
            delete props.password;
            return props;
        });
    }
}
exports.DeveloperRepository = DeveloperRepository;
