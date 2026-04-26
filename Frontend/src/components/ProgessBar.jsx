import React from "react";

const ProgessBar = ({
  totalProblems = 0,
  totalCompleted = 0, // ✅ use this instead of calculating from problems
}) => {

  const solved = totalCompleted // ✅ fixed
  const total = totalProblems
  const percentage = total > 0 ? (solved / total) * 100 : 0

  const radius = 80
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="w-full p-4 md:p-5 rounded-[20px] bg-[#070707] border border-white/10">

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base md:text-[20px] font-heading">Overall Progress</h3>
          <p className="text-sm md:text-[16px] font-body font-light text-white/52">
            Your global Progress
          </p>
        </div>
        <p className="text-sm md:text-[16px] font-heading font-light text-[#A4873E]">
          {Math.round(percentage)}%
        </p>
      </div>

      <div className="mt-4 md:mt-6 flex justify-center">
        <div className="w-full rounded-[20px] border border-white/10 p-4 md:p-6 flex justify-center items-center">
          <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2}>
              <circle
                stroke="#1A1A1A"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#A4873E"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
              />
            </svg>
            <div className="absolute text-lg md:text-[20px] font-heading">
              {solved}/{total}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 md:mt-5 flex items-center justify-center gap-2 text-white/60">
        <img src="stk.svg" alt="Progress summary icon" className="w-4 h-4 md:w-auto md:h-auto" />
        <p className="text-xs md:text-[14px]">
          Total Problems: {total}
        </p>
      </div>

    </div>
  )
}

export default ProgessBar
