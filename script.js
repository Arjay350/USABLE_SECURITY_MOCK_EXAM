const questionBank = window.examQuestions;
const main = document.querySelector("#main-content");
const toast = document.querySelector("#toast");
const sections = [...new Set(questionBank.map((question) => question.section))];
const sectionSymbols = ["◈", "⌘", "⌁", "⌖", "▣", "⌗", "◉", "⌑", "⬡"];
let activeView = "dashboard";
let attempt = null;
let toastTimer;

const readScores = () => JSON.parse(localStorage.getItem("usableSecurityScores") || "[]");

function saveScores(scores) {
  localStorage.setItem("usableSecurityScores", JSON.stringify(scores));
  updateScoreCount();
}

function updateScoreCount() {
  document.querySelector("#score-count").textContent = readScores().length;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function setView(view) {
  activeView = view;
  const labels = { dashboard: "Dashboard", practice: "Practice exam", scores: "My scores", topics: "Topic library", exam: "Mock exam", results: "Exam results" };
  document.querySelector("#current-crumb").textContent = labels[view] || "Dashboard";
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("is-active", link.dataset.view === view));
  render();
  main.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  if (activeView === "dashboard") renderDashboard();
  if (activeView === "practice") renderPractice();
  if (activeView === "scores") renderScores();
  if (activeView === "topics") renderTopics();
  if (activeView === "exam") renderExam();
  if (activeView === "results") renderResults();
}

function iconMarkup() {
  return '<span class="hero-shield" aria-hidden="true"><svg viewBox="0 0 88 98" fill="none"><path d="M44 3 80 17v27c0 22-14.6 38.7-36 50C22.6 82.7 8 66 8 44V17L44 3Z" stroke="currentColor" stroke-width="2.5"/><path d="m28 47 11 11 23-25" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="45" r="31" stroke="currentColor" stroke-opacity=".16"/></svg></span>';
}

function topicCard(section, index, mini = false) {
  const count = questionBank.filter((question) => question.section === section).length;
  const symbol = sectionSymbols[index % sectionSymbols.length];
  if (mini) {
    return `<button class="topic-mini" data-action="start-topic" data-section="${escapeHTML(section)}"><span class="topic-symbol">${symbol}</span><span class="topic-mini-copy"><strong>${escapeHTML(section)}</strong><small>${count} questions · Practice</small></span></button>`;
  }
  return `<button class="topic-card" data-action="start-topic" data-section="${escapeHTML(section)}"><span class="topic-card-top"><span class="topic-symbol">${symbol}</span><span class="topic-count">${count} questions</span></span><strong>${escapeHTML(section)}</strong><span class="topic-card-bottom"><span>Start a focused practice set</span><span aria-hidden="true">→</span></span></button>`;
}

