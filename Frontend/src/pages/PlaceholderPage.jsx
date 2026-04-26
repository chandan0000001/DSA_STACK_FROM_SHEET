const PlaceholderPage = ({ title, description }) => {
  return (
    <div className='min-h-screen bg-black px-5 pt-10 text-white'>
      <div className='mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12'>
        <p className='text-sm uppercase tracking-[0.3em] text-white/40'>Coming Soon</p>
        <h1 className='mt-4 text-3xl font-semibold md:text-5xl'>{title}</h1>
        <p className='mt-4 max-w-2xl text-base text-white/65 md:text-lg'>{description}</p>
      </div>
    </div>
  )
}

export default PlaceholderPage
