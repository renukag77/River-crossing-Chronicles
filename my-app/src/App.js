// App.js
import React, { useState } from 'react';
import './App.css';

function App() {
  const [totalCount, setTotalCount] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentState, setCurrentState] = useState(null);
  const [solution, setSolution] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);
  

 

  // State represents [leftM, leftC, boat, rightM, rightC]
  // boat: 0 = left side, 1 = right side
  const initialState = (count) => [count, count, 0, 0, 0];
  const goalState = (count) => [0, 0, 1, count, count];

  const isValidState = (state) => {
    const [leftM, leftC, , rightM, rightC] = state;
    if (leftM < 0 || leftC < 0 || rightM < 0 || rightC < 0) return false;
    if (leftM < leftC && leftM > 0) return false;
    if (rightM < rightC && rightM > 0) return false;
    return true;
  };

  const getNextStates = (state) => {
    const [leftM, leftC, boat, rightM, rightC] = state;
    const moves = [];
    const possibilities = [
      [1, 0], [2, 0], [0, 1], [0, 2], [1, 1]
    ];

    possibilities.forEach(([m, c]) => {
      if (boat === 0) { // Moving from left to right
        if (leftM >= m && leftC >= c) {
          const newState = [
            leftM - m,
            leftC - c,
            1,
            rightM + m,
            rightC + c
          ];
          if (isValidState(newState)) moves.push(newState);
        }
      } else { // Moving from right to left
        if (rightM >= m && rightC >= c) {
          const newState = [
            leftM + m,
            leftC + c,
            0,
            rightM - m,
            rightC - c
          ];
          if (isValidState(newState)) moves.push(newState);
        }
      }
    });

    return moves;
  };

  const stateToString = (state) => state.join(',');

  const bfs = (initial, goal) => {
    const queue = [[initial]];
    const visited = new Set([stateToString(initial)]);

    while (queue.length > 0) {
      const path = queue.shift();
      const currentState = path[path.length - 1];

      if (stateToString(currentState) === stateToString(goal)) {
        return path;
      }

      const nextStates = getNextStates(currentState);
      for (const nextState of nextStates) {
        const stateStr = stateToString(nextState);
        if (!visited.has(stateStr)) {
          visited.add(stateStr);
          queue.push([...path, nextState]);
        }
      }
    }
    return null;
  };

  const startGame = () => {
    if (totalCount < 1 || totalCount > 3) {
      setError('Please select a valid difficulty level');
      return;
    }
    const initial = initialState(totalCount);
    const goal = goalState(totalCount);
    const solution = bfs(initial, goal);
    
    if (!solution) {
      setError('No solution exists for this configuration');
      return;
    }

    setError('');
    setSolution(solution);
    setCurrentState(initial);
    setCurrentStep(0);
    setGameStarted(true);
  };

  const nextStep = () => {
    if (currentStep < solution.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentState(solution[currentStep + 1]);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentState(solution[currentStep - 1]);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentState(null);
    setSolution([]);
    setCurrentStep(0);
    setError('');
  };

  return (
    <div className="app">
      <div className="game-container">
        <div className="game-header">
          <h1>🏝️ Missionaries & Cannibals 🏝️</h1>
          <button className="rules-btn" onClick={() => setShowRules(!showRules)}>
            {showRules ? 'Hide Rules' : 'Show Rules'}
          </button>
        </div>

        {showRules && (
          <div className="rules-panel">
            <h3>🎮 Game Rules</h3>
            <ol>
              <li>Get all missionaries and cannibals to the other side safely</li>
              <li>The boat can carry maximum 2 people</li>
              <li>At least 1 person must row the boat</li>
              <li>Cannibals cannot outnumber missionaries on either bank</li>
            </ol>
          </div>
        )}
        
        {!gameStarted ? (
          <div className="setup-panel">
            <h2>Select Your Challenge</h2>
            <div className="difficulty-selector">
              <button 
                className={`difficulty-btn ${totalCount === 1 ? 'selected' : ''}`}
                onClick={() => setTotalCount(1)}
              >
                Easy
                <div className="count-display">
                  <span>👨 1</span>
                  <span>👿 1</span>
                </div>
              </button>
              <button 
                className={`difficulty-btn ${totalCount === 2 ? 'selected' : ''}`}
                onClick={() => setTotalCount(2)}
              >
                Medium
                <div className="count-display">
                  <span>👨 2</span>
                  <span>👿 2</span>
                </div>
              </button>
              <button 
                className={`difficulty-btn ${totalCount === 3 ? 'selected' : ''}`}
                onClick={() => setTotalCount(3)}
              >
                Hard
                <div className="count-display">
                  <span>👨 3</span>
                  <span>👿 3</span>
                </div>
              </button>
            </div>
            <button className="start-btn" onClick={startGame}>Start Adventure!</button>
            {error && <div className="error">{error}</div>}
          </div>
        ) : (
          <div className="game-play">
            <div className="river-scene">
              <div className="bank left-bank">
                <div className="bank-content">
                  {Array(currentState[0]).fill().map((_, i) => (
                    <div key={`missionary-left-${i}`} className="person missionary">👨</div>
                  ))}
                  {Array(currentState[1]).fill().map((_, i) => (
                    <div key={`cannibal-left-${i}`} className="person cannibal">👿</div>
                  ))}
                </div>
              </div>
              
              <div className="river">
                <div className="waves"></div>
                <div className="boat" style={{ 
                  left: currentState[2] === 0 ? '20%' : '80%'
                }}>⛵</div>
              </div>
              
              <div className="bank right-bank">
                <div className="bank-content">
                  {Array(currentState[3]).fill().map((_, i) => (
                    <div key={`missionary-right-${i}`} className="person missionary">👨</div>
                  ))}
                  {Array(currentState[4]).fill().map((_, i) => (
                    <div key={`cannibal-right-${i}`} className="person cannibal">👿</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="game-controls">
              <button className="control-btn" onClick={prevStep} disabled={currentStep === 0}>
                ⬅️ Previous
              </button>
              <div className="step-counter">
                Step {currentStep + 1} of {solution.length}
              </div>
              <button className="control-btn" onClick={nextStep} disabled={currentStep === solution.length - 1}>
                Next ➡️
              </button>
            </div>
            
            <button className="reset-btn" onClick={resetGame}>↺ Reset Game</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;