function renderDashboard() {
  const scores = readScores();
  const latest = scores[0];
  const topics = sections.map((section, index) => topicCard(section, index, true)).join("");
  const recent = latest ? `
    <div class="recent-score">
      <div class="recent-score-top"><span class="recent-score-value">${latest.percentage}%</span><span class="recent-score-meta">${latest.correct} / ${latest.questions.length} correct</span></div>
      <div class="score-track"><span style="width:${latest.percentage}%"></span></div>
      <div class="recent-score-meta">${escapeHTML(latest.title)} · ${formatDate(latest.date)}</div>
      <button class="text-button" data-action="navigate" data-view="scores" style="margin-top:11px">View score history →</button>
    </div>` : `<div class="recent-empty"><span class="empty-ring">↗</span><p>Your first score is one practice session away. Start whenever you’re ready.</p></div>`;

  main.innerHTML = `
    <div class="eyebrow"><span class="eyebrow-mark">✳</span> YOUR SECURITY STUDY SPACE</div>
    <h1 class="page-heading">Good security starts with<br class="desktop-break" /> understanding people.</h1>
    <p class="page-subtitle">Build confidence across the core ideas in usable security, one question at a time.</p>
    <section class="dashboard-hero">
      <div class="hero-copy"><span class="hero-kicker">USABLE SECURITY · MOCK EXAM</span><h2>Ready to test what<br />you know?</h2><p>Practice with questions from your reviewer. Get instant feedback, learn from missed answers, and track your progress.</p>
        <div class="hero-actions"><button class="btn btn-primary" data-action="navigate" data-view="practice">Start a practice exam <span class="btn-arrow">→</span></button><button class="btn btn-outline-light" data-action="navigate" data-view="topics">Explore topics</button></div>
      </div>
      <div class="hero-art" aria-hidden="true"><span class="hero-circuit"></span>${iconMarkup()}</div>
    </section>
    <div class="section-row"><div><h2 class="section-title">Your learning at a glance</h2><p class="section-hint">A little progress adds up to stronger security instincts.</p></div></div>
    <div class="stats-grid">
      <article class="stat-card"><span class="stat-icon">▦</span><span class="stat-copy"><strong class="stat-value">${questionBank.length}</strong><span class="stat-label">Questions to practice</span></span></article>
      <article class="stat-card"><span class="stat-icon blue">◈</span><span class="stat-copy"><strong class="stat-value">${sections.length}</strong><span class="stat-label">Subject areas</span></span></article>
      <article class="stat-card"><span class="stat-icon cream">↗</span><span class="stat-copy"><strong class="stat-value">${scores.length}</strong><span class="stat-label">Completed exams</span></span></article>
    </div>
    <div class="dashboard-lower">
      <section class="panel"><div class="panel-heading"><div><h2 class="panel-title">Explore the subject</h2><p class="panel-caption">Choose a unit for focused practice</p></div><button class="text-button" data-action="navigate" data-view="topics">All topics →</button></div><div class="topic-list">${topics}</div></section>
      <section class="panel recent-card"><div class="panel-heading"><div><h2 class="panel-title">Recent activity</h2><p class="panel-caption">Your latest exam result</p></div></div>${recent}</section>
    </div>`;
}

function renderPractice() {
  const options = sections.map((section) => `<option value="${escapeHTML(section)}">${escapeHTML(section)}</option>`).join("");
  main.innerHTML = `
    <div class="eyebrow"><span class="eyebrow-mark">✳</span> PRACTICE MODE</div>
    <h1 class="page-heading">Set up your exam.</h1>
    <p class="page-subtitle">Choose your scope and pace. Every answer comes with immediate feedback.</p>
    <div class="setup-card"><section class="setup-main">
      <h2>Build a practice session</h2><p>Work through the questions, check the answer when you choose, and review your score at the end.</p>
      <label class="form-label" for="topic-select">SUBJECT AREA</label>
      <div class="select-wrap"><select class="select-input" id="topic-select"><option value="all">All topics · ${questionBank.length} questions</option>${options}</select></div>
      <div style="height:17px"></div><span class="form-label">NUMBER OF QUESTIONS</span>
      <div class="length-options" role="radiogroup" aria-label="Number of questions">
        ${[10, 20, 50, questionBank.length].map((length, index) => `<label class="length-choice"><input type="radio" name="exam-length" value="${length}" ${index === 1 ? "checked" : ""}><span>${length === questionBank.length ? "All 234" : length}</span></label>`).join("")}
      </div>
      <div class="setup-actions"><button class="btn btn-dark" data-action="start-exam">Begin exam <span class="btn-arrow">→</span></button><span>Answers are revealed as you go</span></div>
    </section><aside class="setup-aside"><span class="setup-aside-icon">✳</span><h3>Learn as you go</h3><p>Choose an answer to see whether it’s right. If it’s not, we’ll show you the correct choice right away.</p></aside></div>
    <div class="exam-info-grid"><div class="exam-info"><span class="info-icon">◷</span><div><strong>At your own pace</strong><span>No timer. Pause whenever you need.</span></div></div><div class="exam-info"><span class="info-icon">✓</span><div><strong>Instant feedback</strong><span>See the correct answer after each choice.</span></div></div><div class="exam-info"><span class="info-icon">↗</span><div><strong>Progress saved</strong><span>Completed scores stay on this device.</span></div></div></div>`;
}

function renderTopics() {
  main.innerHTML = `
    <div class="eyebrow"><span class="eyebrow-mark">✳</span> YOUR STUDY GUIDE</div>
    <h1 class="page-heading">Explore the subject.</h1>
    <p class="page-subtitle">Pick a topic to start a focused practice session with questions from that part of your reviewer.</p>
    <div class="topic-grid">${sections.map((section, index) => topicCard(section, index)).join("")}</div>`;
}

