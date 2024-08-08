const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Middleware setup
app.use(express.static('.')); // Serve static files from the current directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory SQLite database setup
const db = new sqlite3.Database(':memory:');

db.serialize(function () {
  db.run("CREATE TABLE user (username TEXT, password TEXT, title TEXT)");
  db.run("INSERT INTO user VALUES ('privilegedUser', 'privilegedUser1', 'Administrator')");
});

// Serve the HTML file on GET request
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission on POST request
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Log username, password, and query string for demonstration
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  
  // SQL query to check credentials - vulnerable to SQL injection
  let query = `SELECT title FROM user WHERE username = "${username}" AND password = "${password}"`;
  console.log(`SQL Query: ${query}`);

  // Execute the query
  db.get(query, function (err, row) {
    if (err) {
      console.error('Database Error:', err.message);
      res.redirect('/index.html#error'); // Redirect to error page
    } else if (!row) {
      res.redirect('/index.html#unauthorized'); // Redirect to unauthorized page
    } else {
      res.send(`
        Hello <b>${row.title}</b>!<br />
        This file contains all your secret data: <br /><br />
        SECRETS <br /><br />
        MORE SECRETS <br /><br />
        <a href="/index.html">Go back to login</a>
      `); // Send response with title and secret data
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});