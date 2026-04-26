import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    number: "01",
    title: "Daily Problem System",
    desc: "A fixed set of daily coding problems. No decision fatigue — just open and solve.",
  },
  {
    number: "02",
    title: "Progress Tracking",
    desc: "Every solved problem logged. See exactly how far you've come.",
  },
  {
    number: "03",
    title: "Streak System",
    desc: "Miss a day and it resets. Simple pressure that actually keeps you going.",
  },
  {
    number: "04",
    title: "Topic-Wise Practice",
    desc: "Arrays, strings, trees — focused by topic so you can fix weak areas fast.",
  },
  {
    number: "05",
    title: "Personalized Dashboard",
    desc: "Daily tasks, completed work, overall progress. One clean view.",
  },
  {
    number: "06",
    title: "Structured Learning Flow",
    desc: "Step-by-step guidance. Discipline beats motivation every time.",
  },
  {
    number: "07",
    title: "Minimal UI",
    desc: "Built only for practice and progress. Nothing in the way.",
  },
  {
    number: "08",
    title: "Accountability System",
    desc: "Streak pressure and progress visibility. You won't ghost this like your gym.",
  },
]

const stats = [
  { value: "4",    label: "Problems daily" },
  { value: "365",  label: "Day streak possible" },
  { value: "100+", label: "Topics covered" },
  { value: "1",    label: "Dashboard for all" },
]