function startExam(section = "all", requestedLength = 20) {
  let questions = section === "all" ? [...questionBank] : questionBank.filter((question) => question.section === section);
  if (requestedLength < questions.length) questions = questions.slice(0, requestedLength);
  attempt = { title: section === "all" ? "Full subject practice" : section, questions, answers: {}, index: 0, startedAt: new Date().toISOString(), submitted: false };
  setView("exam");
}

function renderExam() {
  if (!attempt) { setView("practice"); return; }
  const question = attempt.questions[attempt.index];
  const selected = attempt.answers[question.number];
  const correct = question.correct;
  const answeredCount = Object.keys(attempt.answers).length;
  const selectedCorrect = selected === correct;
  const options = Object.entries(question.options).map(([letter, text]) => {
    const isSelected = selected === letter;
    const isCorrect = letter === correct;
    const className = isSelected && selectedCorrect ? "is-correct" : isSelected && !selectedCorrect ? "is-wrong" : selected && isCorrect ? "reveal-correct" : "";
    const mark = isSelected && selectedCorrect ? "✓" : isSelected && !selectedCorrect ? "×" : selected && isCorrect ? "✓" : "";
    return `<button class="answer-option ${className}" data-action="answer" data-answer="${letter}" ${selected ? "disabled" : ""} aria-pressed="${isSelected}"><span class="option-letter">${letter}</span><span>${escapeHTML(text)}</span><span class="option-check" aria-hidden="true">${mark}</span></button>`;
  }).join("");
  const feedback = selected ? `<div class="feedback ${selectedCorrect ? "" : "is-wrong"}" role="status"><span class="feedback-icon">${selectedCorrect ? "✓" : "↗"}</span><span><strong>${selectedCorrect ? "That’s right." : "Not quite — here’s the correct answer."}</strong>${selectedCorrect ? `You chose ${selected}, and it’s correct.` : `<b>${correct}. ${escapeHTML(question.options[correct])}</b>`}</span></div>` : "";
  const map = attempt.questions.map((item, index) => `<button class="map-button ${index === attempt.index ? "is-current" : ""} ${attempt.answers[item.number] ? "is-answered" : ""}" data-action="go-to" data-index="${index}" aria-label="Go to question ${index + 1}${attempt.answers[item.number] ? ", answered" : ""}" aria-current="${index === attempt.index ? "step" : "false"}">${index + 1}</button>`).join("");
  const isReview = attempt.submitted;

  main.innerHTML = `
    <div class="eyebrow"><span class="eyebrow-mark">✳</span> ${isReview ? "ANSWER REVIEW" : "PRACTICE EXAM"}</div>
    <h1 class="page-heading">${isReview ? "Review your answers." : "You’ve got this."}</h1>
    <p class="page-subtitle">${isReview ? "Your selected answers and the correct choices are shown below." : "Take your time. Choose an answer to see instant feedback."}</p>
    ${isReview ? `<div class="result-banner"><div><strong>${escapeHTML(attempt.title)} · ${attempt.correct}/${attempt.questions.length} correct</strong><span>${attempt.percentage}% score · ${attempt.unanswered} unanswered</span></div><button class="btn btn-outline btn-small" data-action="navigate" data-view="scores">Back to scores</button></div>` : ""}
    <div class="exam-layout"><section class="exam-panel">
      <div class="exam-panel-top"><span class="exam-unit">${escapeHTML(question.section)}</span><span class="exam-question-count">Question ${attempt.index + 1} of ${attempt.questions.length}</span></div>
      <div class="progress-wrap" aria-label="Exam progress"><span style="width:${Math.round(((attempt.index + (selected ? 1 : 0)) / attempt.questions.length) * 100)}%"></span></div>
      <div class="question-body"><div class="question-kicker">QUESTION ${String(question.number).padStart(2, "0")} <span>·</span> ${selected ? "ANSWERED" : "SELECT ONE ANSWER"}</div>
        <h2 class="question-prompt">${escapeHTML(question.question)}</h2>
        <div class="option-list">${options}</div>
        ${feedback}
        <div class="question-actions"><button class="btn btn-outline btn-small" data-action="previous" ${attempt.index === 0 ? "disabled" : ""}>← Previous</button><div class="question-actions-right">
          ${isReview ? "" : `<button class="btn btn-outline btn-small" data-action="finish">${answeredCount === attempt.questions.length ? "Finish exam" : "Finish & see score"}</button>`}
          <button class="btn btn-dark btn-small" data-action="next">${attempt.index === attempt.questions.length - 1 ? (isReview ? "Back to scores" : "Finish exam") : "Next question"} <span class="btn-arrow">→</span></button>
        </div></div>
      </div>
    </section><aside class="exam-sidebar"><div class="exam-sidebar-head"><strong>Question map</strong><span>${answeredCount}/${attempt.questions.length} done</span></div><div class="question-map">${map}</div><div class="map-legend"><span><i class="legend-dot current"></i>Current</span><span><i class="legend-dot"></i>Answered</span></div><p class="exam-sidebar-note">${isReview ? "Select any question to revisit your answer." : "Select a number to move around. Your answers are kept as you go."}</p></aside></div>`;
}

