import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axiosIstance from '../config/Axios.config.js'

const clampPos = (x, y) => ({
  x: Math.min(Math.max(0, x), window.innerWidth - 100), 
  y: Math.min(Math.max(0, y), window.innerHeight - 60),
})

const Navigation = ({ currentUserName = '', streak = 0 }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const [panelHeight, setPanelHeight] = useState(200)
  const [minimized, setMinimized] = useState(false)
  const [minimizing, setMinimizing] = useState(false)
  const [expanding, setExpanding] = useState(false)

  const [miniPos, setMiniPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const miniRef = useRef(null)
  const panelRef = useRef(null)
  const navContainerRef = useRef(null) // NEW: Ref to detect clicks outside
  const location = useLocation()

  const shouldAutoMinimize = location.pathname === '/login' || location.pathname === '/register'



  useEffect(() => {
    setMiniPos(clampPos(window.innerWidth / 2 - 50, window.innerHeight - 80))
  }, [])

  useEffect(() => {
    const handleResize = () => setMiniPos((prev) => clampPos(prev.x, prev.y))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── NEW: Click Outside Logic ──
  const closeMenu = useCallback(() => {
    setVisible(false)
    setTimeout(() => setMenuOpen(false), 300)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If menu is open and the click is NOT inside the navContainerRef, close it
      if (menuOpen && navContainerRef.current && !navContainerRef.current.contains(event.target)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [menuOpen, closeMenu])

  // ── Dragging Logic ──
  const startDrag = (clientX, clientY) => {
    dragStart.current = {
      mouseX: clientX,
      mouseY: clientY,
      startX: miniPos.x,
      startY: miniPos.y,
    }
    setDragging(true)
  }

  const onMouseDown = (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY) }
  const onTouchStart = (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)

  const onMouseMove = useCallback((e) => {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.mouseX
    const dy = e.clientY - dragStart.current.mouseY
    setMiniPos(clampPos(dragStart.current.startX + dx, dragStart.current.startY + dy))
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!dragStart.current) return
    const dx = e.touches[0].clientX - dragStart.current.mouseX
    const dy = e.touches[0].clientY - dragStart.current.mouseY
    setMiniPos(clampPos(dragStart.current.startX + dx, dragStart.current.startY + dy))
  }, [])

  const endDrag = useCallback(() => { dragStart.current = null; setDragging(false) }, [])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', endDrag)
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', endDrag)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', endDrag)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', endDrag)
    }
  }, [dragging, onMouseMove, onTouchMove, endDrag])

  const menuSections = [
    { title: 'Solve', delay: 0.1, items: [{ label: 'DSA Sheet', to: '/problems' }, { label: 'Contribute', to: '/contribute' }] },
    { title: 'Find Bug?', delay: 0.15, items: [{ label: 'Report bug', to: '/report-bug' }, { label: 'Contact Us', to: '/contact' }] },
    { title: 'Dashboard', delay: 0.2, items: [{ label: 'Profile', to: '/profile' }, { label: 'Rooms', to: '/rooms' }] },
  ]

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: "Today's Problem", to: '/daily-problem' },
    { label: currentUserName || 'Login', to: currentUserName ? '/profile' : '/register' },
  ]

  const handleToggle = () => {
    if (!menuOpen) {
      setMenuOpen(true)
      setTimeout(() => {
        if (panelRef.current) setPanelHeight(panelRef.current.offsetHeight + 24)
        setVisible(true)
      }, 10)
    } else {
      closeMenu()
    }
  }

  const handleMinimize = () => {
    if (minimized) {
      setExpanding(true)
      setMinimized(false)
      setTimeout(() => setExpanding(false), 300)
    } else {
      if (menuOpen) closeMenu()
      setMinimizing(true)
      setTimeout(() => {
        setMinimizing(false)
        setMinimized(true)
        setMiniPos(clampPos(window.innerWidth / 2 - 50, window.innerHeight - 80))
      }, 300)
    }
  }

  useEffect(() => {
    if (menuOpen) closeMenu()
    setMinimized(shouldAutoMinimize)
  }, [shouldAutoMinimize])

  useEffect(() => {
    const id = 'nav-keyframes'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @keyframes nav-shrink-out { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.94); } }
      @keyframes nav-expand-in { 0% { opacity: 0; transform: scale(0.94); } 100% { opacity: 1; transform: scale(1); } }
      @keyframes pill-pop-in { 0% { opacity: 0; transform: scale(0.88); } 100% { opacity: 1; transform: scale(1); } }
      .dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.45); }
      .handle-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.3); }
    `
    document.head.appendChild(style)
  }, [])

  if (minimized) {
    return (
      <div
        ref={miniRef}
        className='fixed z-50 flex items-center gap-3'
        style={{ left: miniPos.x, top: miniPos.y, userSelect: 'none', animation: 'pill-pop-in 0.3s cubic-bezier(0.4,0,0.2,1) both' }}
      >
        <div className="grid grid-cols-2 gap-1 p-2 cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-lg transition-colors"
          onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
          <div className="handle-dot" /><div className="handle-dot" />
          <div className="handle-dot" /><div className="handle-dot" />
          <div className="handle-dot" /><div className="handle-dot" />
        </div>
        <div className='w-[60px] h-[44px] flex items-center justify-center bg-[#0B0B0B] rounded-xl border border-[#171717] backdrop-blur-md cursor-pointer hover:border-[#333] transition-colors'
          onClick={handleMinimize}>
          <div className='flex gap-[4px]'><span className='dot' /><span className='dot' /><span className='dot' /></div>
        </div>
      </div>
    )
  }

  const animStyle = minimizing ? { animation: 'nav-shrink-out 0.3s cubic-bezier(0.4,0,0.2,1) forwards' }
    : expanding ? { animation: 'nav-expand-in 0.3s cubic-bezier(0.4,0,0.2,1) both' } : {}

  return (
    <div
      ref={navContainerRef} // Attached ref here
      className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center'
      style={{ width: 'calc(100vw - 24px)', maxWidth: '700px', ...animStyle }}
    >
      <div className='relative w-full'
        style={{
          padding: menuOpen ? '10px' : '0px',
          background: menuOpen ? '#1c1c1c' : 'transparent',
          border: menuOpen ? '1px solid #2a2a2a' : '1px solid transparent',
          borderRadius: '16px',
          transition: 'all 0.3s ease',
          paddingBottom: menuOpen ? `${panelHeight}px` : '0px',
        }}>
        
        {/* Menu Panel */}
        <div className='absolute left-2 right-2 rounded-xl overflow-hidden'
          style={{
            bottom: '10px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.97)',
            pointerEvents: menuOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s, transform 0.3s',
          }}>
          <div ref={panelRef} className='bg-[#111111] rounded-xl border border-[#2a2a2a] p-4 md:p-8'>
            <div className='grid grid-cols-3 gap-4 md:gap-8'>
              {menuSections.map((section) => (
                <div key={section.title}>
                  <p className='text-white/40 text-[11px] md:text-[15px] mb-3'>{section.title}</p>
                  <ul className='space-y-3'>
                    {section.items.map((item, i) => (
                      <li key={item.label}>
                        <Link to={item.to} onClick={closeMenu} className={`text-[12px] md:text-[16px] flex items-center gap-1 transition-colors ${location.pathname === item.to ? 'text-[#A4873E]' : 'text-white hover:text-[#A4873E]'}`}>
                          {item.label} <span className='text-white/40 text-[10px]'>→</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nav Bar */}
        <div className='w-full flex items-center bg-[#0B0B0B] px-3 md:px-5 rounded-xl border border-[#171717] backdrop-blur-md overflow-hidden'>
          <div className='w-full h-[56px] md:h-[75px] flex items-center gap-3 sm:gap-6 md:gap-10'>
            <div className='flex gap-1.5 items-center bg-[#000000] rounded-xl py-2 px-3 cursor-pointer select-none active:scale-95 transition-transform shrink-0'
              onClick={handleToggle}>
              {!menuOpen && <img src='menu.svg' alt='Menu icon' className='w-3.5 h-3.5 md:w-5 md:h-5' />}
              <p className='text-[16px] md:text-[18px] text-white/50'>{menuOpen ? '✕' : 'Menu'}</p>
            </div>
            
            <div className='flex-1' style={{ opacity: menuOpen ? 0 : 1, transition: 'opacity 0.25s' }}>
              <ul className='flex items-center gap-4 sm:gap-6 md:gap-10'>
                {navLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} 
                      onClick={closeMenu} // Added closeMenu here so clicking Home/Login closes the menu
                      className={`text-[16px] md:text-[18px] whitespace-nowrap transition-colors ${location.pathname === item.to ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
                      {item.label === "Today's Problem" ? <><span className='sm:hidden'>Daily</span><span className='hidden sm:inline'>Today's Problem</span></> : item.label}
                    </Link>
                  </li>
                ))}
                <li className='flex items-center gap-1.5 shrink-0 ml-auto'>
                  <img src='fire.svg' alt='streak' className='w-4 h-4 md:w-5 md:h-5' />
                  <span className='text-[16px] md:text-[16px] text-white font-heading'>{streak}</span>
                </li>
              </ul>
            </div>
            
            <div onClick={handleMinimize} className='shrink-0 w-6 h-6 flex items-center justify-center rounded-lg cursor-pointer hover:bg-white/10 transition-colors'>
              <svg width='12' height='12' viewBox='0 0 14 14' fill='none'><path d='M2 7h10' stroke='rgba(255,255,255,0.4)' strokeWidth='1.5' strokeLinecap='round' /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation
