const params = new URLSearchParams(window.location.search);
const currentDifficulty = params.get("difficulty") || "easy";

const quizProgress = document.getElementById("quiz-progress");
const questionText = document.getElementById("question-text");
const questionImage = document.getElementById("question-image");
const choicesArea = document.getElementById("choices");
const answerArea = document.getElementById("answer-area");
const answerResult = document.getElementById("answer-result");
const explanation = document.getElementById("explanation");
const sourceLinks = document.getElementById("source-links");
const nextButton = document.getElementById("next-button");

let currentIndex = 0;
let score = 0;

const filteredQuestions = QUESTIONS.filter(
  question => question.difficulty === currentDifficulty
);

if (filteredQuestions.length === 0) {
  showNoQuestions();
} else {
  showQuestion();
}

function showNoQuestions() {
  quizProgress.textContent = "";
  questionText.textContent = "この難易度の問題はまだありません。";
  questionImage.hidden = true;
  choicesArea.innerHTML = "";
  answerArea.hidden = true;
}

function showQuestion() {
  const question = filteredQuestions[currentIndex];

  quizProgress.textContent = `${currentIndex + 1} / ${filteredQuestions.length}`;
  questionText.textContent = question.question;

  showImage(question);
  showChoices(question);

  answerArea.hidden = true;
  answerResult.textContent = "";
  explanation.textContent = "";
  sourceLinks.innerHTML = "";
}

function showImage(question) {
  if (question.image) {
    questionImage.src = question.image;
    questionImage.alt = question.question;
    questionImage.hidden = false;
  } else {
    questionImage.src = "";
    questionImage.alt = "";
    questionImage.hidden = true;
  }
}

function showChoices(question) {
  choicesArea.innerHTML = "";

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = choice;
    button.addEventListener("click", () => selectAnswer(index));

    choicesArea.appendChild(button);
  });
}

function selectAnswer(selectedIndex) {
  const question = filteredQuestions[currentIndex];
  const buttons = choicesArea.querySelectorAll(".choice-button");
  const isCorrect = selectedIndex === question.answerIndex;

  if (isCorrect) {
    score++;
  }

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === question.answerIndex) {
      button.classList.add("is-correct");
    }

    if (index === selectedIndex && !isCorrect) {
      button.classList.add("is-wrong");
    }
  });

  answerResult.textContent = isCorrect ? "正解！" : "不正解";
  explanation.textContent = question.explanation || "";

  showSourceLinks(question);

  if (currentIndex === filteredQuestions.length - 1) {
    nextButton.textContent = "結果を見る";
  } else {
    nextButton.textContent = "次の問題へ";
  }

  answerArea.hidden = false;
}

function showSourceLinks(question) {
  sourceLinks.innerHTML = "";

  if (!question.sourceUrls || question.sourceUrls.length === 0) {
    return;
  }

  const title = document.createElement("p");
  title.textContent = "出典・関連リンク";
  sourceLinks.appendChild(title);

  question.sourceUrls.forEach((url, index) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `リンク${index + 1}を見る`;
    link.className = "source-link";

    sourceLinks.appendChild(link);
  });
}

nextButton.addEventListener("click", () => {
  if (currentIndex === filteredQuestions.length - 1) {
    const resultUrl =
      `result.html?difficulty=${encodeURIComponent(currentDifficulty)}` +
      `&score=${score}` +
      `&total=${filteredQuestions.length}`;

    window.location.href = resultUrl;
    return;
  }

  currentIndex++;
  showQuestion();
});
