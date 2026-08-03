import neo4j, { Driver, Session } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const username = process.env.NEO4J_USERNAME || 'cognodb';
const password = process.env.NEO4J_PASSWORD || 'password';

let driver: Driver;

export const initDriver = (): Driver => {
  if (!driver) {
    console.log(`Connecting to CognoDB/Neo4j at ${uri}...`);
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      maxConnectionPoolSize: 50,
      connectionTimeout: 10000,
    });
  }
  return driver;
};

export const getSession = (database?: string): Session => {
  const activeDriver = initDriver();
  return activeDriver.session({
    database: database || undefined,
  });
};

export const verifyConnection = async (): Promise<boolean> => {
  const session = getSession();
  try {
    const result = await session.run('RETURN 1 AS num');
    const singleRecord = result.records[0];
    const val = singleRecord.get('num');
    if (val.toNumber() === 1) {
      console.log('Successfully connected to CognoDB/Neo4j Graph Database.');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to connect to CognoDB/Neo4j database:', error);
    return false;
  } finally {
    await session.close();
  }
};

export const closeDriver = async (): Promise<void> => {
  if (driver) {
    await driver.close();
    console.log('CognoDB/Neo4j connection closed.');
  }
};
