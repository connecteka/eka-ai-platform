import React from 'react';

const teamMembers = [
  {
    name: 'Vivek Singh',
    title: 'CEO & Founder',
    avatar: 'https://ui-avatars.com/api/?name=Vivek+Singh&background=f97316&color=fff&size=150',
    bio: 'Vivek has over 15 years of experience in automotive technology and is passionate about revolutionizing workshop management.',
  },
  {
    name: 'Ananya Gupta',
    title: 'CTO',
    avatar: 'https://ui-avatars.com/api/?name=Ananya+Gupta&background=0ea5e9&color=fff&size=150',
    bio: 'Ananya is a technology enthusiast with expertise in AI and building scalable systems for the automotive industry.',
  },
  {
    name: 'Rahul Mehta',
    title: 'Lead Product Designer',
    avatar: 'https://ui-avatars.com/api/?name=Rahul+Mehta&background=10b981&color=fff&size=150',
    bio: 'Rahul has a keen eye for design and ensures our platform is intuitive and delightful to use.',
  },
  {
    name: 'Sneha Reddy',
    title: 'Head of Customer Success',
    avatar: 'https://ui-avatars.com/api/?name=Sneha+Reddy&background=8b5cf6&color=fff&size=150',
    bio: 'Sneha is dedicated to helping our customers succeed and get the most out of EKA-AI.',
  },
];

const AboutPage: React.FC = () => {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold font-heading leading-tight">
            Our Mission
          </h1>
          <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
            To empower automotive workshops with AI-powered tools that streamline operations, 
            increase efficiency, and drive growth in the digital age.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">
            Our Story
          </h2>
          <div className="max-w-4xl mx-auto text-text-secondary text-lg space-y-6">
            <p>
              Founded in 2024, EKA-AI was born from a simple observation: automotive workshops 
              in India needed better tools to manage their growing businesses. We saw talented 
              mechanics and workshop owners struggling with paperwork, missed appointments, and 
              inefficient processes.
            </p>
            <p>
              Our journey started with a small team of automotive enthusiasts and tech experts, 
              and has since grown into a platform serving workshops across the country. We are 
              proud of what we have achieved and are excited to continue innovating for the 
              automotive service industry.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold font-heading text-center mb-12">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-background-alt p-8 rounded-lg shadow-md text-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-bold font-heading mb-1">{member.name}</h3>
                <p className="text-text-secondary mb-4">{member.title}</p>
                <p className="text-text-secondary text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
