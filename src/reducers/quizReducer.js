export function quizReducer(state, action) {
  switch (action.type) {
    case "START_QUIZ":
      return {
        ...state,
        questions: action.payload,
        status: "playing",
      };

    case "ANSWER_QUESTION": {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = currentQuestion.correctAnswer === action.payload;
      const newScore = isCorrect ? state.score + 1 : state.score;

      return {
        ...state,
        score: newScore,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    }

    case "TICK":
      return {
        ...state,
        timeLeft: state.timeLeft - 1,
      };

    case "FINISH_QUIZ":
      return {
        ...state,
        status: "finished",
      };

    default:
      return state;
  }
}
