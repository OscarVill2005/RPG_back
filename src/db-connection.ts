import { Pool } from 'pg';

const pool = new Pool({
  user: 'rpg_db_user',
  password: 'cc8xsvxNW4fm4ZWfFCuX3mE3Ge1YlQhu',
  host: 'dpg-d1314aemcj7s73fs5sn0-a',
  port: 5432, // default Postgres port
  database: 'rpg_db_6fjp'
});

export function query(text: any): any {
    return pool.query(text);
};