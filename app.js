const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const path = require("path");
const app = express();
app.use(express.json());

let db = null;
const port = 3000;
const dbFilePath = path.join(__dirname, "./userData.db");

// Connect to SQLite database and create the table if it doesn't exist
const connectDatabaseWithServer = async () => {
  try {
    db = await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    });

    // Create models table if it doesn't exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT NOT NULL,
        lastname TEXT NOT NULL,
        skin_color TEXT NOT NULL,
        height INTEGER NOT NULL,
        email TEXT NOT NULL UNIQUE,
        location TEXT NOT NULL,
        gender TEXT NOT NULL,
        password TEXT NOT NULL
      )
    `);

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log("Connected to the SQLite database.");
    });
  } catch (error) {
    console.error(`Failed to connect to the database: ${error.message}`);
  }
};

connectDatabaseWithServer();

// Endpoint to get all users (for testing purposes)
app.get("/register", async (req, res) => {
  try {
    let getUserQuery = `SELECT * FROM models`;
    let dbResponse = await db.all(getUserQuery);
    res.send(dbResponse);
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve users." });
  }
});

// Endpoint to register a new model
app.post("/register", async (req, res) => {
  const { firstname, lastname, skin_color, height, email, location, gender, password } = req.body;
  try {
    let checkUserQuery = `SELECT * FROM models WHERE email = '${email}'`;
    let checkInDataBase = await db.get(checkUserQuery);
    if (checkInDataBase === undefined) {
      if (password.length < 5) {
        res.status(400).send("Password is too short");
      } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        let createNewModel = `INSERT INTO models (firstname, lastname, skin_color, height, email, location, gender, password)
        VALUES ('${firstname}', '${lastname}', '${skin_color}', ${height}, '${email}', '${location}', '${gender}', '${hashedPassword}')`;
        await db.run(createNewModel);
        res.status(200).send("Model registered successfully");
      }
    } else {
      res.status(400).send("Model already exists");
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to register model." });
  }
});

// Endpoint to login a model
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let getUserDetails = `SELECT * FROM models WHERE email = '${email}'`;
    let checkInDb = await db.get(getUserDetails);
    if (checkInDb === undefined) {
      res.status(400).send("Invalid email");
    } else {
      const isPasswordMatched = await bcrypt.compare(
        password,
        checkInDb.password
      );

      if (isPasswordMatched) {
        res.status(200).send("Login successful!");
      } else {
        res.status(400).send("Invalid password");
      }
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to login model." });
  }
});

// Endpoint to change model password
app.put("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    let getUserDetail = `SELECT * FROM models WHERE email = '${email}'`;
    let dbResponse = await db.get(getUserDetail);
    const isPasswordCheck = await bcrypt.compare(
      oldPassword,
      dbResponse.password
    );
    if (!isPasswordCheck) {
      res.status(400).send("Invalid current password");
    } else {
      if (newPassword.length < 5) {
        res.status(400).send("New password is too short");
      } else {
        let newPasswordHash = await bcrypt.hash(newPassword, 10);
        let updatePasswordQuery = `UPDATE models SET password = '${newPasswordHash}' WHERE email = '${email}'`;
        await db.run(updatePasswordQuery);
        res.status(200).send("Password updated successfully");
      }
    }
  } catch (error) {
    res.status(500).send({ error: "Failed to update password." });
  }
});

module.exports = app;