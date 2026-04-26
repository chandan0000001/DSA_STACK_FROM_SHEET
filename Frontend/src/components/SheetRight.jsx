import React from 'react';
import ProgessBar from './ProgessBar';
import DailyProblems from './DailyProblems';

const SheetRight = ({ totalProblems, totalCompleted, onProgressUpdate }) => {
  return (
    <div className='flex flex-col gap-5'>

      <ProgessBar
        totalProblems={totalProblems}
        totalCompleted={totalCompleted} 
      />

      <DailyProblems
        onProgressUpdate={onProgressUpdate}
      />

    </div>
  );
};

export default SheetRight;