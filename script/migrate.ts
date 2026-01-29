import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });

async function migrate() {
  try {
    // Check if users table exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `);

    if (!checkTable.rows[0].exists) {
      console.log("Users table does not exist, skipping migration");
      return;
    }

    console.log("Connected to database");

    // Check if active_plan_ids column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'active_plan_ids'
    `);

    if (checkColumn.rows.length === 0) {
      console.log("Adding active_plan_ids column...");
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS active_plan_ids integer[] DEFAULT '{}'::integer[] NOT NULL
      `);
      console.log("Column added successfully");
    } else {
      console.log("active_plan_ids column already exists");
    }

    // Check if old current_plan_id column exists and drop it
    const checkOldColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'current_plan_id'
    `);

    if (checkOldColumn.rows.length > 0) {
      console.log("Removing old current_plan_id column...");
      await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS current_plan_id`);
      console.log("Old column removed");
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
