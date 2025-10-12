import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShieldAlt, FaCoins, FaGlobe, FaChartBar, FaDatabase, FaUsers } from 'react-icons/fa';
import '../styles/screens/About.css';

const About = () => {
  const navigate = useNavigate();

  const handleStartTesting = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  const handleCreateModel = () => {
    navigate('/create');
    window.scrollTo(0, 0);
  };

  return (
    <div className="about-container">

      {/* Platform Overview */}
      <section className="about-section cta-section">
        <div className="section-content">
          <h2 className="section-title">
            What is <img src="/src/assets/logos/breach_logo_white.png" alt="Breach" className="breach-logo-inline" />?
          </h2>
          <p className="section-description">
            Breach is a platform that connects AI model creators with security testers 
            to identify vulnerabilities through controlled jailbreaking attempts. Our platform creates 
            a sustainable ecosystem where model safety is tested through real-world adversarial scenarios, 
            while providing economic incentives for both creators and testers.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-section">
        <div className="section-content">
          <h2 className="section-title">How It Works</h2>
          <div className="workflow-grid">
            <div className="workflow-step">
              <div className="step-number">1</div>
              <h3 className="step-title">Upload Models</h3>
              <p className="step-description">
                AI model creators upload their models to the platform and set prize amounts for successful jailbreaks.
              </p>
            </div>
            <div className="workflow-step">
              <div className="step-number">2</div>
              <h3 className="step-title">Test & Jailbreak</h3>
              <p className="step-description">
                Security testers attempt to jailbreak models through various prompts, paying a small fee per attempt.
              </p>
            </div>
            <div className="workflow-step">
              <div className="step-number">3</div>
              <h3 className="step-title">Earn Rewards</h3>
              <p className="step-description">
                Successful jailbreakers earn stablecoin prizes, while model creators gain valuable security insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="about-section features-section">
        <div className="section-content">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3 className="feature-title">Security Testing</h3>
              <p className="feature-description">
                Comprehensive AI safety testing through real-world adversarial scenarios and jailbreaking attempts.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaCoins />
              </div>
              <h3 className="feature-title">Economic Incentives</h3>
              <p className="feature-description">
                Sustainable reward system using stablecoins to incentivize both model creators and security testers.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaGlobe />
              </div>
              <h3 className="feature-title">Decentralized Platform</h3>
              <p className="feature-description">
                Built on blockchain technology for transparent, secure, and decentralized AI safety testing.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaChartBar />
              </div>
              <h3 className="feature-title">Analytics & Insights</h3>
              <p className="feature-description">
                Detailed analytics on jailbreak attempts, success rates, and model vulnerabilities for continuous improvement.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaDatabase />
              </div>
              <h3 className="feature-title">User Prompt Data</h3>
              <p className="feature-description">
                Access to real-world prompt datasets and attack patterns from the community to improve your testing strategies.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3 className="feature-title">Community Insights</h3>
              <p className="feature-description">
                Learn from community attack strategies and build a portfolio of successful jailbreaks with peer collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="about-section cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <div className="cta-buttons">
            <button className="cta-button primary" onClick={handleStartTesting}>Start Testing</button>
            <button className="cta-button secondary" onClick={handleCreateModel}>Create Model</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
