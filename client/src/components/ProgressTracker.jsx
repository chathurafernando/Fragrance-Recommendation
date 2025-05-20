import React from 'react';

const ProgressTracker = ({ currentStep, steps }) => {


  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'incomplete';
  };

  return (
    <div className="container progress-tracker mb-5">
      <div className="row justify-content-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isFirst = index === 0;
          
          return (
            <div 
              key={step.id} 
              className="col step" 
              style={{ textAlign: 'center', position: 'relative' }}
            >
              {!isFirst && (
                <div 
                  className="connector" 
                  style={{
                    position: 'absolute',
                    height: '2px',
                    backgroundColor: status === 'completed' ? '#198754' : 
                                    status === 'active' ? '#0d6efd' : '#dee2e6',
                    top: '15px',
                    left: '-50%',
                    right: '50%',
                    zIndex: '-1'
                  }}
                />
              )}
              
              <div 
                className="step-number" 
                style={{
                  width: '30px',
                  height: '30px',
                  lineHeight: '30px',
                  borderRadius: '50%',
                  backgroundColor: status === 'completed' ? '#198754' : 
                                  status === 'active' ? '#0d6efd' : '#dee2e6',
                  display: 'inline-block',
                  marginBottom: '0.5rem',
                  color: status !== 'incomplete' ? 'white' : '#495057',
                  fontWeight: 'bold'
                }}
              >
                {step.id}
              </div>
              
              <div 
                className="step-label" 
                style={{
                  fontSize: '0.9rem',
                  color: status === 'completed' ? '#198754' : 
                         status === 'active' ? '#0d6efd' : '#6c757d',
                  fontWeight: status === 'active' ? 'bold' : 'normal'
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;