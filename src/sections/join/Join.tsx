import React from 'react';
import DocCard from './components/DocCard';
import './Join.css';
import { ARCAO_LINKS } from '../../links';
import { ARCAO } from '@arcaogaming/project-links';

const Join: React.FC = () => {
  return (
    <section id="join" className="join-section">
      <h2 className="join-section__title">Join ArcAO</h2>
        <p className="join-section__description">
          ArcAO has something for <strong>everyone</strong>! From building the next 
          <strong> revolutionary game</strong> to creating <strong>engaging content</strong>,
          from experiencing <strong>provably fair gaming</strong> to shaping the 
          <strong> future of blockchain gaming</strong> - discover your path in our ecosystem
          with our comprehensive guides and documentation.
        </p>
        <div className="join-section__form">
          <iframe
            src="https://link.we-grow.agency/widget/form/j00fw9ps7kLBCR47Mjas"
            style={{width:'100%', height:'100%', border:'none', borderRadius:'3px'}}
            id="inline-j00fw9ps7kLBCR47Mjas" 
            data-layout={`{'id':'INLINE'}`}
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="ArcAO Email Signup"
            data-height="402"
            data-layout-iframe-id="inline-j00fw9ps7kLBCR47Mjas"
            data-form-id="j00fw9ps7kLBCR47Mjas"
            title="ArcAO Email Signup"
          />
      </div>
      <div className="join-section__grid">
        <DocCard
          title="🎮 Game Developers"
          description={<>Build <strong>revolutionary games</strong> with our comprehensive technical guides and tools. Start creating the <strong>next generation</strong> of blockchain gaming experiences.</>}
          buttonText="Developer Docs"
          buttonUrl={ARCAO.acceleratorProgramSignup}
        />
        <DocCard
          title="🎨 Content Creators"
          description={<>Create <strong>engaging content</strong> and build your community. Access exclusive tools and resources to <strong>amplify your impact</strong> in the ArcAO ecosystem.</>}
          buttonText="Creator Guides"
          buttonUrl={ARCAO.ambassadorProgramSignup}
        />
        <DocCard
          title="🏆 Gamers"
          description={<>Experience <strong>provably fair gaming</strong> and earn while you play. Join a community of players shaping the <strong>future of gaming</strong>.</>}
          buttonText="Player Guides"
          buttonUrl={ARCAO.docs}
        />
        <DocCard
          title="💰 Investors"
          description={<>Discover <strong>investment opportunities</strong> and participate in governance. Shape the future of gaming with <strong>strategic investments</strong> in the ArcAO ecosystem.</>}
          buttonText="Investor Info"
          buttonUrl={ARCAO.delegationGuide}
        />
      </div>
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = 'ambassador';
            window.scrollTo(0, 0);
          }} 
          className="join-section__ambassador-button"
        >
        ✨ Become an ArcAO Ambassador ✨
      </a>
    </section>
  );
};

export default Join;
