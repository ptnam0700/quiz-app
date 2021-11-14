const express = require("express");
const mongodb = require("mongodb");

const app = express();

app.use(express.static("public"));

// decode req.body
app.use(express.urlencoded({ extended: true }));
// decode req.body
app.use(express.json());

let correctAnswers = {};

//get new attempt
app.post("/attempts", async function startQuiz(req, res) {
  const listQuestions = await questions.find({}).toArray();
  var result = [];

  // get random 10 questions form questions collection
  for (let i = 0; i < 10; i++) {
    let index = Math.floor(Math.random() * listQuestions.length);
    result.push(listQuestions[index]);
    listQuestions.splice(index, 1);
  }

  for (let qu of result) {
    correctAnswers[qu._id] = qu.correctAnswer;
  }
  let startedAt = new Date().toISOString();

  // insert data to attempts collection
  content_quiz = await attempts.insertOne({
    questions: result,
    startedAt: startedAt,
    completed: false,
  });

  //find document to get _id
  findAttempts = await attempts.findOne({ startedAt: startedAt }, {});
  let questionsAttempts = result;

  // remove correctAnswer
  for (let j = 0; j < result.length; j++) {
    delete questionsAttempts[j].correctAnswer;
  }
  res.json({
    _id: findAttempts._id,
    questions: questionsAttempts,
    completed: false,
    startedAt: startedAt,
  });
});

async function submitAttempt(req, res) {
  const attemptID = req.params.id;
  const answers = req.body.answers;

  let score = 0;
  let scoreText = "";

  // find the attempt with corresponding id
  const attempt = await db
    .collection("attempts")
    .findOne({ _id: mongodb.ObjectId(`${attemptID}`) });

  // if the attempt is not completed, update score and scoreText
  if (attempt.completed == false) {
    for (let ans in correctAnswers) {
      for (const an in answers) {
        if (ans == an) {
          if (parseInt(correctAnswers[ans]) == parseInt(answers[an])) {
            score += 1;
          }
        }
      }
    }
    if (score < 5) {
      scoreText = "Practice more to improve it :D";
    }
    if (score == 6 || score == 5) {
      scoreText = "Good, keep up!";
    }
    if (score == 7 || score == 8) {
      scoreText = "Good, keep up!";
    }
    if (score > 8) {
      scoreText = "Perfect!!";
    }

    const upd = {
      questions: attempt.questions,
      correctAnswers: correctAnswers,
      startedAt: attempt.startedAt,
      answers: answers,
      score: score,
      scoreText: scoreText,
      completed: true,
    };

    const update = await db
      .collection("attempts")
      .updateOne({ _id: mongodb.ObjectId(`${attemptID}`) }, { $set: upd });
  }

  const result = await db
    .collection("attempts")
    .findOne({ _id: mongodb.ObjectId(`${attemptID}`) });
  res.json({
    "questions": attempt.questions,
    "correctAnswers": correctAnswers,
    "startedAt": attempt.startedAt,
    "answers": answers,
    "score": score,
    "scoreText": scoreText,
    "completed": true,
  });
}
app.post("/attempts/:id/submit", submitAttempt);

let db = null;
const DATABASE_NAME = "wpr-quiz";
// start server
async function startServer() {
  const client = await mongodb.MongoClient.connect(
    `mongodb://localhost:27017/${DATABASE_NAME}`
  );
  db = client.db();
  attempts = db.collection("attempts");
  questions = db.collection("questions");

  console.log("Connect successful");

  await app.listen(3000);
  console.log("Listening to port 3000");
}

startServer();
