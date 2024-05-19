import bcrypt from "bcryptjs";
import { db } from "./connect.js";
import {loadWordsFromDB} from "./translate.js";
import jwt from "jsonwebtoken";

const dotenv = await import('dotenv');
dotenv.config();

 
let currentUser = {};

export function setUser(user) {
  currentUser = user;
}

export function getUser() {
  return currentUser;
}

export const loginUser = async (req, res) => {

    try {
         db.query("SELECT * FROM users WHERE email = ?", [req.body.email], async (err, data) =>{

          if (data.length > 0) {
            const user = data[0];

            const checkPassword = bcrypt.compareSync(req.body.password, data[0].password);
            if (!checkPassword) return res.status(400).json("Wrong password or username");

            console.log("Login succeeded");
            //res.json({ message: "success", name: user.name });
           // console.log(user.id);
            const token = jwt.sign({ id: data[0].id }, "secretkey");
            const { password, ...others } = data[0];
            const words = await loadWordsFromDB(data[0].email);
            console.log(words);
            res.cookie("accessToken", token, { httpOnly: false }).status(200).json({ ...others, words });

            
            const user1 = { id: user.id, level: user.level, email: user.email};
            setUser(user1);
           

            }
        else {
            return res.status(409).json("User not found!");
        }

        });
    } catch (err) {
        console.error(err);
        res.json({ message: "error", error: err });
    }

    
}

