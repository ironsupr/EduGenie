import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  RotateCcw
} from 'lucide-react';

const Quiz = () => {
  const { moduleId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [showHint, setShowHint] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const quiz = {
    title: 'Python Fundamentals - Module 1 Quiz',
    totalQuestions: 10,
    duration: 30,
    questions: [
      {
        id: 0,
        question: 'Which of the following is the correct way to declare a variable in Python?',
        options: [
          'var x = 5',
          'int x = 5',
          'x = 5',
          'declare x = 5'
        ],
        correct: 2,
        hint: 'Python uses dynamic typing, so you don\'t need to specify the data type when declaring variables.',
        explanation: 'In Python, variables are created simply by assigning a value to them. No special keywords like "var" or "int" are needed.'
      },
      {
        id: 1,
        question: 'What will be the output of print(type(5.0))?',
        options: [
          '<class \'int\'>',
          '<class \'float\'>',
          '<class \'double\'>',
          '<class \'number\'>'
        ],
        correct: 1,
        hint: 'Numbers with decimal points are treated as floating-point numbers in Python.',
        explanation: 'The number 5.0 has a decimal point, making it a float type in Python, even though its value is equivalent to the integer 5.'
      },
      {
        id: 2,
        question: 'Which operator is used for floor division in Python?',
        options: [
          '/',
          '//',
          '%',
          '**'
        ],
        correct: 1,
        hint: 'Floor division returns the largest integer less than or equal to the division result.',
        explanation: 'The // operator performs floor division, which divides and then floors the result to the nearest integer.'
      },
      // Add more questions as needed
    ]
  };

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleQuizComplete();
    }
  }, [timeLeft, quizCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answerIndex: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[q.id] === q.correct.toString()) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const getQuestionStatus = (questionIndex: number) => {
    const questionId = quiz.questions[questionIndex].id;
    if (answers[questionId] !== undefined) {
      if (showResults) {
        return answers[questionId] === quiz.questions[questionIndex].correct.toString() 
          ? 'correct' 
          : 'incorrect';
      }
      return 'answered';
    }
    return 'unanswered';
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
              score >= 70 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {score >= 70 ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {score >= 70 ? 'Congratulations!' : 'Keep Practicing!'}
            </h1>
            
            <div className="text-6xl font-bold text-gray-900 mb-6">
              {score}%
            </div>
            
            <p className="text-xl text-gray-600 mb-8">
              You answered {quiz.questions.filter((q, i) => answers[q.id] === q.correct.toString()).length} out of {quiz.questions.length} questions correctly.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{quiz.questions.filter((q, i) => answers[q.id] === q.correct.toString()).length}</div>
                <div className="text-blue-800">Correct</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{quiz.questions.filter((q, i) => answers[q.id] !== q.correct.toString() && answers[q.id] !== undefined).length}</div>
                <div className="text-red-800">Incorrect</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{quiz.questions.filter((q, i) => answers[q.id] === undefined).length}</div>
                <div className="text-gray-800">Unanswered</div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Retake Quiz</span>
              </button>
              <Link
                to={`/course/${moduleId}`}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Course
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">Question {currentQuestion + 1} of {quiz.totalQuestions}</p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              
              <button
                onClick={handleQuizComplete}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Question Navigation</h3>
              <div className="grid grid-cols-5 gap-2">
                {quiz.questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                        currentQuestion === index
                          ? 'bg-blue-600 text-white'
                          : status === 'correct'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : status === 'incorrect'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : status === 'answered'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-gray-600">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Not Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Current</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Question {currentQuestion + 1}
                  </h2>
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                  >
                    <Lightbulb className="h-5 w-5" />
                    <span>Hint</span>
                  </button>
                </div>
                
                <p className="text-lg text-gray-800 leading-relaxed mb-6">
                  {quiz.questions[currentQuestion].question}
                </p>
                
                {showHint && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Hint</h4>
                        <p className="text-yellow-700">{quiz.questions[currentQuestion].hint}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 mb-8">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[quiz.questions[currentQuestion].id] === index.toString()
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={answers[quiz.questions[currentQuestion].id] === index.toString()}
                      onChange={() => handleAnswerSelect(quiz.questions[currentQuestion].id, index.toString())}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      answers[quiz.questions[currentQuestion].id] === index.toString()
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[quiz.questions[currentQuestion].id] === index.toString() && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <Flag className="h-4 w-4" />
                    <span>Flag for Review</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === quiz.questions.length - 1}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;