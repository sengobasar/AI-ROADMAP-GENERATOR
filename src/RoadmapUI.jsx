
if (currentView === 'project' && selectedProject) {
    return (
      <div className="custom-bg">
        <style>{customStyles}</style>
        
        {/* Bootstrap CSS */}
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
          rel="stylesheet" 
        />

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
                    <ChevronRight className="rotate-180" size={20} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <div>
                    <h1 className="text-white h3 mb-1">{selectedProject.projectName}</h1>
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
            
            {/* Progress Bar */}
            <div className="custom-progress mb-3">
              <div 
                className="custom-progress-bar"
                style={{ width: `${selectedProject.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Roadmap Steps */}
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col">
              {selectedProject.roadmap.map((step, index) => (
                <div
                  key={step.id}
                  className={`custom-card rounded-4 p-4 mb-4 ${
                    step.completed ? 'custom-card-completed' : ''
                  }`}
                  onClick={() => openStepDetails(step)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start justify-content-between">
                    <div className="d-flex align-items-start flex-grow-1">
                      <div className="flex-shrink-0 me-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStepCompletion(selectedProject.id, step.id);
                          }}
                          className={`custom-btn-check d-flex align-items-center justify-content-center ${
                            step.completed ? 'custom-btn-check-completed' : ''
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle size={20} />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <span className="text-white-50 small fw-medium me-2">Step {index + 1}</span>
                          <div 
                            className="custom-pulse rounded-circle bg-primary"
                            style={{ width: '8px', height: '8px' }}
                          />
                        </div>
                        <h3 className={`h5 mb-2 ${step.completed ? 'text-success' : 'text-white'}`}>
                          {step.title}
                        </h3>
                        <p className="text-white-70 mb-0">
                          {step.description}
                        </p>
                        {step.completedAt && (
                          <div className="mt-2 text-success small d-flex align-items-center">
                            <CheckCircle size={16} className="me-2" />
                            <span>Completed on {new Date(step.completedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight size={20} className="text-white-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Details Modal */}
        {selectedStep && (
          <div className="custom-modal position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4" style={{ zIndex: 1050 }}>
            <div className="custom-modal-content rounded-4 w-100" style={{ maxWidth: '48rem', maxHeight: '80vh', overflow: 'auto' }}>
              <div className="p-4">
                <div className="d-flex align-items-start justify-content-between mb-4">
                  <div>
                    <h2 className="text-white h4 mb-2">{selectedStep.title}</h2>
                    <p className="text-white-70">{selectedStep.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="btn text-white-50 p-0"
                    style={{ fontSize: '2rem' }}
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="h5 text-white mb-3 d-flex align-items-center">
                    <BookOpen size={20} className="me-2" />
                    <span>Detailed Instructions</span>
                  </h3>
                  
                  {loadingInstructions ? (
                    <div className="d-flex align-items-center text-white-70">
                      <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                      <span>Loading instructions...</span>
                    </div>
                  ) : (
                    <div>
                      {stepInstructions.map((instruction, index) => (
                        <div key={index} className="custom-card rounded-3 p-3 mb-3">
                          <div className="d-flex align-items-start">
                            <div 
                              className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white small fw-bold flex-shrink-0 me-3"
                              style={{ width: '24px', height: '24px' }}
                            >
                              {index + 1}
                            </div>
                            <p className="text-white mb-0">{instruction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="d-flex gap-3">
                  <button
                    onClick={() => {
                      toggleStepCompletion(selectedProject.id, selectedStep.id);
                      setSelectedStep(null);
                    }}
                    className={`btn flex-fill py-2 fw-bold ${
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
      </div>
    );
  }
import React from 'react';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';

const RoadmapUI = ({ roadmapData, onStepClick, onToggleCompletion, projectId }) => {
  const treeStyles = `
    @keyframes pulse-subtle {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      50% {
        transform: scale(1.005);
        box-shadow: 0 6px 10px -2px rgba(0, 0, 0, 0.1), 0 3px 6px -2px rgba(0, 0, 0, 0.08);
      }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
      20%, 40%, 60%, 80% { transform: translateX(3px); }
    }

    .tree-animate-pulse-subtle {
      animation: pulse-subtle 2s infinite ease-in-out;
    }

    .tree-animate-shake {
      animation: shake 0.8s cubic-bezier(.36,.07,.19,.97) both;
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      perspective: 1000px;
    }

    .tree-connection-line {
      border-left: 1px dotted rgba(255, 255, 255, 0.3);
    }

    .tree-horizontal-line {
      border-top: 1px dotted rgba(255, 255, 255, 0.3);
    }
  `;

  return (
    <>
      <style>{treeStyles}</style>
      <div className="row">
        <div className="col">
          {roadmapData.map((step, index) => (
            <RoadmapItem 
              key={step.id}
              step={step}
              index={index}
              onStepClick={onStepClick}
              onToggleCompletion={onToggleCompletion}
              projectId={projectId}
            />
          ))}
        </div>
      </div>
    </>
  );
};

const RoadmapItem = ({ step, index, onStepClick, onToggleCompletion, projectId }) => {
  // Calculate indentation based on level
  const indentMultiplier = step.level || 0;
  const leftOffset = indentMultiplier * 32; // 32px per level

  // Get emoji and styling based on type and status
  const getEmoji = () => {
    if (step.completed || step.status === 'completed') return '✅';
    if (step.status === 'in-progress') return '⏳';
    if (step.status === 'stuck') return '⚠️';
    
    switch (step.type) {
      case 'root': return '🚀';
      case 'branch': return '✨';
      default: return '➡️';
    }
  };

  // Get node styling based on type and status
  const getNodeClass = () => {
    let baseClass = 'position-relative mb-4 p-4 rounded-4 shadow-sm transition-all cursor-pointer ';
    
    // Status-based classes
    if (step.completed || step.status === 'completed') {
      baseClass += 'custom-card-completed ';
    } else if (step.status === 'in-progress') {
      baseClass += 'tree-animate-pulse-subtle ';
    } else if (step.status === 'stuck') {
      baseClass += 'tree-animate-shake ';
    }

    // Type-based classes
    switch (step.type) {
      case 'root':
        baseClass += 'custom-card border-2 border-purple-600 ';
        break;
      case 'branch':
        baseClass += 'custom-card border border-purple-300 ';
        break;
      default:
        baseClass += 'custom-card border border-gray-300 ';
        break;
    }

    return baseClass;
  };

  const getTitleClass = () => {
    let titleClass = 'fw-semibold mb-2 d-flex align-items-center ';
    
    if (step.completed || step.status === 'completed') {
      titleClass += 'text-success ';
    } else {
      switch (step.type) {
        case 'root':
          titleClass += 'text-white h3 fw-bold ';
          break;
        case 'branch':
          titleClass += 'text-purple-400 h5 fw-bold ';
          break;
        default:
          titleClass += 'text-white h6 ';
          break;
      }
    }
    
    return titleClass;
  };

  return (
    <div 
      className="position-relative"
      style={{ paddingLeft: `${leftOffset}px` }}
    >
      {/* Vertical dotted line for levels > 0 */}
      {step.level > 0 && (
        <div
          className="position-absolute tree-connection-line"
          style={{
            left: `${(step.level - 1) * 32 + 16}px`,
            top: 0,
            bottom: 0,
            width: '1px'
          }}
        />
      )}
      
      {/* Horizontal connector for levels > 0 */}
      {step.level > 0 && (
        <div
          className="position-absolute d-flex align-items-center"
          style={{
            left: `${(step.level - 1) * 32 + 16}px`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px'
          }}
        >
          <span className="text-white-50">↳</span>
        </div>
      )}

      <div
        className={getNodeClass()}
        onClick={() => onStepClick(step)}
      >
        <div className="d-flex align-items-start justify-content-between">
          <div className="d-flex align-items-start flex-grow-1">
            <div className="flex-shrink-0 me-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompletion(projectId, step.id);
                }}
                className={`custom-btn-check d-flex align-items-center justify-content-center ${
                  step.completed ? 'custom-btn-check-completed' : ''
                }`}
              >
                {step.completed ? (
                  <CheckCircle size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </button>
            </div>
            
            <div className="flex-grow-1">
              <h3 className={getTitleClass()}>
                <span className="me-2 fs-4">{getEmoji()}</span>
                {step.title}
              </h3>
              <p className="text-white-70 mb-0">
                {step.description}
              </p>
              {step.completedAt && (
                <div className="mt-2 text-success small d-flex align-items-center">
                  <CheckCircle size={16} className="me-2" />
                  <span>Completed on {new Date(step.completedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
          
          <ChevronRight size={20} className="text-white-40" />
        </div>
      </div>
    </div>
  );
};

export default RoadmapUI;