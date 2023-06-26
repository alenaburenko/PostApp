const express = require("express");
const cron = require("node-cron");
const fetch = require("node-fetch");
const { Pool } = require("pg");
const xml2js = require("xml2js");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "posts",
});
pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");

   
    const createPostsTableQuery = `CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      link TEXT NOT NULL,
      categories TEXT[]
    );`;

    pool.query(createPostsTableQuery);

    const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );`;

    pool.query(createUsersTableQuery);
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL database", err);
  });

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

cron.schedule("*/5 * * * *", async () => {
  const rssFeedUrl = "https://lifehacker.com/rss";

  try {
    const response = await fetch(rssFeedUrl);
    const xml = await response.text();

    const parser = new xml2js.Parser();
    const parsedXml = await parser.parseStringPromise(xml);

    const items = parsedXml.rss.channel[0].item;
    const posts = [];

    for (const item of items) {
      const title = item.title[0];
      const description = item.description[0];
      const link = item.link[0];
      const categories = item.category ? item.category.map((category) => category) : [];

      const postExistsQuery = "SELECT EXISTS(SELECT 1 FROM posts WHERE title = $1)";
      const postExistsData = [title];
      const postExistsResult = await pool.query(postExistsQuery, postExistsData);
      const postExists = postExistsResult.rows[0].exists;

      if (!postExists) {
        posts.push([title, description, link, categories]);
      }
    }

    if (posts.length > 0) {
      const query = "INSERT INTO posts (title, description, link, categories) VALUES ($1, $2, $3, $4)";

      await Promise.all(posts.map(async (post) => {
        try {
          await pool.query(query, post);
        } catch (error) {
          console.error(error);
        }
      }));
    }
  } catch (error) {
    console.error("Error while fetching RSS feed:", error);
  }
});


app.use(express.json());

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery =
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)";
    const insertData = [username, email, hashedPassword];

    await pool.query(insertQuery, insertData);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const selectQuery = "SELECT * FROM users WHERE email = $1";
    const selectData = [email];

    const result = await pool.query(selectQuery, selectData);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error authenticating user" });
  }
});

app.get("/posts", (req, res) => {
  pool.query("SELECT * FROM posts", (error, result) => {
    if (error) {
      console.error("Error while retrieving posts:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while retrieving posts." });
    }

  
    const parsedData = result.rows.map((row) => {
      const { description } = row;
      const parsedDescription = parseDescription(description);
      return { ...row, description: parsedDescription };
    });

    return res.json(parsedData);
  });
});

function parseDescription(description) {
  const photoRegex = /<img[^>]*src="([^"]*)"/;
  const photoMatch = description.match(photoRegex);
  const photo = photoMatch ? photoMatch[1] : null;

  const textRegex = /<p>(.*?)<\/p>/;
  const textMatch = description.match(textRegex);
  const text = textMatch ? textMatch[1] : null;

  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>Read more...<\/a>/;
  const linkMatch = description.match(linkRegex);
  const link = linkMatch ? linkMatch[1] : null;

  return { photo, text, link };
}

app.post("/posts", (req, res) => {
  const { title, description, link, categories } = req.body;
  const query = `INSERT INTO posts (title, description, link, categories) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [title, description, link, categories];
  pool.query(query, values, (error, result) => {
    if (error) {
      console.error("Error while creating post:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while creating a post." });
    }

    return res.json(result.rows[0]);
  });
});


app.put("/posts/:id", (req, res) => {
  const { id } = req.params;
  let { title, description, link, categories } = req.body;
  const query = `UPDATE posts SET title = $1, description = $2, link = $3, categories = $4 WHERE id = $5`;
  const values = [title, description, link, categories, id];
  pool.query(query, values, (error, result) => {
    if (error) {
      console.error("Error while updating post:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while updating the post." });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    return res.sendStatus(204);
  });
});


app.delete("/posts/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM posts WHERE id = $1`;
  const values = [id];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error("Error while deleting post:", error);
      return res
        .status(500)
        .json({ error: "An error occurred while deleting the post." });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Post not found." });
    }

    return res.sendStatus(204);
  });
});


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
