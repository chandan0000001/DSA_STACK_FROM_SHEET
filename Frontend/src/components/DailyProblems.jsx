import React from 'react'
import { useNavigate } from 'react-router-dom'

const DailyProblems = () => {
  const navigate = useNavigate()

  return (
    <div className='w-full p-4 md:p-5 rounded-[20px] bg-[#070707] border border-white/10'>

      <div className='flex justify-between items-start'>
        <div>
          <h3 className='text-base md:text-[20px] font-heading'>Today Problems</h3>
          <p className='text-sm md:text-[16px] font-body font-light text-white/52'>
            Solved today's problem?
          </p>
        </div>
        <i className="ri-focus-3-line text-[#A4873E] text-xl"></i>
      </div>

      <div className='mt-4 md:mt-5 relative rounded-[20px] overflow-hidden'>
        <img
          src="daily.svg"
          alt="Illustration for today's daily DSA challenge"
          className='w-full h-[130px] md:h-[150px] object-cover opacity-40'
        />

        <div className='absolute inset-0 flex flex-col justify-center items-center text-center px-4 md:px-6'>
          <h2 className='text-base md:text-[18px] font-bold'>
            DSA Today Problem
            <br />
            Challange
          </h2>
          <button
            onClick={() => navigate('/daily-problem')}
            className='mt-3 md:mt-4 px-5 md:px-6 py-1.5 md:py-1 rounded-[12px] bg-[#A4873E] flex items-center gap-2 text-sm md:text-base'
          >
            Solve
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>

      <div className='mt-4 md:mt-5 flex items-center justify-center gap-2 text-white/60'>
        <img src="fast.svg" alt="Fast challenge icon" className='w-4 h-4 md:w-auto md:h-auto' />
        <p className='text-xs md:text-[14px]'>4 Questions to solve</p>
      </div>

    </div>
  )
}

export default DailyProblems
