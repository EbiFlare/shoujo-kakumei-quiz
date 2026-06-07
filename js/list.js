const LIST_UNLOCK_CODE = "REVOLUTION";

const listLock = document.getElementById("list-lock");
const listContent = document.getElementById("list-content");
const unlockCodeInput = document.getElementById("unlock-code-input");
const unlockCodeButton = document.getElementById("unlock-code-button");
const unlockError = document.getElementById("unlock-error");

const difficultyFilter = document.getElementById("difficulty-filter");
const memberFilter = document.getElementById("member-filter");
const genreFilter = document.getElementById("genre-filter");
const keywordFilter = document.getElementById("keyword-filter");
const resetFilterButton = document.getElementById("reset-filter-button");
const listCount = document.getElementById("list-count");
const questionList = document.getElementById("question-list");

const difficultyLabels = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  "革命": "革命"
};

const isUnlocked = localStorage.getItem("quizListUnlocked") === "true";

if (isUnlocked) {
  showListContent();
} else {
  showLockContent();
}

function showLockContent() {
  listLock.hidden = false;
  listContent.hidden = true;
}

function showListContent() {
  listLock.hidden = true;
  listContent.hidden = false;

  setupFilters();
  renderList();
}

unlockCodeButton.addEventListener("click", unlockByCode);

unlockCodeInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    unlockByCode();
  }
});

function unlockByCode() {
  const input = unlockCodeInput.value.trim();

  if (input === LIST_UNLOCK_CODE) {
    localStorage.setItem("quizListUnlocked", "true");
    unlockError.hidden = true;
    showListContent();
    return;
  }

  unlockError.hidden = false;
}

function setupFilters() {
  setupDifficultyOptions();
  setupMemberOptions();
  setupGenreOptions();

  difficultyFilter.addEventListener("change", renderList);
  memberFilter.addEventListener("change", renderList);
  genreFilter.addEventListener("change", renderList);
  keywordFilter.addEventListener("input", renderList);

  resetFilterButton.addEventListener("click", () => {
    difficultyFilter.value = "";
    memberFilter.value = "";
    genreFilter.value = "";
    keywordFilter.value = "";
    renderList();
  });
}

function setupDifficultyOptions() {
  const difficulties = uniqueValues(
    QUESTIONS.map(question => question.difficulty).filter(Boolean)
  );

  difficulties.forEach(difficulty => {
    const option = document.createElement("option");
    option.value = difficulty;
    option.textContent = difficultyLabels[difficulty] || difficulty;
    difficultyFilter.appendChild(option);
  });
}

function setupMemberOptions() {
  const members = uniqueValues(
    QUESTIONS.flatMap(question => question.members || []).filter(Boolean)
  );

  members.forEach(member => {
    const option = document.createElement("option");
    option.value = member;
    option.textContent = member;
    memberFilter.appendChild(option);
  });
}

function setupGenreOptions() {
  const genres = uniqueValues(
    QUESTIONS.map(question => question.genre).filter(Boolean)
  );

  genres.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

function uniqueValues(values) {
  return Array.from(new Set(values)).sort((a, b) => {
    return String(a).localeCompare(String(b), "ja");
  });
}

function renderList() {
  const difficulty = difficultyFilter.value;
  const member = memberFilter.value;
  const genre = genreFilter.value;
  const keyword = keywordFilter.value.trim().toLowerCase();

  const filteredQuestions = QUESTIONS.filter(question => {
    const difficultyMatch = !difficulty || question.difficulty === difficulty;
    const memberMatch = !member || (question.members || []).includes(member);
    const genreMatch = !genre || question.genre === genre;

    const keywordTarget = [
      question.id,
      question.question,
      question.explanation,
      question.contributor,
      question.genre,
      ...(question.members || [])
    ]
      .join(" ")
      .toLowerCase();

    const keywordMatch = !keyword || keywordTarget.includes(keyword);

    return difficultyMatch && memberMatch && genreMatch && keywordMatch;
  });

  listCount.textContent = `${filteredQuestions.length}件の問題`;

  questionList.innerHTML = "";

  if (filteredQuestions.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-message";
    empty.textContent = "条件に一致する問題がありません。";
    questionList.appendChild(empty);
    return;
  }

  filteredQuestions.forEach(question => {
    questionList.appendChild(createQuestionCard(question));
  });
}

function createQuestionCard(question) {
  const details = document.createElement("details");
  details.className = "list-question-card";

  const summary = document.createElement("summary");
  summary.className = "list-question-summary";

  const titleArea = document.createElement("div");
  titleArea.className = "list-question-title-area";

  const meta = document.createElement("div");
  meta.className = "list-question-meta";

  const metaItems = [
    question.id,
    difficultyLabels[question.difficulty] || question.difficulty,
    question.genre,
    ...(question.members || [])
  ].filter(Boolean);

  metaItems.forEach(item => {
    const chip = document.createElement("span");
    chip.className = "meta-chip";
    chip.textContent = item;
    meta.appendChild(chip);
  });

  const questionText = document.createElement("h2");
  questionText.className = "list-question-title";
  questionText.textContent = question.question;

  titleArea.appendChild(meta);
  titleArea.appendChild(questionText);

  summary.appendChild(titleArea);
  details.appendChild(summary);

  const body = document.createElement("div");
  body.className = "list-question-body";

  if (question.image) {
    const image = document.createElement("img");
    image.className = "question-image";
    image.src = question.image;
    image.alt = question.question;
    body.appendChild(image);
  }

  const choices = document.createElement("ol");
  choices.className = "list-choices";

  question.choices.forEach((choice, index) => {
    const li = document.createElement("li");
    li.textContent = choice;

    if (index === question.answerIndex) {
      li.className = "is-correct-answer";
    }

    choices.appendChild(li);
  });

  body.appendChild(choices);

  const answer = document.createElement("p");
  answer.className = "list-answer";
  answer.textContent = `正解：${question.choices[question.answerIndex]}`;
  body.appendChild(answer);

  const explanation = document.createElement("p");
  explanation.className = "list-explanation";
  explanation.textContent = question.explanation || "";
  body.appendChild(explanation);

  if (question.contributor) {
    const contributor = document.createElement("p");
    contributor.className = "list-contributor";
    contributor.textContent = `作問：${question.contributor}`;
    body.appendChild(contributor);
  }

  const links = createSourceLinks(question);
  if (links) {
    body.appendChild(links);
  }

  details.appendChild(body);

  return details;
}

function createSourceLinks(question) {
  if (!question.sourceUrls || question.sourceUrls.length === 0) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "source-links";

  const title = document.createElement("p");
  title.textContent = "出典・関連リンク";
  wrapper.appendChild(title);

  question.sourceUrls.forEach((url, index) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "source-link";
    link.textContent = `リンク${index + 1}を見る`;

    wrapper.appendChild(link);
  });

  return wrapper;
}
