import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className='w-full bg-black pt-3 text-white px-6 md:px-16 pb-12 overflow-hidden'>

      <div className='w-full overflow-hidden'>
        <h2
          className='font-heading leading-none select-none'
          style={{
            fontSize: 'clamp(3rem, 10vw, 10rem)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255, 255, 255, 0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          DevProgress
        </h2>
      </div>

      <div className='flex flex-col md:flex-row justify-between gap-12 md:gap-8 mt-4 -white/10 pt-10'>

        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-1'>
            <span className='font-heading text-lg text-white'>DevProgress</span>
            <span className='font-body text-xs text-white/30'>Your Daily DSA Engine</span>
          </div>

          <div className='flex items-center gap-4'>
            <a
              href='https://www.linkedin.com/in/chandan-kumar-dalai/'
              target='_blank'
              rel='noreferrer'
              aria-label='Visit chandan on LinkedIn'
              className='text-white/40 hover:text-[#A4873E] transition-colors duration-200'
            >
              <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19ZM8.34 10.34H5.67V18H8.34V10.34ZM7 6.56A1.56 1.56 0 1 0 7 9.68A1.56 1.56 0 1 0 7 6.56ZM18.33 13.32C18.33 10.99 16.89 9.94 15.28 9.94C13.98 9.94 13.4 10.66 13.08 11.17V10.34H10.42V18H13.08V13.86C13.08 12.77 13.29 11.72 14.64 11.72C15.97 11.72 15.99 12.96 15.99 13.93V18H18.66L18.33 13.32Z'/>
              </svg>
            </a>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16'>

          <div>
            <p className='font-tech text-[10px] tracking-[0.2em] text-white/30 uppercase mb-4'>
              Solve
            </p>
            <ul className='flex flex-col gap-3'>
              {[
                { label: 'DSA Sheet', to: '/problems' },
                { label: "Today's Problem", to: '/daily-problem' },
                { label: 'Contribute', to: '/contribute' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className='font-body text-sm text-white/50 hover:text-[#A4873E] transition-colors duration-200'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className='font-tech text-[10px] tracking-[0.2em] text-white/30 uppercase mb-4'>
              Company
            </p>
            <ul className='flex flex-col gap-3'>
              {[
                { label: 'About', to: '/about' },
                { label: 'Report Bug', to: '/report-bug' },
                { label: 'Contact', to: '/contact' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className='font-body text-sm text-white/50 hover:text-[#A4873E] transition-colors duration-200'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className='col-span-2 md:col-span-1'>
            <p className='font-tech text-[10px] tracking-[0.2em] text-white/30 uppercase mb-4'>
              Account
            </p>
            <ul className='flex flex-col gap-3'>
              {[
                { label: 'Profile', to: '/profile' },
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Login', to: '/login' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className='font-body text-sm text-white/50 hover:text-[#A4873E] transition-colors duration-200'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <div className='mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2'>
        <p className='font-body text-xs text-white/20'>
          © {new Date().getFullYear()} DevProgress. All rights reserved. chandan
        </p>
        <p className='font-body text-xs text-white/20'>
          Built for consistency. Not excuses.
        </p>
      </div>

    </footer>
  )
}

export default Footer
