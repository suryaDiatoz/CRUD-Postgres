const cors = require("cors");
const morgan = require("morgan");
const express = require("express");

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan());

// get all todo along with search and filter

// app.get("/todos", async (req, res) => {
//   try {
//     const allTodos = await pool.query("SELECT * FROM todo");
//     res.json(allTodos.rows);
//   } catch (error) {
//     console.error(error);
//     return res.status(502).json({ error: "Something Went Wrong" });
//   }
// });

app.get("/todos", async (req, res) => {
  try {
    let query = "SELECT * FROM todo";
    const { search } = req.query;

    if (search) {
      query += " WHERE description ILIKE $1"; 
    }

    const result = await pool.query(query, search ? [`%${search}%`] : []);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: "Something Went Wrong" });
  }
});



// get a todo with specific id
app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [
      id,
    ]);
         
    if (todo.rowCount == 0) {
      return res.status(404).json({ error: "Todo With that id Not found" });
    }
    res.json(todo.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: "Something Went Wrong" });

  }
});

// Create todo

app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body;

    const newTodo = await pool.query(
      "INSERT INTO todo (description) VALUES($1) RETURNING *",
      [description]
    );
    res.json(newTodo.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: "Something Went Wrong" });

  }
});

// update a todo

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const updatedTodo = await pool.query(
      "UPDATE todo SET description = $1 WHERE todo_id = $2",
      [description, id]
    );

    if (updatedTodo.rowCount == 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.status(200).json("Todo Was Updated");
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: "Something Went Wrong" });
  }
});


// delete a todo

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTodo = await pool.query(
      "DELETE FROM todo WHERE todo_id = $1",
      [id]
    );
    
    if (deletedTodo.rowCount == 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json("Todo was deleted");
  } catch (error) {
    console.error(error);
    return res.status(502).json({ error: "Something Went Wrong" });
  }
});

app.listen(8080, () => {
  console.log("Server Listening On https://localhost:8080");
});
