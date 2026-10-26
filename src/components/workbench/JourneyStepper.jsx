import React from 'react';
import { journeySteps } from '../../data/caseData.js';

export function JourneyStepper({ currentStage }) {
  return (
    <div className="journey-stepper">
      {journeySteps.map((step, i) => {
        const state = step.id < currentStage ? 'done' : step.id === currentStage ? 'current' : '';
        return (
          <React.Fragment key={step.id}>
            <div className={`journey-step ${state}`} title={step.detail}>
              <div className="journey-step-circle">{step.id < currentStage ? '✓' : step.id}</div>
              <div className="journey-step-label">{step.label}</div>
            </div>
            {i < journeySteps.length - 1 && <div className="journey-connector" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