function submitAttempt() {
  const unanswered = attempt.questions.length - Object.keys(attempt.answers).length;
  const correct = attempt.questions.filter((question) => attempt.answers[question.number] === question.correct).length;
  const record = {
    title: attempt.title,
    date: new Date().toISOString(),
    correct,
    unanswered,
    percentage: Math.round((correct / attempt.questions.length) * 100),
    questions: attempt.questions,
    answers: attempt.answers,
  };
  const scores = readScores();
  scores.unshift(record);
  saveScores(scores.slice(0, 10));
  attempt = { ...record, index: 0, submitted: true };
  setView("results");
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function scoreSummary(scores) {
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores.map((score) => score.percentage)) : 0;
  const latest = scores[0];
  const displayScore = latest ? latest.percentage : 0;
  const message = !latest ? "Every strong security habit starts with one question." : displayScore >= 80 ? "Excellent work — your security foundations are looking strong." : displayScore >= 60 ? "Good progress. A little more practice will build confidence." : "A useful start. Review the answers and try again when you’re ready.";
  return { average, best, latest, displayScore, message };
}

function renderScores() {
  const scores = readScores();
  const summary = scoreSummary(scores);
  const rows = scores.map((score, index) => `
    <div class="history-row"><div class="history-name">${escapeHTML(score.title)}</div><div class="history-date">${formatDate(score.date)}</div><div class="history-correct">${score.correct}/${score.questions.length} correct</div><div class="history-score">${score.percentage}%</div><div class="history-actions"><button class="btn btn-outline btn-small" data-action="review-score" data-index="${index}">Review</button></div></div>`).join("");
  main.innerHTML = `
    <div class="eyebrow"><span class="eyebrow-mark">✳</span> YOUR PROGRESS</div>
    <h1 class="page-heading">See how you’re growing.</h1>
    <p class="page-subtitle">Every completed session is saved on this device, so you can keep track of your progress.</p>
    <div class="score-summary"><section class="score-card-main"><div class="score-ring"><div class="score-ring-inner"><strong>${summary.displayScore}%</strong><small>${summary.latest ? "LATEST SCORE" : "NO SCORES YET"}</small></div></div><div class="score-summary-copy"><span>KEEP BUILDING</span><h2>${summary.latest ? "Practice pays off." : "Your first session awaits."}</h2><p>${summary.message}</p></div></section>
      <div class="score-metrics"><div class="metric-box"><strong>${summary.average}%</strong><span>Average score</span></div><div class="metric-box"><strong>${summary.best}%</strong><span>Personal best</span></div><div class="metric-box"><strong>${scores.length}</strong><span>Completed exams</span></div><div class="metric-box"><strong>${summary.latest ? summary.latest.questions.length : 0}</strong><span>Latest questions</span></div></div></div>
    <section class="panel history-panel"><div class="panel-heading"><div><h2 class="panel-title">Exam history</h2><p class="panel-caption">${scores.length ? `Showing your ${scores.length} most recent completed sessions` : "Your completed practice exams will appear here"}</p></div><button class="btn btn-dark btn-small" data-action="navigate" data-view="practice">New exam <span class="btn-arrow">→</span></button></div>${rows || `<div class="history-empty">No completed exams yet. Your scores will show here after your first session.</div>`}</section>`;
}

