import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const getDb = () => {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith('http')) {
    console.warn('DATABASE_URL is missing or invalid. Database features will be disabled.');
    return null;
  }
  try {
    const sql = neon(url);
    return drizzle(sql, { schema });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return null;
  }
};

export const db = getDb();
