const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const openapiSpecification = require("./openapi.json");
const { pool, initDb } = require("./db");
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(() => {
  process.exit(1);
});

app.get("/", (req,res ) =>{
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  })
})

app.get("/health", (req, res) =>{
    res.json({
      status: "ok"
    })
});


app.get("/tasks", (req, res ) =>{

    pool.query("SELECT * FROM tasks").then(result => {
    res.json(result.rows);
    });
})

app.get("/tasks/filter", (req, res) => {
    const wantDone = req.query.done;
    if(wantDone === undefined){
      return res.status(400).json({
        error: "Query parameter 'done' is required."
      })
    }
    pool.query("SELECT * FROM tasks WHERE done = $1", [wantDone === "true"]).then(result => {
      res.json(result.rows);
    });
})

app.get("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
  if (result.rows.length > 0) {
    res.json(result.rows[0]);
  } else {
    res.status(404).json({ error: `Task ${id} not found` });
  } 
});

app.post("/tasks", async (req, res) => {
  const title = req.body.title;
  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }
  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *",
      [title, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task." });
  }
});


app.put("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    return res.status(404).json({
      error: `Task ${id} not found`
    })
  }
  const current = existing.rows[0];
  const title = req.body.title !== undefined ? req.body.title : current.title;
  const done = req.body.done !== undefined ? req.body.done : current.done;
  const result = await pool.query(
    "UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *",
    [title, done, id]
  );
  res.json(result.rows[0]);
})

app.delete("/tasks/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
  if (result.rows.length === 0) {
    return res.status(404).json({
      error: `Task ${id} not found`
    })
  }
  res.status(204).send();
})
