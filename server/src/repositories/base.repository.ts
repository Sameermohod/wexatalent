import { getSession } from '../config/neo4j';

export class BaseRepository {
  protected async runQuery(query: string, params: Record<string, any> = {}) {
    const session = getSession();
    try {
      const result = await session.run(query, params);
      return result;
    } finally {
      await session.close();
    }
  }
}
