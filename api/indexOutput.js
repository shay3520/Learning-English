// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";


// import { chatbotPractice } from "./chatbot.js";


// const app = express();

// app.use(bodyParser.json());
// app.use(cors({
//   origin: "http://localhost:3000", // Set the origin of your client
//   credentials: true, // Allow credentials (cookies, authorization headers, etc.)
// }));

// /*require("dotenv").config();

// // Create a OpenAI connection
// const secretKey = process.env.OPENAI_API_KEY;
// const openai = new OpenAI({
//   apiKey: secretKey,
// });*/




// app.post('/api/chatbot', chatbotPractice);


// let massageToUser = getAItoUser();
// console.log(massageToUser);

// // app.post('/api/register/', (req, res) => {
// //     const salt = bcrypt.genSaltSync(10);
// //   const password = bcrypt.hashSync(req.body.password , salt);  
// //   const email=req.body.email;
// //   const username=req.body.name;

// //    //check if user exsist
// //    const q= "SELECT * FROM users WHERE email = ?"
 
// //    db.query(q,[email], (err,data)=>{
// //     if(err) return res.status(500).json(err) //problem reaching the db
// //     if(data.length) return res.status(409).json("User already exsist!") //if user exsist
 
 
// // try {

// //     db.query(
// //       "INSERT INTO users (email, password,username) VALUES (?, ?, ?)",
// //       [email,password,username]
// //   );

// //     console.log("Registration succeeded");
// //     res.json({ message: "success" });
// // } catch (err) {
// //     console.error(err);
// //     res.json({ message: "error", error: err });
// // }
// // })});



// // app.post('/api/translate/', async (req, res) => {
// //     const options = {
// //       method: 'POST',
// //       url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
// //       params: {
// //         'to[0]': req.body.lang,
// //         'api-version': '3.0',
// //         profanityAction: 'NoAction',
// //         textType: 'plain'
// //       },
// //       headers: {
// //         'content-type': 'application/json',
// //         'X-RapidAPI-Key': '075247818fmshafb071848ec291cp101e1fjsne9596a653981',
// //         'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
// //       },
// //       data: [
// //         {
// //           Text: req.body.text,
// //         }
// //       ]
// //     };
  
// //     try {
// //       const response = await axios.request(options);
// //       const translation = response.data[0].translations[0].text; // Extract the translation text
  
// //       console.log(translation);
// //       res.json({ translation }); // Send the translation as JSON response
// //     } catch (error) {
// //       console.error(error);
// //       res.status(500).json({ error: 'Internal Server Error' }); // Handle errors and send an appropriate response
// //     }
// //   });





// app.listen(8800,() =>{
//   console.log("connected")
// });


