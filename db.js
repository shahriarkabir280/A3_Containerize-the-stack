require("dotenv").config();
const { Pool } = require("pg");
   
const pool = new Pool({connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/tasks_db"});

async function initDb() {
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                done BOOLEAN NOT NULL DEFAULT false
            )
        `);

        const{rows}= await pool.query("SELECT COUNT(*) FROM tasks");
        if(parseInt(rows[0].count) === 0){
            const client = await pool.connect();
            try{
                await client.query("BEGIN");
                await client.query(
                    "INSERT INTO tasks (title, done) VALUES ($1, $2), ($3, $4), ($5, $6)",
                    ["Task 1", false, "Task 2", true, "Task 3", false]
                );
                await client.query("COMMIT");
            } catch(err){
                await client.query("ROLLBACK");
                throw err;
            } finally{
                client.release();
            }
        }       

    }
   catch (err) {
    console.error("Error initializing database:", err);
    throw err;
  }
}

module.exports = { pool, initDb };
