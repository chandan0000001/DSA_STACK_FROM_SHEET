import { useEffect, useRef, useState } from 'react'
import {useNavigate} from 'react-router-dom'

const hints = [
  "You know you can minimize the navbar, try it!",
  "Have you solved today's problem? It's only 4, go do it bro!",
  "Login to have a track of your journey",
]

const HeroSection = () => {
  const hintRef     = useRef(null)
  const [index, setIndex] = useState(0)

  const labelRef    = useRef(null)
  const headingRef  = useRef(null)
  const subtitleRef = useRef(null)
  const tagsRef     = useRef(null)
  const scrollRef   = useRef(null)

  const navigate = useNavigate()

  

  // Hint typing
  useEffect(() => {
    const el = hintRef.current
    if (!el) return
    const play = () => {
      el.classList.remove('running')
      void el.offsetWidth
      el.classList.add('running')
    }
    play()
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % hints.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const el = hintRef.current
    if (!el) return
    el.classList.remove('running')
    void el.offsetWidth
    el.classList.add('running')
  }, [index])

  // Entrance animations
  useEffect(() => {
    const items = [
      { el: labelRef.current,    delay: 0   },
      { el: headingRef.current,  delay: 150 },
      { el: subtitleRef.current, delay: 300 },
      { el: tagsRef.current,     delay: 420 },
      { el: scrollRef.current,   delay: 550 },
    ]
    items.forEach(({ el, delay }) => {
      if (!el) return
      setTimeout(() => el.classList.add('revealed'), delay)
    })
  }, [])

  return (
    <>
      <style>{`
        @keyframes typing {
          0%   { width: 0;    opacity: 1; }
          40%  { width: 100%; opacity: 1; }
          70%  { width: 100%; opacity: 1; }
          90%  { width: 0;    opacity: 1; }
          100% { width: 0;    opacity: 0; }
        }
        .animate-typing {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 1px solid rgba(255,255,255,0.2);
          width: 0;
          opacity: 0;
        }
        .animate-typing.running {
          animation: typing 4s ease-in-out forwards;
        }

        @keyframes scroll-line {
          0%   { top: -100%; }
          100% { top: 100%;  }
        }
        .animate-scroll-line {
          animation: scroll-line 1.5s ease-in-out infinite;
        }

        .hero-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.75s ease, transform 0.75s ease;
        }
        .hero-fade.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-fade-x {
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.75s ease, transform 0.75s ease;
        }
        .hero-fade-x.revealed {
          opacity: 1;
          transform: translateX(0);
        }

        .hero-fade-only {
          opacity: 0;
          transition: opacity 1s ease;
        }
        .hero-fade-only.revealed {
          opacity: 1;
        }
      `}</style>

      <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center px-6 md:px-16">
        <section>

          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10 blur-3xl" />

          {/* Hint Text */}
          <div className='absolute top-10 left-4 sm:left-32 md:left-150'>
            <span ref={hintRef} className="animate-typing text-white/20 text-xs sm:text-sm">
              {hints[index]}
            </span>
          </div>

          {/* Left Side Content */}
          <div className="z-10 max-w-full">

            <p ref={labelRef} className="hero-fade text-xs tracking-[0.3em] text-gray-400 uppercase mb-6">
              DSA Progress Tracker
            </p>

            <h1 ref={headingRef} className="hero-fade text-[3rem] sm:text-[5rem] md:text-[8rem] font-extrabold leading-none tracking-tight">
              Your Daily Progress Engine <br /> DevProgress
            </h1>

            <p ref={subtitleRef} className="hero-fade mt-8 text-gray-400 max-w-md text-sm leading-relaxed">
              Turn your learning into a structured system. Track problems, build consistency, and grow faster.
            </p>

          </div>

          {/* Right Side Tags */}
          <div
            ref={tagsRef}
            className="hero-fade-x absolute right-4 md:right-10 bottom-10 sm:bottom-20 flex flex-col gap-3 text-xs"
          >
            <div 
            onClick={()=>{
              navigate('/rooms')
            }}
            className="px-4 py-2 cursor-pointer rounded-full border border-green-500 text-green-400 w-fit">
              ● Your Rooms
            </div>
            <div className="px-4 py-2 rounded-full border border-gray-700 text-gray-300 w-fit">
              DSA Mastery Hub
            </div>
            <div className="px-4 py-2 rounded-full border border-gray-700 text-gray-300 w-fit">
              Progress Tracker
            </div>
          </div>

          {/* Scroll Indicator */}
          <div
            ref={scrollRef}
            className="hero-fade-only absolute right-6 top-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center gap-3"
          >
            <div className="h-24 w-[1px] bg-gray-700 relative overflow-hidden">
              <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-orange-500 to-transparent absolute left-0 animate-scroll-line" />
            </div>
            <p className="text-[10px] tracking-widest text-gray-500 [writing-mode:vertical-rl]">
              SCROLL
            </p>
          </div>

        </section>
      </div>
    </>
  )
}

export default HeroSection