"use strict";

const els = {
  loading: document.getElementById("loading-screen"),
  error: document.getElementById("error-screen"),
  start: document.getElementById("start-screen"),
  question: document.getElementById("question-screen"),
  result: document.getElementById("result-screen"),
  totalCount: document.getElementById("total-count"),
  sidebarScore: document.getElementById("sidebar-score"),
  category: document.getElementById("category-label"),
  questionNumber: document.getElementById("question-number"),
  questionTotal: document.getElementById("question-total"),
  progressTrack: document.getElementById("progress-track"),
  progressFill: document.getElementById("progress-fill"),
  questionText: document.getElementById("question-text"),
  answers: document.getElementById("answers"),
  feedback: document.getElementById("feedback"),
  feedbackHeading: document.getElementById("feedback-heading"),
  feedbackExplanation: document.getElementById("feedback-explanation"),
  questionHint: document.getElementById("question-hint"),
  nextButton: document.getElementById("next-button"),
  resultScore: document.getElementById("result-score"),
  resultTotal: document.getElementById("result-total"),
  resultTitle: document.getElementById("result-title"),
  resultMessage: document.getElementById("result-message"),
  resultMeter: document.getElementById("result-meter-fill"),
  correctCount: document.getElementById("correct-count"),
  incorrectCount: document.getElementById("incorrect-count"),
  accuracy: document.getElementById("accuracy"),
};

let questions = [];
let currentIndex = 0;
let score = 0;
let hasAnswered = false;

function showScreen(name) {
  for (const key of ["loading", "error", "start", "question", "result"]) {
    els[key].hidden = key !== name;
  }
}

function validQuestion(item) {
  return item && typeof item.category === "string" &&
    typeof item.question === "string" &&
    Array.isArray(item.options) && item.options.length === 4 &&
    item.options.every(option => typeof option === "string") &&
    Number.isInteger(item.answerIndex) &&
    item.answerIndex >= 0 && item.answerIndex < item.options.length &&
    typeof item.explanation === "string";
}

async function loadQuestions() {
  showScreen("loading");
  try {
    const response = await fetch("./questions.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0 || !data.every(validQuestion)) {
      throw new Error("Invalid question data");
    }
    questions = data;
    els.totalCount.textContent = String(questions.length).padStart(2, "0");
    els.questionTotal.textContent = String(questions.length).padStart(2, "0");
    els.progressTrack.setAttribute("aria-valuemax", String(questions.length));
    resetState();
    showScreen("start");
  } catch (error) {
    console.error("Question loading failed:", error);
    showScreen("error");
  }
}

function resetState() {
  currentIndex = 0;
  score = 0;
  hasAnswered = false;
  els.sidebarScore.textContent = "00";
  els.progressFill.style.width = "0%";
  els.progressTrack.setAttribute("aria-valuenow", "0");
  els.feedback.hidden = true;
  els.nextButton.hidden = true;
}

function startQuiz() {
  resetState();
  showScreen("question");
  renderQuestion();
}

function renderQuestion() {
  hasAnswered = false;
  const item = questions[currentIndex];
  els.category.textContent = item.category.toUpperCase();
  els.questionNumber.textContent = String(currentIndex + 1).padStart(2, "0");
  els.questionText.textContent = item.question;
  els.questionHint.textContent = "Choose an option to continue.";
  els.feedback.hidden = true;
  els.feedback.classList.remove("is-wrong");
  els.nextButton.hidden = true;
  els.nextButton.firstChild.textContent = currentIndex === questions.length - 1 ? "See my results " : "Next question ";
  els.answers.replaceChildren();

  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.dataset.index = String(index);
    const key = document.createElement("span");
    key.className = "answer-key";
    key.textContent = String.fromCharCode(65 + index);
    const label = document.createElement("span");
    label.className = "answer-text";
    label.textContent = option;
    button.append(key, label);
    button.addEventListener("click", () => selectAnswer(index));
    els.answers.append(button);
  });
  const completed = currentIndex;
  els.progressFill.style.width = `${(completed / questions.length) * 100}%`;
  els.progressTrack.setAttribute("aria-valuenow", String(completed));
  els.questionText.focus({ preventScroll: true });
}

