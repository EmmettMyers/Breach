import React from 'react';
import '../styles/screens/About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <div className="about-header">
          <h1 className="about-title">About Breach</h1>
          <p className="about-subtitle">Decentralized AI Model Marketplace</p>
        </div>

        <div className="about-section">
          <h2 className="section-title">What is Breach?</h2>
          <p className="section-text">
            Breach is a revolutionary decentralized marketplace that connects AI model creators with users, 
            enabling direct peer-to-peer transactions without intermediaries. Built on blockchain technology, 
            Breach ensures transparency, security, and fair compensation for all participants.
          </p>
        </div>

        <div className="about-section">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">Decentralized</h3>
              <p className="feature-description">
                No central authority controls the marketplace. All transactions are peer-to-peer and transparent.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Secure</h3>
              <p className="feature-description">
                Built on blockchain technology with smart contracts ensuring secure and reliable transactions.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Fair Compensation</h3>
              <p className="feature-description">
                Model creators receive direct payment for their work without platform fees or intermediaries.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Global Access</h3>
              <p className="feature-description">
                Access AI models from anywhere in the world with just a crypto wallet connection.
              </p>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Connect Your Wallet</h3>
                <p className="step-description">
                  Connect your crypto wallet to access the marketplace and manage your transactions.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Explore Models</h3>
                <p className="step-description">
                  Browse through a diverse collection of AI models created by developers worldwide.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Create or Use</h3>
                <p className="step-description">
                  Either create and list your own AI models or use existing ones for your projects.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3 className="step-title">Transact Securely</h3>
                <p className="step-description">
                  All transactions are handled through smart contracts, ensuring security and transparency.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2 className="section-title">Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-item">
              <span className="tech-label">Blockchain:</span>
              <span className="tech-value">Base Network</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Smart Contracts:</span>
              <span className="tech-value">Solidity</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Frontend:</span>
              <span className="tech-value">React + Vite</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Wallet Integration:</span>
              <span className="tech-value">SBC AppKit</span>
            </div>
          </div>
        </div>

        <div className="about-section">
          <h2 className="section-title">Get Started</h2>
          <p className="section-text">
            Ready to join the decentralized AI revolution? Connect your wallet and start exploring 
            the marketplace today. Whether you're a model creator or a user looking for AI solutions, 
            Breach provides the tools and infrastructure you need.
          </p>
          <div className="cta-buttons">
            <a href="/" className="cta-button primary">Explore Models</a>
            <a href="/create" className="cta-button secondary">Create Model</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
