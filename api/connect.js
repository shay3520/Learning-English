import mysql from "mysql2";

export const db = mysql.createConnection({
  connectionLimit: 100,
  host: "localhost",
  user: "root",
  password: "shay3520",
  database: "users_db",
  queueLimit: 0,
  waitForConnections: true,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});
