"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDriver = exports.verifyConnection = exports.getSession = exports.initDriver = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const username = process.env.NEO4J_USERNAME || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';
let driver;
const initDriver = () => {
    if (!driver) {
        console.log(`Connecting to CognoDB/Neo4j at ${uri}...`);
        driver = neo4j_driver_1.default.driver(uri, neo4j_driver_1.default.auth.basic(username, password), {
            maxConnectionPoolSize: 50,
            connectionTimeout: 10000,
        });
    }
    return driver;
};
exports.initDriver = initDriver;
const getSession = (database) => {
    const activeDriver = (0, exports.initDriver)();
    return activeDriver.session({
        database: database || undefined,
    });
};
exports.getSession = getSession;
const verifyConnection = async () => {
    const session = (0, exports.getSession)();
    try {
        const result = await session.run('RETURN 1 AS num');
        const singleRecord = result.records[0];
        const val = singleRecord.get('num');
        if (val.toNumber() === 1) {
            console.log('Successfully connected to CognoDB/Neo4j Graph Database.');
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Failed to connect to CognoDB/Neo4j database:', error);
        return false;
    }
    finally {
        await session.close();
    }
};
exports.verifyConnection = verifyConnection;
const closeDriver = async () => {
    if (driver) {
        await driver.close();
        console.log('CognoDB/Neo4j connection closed.');
    }
};
exports.closeDriver = closeDriver;