function renderResults() {
  if (!attempt) { setView("scores"); return; }
  const answered = Object.keys(attempt.answers).length;
  const breakdown = sections.map((section) => {
    const questions = attempt.questions.filter((question) => question.section === section);
    if (!questions.length) return "";
    const correct = questions.filter((question) => attempt.answers[question.number] === question.correct).length;
    return `<div class="breakdown-row"><span>${escapeHTML(section)}</span><span>${correct}/${questions.length}</span><strong>${Math.round(correct / questions.length * 100)}%</strong></div>`;
  }).join("");
  main.innerHTML = `
    <div class="eyebrow"><span class="eyebrow-mark">✳</span> SESSION COMPLETE</div>
    <h1 class="page-heading">Nice work showing up.</h1>
    <p class="page-subtitle">Here’s how your practice session went. Your score has been saved on this device.</p>
    <div class="score-summary"><section class="score-card-main"><div class="score-ring"><div class="score-ring-inner"><strong>${attempt.percentage}%</strong><small>YOUR SCORE</small></div></div><div class="score-summary-copy"><span>EXAM COMPLETE</span><h2>${attempt.correct} of ${attempt.questions.length} correct</h2><p>${answered} answered · ${attempt.unanswered} unanswered. ${scoreSummary([attempt]).message}</p></div></section>
      <div class="score-metrics"><div class="metric-box"><strong>${attempt.correct}</strong><span>Correct answers</span></div><div class="metric-box"><strong>${attempt.questions.length - attempt.correct}</strong><span>To review</span></div><div class="metric-box"><strong>${answered}</strong><span>Answered</span></div><div class="metric-box"><strong>${attempt.unanswered}</strong><span>Skipped</span></div></div></div>
    <div class="result-banner"><div><strong>Keep the momentum going.</strong><span>Review each correct answer or choose a new topic to practice.</span></div><div class="hero-actions" style="margin:0"><button class="btn btn-outline btn-small" data-action="review-current">Review answers</button><button class="btn btn-dark btn-small" data-action="navigate" data-view="practice">New exam <span class="btn-arrow">→</span></button></div></div>
    <section class="panel result-breakdown"><div class="panel-heading"><div><h2 class="panel-title">Topic breakdown</h2><p class="panel-caption">Your score by subject area</p></div></div>${breakdown || '<div class="no-results">No topic results available.</div>'}</section>`;
}

function handleAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, view } = button.dataset;
  if (action === "navigate") { setView(view); return; }
  if (action === "start-topic") { startExam(button.dataset.section, questionBank.filter((question) => question.section === button.dataset.section).length); return; }
  if (action === "start-exam") {
    const section = document.querySelector("#topic-select").value;
    const length = Number(document.querySelector('input[name="exam-length"]:checked').value);
    startExam(section, length);
    return;
  }
  if (action === "answer" && attempt && !attempt.submitted) {
    const question = attempt.questions[attempt.index];
    if (!attempt.answers[question.number]) {
      attempt.answers[question.number] = button.dataset.answer;
      renderExam();
      main.querySelector(".feedback").focus?.({ preventScroll: true });
      if (attempt.answers[question.number] !== question.correct) showToast("The correct answer is highlighted below.");
    }
    return;
  }
  if (action === "previous" && attempt && attempt.index > 0) { attempt.index--; renderExam(); return; }
  if (action === "next" && attempt) {
    if (attempt.index < attempt.questions.length - 1) { attempt.index++; renderExam(); }
    else if (attempt.submitted) setView("scores");
    else finishExam();
    return;
  }
  if (action === "go-to" && attempt) { attempt.index = Number(button.dataset.index); renderExam(); return; }
  if (action === "finish" && attempt) { finishExam(); return; }
  if (action === "review-score") {
    const score = readScores()[Number(button.dataset.index)];
    if (score) { attempt = { ...score, index: 0, submitted: true }; setView("exam"); }
    return;
  }
  if (action === "review-current" && attempt) { attempt.index = 0; attempt.submitted = true; setView("exam"); }
}

function finishExam() {
  const unanswered = attempt.questions.length - Object.keys(attempt.answers).length;
  if (unanswered && !window.confirm(`You still have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Finish and score this exam?`)) return;
  submitAttempt();
}

document.addEventListener("click", handleAction);
updateScoreCount();
renderDashboard();