import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './Ambassador.css';

const Ambassador: React.FC = () => {
  return (
    <div className="ambassador-container">
      <div className="ambassador-app">
        <Header toggleSidebar={() => {}} isPage={true} />
        <main className="ambassador-main-content">
          <section className="ambassador-content-section">
            <h1>Join the next ArcAO Ambassador Cohort! 🛡️</h1>
            <p>
              Thank you for your interest in becoming an ArcAO Ambassador! As an Ambassador, 
              you'll help shape the future of decentralized gaming by spreading the word, 
              engaging with the community, and showcasing ArcAO's vision across your networks—whether 
              it's RuneRealm, Satoshi's Palace, RandAO, or ArcAO itself. 🚀
            </p>
            
            <div className="ambassador-perks-section">
              <h2>Perks include:</h2>
              <ul>
                <li>Exclusive rewards such as tokens, NFTs, and early access to updates.</li>
                <li>VIP invitations to events and sneak peeks at new features.</li>
                <li>Networking opportunities with developers, creators, and innovators in Web3 gaming.</li>
              </ul>
              <p style={{ marginTop: '2rem', fontStyle: 'italic' }}>
                Let's build something extraordinary—together!
              </p>
            </div>

            <div className="ambassador-form-container">
              <iframe
                src="https://link.we-grow.agency/widget/form/SmLWpzCMD4bpqtXapq2d"
                style={{width:'100%', minHeight:'1200px', border:'none', borderRadius:'3px'}}
                id="inline-SmLWpzCMD4bpqtXapq2d" 
                data-layout={`{'id':'INLINE'}`}
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="ArcAO Ambassador Application"
                data-height="1015"
                data-layout-iframe-id="inline-SmLWpzCMD4bpqtXapq2d"
                data-form-id="SmLWpzCMD4bpqtXapq2d"
                title="ArcAO Ambassador Application"
              />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Ambassador;
