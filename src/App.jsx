import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Target, CheckCircle, Circle, Star, Calendar, TrendingUp, BookOpen, Users, Award, Zap, ArrowRight, GitBranch, Clock, Award as Trophy, Trash2, MapPin, Brain, Play } from 'lucide-react';

// Remove the direct Gemini API key - we'll use your backend instead
// const GEMINI_API_KEY = "AIzaSyCpWwulTDl5ZUVJ08yrFw_1yicSsqwYnGo"; // REMOVED

// Enhanced Quiz Component
const QuizModal = ({ project, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const completedSteps = project.roadmap.filter(step => step.completed);
      let allQuestions = [];

      if (completedSteps.length === 0) {
        allQuestions = getDefaultQuestions();
      } else {
        for (const step of completedSteps) {
          const stepQuestions = await generateQuestionsForStep(step, project.prompt);
          allQuestions.push(...stepQuestions);
        }
      }

      setQuizQuestions(allQuestions);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setQuizQuestions(getDefaultQuestions());
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestionsForStep = async (step, projectPrompt) => {
    try {
      // Use your backend instead of calling Gemini directly
      const response = await fetch('https://ai-roadmap-generator-c1q3.onrender.com/api/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepDescription: `Generate 5 quiz questions about: ${step.title} - ${step.description}`,
          category: 'learning',
          phaseNumber: 1,
          stepNumber: 1,
          projectName: projectPrompt,
          useAI: 'auto'
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.instructions) {
        // Convert instructions to quiz format
        return data.instructions.slice(0, 5).map((instruction, index) => ({
          question: `What is the main focus of "${step.title}"?`,
          options: [
            `Understanding and implementing ${instruction}`,
            "Memorizing all technical details",
            "Skipping to advanced topics immediately",
            "Just reading about it without practice"
          ],
          correct: 0
        }));
      }

      throw new Error('Invalid response from backend');
    } catch (error) {
      console.error('Error generating questions with backend:', error);
      return getDefaultQuestions().slice(0, 5);
    }
  };

  const getDefaultQuestions = () => [
    {
      question: "What's the most important aspect of effective learning?",
      options: [
        "Speed of completion",
        "Consistent practice and application",
        "Perfect understanding from the start",
        "Comparing yourself to others"
      ],
      correct: 1
    },
    {
      question: "When you encounter a difficult concept, what should you do?",
      options: [
        "Skip it and hope it becomes clear later",
        "Break it down into smaller parts and practice",
        "Memorize it without understanding",
        "Give up on the entire topic"
      ],
      correct: 1
    },
    {
      question: "How should you measure your learning progress?",
      options: [
        "By comparing to others constantly",
        "Only by final results",
        "Through consistent milestones and practical application",
        "By time spent studying"
      ],
      correct: 2
    },
    {
      question: "What's the benefit of following a structured learning path?",
      options: [
        "It guarantees immediate success",
        "It provides clear direction and builds knowledge systematically",
        "It makes learning more complicated",
        "It's only useful for beginners"
      ],
      correct: 1
    },
    {
      question: "How should you approach practice and implementation?",
      options: [
        "Only when you feel completely ready",
        "Regularly, even if you make mistakes",
        "Never, theory is enough",
        "Only when supervised"
      ],
      correct: 1
    }
  ];

  const handleAnswer = (answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, index) => {
      if (answers[index] === q.correct) {
        correct++;
      }
    });
    setScore(correct);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  // ... rest of QuizModal component remains the same
  if (isLoading) {
    return (
      <div className="custom-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1060 }}>
        <div className="custom-modal-content rounded-4 p-5 text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p className="text-white h5">Preparing your personalized quiz...</p>
          <p className="text-white-70 small">Creating 5 questions for each completed step</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const completedSteps = project.roadmap.filter(step => step.completed).length;

    return (
      <div className="custom-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1060 }}>
        <div className="custom-modal-content rounded-4 w-100" style={{ maxWidth: '36rem' }}>
          <div className="p-5 text-center">
            <div className="mb-4">
              <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 ${percentage >= 80 ? 'bg-success' : percentage >= 60 ? 'bg-warning' : 'bg-danger'}`} style={{ width: '100px', height: '100px' }}>
                <Trophy size={50} color="white" />
              </div>
              <h3 className="text-white h3 mb-2">Quiz Complete!</h3>
              <p className="text-white-70 mb-2">You answered {score} out of {quizQuestions.length} questions correctly</p>
              <div className="text-white h2 mb-2">{percentage}%</div>
              <p className="text-white-50 small">Based on {completedSteps} completed step{completedSteps !== 1 ? 's' : ''}</p>
            </div>
            <div className="mb-4 p-4 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
              <h4 className="text-white h6 mb-2">Performance Analysis</h4>
              <div className="row g-3 text-center">
                <div className="col-4">
                  <div className="text-success h4 mb-1">{score}</div>
                  <div className="text-white-70 small">Correct</div>
                </div>
                <div className="col-4">
                  <div className="text-danger h4 mb-1">{quizQuestions.length - score}</div>
                  <div className="text-white-70 small">Incorrect</div>
                </div>
                <div className="col-4">
                  <div className="text-primary h4 mb-1">{quizQuestions.length}</div>
                  <div className="text-white-70 small">Total</div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-white-70">
                {percentage >= 90 ? "Outstanding! You've mastered these concepts! Keep up the excellent work!" :
                 percentage >= 80 ? "Excellent work! You have a strong understanding of the material!" :
                 percentage >= 70 ? "Good job! You're on the right track. Review a few concepts and you'll be great!" :
                 percentage >= 60 ? "Not bad! Consider reviewing the material and practicing more." :
                 "Keep practicing! Learning takes time, and you're making progress!"}
              </p>
            </div>
            <div className="d-flex gap-3">
              <button onClick={resetQuiz} className="btn btn-outline-light flex-fill py-2">
                Retake Quiz
              </button>
              <button
                onClick={() => onComplete(score, quizQuestions.length)}
                className="btn custom-btn-primary flex-fill py-2"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const completedSteps = project.roadmap.filter(step => step.completed).length;
  const currentAnswer = answers[currentQuestion];

  return (
    <div className="custom-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1060 }}>
      <div className="custom-modal-content rounded-4 w-100" style={{ maxWidth: '42rem' }}>
        <div className="p-5">
          <div className="d-flex align-items-start justify-content-between mb-4">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                  <Brain size={20} color="white" />
                </div>
                <span className="text-white-70 small fw-medium">Knowledge Assessment</span>
              </div>
              <h2 className="text-white h3 mb-2">{project.projectName}</h2>
              <p className="text-white-70 fs-6">{`Based on your ${completedSteps} completed steps.`}</p>
            </div>
            <button onClick={onClose} className="btn text-white-50 p-2 ms-3" style={{ fontSize: '1.5rem' }}>×</button>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between text-white-70 small mb-2">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="custom-progress mb-2">
              <div className="custom-progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="mb-5">
            <h4 className="text-white h5 mb-4 p-3 rounded-3" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              {question.question}
            </h4>
            <div className="row g-3">
              {question.options.map((option, index) => (
                <div key={index} className="col-12">
                  <button
                    onClick={() => handleAnswer(index)}
                    className={`btn w-100 text-start p-4 ${
                      currentAnswer === index
                        ? 'custom-btn-primary border-primary'
                        : 'btn-outline-light'
                    }`}
                    style={{
                      transition: 'all 0.2s ease',
                      minHeight: '60px'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <span className={`me-3 fw-bold rounded-circle d-flex align-items-center justify-content-center ${
                        currentAnswer === index ? 'bg-white text-primary' : 'bg-primary text-white'
                      }`} style={{ width: '32px', height: '32px', fontSize: '0.875rem' }}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-grow-1">{option}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-white-50 small">
              {currentAnswer !== undefined ? `Answer ${String.fromCharCode(65 + currentAnswer)} selected` : 'Select an answer to continue'}
            </div>
            <button
              onClick={nextQuestion}
              disabled={currentAnswer === undefined}
              className={`btn px-4 py-2 ${currentAnswer !== undefined ? 'custom-btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: '140px' }}
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ... (CurrentStageIndicator and TimelineNode components remain the same)
const CurrentStageIndicator = ({ roadmap }) => {
  const currentStepIndex = roadmap.findIndex(step => !step.completed);
  const currentStep = currentStepIndex === -1 ? roadmap[roadmap.length - 1] : roadmap[currentStepIndex];
  const isCompleted = currentStepIndex === -1;

  return (
    <div className="current-stage-indicator">
      <div className="stage-badge">
        <MapPin size={16} className="me-2" />
        {isCompleted ? 'All Complete!' : `Currently at Step ${currentStepIndex + 1}`}
      </div>
      <div className="stage-title">
        {isCompleted ? 'Journey Complete!' : currentStep?.title}
      </div>
    </div>
  );
};

const TimelineNode = ({ step, index, isCompleted, onToggle, onStepClick, isHighlighted, isLast, isCurrent }) => {
  const isEven = index % 2 === 0;

  return (
    <div className={`timeline-item ${isEven ? 'timeline-left' : 'timeline-right'} ${isCompleted ? 'completed' : ''} ${isHighlighted ? 'highlighted' : ''} ${isCurrent ? 'current' : ''}`}>
      <div className="timeline-number">
        {String(index + 1).padStart(2, '0')}
        {isCurrent && <div className="current-pulse"></div>}
      </div>

      <div className="timeline-circle" onClick={onToggle}>
        {isCompleted ? (
          <CheckCircle size={24} className="text-white" />
        ) : (
          <Circle size={24} className="text-white" />
        )}
        {isCurrent && !isCompleted && <div className="current-glow"></div>}
      </div>

      <div className="timeline-content" onClick={() => onStepClick(step)}>
        <div className="timeline-card">
          <div className="timeline-header">
            <h3 className="timeline-title">{step.title}</h3>
            <div className="timeline-status">
              {isCompleted ? (
                <span className="status-completed">
                  <Trophy size={16} />
                  Completed
                </span>
              ) : isCurrent ? (
                <span className="status-current">
                  <MapPin size={16} />
                  Current
                </span>
              ) : (
                <span className="status-pending">
                  <Clock size={16} />
                  Pending
                </span>
              )}
            </div>
          </div>
          <p className="timeline-description">{step.description}</p>
          <div className="timeline-arrow">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {!isLast && <div className="timeline-line"></div>}
    </div>
  );
};
const RoadmapDashboard = () => {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('currentView');
    return saved || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  const [selectedProject, setSelectedProject] = useState(() => {
    const saved = localStorage.getItem('selectedProject');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selectedProject', JSON.stringify(selectedProject));
    } else {
      localStorage.removeItem('selectedProject');
    }
  }, [selectedProject]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [newProjectPrompt, setNewProjectPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedStep, setSelectedStep] = useState(null);
  const [stepInstructions, setStepInstructions] = useState([]);
  const [loadingInstructions, setLoadingInstructions] = useState(false);
  const [highlightedStep, setHighlightedStep] = useState(0);
  const [instructionProgress, setInstructionProgress] = useState({});

  // Generate roadmap using backend API instead of calling Gemini directly
  const generateRoadmapWithAI = async (prompt) => {
    try {
      setLoadingMessage('Connecting to AI to generate your roadmap...');

      // Call your backend instead of Gemini directly
      const response = await fetch('https://ai-roadmap-generator-c1q3.onrender.com/api/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          category: 'learning'
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.phases) {
        // Convert phases to roadmap format
        return data.phases.flatMap(phase => 
          phase.steps.map(step => ({
            title: step.title,
            description: step.description
          }))
        );
      }

      throw new Error('Invalid response from backend');
    } catch (error) {
      console.error('Error generating roadmap with AI:', error);
      // Fallback to a more specific generic roadmap if API fails
      return [
        {
          title: 'Initial Concepts and Tools',
          description: `Set up your development environment. Learn core syntax and fundamental data structures. Complete simple exercises to build a foundational understanding.`
        },
        {
          title: 'Practical Mini-Projects',
          description: `Apply your knowledge by building 2-3 small-scale projects. This could involve creating a simple calculator, a to-do list, or a command-line utility. Focus on applying new concepts in a practical setting.`
        },
        {
          title: 'Intermediate Concepts',
          description: `Dive deeper into more complex topics such as algorithms, object-oriented programming (OOP) principles, or asynchronous operations. Work through a series of problem-solving challenges to solidify these skills.`
        },
        {
          title: 'Advanced Project and Specialization',
          description: `Choose a specific area of interest (e.g., machine learning, web development, data science) and build a substantial, real-world project. This will test your ability to integrate multiple concepts and manage a larger codebase.`
        },
        {
          title: 'Portfolio and Community Engagement',
          description: `Refine your final project for your portfolio. Share your work on platforms like GitHub, contribute to open-source projects, and seek feedback from mentors to prepare for real-world application.`
        }
      ];
    }
  };

  // Use your backend for step instructions (this was already correct)
  const getStepInstructionsWithAI = async (stepTitle, stepDescription, projectPrompt) => {
    try {
      console.log('Calling backend for enhanced instructions...');
      
      const response = await fetch('https://ai-roadmap-generator-c1q3.onrender.com/api/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stepDescription: stepDescription,
          category: 'learning',
          phaseNumber: 1,
          stepNumber: 1,
          projectName: selectedProject?.projectName || projectPrompt,
          useAI: 'auto'
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.instructions) {
        console.log(`Got ${data.instructions.length} instructions from ${data.aiUsed} AI`);
        return data.instructions;
      } else {
        throw new Error('Invalid response from backend');
      }
    } catch (error) {
      console.error('Error getting instructions from backend:', error);
      
      // Simple fallback if backend is not available
      return [
        `Research and understand the key concepts needed for: ${stepDescription}`,
        `Set up your development environment and necessary tools for this step`,
        `Complete hands-on practice exercises related to: ${stepTitle}`,
        `Build a small project or example to apply what you've learned`,
        `Review your work and identify areas for improvement`,
        `Document your progress and prepare for the next step`
      ];
    }
  };

  // Create a new project with AI-generated roadmap
  const createProject = async () => {
    if (!newProjectPrompt.trim()) return;

    setIsLoading(true);
    setLoadingMessage('Generating your roadmap with AI...');

    try {
      const aiRoadmap = await generateRoadmapWithAI(newProjectPrompt);

      const newProject = {
        id: Date.now().toString(),
        projectName: `Learn ${newProjectPrompt.split(' ').slice(0, 3).join(' ')}`,
        prompt: newProjectPrompt,
        roadmap: aiRoadmap.map((step, index) => ({
          id: `step-${Date.now()}-${index}`,
          title: step.title,
          description: step.description,
          completed: false,
          completedAt: null
        })),
        createdAt: new Date().toISOString(),
        progress: 0
      };

      setProjects(prev => [newProject, ...prev]);
      setNewProjectPrompt('');
      setShowCreateModal(false);
      setCurrentView('timeline-project');
      setSelectedProject(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to generate roadmap. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const deleteProject = () => {
    if (projectToDelete) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const toggleStepCompletion = (projectId, stepId) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedRoadmap = project.roadmap.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              completed: !step.completed,
              completedAt: !step.completed ? new Date().toISOString() : null
            };
          }
          return step;
        });

        const completedSteps = updatedRoadmap.filter(step => step.completed).length;
        const progress = Math.round((completedSteps / updatedRoadmap.length) * 100);

        const updatedProject = {
          ...project,
          roadmap: updatedRoadmap,
          progress
        };

        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject(updatedProject);
        }

        return updatedProject;
      }
      return project;
    }));
  };

  const toggleInstructionCompletion = (stepId, instructionIndex) => {
    setInstructionProgress(prev => ({
      ...prev,
      [`${stepId}-${instructionIndex}`]: !prev[`${stepId}-${instructionIndex}`]
    }));
  };

  const getStepInstructions = async (step, projectPrompt) => {
    setLoadingInstructions(true);

    try {
      const instructions = await getStepInstructionsWithAI(step.title, step.description, projectPrompt);
      setStepInstructions(instructions);
    } catch (error) {
      console.error('Error getting step instructions:', error);
      setStepInstructions([
        "Use a search engine to find the three most popular programming languages for your field and read an overview of each.",
        "Set up your local development environment by installing the necessary language runtimes, libraries, and a code editor.",
        "Write a basic 'Hello, World!' program to ensure your environment is configured correctly.",
        "Complete a tutorial on basic data structures and their use cases, such as arrays, lists, or dictionaries.",
        "Solve two simple coding challenges on a platform like HackerRank or LeetCode to practice fundamental logic."
      ]);
    } finally {
      setLoadingInstructions(false);
    }
  };

  const openStepDetails = (step) => {
    setSelectedStep(step);
    getStepInstructions(step, selectedProject.prompt);
  };

  const handleQuizComplete = (score, total) => {
    setShowQuizModal(false);
    const percentage = Math.round((score / total) * 100);
    const completedSteps = selectedProject.roadmap.filter(step => step.completed).length;

    if (percentage >= 80) {
      alert(`Outstanding! You scored ${score}/${total} (${percentage}%) on your ${completedSteps}-step quiz! You've truly mastered the material!`);
    } else if (percentage >= 70) {
      alert(`Great job! You scored ${score}/${total} (${percentage}%) on your comprehensive quiz! Keep up the excellent learning!`);
    } else {
      alert(`Good effort! You scored ${score}/${total} (${percentage}%). Consider reviewing some concepts and try the quiz again!`);
    }
  };

  const getDashboardStats = () => {
    const totalProjects = projects.length;
    const totalSteps = projects.reduce((acc, project) => acc + project.roadmap.length, 0);
    const completedSteps = projects.reduce((acc, project) =>
      acc + project.roadmap.filter(step => step.completed).length, 0
    );
    const avgProgress = totalProjects > 0
      ? Math.round(projects.reduce((acc, project) => acc + project.progress, 0) / totalProjects)
      : 0;

    return { totalProjects, totalSteps, completedSteps, avgProgress };
  };

  const stats = getDashboardStats();

  const customStyles = `
    .custom-bg {
      background: linear-gradient(135deg, #1e293b, #6b21a8, #1e293b);
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }
    .custom-header {
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .custom-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      position: relative;
    }
    .custom-card:hover {
      transform: scale(1.02);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .custom-btn-primary {
      background: linear-gradient(to right, #3b82f6, #8b5cf6);
      border: none;
      transition: all 0.2s ease;
    }
    .custom-btn-primary:hover {
      background: linear-gradient(to right, #2563eb, #7c3aed);
      transform: scale(1.05);
    }
    .custom-modal {
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
    }
    .custom-modal-content {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .custom-progress {
      background: rgba(255, 255, 255, 0.1);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    .custom-progress-bar {
      background: linear-gradient(to right, #10b981, #3b82f6);
      height: 100%;
      transition: width 0.5s ease;
    }
    .custom-gradient-icon {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    }
    .text-white { color: white !important; }
    .text-white-70 { color: rgba(255, 255, 255, 0.7) !important; }
    .text-white-50 { color: rgba(255, 255, 255, 0.5) !important; }
    .text-white-40 { color: rgba(255, 255, 255, 0.4) !important; }

    /* Current Stage Indicator */
    .current-stage-indicator {
      background: linear-gradient(135deg, #10b981, #059669);
      padding: 1rem 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
      border: 1px solid rgba(16, 185, 129, 0.5);
    }

    .stage-badge {
      display: flex;
      align-items: center;
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .stage-title {
      color: white;
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
    }

    /* Enhanced Timeline Styles */
    .timeline-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
      position: relative;
    }

    .timeline-item {
      position: relative;
      width: 100%;
      margin-bottom: 4rem;
      display: flex;
      align-items: center;
    }

    .timeline-number {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: -50px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      width: 60px;
      height: 30px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
      z-index: 3;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
    }

    .timeline-number.current-step {
      background: linear-gradient(135deg, #f59e0b, #f97316);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
      animation: currentPulse 2s ease-in-out infinite;
    }

    .current-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 19px;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      opacity: 0.6;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes currentPulse {
      0%, 100% { transform: translateX(-50%) scale(1); }
      50% { transform: translateX(-50%) scale(1.1); }
    }

    .timeline-circle {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(75, 85, 99, 0.8);
      border: 4px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 2;
      backdrop-filter: blur(10px);
    }

    .timeline-item.completed .timeline-circle {
      background: linear-gradient(135deg, #10b981, #059669);
      border-color: #10b981;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
    }

    .timeline-item.current .timeline-circle {
      background: linear-gradient(135deg, #f59e0b, #f97316);
      border-color: #f59e0b;
      box-shadow: 0 0 25px rgba(245, 158, 11, 0.6);
      animation: currentGlow 2s ease-in-out infinite;
    }

    .current-glow {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b, #f97316);
      opacity: 0.3;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes currentGlow {
      0%, 100% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.6); }
      50% { box-shadow: 0 0 35px rgba(245, 158, 11, 0.8); }
    }

    .timeline-circle:hover {
      transform: translateX(-50%) scale(1.1);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
    }

    .timeline-line {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 60px;
      width: 4px;
      height: calc(100% - 60px);
      background: linear-gradient(to bottom, rgba(139, 92, 246, 0.6), rgba(139, 92, 246, 0.2));
      z-index: 1;
    }
    
    .timeline-item:last-child .timeline-line {
        height: 0;
    }

    .timeline-content {
      width: 45%;
      cursor: pointer;
    }

    .timeline-left .timeline-content {
      margin-right: auto;
      padding-right: 60px;
    }

    .timeline-right .timeline-content {
      margin-left: auto;
      padding-left: 60px;
    }

    .timeline-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 2rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .timeline-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      transition: left 0.6s;
    }

    .timeline-card:hover::before {
      left: 100%;
    }

    .timeline-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.4);
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .timeline-title {
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
      flex: 1;
      margin-right: 1rem;
    }

    .timeline-item.completed .timeline-title {
      color: #10b981;
    }

    .timeline-item.current .timeline-title {
      color: #f59e0b;
    }

    .timeline-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-completed {
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .status-current {
      color: #f59e0b;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .status-pending {
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .timeline-description {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
    }

    .timeline-arrow {
      position: absolute;
      right: 1.5rem;
      bottom: 1.5rem;
      color: rgba(255, 255, 255, 0.4);
      transition: all 0.3s ease;
    }

    .timeline-card:hover .timeline-arrow {
      color: #8b5cf6;
      transform: translateX(4px);
    }

    .delete-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(239, 68, 68, 0.8);
      border: none;
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .custom-card:hover .delete-btn {
      opacity: 1;
    }

    .delete-btn:hover {
      background: rgba(220, 38, 38, 0.9);
      transform: scale(1.1);
    }

    .instruction-item {
      display: flex;
      align-items: flex-start;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      margin-bottom: 0.75rem;
      transition: all 0.2s ease;
    }

    .instruction-checkbox {
      margin-right: 1rem;
      margin-top: 0.25rem;
      cursor: pointer;
    }

    .instruction-item.completed {
      background: rgba(16, 185, 129, 0.1);
      border-left: 3px solid #10b981;
    }

    .instruction-item.completed .instruction-text {
      text-decoration: line-through;
      opacity: 0.7;
    }

    .quiz-btn {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border: none;
      color: white;
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
      transition: all 0.3s ease;
      z-index: 1000;
      animation: quizPulse 3s ease-in-out infinite;
    }

    @keyframes quizPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .quiz-btn:hover {
      transform: scale(1.15) !important;
      box-shadow: 0 12px 35px rgba(139, 92, 246, 0.6);
      animation: none;
    }

    .quiz-btn::after {
      content: '';
      position: absolute;
      top: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
      animation: badgePulse 2s ease-in-out infinite;
    }

    @keyframes badgePulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    @media (max-width: 768px) {
      .timeline-item {
        flex-direction: column;
        text-align: center;
      }

      .timeline-content {
        width: 100% !important;
        padding: 0 1rem !important;
        margin: 0 !important;
      }

      .timeline-left .timeline-card::after,
      .timeline-right .timeline-card::after {
        display: none;
      }

      .timeline-number {
        position: static;
        transform: none;
        margin-bottom: 1rem;
      }

      .timeline-circle {
        position: static;
        transform: none;
        margin: 1rem 0;
      }

      .quiz-btn {
        bottom: 1rem;
        right: 1rem;
        width: 60px;
        height: 60px;
      }
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }

    .sticky-top {
      position: sticky;
      top: 0;
      z-index: 1030;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `;

  // Timeline Project View
  if (currentView === 'timeline-project' && selectedProject) {
    const currentStepIndex = selectedProject.roadmap.findIndex(step => !step.completed);
    const hasCompletedSteps = selectedProject.roadmap.some(step => step.completed);
    const completedStepsCount = selectedProject.roadmap.filter(step => step.completed).length;

    return (
      <div className="custom-bg">
        <style>{customStyles}</style>

        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />

        {/* Enhanced Quiz Button */}
        {hasCompletedSteps && (
          <button
            className="quiz-btn d-flex align-items-center justify-content-center"
            onClick={() => setShowQuizModal(true)}
            title={`Take comprehensive quiz (${completedStepsCount} steps × 5 questions = ${completedStepsCount * 5} questions)`}
          >
            <Brain size={28} />
          </button>
        )}

        {/* Project Header */}
        <div className="custom-header sticky-top">
          <div className="container-fluid">
            <div className="row align-items-center py-3">
              <div className="col">
                <div className="d-flex align-items-center">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="btn p-0 me-3"
                    style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <div>
                    <h1 className="text-white h3 mb-1 d-flex align-items-center">
                      <GitBranch className="me-2" size={28} />
                      {selectedProject.projectName}
                    </h1>
                    <p className="text-white-70 small mb-0">"{selectedProject.prompt}"</p>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <div className="text-end me-3">
                    <div className="text-white fw-bold">{selectedProject.progress}% Complete</div>
                    <div className="text-white-70 small">
                      {selectedProject.roadmap.filter(s => s.completed).length} / {selectedProject.roadmap.length} steps
                    </div>
                    {hasCompletedSteps && (
                      <div className="text-primary small">
                        {completedStepsCount * 5} quiz questions ready
                      </div>
                    )}
                  </div>
                  <div
                    className="custom-gradient-icon rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '64px', height: '64px' }}
                  >
                    <TrendingUp size={32} color="white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="custom-progress mb-3">
              <div
                className="custom-progress-bar"
                style={{ width: `${selectedProject.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Stage Indicator */}
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <CurrentStageIndicator roadmap={selectedProject.roadmap} />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline-container">
          {selectedProject.roadmap.map((step, index) => (
            <TimelineNode
              key={step.id}
              step={step}
              index={index}
              isCompleted={step.completed}
              isHighlighted={highlightedStep === index}
              isCurrent={currentStepIndex === index}
              isLast={index === selectedProject.roadmap.length - 1}
              onToggle={() => toggleStepCompletion(selectedProject.id, step.id)}
              onStepClick={(step) => {
                setHighlightedStep(index);
                openStepDetails(step);
              }}
            />
          ))}
        </div>

        {/* Enhanced Step Details Modal with Checkboxes */}
        {selectedStep && (
          <div className="custom-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1050 }}>
            <div className="custom-modal-content rounded-4 w-100" style={{ maxWidth: '50rem', maxHeight: '85vh', overflow: 'auto' }}>
              <div className="p-5">
                <div className="d-flex align-items-start justify-content-between mb-4">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                        <BookOpen size={20} color="white" />
                      </div>
                      <span className="text-white-70 small fw-medium">Step Details</span>
                    </div>
                    <h2 className="text-white h3 mb-2">{selectedStep.title}</h2>
                    <p className="text-white-70 fs-5">{selectedStep.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="btn text-white-50 p-2 ms-3"
                    style={{ fontSize: '1.5rem' }}
                  >
                    ×
                  </button>
                </div>

                <div className="mb-5">
                  <h3 className="h4 text-white mb-4">What you need to do:</h3>

                  {loadingInstructions ? (
                    <div className="d-flex align-items-center text-white-70 fs-5">
                      <div className="spinner-border spinner-border-sm text-primary me-3" role="status"></div>
                      <span>Loading your personalized instructions...</span>
                    </div>
                  ) : (
                    <div>
                      {stepInstructions.map((instruction, index) => {
                        const progressKey = `${selectedStep.id}-${index}`;
                        const isCompleted = instructionProgress[progressKey] || false;

                        return (
                          <div key={index} className={`instruction-item ${isCompleted ? 'completed' : ''}`}>
                            <input
                              type="checkbox"
                              className="instruction-checkbox form-check-input"
                              checked={isCompleted}
                              onChange={() => toggleInstructionCompletion(selectedStep.id, index)}
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-start">
                                <div
                                  className="custom-gradient-icon rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0 me-3"
                                  style={{ width: '32px', height: '32px', fontSize: '0.875rem' }}
                                >
                                  {index + 1}
                                </div>
                                <p className={`instruction-text text-white mb-0 fs-6 lh-lg ${isCompleted ? 'text-decoration-line-through' : ''}`}>
                                  {instruction}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="d-flex gap-3">
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="btn btn-outline-light flex-fill py-3"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      toggleStepCompletion(selectedProject.id, selectedStep.id);
                      setSelectedStep(null);
                    }}
                    className={`btn flex-fill py-3 fw-bold fs-5 ${
                      selectedStep.completed
                        ? 'btn-warning'
                        : 'btn-success'
                    }`}
                  >
                    {selectedStep.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Quiz Modal */}
        {showQuizModal && (
          <QuizModal
            project={selectedProject}
            onClose={() => setShowQuizModal(false)}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    );
  }

  return (
    <div className="custom-bg">
      <style>{customStyles}</style>

      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <div className="custom-header">
        <div className="container-fluid">
          <div className="row align-items-center py-3">
            <div className="col">
              <div className="d-flex align-items-center">
                <div
                  className="custom-gradient-icon rounded-3 d-flex align-items-center justify-content-center me-3"
                  style={{ width: '48px', height: '48px' }}
                >
                  <Target size={28} color="white" />
                </div>
                <div>
                  <h1 className="text-white h3 mb-1">Roadmap Dashboard</h1>
                  <p className="text-white-70 small mb-0">Track your learning journey and test your knowledge with comprehensive quizzes</p>
                </div>
              </div>
            </div>

            <div className="col-auto">
              <button
                onClick={() => setShowCreateModal(true)}
                className="custom-btn-primary btn text-white fw-bold d-flex align-items-center"
              >
                <Plus size={20} className="me-2" />
                <span>Create Project</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="custom-card rounded-3 p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-white-70 small mb-1">Total Projects</p>
                  <p className="text-white h4 mb-0">{stats.totalProjects}</p>
                </div>
                <div className="bg-primary bg-opacity-20 rounded-3 p-2">
                  <Target size={24} className="text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="custom-card rounded-3 p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-white-70 small mb-1">Completed Steps</p>
                  <p className="text-white h4 mb-0">{stats.completedSteps}</p>
                </div>
                <div className="bg-success bg-opacity-20 rounded-3 p-2">
                  <CheckCircle size={24} className="text-success" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="custom-card rounded-3 p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-white-70 small mb-1">Total Steps</p>
                  <p className="text-white h4 mb-0">{stats.totalSteps}</p>
                </div>
                <div className="bg-warning bg-opacity-20 rounded-3 p-2">
                  <GitBranch size={24} className="text-warning" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="custom-card rounded-3 p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-white-70 small mb-1">Avg. Progress</p>
                  <p className="text-white h4 mb-0">{stats.avgProgress}%</p>
                </div>
                <div className="bg-info bg-opacity-20 rounded-3 p-2">
                  <TrendingUp size={24} className="text-info" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col">
            <h2 className="text-white h5">Your Roadmaps</h2>
          </div>
        </div>

        <div className="row g-4">
          {projects.length === 0 ? (
            <div className="col-12 text-center text-white-70">
              <p>No roadmaps created yet. Click 'Create Project' to start your journey!</p>
            </div>
          ) : (
            projects.map(project => (
              <div className="col-md-6 col-lg-4" key={project.id}>
                <div className="custom-card rounded-3 p-4 h-100 d-flex flex-column">
                  <button
                    className="delete-btn"
                    onClick={() => { setProjectToDelete(project); setShowDeleteModal(true); }}
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="d-flex align-items-center mb-3">
                    <div className="custom-gradient-icon rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px' }}>
                      <Calendar size={28} color="white" />
                    </div>
                    <div>
                      <h3 className="text-white h5 mb-0">{project.projectName}</h3>
                      <p className="text-white-70 small mb-0">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <p className="text-white-70 small mb-3 line-clamp-2">
                    <Star size={14} className="me-2 text-warning" />
                    {project.prompt}
                  </p>

                  <div className="mb-3 mt-auto">
                    <div className="d-flex justify-content-between text-white-70 small mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="custom-progress">
                      <div className="custom-progress-bar" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setCurrentView('timeline-project');
                      }}
                      className="custom-btn-primary btn text-white flex-grow-1"
                    >
                      <Play size={20} className="me-2" />
                      View Roadmap
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="custom-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1050 }}>
          <div className="custom-modal-content rounded-4 w-100" style={{ maxWidth: '30rem' }}>
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-white h5 mb-0">Create New Roadmap</h3>
                <button onClick={() => setShowCreateModal(false)} className="btn text-white-50 p-0" style={{ fontSize: '1.5rem' }}>×</button>
              </div>

              <div className="mb-4">
                <label htmlFor="project-prompt" className="form-label text-white-70">
                  What do you want to learn?
                </label>
                <textarea
                  id="project-prompt"
                  rows="3"
                  className="form-control"
                  placeholder="e.g., Learn to build a full-stack e-commerce app with React and Node.js"
                  value={newProjectPrompt}
                  onChange={(e) => setNewProjectPrompt(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    resize: 'none'
                  }}
                />
              </div>

              <button
                onClick={createProject}
                className="custom-btn-primary btn w-100 text-white"
                disabled={isLoading || !newProjectPrompt.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {loadingMessage}
                  </>
                ) : (
                  'Generate Roadmap with AI'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="custom-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1050 }}>
          <div className="custom-modal-content rounded-4 w-100" style={{ maxWidth: '25rem' }}>
            <div className="p-4 text-center">
              <div className="mb-4">
                <div className="bg-danger bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                  <Trash2 size={32} className="text-danger" />
                </div>
                <h3 className="text-white h5 mb-2">Delete Roadmap?</h3>
                <p className="text-white-70 mb-0">Are you sure you want to delete "{projectToDelete?.projectName}"? This action cannot be undone.</p>
              </div>

              <div className="d-flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="btn btn-outline-light flex-fill">
                  Cancel
                </button>
                <button onClick={deleteProject} className="btn btn-danger flex-fill">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapDashboard;
