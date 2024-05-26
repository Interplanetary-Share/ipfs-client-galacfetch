import React from 'react'

type SectionProps = {
  title: string
  description: string
  views: React.ReactNode[]
}

const Section: React.FC<SectionProps> = ({ title, description, views }) => {
  const normalizedTitle = title.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg mb-10">
      <h2
        id={normalizedTitle}
        className="text-3xl font-bold text-blue-600 mb-4"
      >
        {title} <a href={`#${normalizedTitle}`}>#</a>
      </h2>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
        {views.map((view, index) => (
          <div key={index} className="bg-gray-100 p-6 rounded-lg shadow-md">
            {view}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Section
