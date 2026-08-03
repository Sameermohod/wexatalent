"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const neo4j_1 = require("../config/neo4j");
class BaseRepository {
    async runQuery(query, params = {}) {
        const session = (0, neo4j_1.getSession)();
        try {
            const result = await session.run(query, params);
            return result;
        }
        finally {
            await session.close();
        }
    }
}
exports.BaseRepository = BaseRepository;