function selectAnswer(selectedIndex) {
  // This guard is essential: an answer can only be submitted once per question.
  if (hasAnswered) return;
  hasAnswered = true;
  const item = questions[currentIndex];
  const correct = selectedIndex === item.answerIndex;
  if (correct) score += 1;
  els.sidebarScore.textContent = String(score).padStart(2, "0");

  [...els.answers.children].forEach((button, index) => {
    button.disabled = true;
    if (index === item.answerIndex) {
      button.classList.add("correct");
      button.setAttribute("aria-label", `${item.options[index]} — correct answer`);
      appendStatusIcon(button, "✓");
    } else if (index === selectedIndex) {
      button.classList.add("incorrect");
      button.setAttribute("aria-label", `${item.options[index]} — incorrect answer`);
      appendStatusIcon(button, "×");
    }
  });
  els.feedbackHeading.textContent = correct ? "That's right. Nicely done!" : "Not quite — here's why.";
  els.feedbackExplanation.textContent = item.explanation;
  els.feedback.classList.toggle("is-wrong", !correct);
  els.feedback.hidden = false;
  els.questionHint.textContent = correct ? "+1 point earned" : "Keep learning — you've got this.";
  els.nextButton.hidden = false;
  const completed = currentIndex + 1;
  els.progressFill.style.width = `${(completed / questions.length) * 100}%`;
  els.progressTrack.setAttribute("aria-valuenow", String(completed));
}

function appendStatusIcon(button, text) {
  const icon = document.createElement("span");
  icon.className = "answer-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = text;
  button.append(icon);
}

function advance() {
  if (!hasAnswered) return;
  if (currentIndex === questions.length - 1) {
    showResults();
    return;
  }
  currentIndex += 1;
  renderQuestion();
}

function showResults() {
  const percentage = Math.round((score / questions.length) * 100);
  els.resultScore.textContent = String(score);
  els.resultTotal.textContent = `/ ${questions.length}`;
  els.correctCount.textContent = String(score);
  els.incorrectCount.textContent = String(questions.length - score);
  els.accuracy.textContent = `${percentage}%`;
  els.resultMeter.style.width = `${percentage}%`;
  if (percentage >= 85) {
    els.resultTitle.textContent = "You know your stuff.";
    els.resultMessage.textContent = "Excellent work! You've built a strong foundation in frontend development.";
  } else if (percentage >= 60) {
    els.resultTitle.textContent = "You're getting there.";
    els.resultMessage.textContent = "A solid result. Review the explanations and keep experimenting.";
  } else {
    els.resultTitle.textContent = "Every answer teaches.";
    els.resultMessage.textContent = "Learning takes practice. Give it another go and see how far you improve.";
  }
  showScreen("result");
}

const quizDialog = document.getElementById("quiz-dialog");
const openQuiz = document.getElementById("open-quiz");
const closeQuiz = document.getElementById("close-quiz");
let lastFocus = null;
openQuiz.addEventListener("click", () => {
  lastFocus = document.activeElement;
  quizDialog.showModal();
});
closeQuiz.addEventListener("click", () => quizDialog.close());
quizDialog.addEventListener("close", () => { if (lastFocus) lastFocus.focus(); });
quizDialog.addEventListener("click", (event) => {
  if (event.target === quizDialog) quizDialog.close();
});
document.getElementById("start-button").addEventListener("click", startQuiz);
document.getElementById("next-button").addEventListener("click", advance);
document.getElementById("restart-button").addEventListener("click", startQuiz);
document.getElementById("retry-button").addEventListener("click", loadQuestions);
document.getElementById("year").textContent = String(new Date().getFullYear());
loadQuestions();
