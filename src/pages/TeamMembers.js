import React from 'react';
import '../styles/TeamMembers.css';
import SEO from '../components/SEO';

const TeamMembers = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Mr. Dharmendra Prajapati',
      position: 'Managing Director & CEO',
      bio: 'Infopearltech Solutions Pvt.Ltd.',
      // email: 'info@infopearltech.com',
      // phone: '+91 9826000000',
      website: "https://infopearl.in",
      image: require('../assets/dharm.jpg'),
      showSocialLinks: true,
      linkedinUrl: "https://www.linkedin.com/in/dharmendra-prajapati-43b25262/",
      emailAddress: "ceo@infopearl.in"
    },
    {
      id: 2,
      name: 'Dr. Kamal Sharma',
      position: 'Managing Director & CEO',
      bio: 'Lord-Tech Datus Solutions Pvt.Ltd.',
      image: require('../assets/kamal.jpg'),
      website: "https://lordtechdatus.com",
      showSocialLinks: true,
      linkedinUrl: "https://www.linkedin.com/in/dr-kamal-sharma-63802b147/",
      emailAddress: "info@lordtechdatus.com"
    },
    
    {
      id: 3,
      name: 'Ms. Harshita Rajawat',
      position: ' Data Scientist',
      bio: ' Expertise in Data Analysis and Programming.',
      image: require('../assets/t4.jpg'),
      showSocialLinks: false
    },
    {
      id: 4,
      name: 'Mr. Pushpendra Prajapati',
      position: 'Frontend Developer',
      bio: 'Creates beautiful and intuitive user interfaces.',
      image: require('../assets/t4.jpg'),
      showSocialLinks: false
    },
    {
      id: 5,
      name: 'Mr. Prateek Bajpayee', 
      position: 'Full Stack Developer',
      bio: 'Full-stack developer with expertise in React and Node.js.',
      image: require('../assets/t4.jpg'),
      showSocialLinks: false
    },
    {
      id: 6,
      name: 'Mr. Nakul Prajapati',   
      position: 'Civil Engineer',
      bio: ' Expertise in Civil Engineering.',
      image: require('../assets/t4.jpg'),
      showSocialLinks: false
    }
    
  ];

  return (
    <div className="team-members-container">
      <SEO 
        title="Team Member"
        description="Learn about InfoPearl Tech Solutions - our vision, mission, values, and journey in providing academic research support and innovative IT solutions."
        keywords="about InfoPearl, company history, vision, mission, values, team, academic research, IT solutions"
        canonicalUrl="https://infopearl.in/team-member"
      />
      <div className="team-header">
        <h1>Meet Our Team</h1>
        <p>Meet the talented professionals behind InfoPearl Tech's success</p>
      </div>
      
      <div className="team-grid">
        {teamMembers.map(member => (
          <div className="team-card" key={member.id}>
            <div className="member-image">
              <img src={member.image} alt={member.name} />
            </div>
            <div className="member-info">
              <h3>{member.name}</h3>
              <h4>{member.position}</h4>
              <p>{member.bio}</p>
              {member.showSocialLinks && (
                <div className="social-links">
                  {member.linkedinUrl && (
                    <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                  )}
                  {member.website && (
                    <a href={member.website} target="_blank" rel="noopener noreferrer" aria-label="Website"><i className="fas fa-globe"></i></a>
                  )}
                  {member.emailAddress && (
                    <a href={`mailto:${member.emailAddress}`} aria-label="Email"><i className="fas fa-envelope"></i></a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamMembers; 