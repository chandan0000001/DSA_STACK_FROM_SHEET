import React, { useEffect, useRef } from 'react'

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    desc: "Sign up in seconds. No unnecessary forms. Just get in and start.",
    tip: "Your streak and progress are tied to your account — don't skip this.",
  },
  {
    number: "02",
    title: "Solve Today's Problems",
    desc: "Every day a fresh set of 4 problems is waiting. Open the daily section and start solving.",
    tip: "Don't cherry-pick. Do all 4. That's the whole point.",
  },
  {
    number: "03",
    title: "Track Your Progress",
    desc: "Mark problems as solved. Your dashboard updates in real time — problems solved, streaks, topics covered.",
    tip: "Be honest. Marking something solved when you didn't hurts only you.",
  },
  {
    number: "04",
    title: "Build Your Streak",
    desc: "Come back the next day. And the day after. The streak counter rewards consistency, not perfection.",
    tip: "Missing one day resets it. That pressure is intentional.",
  },
  {
    number: "05",
    title: "Practice by Topic",
    desc: "Use the DSA sheet to drill specific topics — arrays, recursion, trees, graphs. Focus on your weak areas.",
    tip: "Sort by difficulty. Start easy, build confidence, go harder.",
  },
  {
    number: "06",
    title: "Check the Leaderboard",
    desc: "See who finished today's problems first. Use it as fuel, not discouragement.",
    tip: "Someone is always ahead. That's fine. Keep going.",
  },
]

const rules = [
  "Solve before you look at solutions.",
  "If you're stuck for 30 mins, read a hint — not the answer.",
  "One topic at a time. Don't bounce around.",
  "Daily problems first. Sheet practice second.",
  "Show up even on bad days. Especially on bad days.",
]

function useScrollReveal() {
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
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

const HowTo = () => {
  const headRef   = useRef(null)
  const rulesRef  = useRef(null)
  const ctaRef    = useRef(null)
  const stepRefs  = useRef([])

  useEffect(() => {
    const els = [headRef, rulesRef, ctaRef]
    els.forEach((r) => {
      const el = r.current
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('revealed')
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(el)
    })
  }, [])

  useEffect(() => {
    const observers = []
    stepRefs.current.forEach((el, i) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => el.classList.add('revealed'), i * 80)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
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
          transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }
        .step-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .step-item.revealed {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className='w-full bg-black text-white min-h-screen'>

        {/* ── HERO ── */}
        <div className='px-6 md:px-16 py-24 md:py-36 border-b border-white/10'>
          <div ref={headRef} className='reveal max-w-3xl'>
            <p className='text-xs tracking-[0.3em] text-[#A4873E] uppercase mb-6'>
              How it works
            </p>
            <h1 className='text-4xl sm:text-6xl md:text-7xl font-bold leading-tight mb-8'>
              Use it right <br />
              <span className='text-white/20'>or don't bother.</span>
            </h1>
            <p className='text-gray-400 text-sm md:text-base leading-relaxed max-w-lg'>
              DevProgress works only if you use it consistently. Here's exactly
              how to get the most out of it — no fluff.
            </p>
          </div>
        </div>

        {/* ── STEPS ── */}
        <div className='px-6 md:px-16 py-20 md:py-28 border-b border-white/10'>

          <p className='text-xs tracking-[0.3em] text-[#A4873E] uppercase mb-14'>
            Step by step
          </p>

          <div className='flex flex-col divide-y divide-white/10 border-t border-white/10'>
            {steps.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => (stepRefs.current[i] = el)}
                className='step-item group grid grid-cols-1 md:grid-cols-[120px_1fr_1fr] gap-4 md:gap-12 py-10 hover:bg-white/[0.015] transition-colors duration-300'
              >
                {/* Number */}
                <span className='text-5xl md:text-6xl font-bold text-white/10 group-hover:text-[#A4873E]/25 transition-colors duration-300 leading-none'>
                  {step.number}
                </span>

                {/* Title + Desc */}
                <div className='flex flex-col gap-3'>
                  <h3 className='text-lg md:text-xl font-semibold text-white group-hover:text-[#A4873E] transition-colors duration-300'>
                    {step.title}
                  </h3>
                  <p className='text-sm text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors'>
                    {step.desc}
                  </p>
                </div>

                {/* Tip */}
                <div className='flex items-start gap-3'>
                  <div className='mt-1 w-1 h-1 rounded-full bg-[#A4873E]/50 shrink-0 mt-2' />
                  <p className='text-xs text-white/30 leading-relaxed group-hover:text-white/50 transition-colors duration-300 italic'>
                    {step.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RULES ── */}
        <div className='px-6 md:px-16 py-20 md:py-28 border-b border-white/10'>
          <div ref={rulesRef} className='reveal'>

            <p className='text-xs tracking-[0.3em] text-[#A4873E] uppercase mb-14'>
              The rules
            </p>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden'>
              {rules.map((rule, i) => (
                <div
                  key={i}
                  className={`bg-black px-8 py-7 flex items-start gap-5 group hover:bg-white/[0.02] transition-colors duration-300
                    ${i === rules.length - 1 && rules.length % 2 !== 0 ? 'md:col-span-2' : ''}
                  `}
                >
                  <span className='text-xs text-[#A4873E]/40 font-mono mt-0.5 shrink-0'>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className='text-sm md:text-base text-gray-400 leading-relaxed group-hover:text-gray-200 transition-colors duration-300'>
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className='px-6 md:px-16 py-24 md:py-32'>
          <div ref={ctaRef} className='reveal max-w-2xl'>
            <p className='text-xs tracking-[0.3em] text-[#A4873E] uppercase mb-6'>
              Ready?
            </p>
            <h2 className='text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-8'>
              Stop reading. <br /> Start solving.
            </h2>
            <p className='text-gray-500 text-sm leading-relaxed mb-10 max-w-md'>
              You know how it works now. The only thing left is to actually show up.
            </p>
            <div className='flex flex-col sm:flex-row gap-4'>
              
              <a
                href='/daily-problem'
                className='px-8 py-4 bg-[#A4873E] hover:bg-[#b89750] text-black font-semibold rounded-full text-sm tracking-wide transition-colors text-center'
              >
                Today's Problems →
              </a>
            
              <a
                href='/problems'
                className='px-8 py-4 border border-white/20 hover:border-[#A4873E]/50 text-white rounded-full text-sm tracking-wide transition-colors text-center'
              >
                Browse DSA Sheet
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default HowTo