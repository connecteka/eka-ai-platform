import React from 'react';

const testimonials = [
  {
    quote:
      'This platform has transformed our business. We are more efficient and profitable than ever before.',
    author: 'Rajesh Kumar',
    title: 'Owner, Kumar Motors',
    avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=f97316&color=fff&size=150',
  },
  {
    quote:
      'The best tool we have ever used. It is intuitive, powerful, and has all the features we need.',
    author: 'Priya Sharma',
    title: 'Manager, Sharma Auto Care',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=0ea5e9&color=fff&size=150',
  },
  {
    quote:
      'I was skeptical at first, but this platform has exceeded all my expectations. Highly recommended!',
    author: 'Amit Patel',
    title: 'Workshop Owner',
    avatar: 'https://ui-avatars.com/api/?name=Amit+Patel&background=10b981&color=fff&size=150',
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="bg-background-alt py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading">
            What our customers are saying
          </h2>
          <p className="mt-2 text-lg text-text-secondary">
            Real stories from real workshop owners.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background p-8 rounded-lg shadow-md">
              <p className="text-text-secondary mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold text-text-primary">{testimonial.author}</p>
                  <p className="text-sm text-text-secondary">{testimonial.title}</p>
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
