# NEON//KNOW — CodeNova Task 2 (Popup Quiz Edition)

A frontend fundamentals quiz in a completely redesigned navy, coral and lime theme. The **Start the quiz** button opens a real, accessible native HTML `<dialog>` modal. The quiz, instant answer feedback, results and **Try again** all appear inside this popup without reloading the page.

## Run

1. Extract the ZIP and open this folder in VS Code.
2. Install the Live Server extension if needed.
3. Right-click `index.html` → **Open with Live Server**.
4. Click **Start the quiz**, then **Let's go!**.
5. Complete the questions to see the results popup; click **Try again** to restart inside the popup.

Do not open `index.html` directly using `file://`, because `fetch()` loads `questions.json`.

## Files

- `index.html` — landing page and native dialog quiz structure
- `style.css` — custom responsive theme, question states and popup design
- `script.js` — quiz state, answer locking, scoring, modal controls, restart
- `questions.json` — 12 questions with explanations
- `SUBMISSION_CHECKLIST.md` — testing and GitHub Pages checklist

## State management

`questions` holds validated JSON data; `currentIndex` tracks the current question; `score` counts correct answers; and `hasAnswered` locks the question after the first answer. `renderQuestion()` creates answer buttons and updates progress. `selectAnswer()` increments score at most once and displays immediate color-coded feedback. `advance()` moves to the next question or results. `showResults()` calculates the final score and percentage. `startQuiz()` resets all state without refreshing the page. Native `dialog.showModal()` provides modal focus handling and Escape-key closing.

## Important UI states

- Loading and fetch error with retry
- Welcome screen inside popup
- Active question with progress and score
- Correct (green) / incorrect (pink) feedback
- Results summary inside popup
- Try again restarts in popup

## Accessibility

Semantic sections, real button elements, native modal dialog, visible focus outlines, progressbar ARIA attributes, live feedback region, touch-sized controls, reduced-motion support and responsive breakpoints.

## Submission

Publish these files to the root of a public GitHub repository and enable GitHub Pages (`main`, `/ (root)`). Capture real screenshots of landing page, popup question, feedback and results. Test mobile viewport widths and answer-lock behaviour before submission. No deployment or screenshots are included in this ZIP.
