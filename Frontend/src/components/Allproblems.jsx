import React from 'react'

const Allproblems = ({
  problems,
  doneProblems,
  loading,
  error,
  progressError,
  pendingProblems = {},
  onCheck
}) => {

  return ( 
    <div className='w-full mt-6'>

      {progressError && (
        <div className='mb-4 rounded-[16px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
          {progressError}
        </div>
      )}

      {/* Table Container */}
      <div className='bg-black border border-white/10 rounded-[20px] overflow-hidden'>

        {/* Header */}
        <div className='grid grid-cols-[1fr_1fr_4fr_2fr] sm:grid-cols-[1fr_1fr_3fr_2fr_1fr] gap-2 sm:gap-0 px-4 sm:px-6 py-4 text-white/70 text-[12px] md:text-base font-medium border-b border-white/10'>
          <p>Status</p>
          <p>#</p>
          <p>Title</p>
          <p className='hidden sm:block'>Tag</p>
          <p>Difficulty</p>
        </div>

        {loading && (
          <div className='px-6 py-8 text-white/60 text-sm md:text-base'>
            Loading problems...
          </div>
        )}

        {!loading && error && (
          <div className='px-6 py-8 text-red-400 text-sm md:text-base'>
            {error}
          </div>
        )}

        {!loading && !error && problems.length === 0 && (
          <div className='px-6 py-8 text-white/60 text-sm md:text-base'>
            No problems found.
          </div>
        )}

        {/* Rows */}
        {!loading && !error && problems.map((p, index) => (
          <div
            key={p._id}
            className='grid grid-cols-[1fr_1fr_4fr_2fr] sm:grid-cols-[1fr_1fr_3fr_2fr_1fr] gap-2 sm:gap-0 px-4 sm:px-6 py-4 items-center text-[12px] md:text-base border-b border-white/5 hover:bg-white/5 transition-all'
          >

            {/* Status */}
            <div>
              {doneProblems[p._id] ? (
                <i
                  onClick={() => !pendingProblems[p._id] && onCheck(p._id)}
                  className={`ri-checkbox-circle-line text-lg transition-opacity ${
                    pendingProblems[p._id]
                      ? 'text-green-500/60 cursor-wait'
                      : 'text-green-500 cursor-pointer'
                  }`}
                ></i>
              ) : (
                <div
                  onClick={() => !pendingProblems[p._id] && onCheck(p._id)}
                  className={`w-[18px] h-[18px] rounded-[3px] border transition-all ${
                    pendingProblems[p._id]
                      ? 'border-white/20 cursor-wait opacity-60'
                      : 'border-white/30 cursor-pointer hover:border-white/50'
                  }`}
                />
              )}
            </div>

            {/* Index */}
            <p className='text-white/60'>{index + 1}</p>

            {/* Title — overflow hidden to prevent expansion */}
            <div className='overflow-hidden min-w-0'>
              <a
              href={p.link}
              target='_blank'
              rel='noreferrer'
              className='block text-white/80 truncate hover:text-white'
            >
              {p.name}
            </a>
              
            </div>

            {/* Tag */}
            <div className='overflow-hidden hidden sm:block'>
              <p className='text-white/50 truncate'>
                {p.tags?.join(', ') || 'No tags'}
              </p>
            </div>

            {/* Difficulty */}
            <p className={`font-medium
              ${p.difficulty === 'Easy' ? 'text-green-400' :
                p.difficulty === 'Medium' ? 'text-yellow-400' :
                p.difficulty === 'Hard' ? 'text-red-400' : 'text-white/70'}`}
            >
              {p.difficulty || 'N/A'}
            </p>

          </div>
        ))}

      </div>
    </div>
  )
}

export default Allproblems
