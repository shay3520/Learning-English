import { getUser } from "./login.js";
import OpenAI from "openai";

import { db } from "./connect.js";
import { createInterface } from "readline";

import { spawn } from "child_process";
import { fsync } from "fs";

const secretKey = process.env.OPENAI_API_KEY;
const generalUser = "generaluser@gmail.com";

const openai = new OpenAI({
  apiKey: secretKey,
});

let thread, topic, level, assistant, email;

export const chatbotPractice = async (req, res) => {
  const user = getUser();
  email = user.email;
  level = user.level;
  topic = req.body.topic;
  assistant = user.id;
  console.log("Chatbot accessed user topic:", topic);

  try {
    thread = await openai.beta.threads.create();

    if (level == "A1" || level == "A2") level = "easy";
    else if (level == "B1" || level == "B2") level = "intermediate";
    else if (level == "C1" || level == "C2") level = "difficult";

    // Generate the conversation prompt
    let conversationPrompt = `Discuss ${topic} at a ${level} level in no more than 20 words. Engage in a conversation.`;
    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant,
      instructions: conversationPrompt,
    });

    // Poll for response
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Display the AI's message
    let messages = await openai.beta.threads.messages.list(thread.id);
    let lastMessage = messages.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    if (lastMessage) {
      //console.log(AI: ${lastMessage.content[0].text.value}\n);
      // setAItoUser(AI: ${lastMessage.content[0].text.value}\n);
      res.json({ message: `${lastMessage.content[0].text.value}\n` });
    }
  } catch (err) {
    console.error(err);
    res.json({ message: "error", error: err });
  }
};

let checkSentencesLevel = [];

let counter = 0;

export const botAssisten = async (req, res) => {
  // Simplify level settings

  if (level == "A1" || level == "A2") level = "easy";
  else if (level == "B1" || level == "B2") level = "intermediate";
  else if (level == "C1" || level == "C2") level = "difficult";

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Main conversation function
  async function main() {
    try {
      //let counter=0;
      let message;
      counter += 1;
      // Get user's response
      console.log("user content: ", req.body.content);
      let userResponse = req.body.content;
      // let userResponse = await askQuestion("Your response: ");
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: userResponse,
      });

      // Call computeSimilarity without await, handle asynchronously
      computeSimilarity(topic, userResponse)
        .then((sentencesLevel) => {
          console.log("Similarity score calculated: ", sentencesLevel);
          if (
            checkSentencesLevel &&
            !checkSentencesLevel.includes(userResponse) &&
            sentencesLevel[similarity_score] > -1
          ) {
            checkSentencesLevel.push(userResponse);
          }
          console.log(
            "checkSentencesLevel.length: ",
            checkSentencesLevel.length
          );
          if (checkSentencesLevel.length >= 3 && email === generalUser) {
            //  console.log("If you want to continue  - REGISTER");
            //   res.json({message: If you want to continue  - REGISTER\n});
            //  // checkSentencesLevel = [];
          } else if (checkSentencesLevel.length >= 3) {
            console.log("15 high-level sentences collected");
            checkCEFR(checkSentencesLevel);
            checkSentencesLevel = [];
          }
        })
        .catch((error) => {
          console.error("Error computing similarity:", error);
        });

      // Generate the conversation prompt
      let conversationPrompt = `Discuss ${topic} at a ${level} level in no more than 20 words. Engage in a conversation.`;
      let run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant,
        instructions: conversationPrompt,
      });

      // Poll for response
      let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      // Display the AI's message
      let messages = await openai.beta.threads.messages.list(thread.id);
      let lastMessage = messages.data
        .filter(
          (message) => message.run_id === run.id && message.role === "assistant"
        )
        .pop();

      if (counter > 2 && email === generalUser) {
        console.log("If you want to continue  - REGISTER");
        res.json({ message: `If you want to continue  - REGISTER\n` });
      } else {
        res.json({ message: `${lastMessage.content[0].text.value}\n` });
      }
    } catch (error) {
      console.error(error);
    } finally {
      readline.close();
    }
  }

  // Start the conversation
  main();
};

async function computeSimilarity(text1, text2) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [
      "./python.py",
      JSON.stringify([text1, text2]),
    ]);

    pythonProcess.stdout.on("data", (data) => {
      // console.log("Data received from python script:", data.toString());
      resolve(JSON.parse(data.toString()));
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Error received from python script:", data.toString());
      reject(data.toString());
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        // console.log(pythonProcess exited with code ${code});
        reject(`pythonProcess exited with code ${code}`);
      }
    });
  });
}

function checkCEFR(texts) {
  const pythonProcess = spawn("python", [
    "./pythonML.py",
    JSON.stringify(texts),
  ]);

  pythonProcess.stdout.on("data", (data) => {
    // console.log("Data received from python script:", data.toString());
    console.log("Data received from python script:", data);
    updateUserLevelDB(data.toString().trim());
  });
}

function updateUserLevelDB(levelforUpdate) {
  let user = getUser();
  console.log("levelforUpdate: ", levelforUpdate);
  let levelAsStr = fromStringToNumber(levelforUpdate);
  console.log("levelAsStr: ", levelAsStr);
  let levelAsStr2 = fromStringToNumber(user.level);
  console.log("levelAsStr2: ", levelAsStr2);

  let updatedLevelNum = levelAsStr * 0.4 + levelAsStr2 * 0.6;
  let updatedLevel = fromNumberToString(updatedLevelNum);
  console.log("Updated level: ", updatedLevel);
  console.log("User email: ", user.email);
  db.query("UPDATE users SET level = ? WHERE email = ?", [
    updatedLevel,
    user.email,
  ]);
}

function fromStringToNumber(str) {
  let LEVEL_NUMERIC = {
    beginner: 0.0,
    "beginner+": 0.5,
    intermediate: 1.0,
    "intermediate+": 1.5,
    expert: 2.0,
    "expert+": 2.5,
  };

  // let LEVEL_NUMERIC = {
  //     "beginner": 0.0,"intermediate": 1.0, "expert": 2.0
  // };

  return LEVEL_NUMERIC[str];
}

function fromNumberToString(num) {
  let LABELS = {
    0.0: "beginner",
    0.5: "beginner+",
    1.0: "intermediate",
    1.5: "intermediate+",
    2.0: "expert",
    2.5: "expert+",
  };
  // let LABELS = {
  //   0.0: "beginner", 1.0: "intermediate", 2.0: "expert"
  // };
  // Find the key in LABELS that is the closest number to 'num'
  let closestLabel = Object.keys(LABELS).reduce((closestKey, currentKey) => {
    return Math.abs(parseFloat(currentKey) - num) <
      Math.abs(parseFloat(closestKey) - num)
      ? currentKey
      : closestKey;
  });

  // Return the label corresponding to the closest number
  return LABELS[closestLabel];
}
