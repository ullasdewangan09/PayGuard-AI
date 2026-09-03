import React from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { Navigation } from '../components/Navigation';

// Architecture sections
import { Hero } from '../components/sections/Hero';
import { EditorialNarrative } from '../components/sections/EditorialNarrative';
import { SimpleStory } from '../components/sections/SimpleStory';
import { DecisionMatrix } from '../components/sections/DecisionMatrix';
import { RogueAgentBreakdown } from '../components/sections/RogueAgentBreakdown';

import { AttackLabSimulator } from '../components/sections/AttackLabSimulator';
import { SecurityProof } from '../components/sections/SecurityProof';
import { SpatialArchitecture } from '../components/sections/SpatialArchitecture';
import { RazorpayRelationship } from '../components/sections/RazorpayRelationship';
import { PaymentReceipt } from '../components/sections/PaymentReceipt';
import { FinalCTA } from '../components/sections/FinalCTA';

export const LandingPage: React.FC = () => {
  const { activeSection } = useScrollProgress();

  return (
    <div className="relative min-h-screen text-app-textPrimary font-sans bg-transparent">
      {/* Floating Navigation */}
      <Navigation activeSection={activeSection} />

      {/* Narrative — Sticky Stack Disclosure */}
      <main className="relative z-10 w-full flex flex-col">

        {/* ── LEVEL 1: WHAT IS PAYGUARD? ─────────────────────────────── */}
        <Hero />
        <EditorialNarrative />

        {/* ── LEVEL 2: HOW DOES IT PROTECT YOU? ──────────────────────── */}
        <SimpleStory />
        <DecisionMatrix />

        {/* ── LEVEL 4: ADVERSARIAL CASE ──────────────────────────────── */}
        <RogueAgentBreakdown />

        {/* ── LEVEL 6: ATTACK LAB & PROOF ────────────────────────────── */}
        <AttackLabSimulator />
        <SecurityProof />

        {/* ── LEVEL 7: UNDER THE HOOD (for developers & judges) ──────── */}
        <SpatialArchitecture />

        {/* ── LEVEL 8: RAZORPAY RELATIONSHIP & RECEIPT ───────────────── */}
        <RazorpayRelationship />
        <PaymentReceipt />

        {/* Final CTA */}
        <FinalCTA />
      </main>
    </div>
  );
};

export default LandingPage;