function useScrollReveal(options = {}) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.disconnect()
        }
      },
      { threshold: 0.15, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

const Sections = () => {
  const hookRef     = useScrollReveal()
  const statsRef    = useScrollReveal()
  const featHeadRef = useScrollReveal()
  const ctaRef      = useScrollReveal()
  const featureRefs = useRef([])

  const navigate = useNavigate()

  useEffect(() => {
    const observers = []
    featureRefs.current.forEach((el) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('revealed')
            observer.disconnect()
          }
        },
        { threshold: 0.15 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <>
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .stagger > * {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .stagger.revealed > *:nth-child(1) { opacity:1; transform:translateY(0); transition-delay: 0ms; }
        .stagger.revealed > *:nth-child(2) { opacity:1; transform:translateY(0); transition-delay: 80ms; }
        .stagger.revealed > *:nth-child(3) { opacity:1; transform:translateY(0); transition-delay: 160ms; }
        .stagger.revealed > *:nth-child(4) { opacity:1; transform:translateY(0); transition-delay: 240ms; }
        .feat-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease, background 0.3s;
        }
        .feat-item.revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className='w-full bg-black text-white px-6 md:px-16 py-20 md:py-32 '>

  <div ref={hookRef} className='reveal max-w-5xl'>
    <p className='font-tech text-xs tracking-[0.3em] text-[#A4873E] uppercase mb-6'>
      Why this exists
    </p>
    <h2 className='font-heading text-4xl sm:text-5xl md:text-7xl leading-tight mb-8 md:mb-10'>
      Be Honest <br /> With Yourself
    </h2>
    <p className='font-body text-gray-400 max-w-lg text-sm md:text-base leading-relaxed mb-4'>
      You don't lack talent. You lack consistency.
      This system keeps you from disappearing after Day 3 like usual.
    </p>
    <p className='font-body text-gray-600 max-w-md text-xs md:text-sm leading-relaxed'>
      No tutorials. No roadmaps. Just daily problems, a streak counter,
      and the quiet shame of breaking it.
    </p>
  </div>

  {/* Stats */}
  <div ref={statsRef} className='stagger grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-16 md:mt-20'>
    {stats.map((s) => (
      <div
        key={s.label}
        className='group relative bg-[#0a0a0a] rounded-2xl px-6 py-8 md:py-10 flex flex-col gap-3 overflow-hidden cursor-default transition-all duration-500'
        style={{
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(164,135,62,0.4)'}
        onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'}
      >
        {/* background glow on hover */}
        <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl'
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(164,135,62,0.06) 0%, transparent 70%)',
          }}
        />

        {/* top label */}
        <span className='font-tech text-[10px] tracking-[0.25em] text-white/25 uppercase'>
          {s.label}
        </span>

        {/* big number */}
        <span className='font-heading text-5xl md:text-6xl text-white group-hover:text-[#A4873E] transition-colors duration-500'>
          {s.value}
        </span>

        {/* bottom accent */}
        <div className='mt-auto pt-4 flex items-center gap-2'>
          <div className='h-px w-6 bg-[#A4873E]/20 group-hover:w-10 group-hover:bg-[#A4873E]/60 transition-all duration-500' />
        </div>
      </div>
    ))}
  </div>

</div>

      <div className='w-full bg-black text-white px-6 md:px-16 py-20 md:py-32 '>

        <div ref={featHeadRef} className='reveal mb-14 md:mb-20'>
          <p className='font-tech text-xs tracking-[0.3em] text-[#A4873E] uppercase mb-6'>
            What you get
          </p>
          <h2 className='font-heading text-4xl sm:text-5xl md:text-6xl leading-tight max-w-2xl'>
            Everything you need.{' '}
            <span className='text-white/20'>Nothing you don't.</span>
          </h2>
        </div>

        <div className='divide-y divide-white/10 '>
          {features.map((f, i) => (
            <div
              key={f.number}
              ref={(el) => (featureRefs.current[i] = el)}
              className='feat-item group flex flex-col md:flex-row md:items-center gap-4 md:gap-12 py-8 md:py-10 hover:bg-white/2 transition-colors duration-300 cursor-default'
            >
              <span className='font-heading text-5xl md:text-7xl text-white/10 group-hover:text-[#A4873E]/30 transition-colors duration-300 min-w-20 md:min-w-30 leading-none select-none'>
                {f.number}
              </span>
              <div className='hidden md:block h-12 w-px bg-white/10 group-hover:bg-[#A4873E]/30 transition-colors duration-300 shrink-0' />
              <div className='flex-1'>
                <h3 className='font-heading text-lg md:text-2xl text-white mb-2 group-hover:text-[#A4873E] transition-colors duration-300'>
                  {f.title}
                </h3>
                <p className='font-body text-xs md:text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors max-w-xl'>
                  {f.desc}
                </p>
              </div>
              <span className='hidden md:block font-tech text-xs text-[#A4873E] opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0'>
                →
              </span>
            </div>
          ))}
        </div>

      </div>

      <div className='w-full bg-black text-white px-6 md:px-16 py-20 md:py-32 '>
        <div ref={ctaRef} className='reveal max-w-3xl'>
          <p className='font-tech text-xs tracking-[0.3em] text-[#A4873E] uppercase mb-6'>
            No excuses left
          </p>
          <h2 className='font-heading text-4xl sm:text-5xl md:text-7xl leading-tight mb-6 md:mb-8'>
            Day 1 or day one.
          </h2>
          <p className='font-body text-gray-500 max-w-md text-xs md:text-sm leading-relaxed mb-10 md:mb-12'>
            The problems are ready. The streak counter is at zero.
            All that's missing is you actually showing up.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 md:gap-4'>
            <button 
              onClick={()=>{
                navigate("/daily-problem")
              }}
            className='font-body px-6 md:px-8 py-3 md:py-4 bg-[#A4873E] hover:bg-[#b89750] text-white font-semibold rounded-full text-sm tracking-wide transition-colors'>
              Start Today's Problems →
            </button>
            <button 
              onClick={()=>{
                navigate("/howto")
              }}
            className='font-body px-6 md:px-8 py-3 md:py-4 border border-white/20 hover:border-[#A4873E]/50 text-white rounded-full text-sm tracking-wide transition-colors'>
              See how it works
            </button>
          </div>
        </div>
      </div>

    </>
  )
}

export default Sections