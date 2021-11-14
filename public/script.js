// TODO(you): Write the JavaScript necessary to complete the assignment.
const screen_intro = document.getElementById("introduction");
const screen_quiz = document.getElementById("attempt-quiz");
const screen_review = document.getElementById("review-quiz");
const start = document.getElementsByClassName("start")[0];
const confirmSubmitBox =
  document.getElementsByClassName("confirm-submit-box")[0];
const subBackground = document.getElementsByClassName("sub-background")[0];
const formContainer = document.getElementsByClassName("form-container")[0];

const button_start = document.getElementById("start-button");
button_start.addEventListener("click", HandleScreen_quiz);

const button_submit = document.getElementById("submit-btn");
button_submit.addEventListener("click", HandleScreen_review);

const try_again = document.querySelector(".btn-try-again");
try_again.addEventListener("click", TryAgain);

const sc = document.querySelector(".sc");
const percent = document.querySelector("#percent");
const text = document.querySelector("#text");
const btnBox = document.querySelectorAll(".btn-box")[1];

let listId = [];
let resId;
let questions;
let answers = {};
let count = 0;

fetch("http://localhost:3000/attempts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => 
    res.json()
  )
  .then((res) => 
    openQuizContent(res)
  );

function openQuizContent(res) {
  questions = res.questions;
  resId = res._id;
}

function HandleScreen_quiz() {
  screen_intro.classList.add("hidden");
  screen_quiz.classList.remove("hidden");
  btnBox.classList.remove("hidden");
  start.scrollIntoView(true);
  createQuestion();
}

function createQuestion() {
  for (let ele of questions) {
    count++;
    listId.push(ele._id);
    let questionContainer = document.createElement("div");

    let name = document.createElement("p");
    let form = document.createElement("form");
    let title = document.createElement("h2");

    title.innerHTML = `Question ${count} of 10`;
    name.innerHTML = ele.text;

    questionContainer.classList.add("question-container");

    // create question content
    for (let i = 0; i < ele.answers.length; i++) {
      let formEachQues = document.createElement("div");
      let input = document.createElement("input");
      let label = document.createElement("label");

      formEachQues.classList.add("form-group");

      // handle input in form
      input.id = `q${count}-o${i}`;
      input.type = "radio";
      input.name = ele._id;

      // handle label in form
      label.htmlFor = `q${count}-o${i}`;
      label.textContent = ele.answers[i];
      label.classList.add(`q${ele._id}`);

      formEachQues.appendChild(input);
      formEachQues.appendChild(label);
      form.appendChild(formEachQues);
    }

    questionContainer.appendChild(title);
    questionContainer.appendChild(name);
    questionContainer.appendChild(form);
    formContainer.appendChild(questionContainer);
  }
}

function HandleScreen_review() {
  confirmSubmitBox.classList.remove("hidden");
  subBackground.classList.remove("hidden");
}
function CancelNextScreen() {
  confirmSubmitBox.classList.add("hidden");
  subBackground.classList.add("hidden");
}
function nextScreen() {
  screen_review.classList.remove("hidden");
  confirmSubmitBox.classList.add("hidden");
  subBackground.classList.add("hidden");
  btnBox.classList.add("hidden");
  start.scrollIntoView(true);
  handleResult();
}

function handleResult() {
  let checkedAnswers = document.querySelectorAll('input[type="radio"]:checked');
  for (let ele of checkedAnswers) {
    let key = ele.name;
    let value = ele.id.substr(-1);
    answers[key] = value;
  }

  fetch("http://localhost:3000/attempts/" + resId + "/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answers: answers }),
  })
    .then((response) => response.json())
    .then((response) => handleAnswers(response));
}

function handleAnswers(res) {
  let yourAnswer = answers;
  let correctAnswer = res.correctAnswers;

  const inputTag = document.querySelectorAll("input");

  sc.innerHTML = res.score + "/10";
  percent.innerHTML = res.score + "0%";
  text.innerHTML = res.scoreText;
  for (let ele of inputTag) {
    ele.disabled = true;
  }
  for (let ele of listId) {
    let labelCorrect = document.querySelectorAll(`.q${ele}`)[
      correctAnswer[ele]
    ];

    let boxCorrectAnswer = document.createElement("div");
    boxCorrectAnswer.innerHTML = "correct answer";
    boxCorrectAnswer.classList.add("result-box");
    labelCorrect.parentElement.appendChild(boxCorrectAnswer);

    if (ele in yourAnswer == true) {
      labelCorrect.classList.add("correct");
    }
    if (ele in yourAnswer == true && yourAnswer[ele] != correctAnswer[ele]) {
      let labelWrongAnswer = document.querySelectorAll(`.q${ele}`)[
        yourAnswer[ele]
      ];
      let boxWrong = document.createElement("span");
      boxWrong.innerHTML = "your answer";
      boxWrong.classList.add("result-box");
      labelWrongAnswer.parentElement.appendChild(boxWrong);
      labelWrongAnswer.classList.add("wrong");
    }
    if (ele in yourAnswer == false) {
      labelCorrect.classList.add("wr");
    }
  }
}

function TryAgain() {
  screen_review.classList.add("hidden");
  screen_intro.classList.remove("hidden");
  start.scrollIntoView(true);
  listId = [];
  resId = 0;
  questions = [];
  answers = {};
  count = 0;
  formContainer.innerHTML = "";

  fetch("http://localhost:3000/attempts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => openQuizContent(res));
}
