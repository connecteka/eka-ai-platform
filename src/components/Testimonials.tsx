import React from 'react';

const testimonials = [
  {
    quote:
      'EKA-AI has completely transformed how we manage job cards. The AI diagnostics save us hours every day.',
    author: 'Rajesh Kumar',
    title: 'Owner, Kumar Motors, Delhi',
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=F98906&color=fff&size=150',
  },
  {
    quote:
      'GST invoice generation is seamless. The platform pays for itself just by reducing billing errors.',
    author: 'Priya Sharma',
    title: 'Manager, Sharma Auto Care, Mumbai',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=F98906&color=fff&size=150',
  },
  {
    quote:
      'Customer approval workflow is a game-changer. Our customers love the transparency and professionalism.',
    author: 'Amit Patel',
    title: 'Workshop Owner, Ahmedabad',
    avatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=F98906&color=fff&size=150',
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            Trusted by Workshops Across India
          </h2>
          <p className="mt-2 text-lg" style={{ color: 'var(--text-secondary)' }}>
            Real stories from real workshop owners who transformed their business with EKA-AI.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="p-8 rounded-xl border"
              style={{ 
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-light)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="mb-6">
                <svg className="w-8 h-8 opacity-25" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--eka-orange)' }}>
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="mb-6 text-pretty" style={{ color: 'var(--text-secondary)' }}>
                {testimonial.quote}
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {testimonial.author}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
