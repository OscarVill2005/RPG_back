import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'admin',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'RPG'
});

export function query(text: any): any {
    return pool.query(text);
};