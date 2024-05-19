import { db } from "./connect.js";
import axios from "axios";
import { getUser } from "./login.js";

export const translateUser = async (req, res) => {
  const email = getUser().email;
  console.log(email);
  console.log("1");
  const options = {
    method: "POST",
    url: "https://microsoft-translator-text.p.rapidapi.com/translate",
    params: {
      "to[0]": req.body.lang,
      "api-version": "3.0",
      profanityAction: "NoAction",
      textType: "plain",
    },
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": "88b611fe02msh7db2175fb311c86p11172ajsnc22c2ff03d2c",
      "X-RapidAPI-Host": "microsoft-translator-text.p.rapidapi.com",
    },
    data: [
      {
        Text: req.body.text,
      },
    ],
  };

  try {
    console.log("2");
    const response = await axios.request(options);
    const translation = response.data[0].translations[0].text; // Extract the translation text

    console.log(translation);
    console.log(req.body.text, translation, email);

    db.query(
      "SELECT * FROM vocabulary WHERE word = ? AND userEmail = ?",
      [req.body.text, email],
      async (err, data) => {
        if (data.length > 0) {
          console.log("Word already exists");
          res.json({ error: "Word already exists" });
        } else if (req.body.text.toLowerCase() === translation.toLowerCase()) {
          console.log("Word doesnt exist");
          res.json("Word doesnt exist");
        } else {
          db.query(
            "INSERT INTO vocabulary (word, translation, userEmail) VALUES (?, ?, ?)",
            [req.body.text, translation, email]
          );
          res.json({ translation }); // Send the translation as JSON response
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" }); // Handle errors and send an appropriate response
  }
};

export const removeWord = async (req, res) => {
  try {
    const { taskName } = req.body;
    const email = getUser().email;

    db.query("DELETE FROM vocabulary WHERE word = ? AND userEmail = ?", [
      taskName,
      email,
    ]);

    res.json({ message: "Word removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserWords = async (req, res) => {
  try {
    const email = getUser().email;
    db.query(
      "SELECT * FROM vocabulary WHERE userEmail = ?",
      [email],
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.json(results);
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export async function loadWordsFromDB(email) {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT word, translation FROM vocabulary WHERE userEmail = ?",
      [email],
      (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      }
    );
  });
}
