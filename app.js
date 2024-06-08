const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Vulnerability 1: SQL Injection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test'
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).send('Internal Server Error');
    }
    if (results.length > 0) {
      res.cookie('auth', 'true');
      res.send('Logged in successfully!');
    } else {
      res.send('Login failed');
    }
  });
});

// Vulnerability 2: Cross-Site Scripting (XSS)
app.get('/', (req, res) => {
  res.send(`<html><body>${req.query.feedback}</body></html>`);
});

// Vulnerability 3: Command Injection
app.get('/ping', (req, res) => {
  const { ip } = req.query;
  require('child_process').exec(`ping -c 4 ${ip}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send('Failed to ping');
    }
    res.send(`<pre>${stdout}</pre>`);
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
