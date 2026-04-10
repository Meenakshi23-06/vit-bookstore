const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { driver } = require("./db");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve the frontend HTML/CSS/JS files directly
app.use(express.static(path.join(__dirname, '..')));

/* -------- REGISTER -------- */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const session = driver.session();

  try {
    await session.run(
      "CREATE (u:User {username: $username, password: $password})",
      { username, password }
    );
    res.send("User Registered");
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  } finally {
    await session.close();
  }
});

/* -------- LOGIN -------- */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const session = driver.session();

  try {
    const result = await session.run(
      "MATCH (u:User {username: $username, password: $password}) RETURN u",
      { username, password }
    );

    if (result.records.length > 0) {
      res.send({ success: true });
    } else {
      res.send({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  } finally {
    await session.close();
  }
});

/* GET BOOKS BY CATEGORY */
app.get("/books/:category", async (req, res) => {
  const category = req.params.category;
  const session = driver.session();

  try {
    const result = await session.run(
      "MATCH (b:Book {category: $category}) RETURN b",
      { category }
    );

    const books = result.records.map(record => {
      const b = record.get("b").properties;
      return b;
    });

    res.send(books);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  } finally {
    await session.close();
  }
});

/* BUY BOOK (Add to Collection) */
app.post("/books/buy", async (req, res) => {
  const { username, title } = req.body;
  
  if (!username || !title) {
    return res.status(400).send({ success: false, message: "Username and Book title required" });
  }

  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:User {username: $username}), (b:Book {title: $title})
       MERGE (u)-[r:OWNS]->(b)
       RETURN r`,
      { username, title }
    );

    if (result.records.length > 0) {
      res.send({ success: true });
    } else {
      res.status(404).send({ success: false, message: "User or Book not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

/* GET USER'S BOOKS */
app.get("/my-books/:username", async (req, res) => {
  const username = req.params.username;
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:User {username: $username})-[:OWNS]->(b:Book)
       RETURN b`,
      { username }
    );

    const books = result.records.map(record => record.get("b").properties);
    res.send({ success: true, books });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

/* ADMIN GRAPH DATA */
app.get("/admin/graph", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:User)-[r:OWNS]->(b:Book) 
       RETURN u, r, b
       UNION
       MATCH (u:User) WHERE NOT (u)-[:OWNS]->() RETURN u, null AS r, null AS b
       UNION
       MATCH (b:Book) WHERE NOT ()-[:OWNS]->(b) RETURN null AS u, null AS r, b`
    );

    let nodesHash = {};
    let edges = [];

    result.records.forEach(record => {
      const u = record.get("u");
      const b = record.get("b");
      const r = record.get("r");

      if (u) {
        if (!nodesHash[u.identity.toString()]) {
          nodesHash[u.identity.toString()] = { id: u.identity.toString(), label: u.properties.username, group: 'users' };
        }
      }
      
      if (b) {
        if (!nodesHash[b.identity.toString()]) {
          nodesHash[b.identity.toString()] = { id: b.identity.toString(), label: b.properties.title, group: 'books' };
        }
      }
      
      if (u && b && r) {
        edges.push({ from: u.identity.toString(), to: b.identity.toString(), label: 'OWNS' });
      }
    });

    const nodes = Object.values(nodesHash);
    res.send({ success: true, nodes, edges });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

app.listen(5001, () => {
  console.log("Server running on http://localhost:5001 - (Version V3 - Session Fixed)");
});