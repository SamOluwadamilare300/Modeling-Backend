const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const path = require("path");
const app = express();
app.use(express.json());
const cors = require("cors");

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

    const corsOptions = {
      origin: ["http://127.0.0.1:5500", "https://modeling-client.vercel.app/"],
      methods: "GET,POST,PUT,DELETE",
      allowedHeaders: "Content-Type,Authorization",
      credentials: true,
    };

    app.use(cors(corsOptions));
    app.use(express.json());

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
    let checkUserQuery = `SELECT * FROM models WHERE email = ?`;
    let checkInDataBase = await db.get(checkUserQuery, [email]);

    if (!checkInDataBase) {
      if (password.length < 5) {
        return res.status(400).json({ message: "Password is too short" });
      }

      let hashedPassword = await bcrypt.hash(password, 10);
      let createNewModel = `
        INSERT INTO models (firstname, lastname, skin_color, height, email, location, gender, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.run(createNewModel, [firstname, lastname, skin_color, height, email, location, gender, hashedPassword]);

      // ✅ Success message after registration
      return res.status(200).json({
        message: "Congratulations! Your registration is accepted into the Modelie world. Our Admin will reach out to you for an interview to join our team of models for the next fashion week in Paris."
      });
    } else {
      return res.status(400).json({ message: "Model already exists" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to register model." });
  }
});

// Endpoint to login a model
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let getUserDetails = `SELECT * FROM models WHERE email = ?`;
    let checkInDb = await db.get(getUserDetails, [email]);
    if (!checkInDb) {
      return res.status(400).json({ message: "Invalid email" });
    } else {
      const isPasswordMatched = await bcrypt.compare(password, checkInDb.password);
      if (isPasswordMatched) {
        return res.status(200).json({ message: "Login successful!" });
      } else {
        return res.status(400).json({ message: "Invalid password" });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to login model." });
  }
});

// Endpoint to change model password
app.put("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    let getUserDetail = `SELECT * FROM models WHERE email = ?`;
    let dbResponse = await db.get(getUserDetail, [email]);
    if (!dbResponse) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isPasswordCheck = await bcrypt.compare(oldPassword, dbResponse.password);
    if (!isPasswordCheck) {
      return res.status(400).json({ message: "Invalid current password" });
    } else {
      if (newPassword.length < 5) {
        return res.status(400).json({ message: "New password is too short" });
      } else {
        let newPasswordHash = await bcrypt.hash(newPassword, 10);
        let updatePasswordQuery = `UPDATE models SET password = ? WHERE email = ?`;
        await db.run(updatePasswordQuery, [newPasswordHash, email]);
        return res.status(200).json({ message: "Password updated successfully" });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to update password." });
  }
});

module.exports = app;