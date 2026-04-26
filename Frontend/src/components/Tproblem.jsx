import React from 'react'

const ProblemTable = ({
  problems = [],
  solvedProblems = [],
  pendingProblems = {},
  onToggle
}) => {

  const isSolved = (problemId) =>
    solvedProblems.map(id => id.toString()).includes(problemId.toString());

  return (
    <div className='w-full mt-6'>

      {/* Table Container */}
      <div className='bg-black border border-white/10 rounded-[20px] overflow-hidden'>

        {/* Header */}
        <div className='grid grid-cols-[1fr_1fr_3fr_2fr_1fr] px-6 py-4 text-white/70 text-sm md:text-base font-medium border-b border-white/10'>
          <p>Status</p>
          <p>#</p>
          <p>Title</p>
          <p>Tag</p>
          <p>Difficulty</p>
        </div>

        {/* Empty State */}
        {problems.length === 0 && (
          <div className='flex justify-center items-center py-10'>
            <p className='text-white/30 text-sm'>No problems for today</p>
          </div>
        )}

        {/* Rows */}
        {problems.map((p, index) => (
          <div
            key={p._id}
            className='grid grid-cols-[1fr_1fr_3fr_2fr_1fr] px-6 py-4 items-center text-sm md:text-base border-b border-white/5 hover:bg-white/5 transition-all'
          >

            {/* Status Toggle */}
            <div
              className={`flex items-center ${pendingProblems[p._id] ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
              onClick={() => !pendingProblems[p._id] && onToggle(p._id)}
            >
              {isSolved(p._id) ? (
                <i className="ri-checkbox-circle-fill text-green-500 text-xl"></i>
              ) : (
                <div className='w-5 h-5 border border-white/30 rounded-full hover:border-white/60 transition-all' />
              )}
            </div>

            {/* Index */}
            <p className='text-white/60'>{index + 1}</p>

            {/* Title as Link */}
            <a
              href={p.link}
              target='_blank'
              rel='noreferrer'
              className='text-white/80 truncate hover:text-white'
            >
              {p.name}
            </a>

            {/* Tags */}
            <p className='text-white/50'>
              {Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || p.category || '—'}
            </p>

            {/* Difficulty */}
            <p className={`font-medium
              ${p.difficulty === 'Easy' ? 'text-green-400' :
                p.difficulty === 'Medium' ? 'text-yellow-400' :
                p.difficulty === 'Hard' ? 'text-red-400' : 'text-white/70'}`}
            >
              {p.difficulty || '—'}
            </p>

          </div>
        ))}

      </div>
    </div>
  )
}

export default ProblemTable
