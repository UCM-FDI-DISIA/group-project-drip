import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Increase the size limit for the body-parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from "front-end" directory
app.use(express.static(path.join(__dirname, '../front-end')));

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'earrings.db'), (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        db.run(`
            CREATE TABLE IF NOT EXISTS earrings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                brand TEXT NOT NULL,
                name TEXT NOT NULL,
                image TEXT,
                left_image TEXT,
                right_image TEXT,
                link TEXT
            )
        `, (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            }
        });
    }
});

// Function to add an earring to the database
function addEarringToDatabase(earringData, callback) {
    db.run(`
        INSERT INTO earrings (brand, name, image, left_image, right_image, link)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
        earringData.brand,
        earringData.name,
        earringData.image,
        earringData.left,
        earringData.right,
        earringData.link
    ], callback);
}

// Function to get all earrings from the database
function getEarringsFromDatabase(callback) {
    db.all(`SELECT * FROM earrings`, [], (err, rows) => {
        if (err) {
            console.error("Error fetching earrings:", err.message);
            callback(err);
        } else {
            callback(null, rows);
        }
    });
}

// Endpoint to handle earring upload
app.post('/upload-earring', (req, res) => {
    const earringData = req.body;
    addEarringToDatabase(earringData, (err) => {
        if (err) {
            console.error("Error inserting earring:", err.message);
            res.status(500).json({ status: "error", message: "Error uploading earring. Please try again." });
        } else {
            res.json({ status: "success" });
        }
    });
});

// Endpoint to get all earrings
app.get('/earrings', (req, res) => {
    getEarringsFromDatabase((err, earrings) => {
        if (err) {
            res.status(500).json({ status: "error", message: "Error fetching earrings." });
        } else {
            res.json(earrings);
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});



// sql command to delete certain earrings from database when necessary
// obvs change depeneding on which ones need to be deleted!

// db.run(`
//     DELETE FROM earrings
//     WHERE link = ?;
// `, ["https://www.nordstrom.com/s/tory-burch-kira-stud-earrings/7528067?origin=keywordsearch-personalizedsort&breadcrumb=Home%2FAll%20Results&color=710"], (err) => {
//     if (err) {
//         console.error("Error deleting rows:", err.message);
//     } else {
//         console.log("Rows deleted successfully");
//     }
// });