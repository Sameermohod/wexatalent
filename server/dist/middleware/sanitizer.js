"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.neo4jSanitizer = exports.convertNeo4jTypes = void 0;
const neo4j_driver_1 = require("neo4j-driver");
// Recursive converter function for Neo4j Types
const convertNeo4jTypes = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    // Check if it is a Neo4j Integer object
    if ((0, neo4j_driver_1.isInt)(obj)) {
        return obj.toNumber();
    }
    // If it's an array, recursively convert all items
    if (Array.isArray(obj)) {
        return obj.map(exports.convertNeo4jTypes);
    }
    // If it's an object, recursively convert all properties
    if (typeof obj === 'object') {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
            converted[key] = (0, exports.convertNeo4jTypes)(value);
        }
        return converted;
    }
    return obj;
};
exports.convertNeo4jTypes = convertNeo4jTypes;
// Global Express Middleware
const neo4jSanitizer = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
        const sanitizedBody = (0, exports.convertNeo4jTypes)(body);
        return originalJson.call(this, sanitizedBody);
    };
    next();
};
exports.neo4jSanitizer = neo4jSanitizer;
