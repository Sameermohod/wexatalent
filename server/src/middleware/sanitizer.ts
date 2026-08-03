import { Request, Response, NextFunction } from 'express';
import { isInt } from 'neo4j-driver';

// Recursive converter function for Neo4j Types
export const convertNeo4jTypes = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Check if it is a Neo4j Integer object
  if (isInt(obj)) {
    return obj.toNumber();
  }

  // If it's an array, recursively convert all items
  if (Array.isArray(obj)) {
    return obj.map(convertNeo4jTypes);
  }

  // If it's an object, recursively convert all properties
  if (typeof obj === 'object') {
    const converted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertNeo4jTypes(value);
    }
    return converted;
  }

  return obj;
};

// Global Express Middleware
export const neo4jSanitizer = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (body: any) {
    const sanitizedBody = convertNeo4jTypes(body);
    return originalJson.call(this, sanitizedBody);
  };

  next();
};
