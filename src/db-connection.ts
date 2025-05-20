import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: 'Rumbo2005',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'bar'
});

export function query(text: any): any {
    return pool.query(text);
};