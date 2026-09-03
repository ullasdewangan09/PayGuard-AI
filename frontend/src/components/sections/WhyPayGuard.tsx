import React from 'react';

const AI_CAN = [
  { emoji: '🛒', label: 'Buy products', sub: 'at any price, from any vendor' },
  { emoji: '📅', label: 'Book services', sub: 'for any duration, any location' },
  { emoji: '💳', label: 'Make payments', sub: 'one-time, recurring, or ongoing' },
];

const WITHOUT_LIMITS = [
  { icon: '💸', text: 'Spend far more than you intended' },
  { icon: '🔄', text: "Start subscriptions you didn't ask for" },
  { icon: '🏪', text: "Buy from vendors you didn't choose" },
  { icon: '🪄', text: 'Add extra items to your order' },
  { icon: '📆', text: 'Schedule future charges on your card' },
];

export const WhyPayGuard: React.FC = () => {
  return (
    <section
      id="why-payguard"
      className="relative py-24 md:py-32 px-4 md:px-8 overflow-hidden bg-gray-50 border-t border-gray-200"
    >
      {/* Section divider gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.05) 50%, transparent)' }}
      />

      <div className="max-w-5xl mx-auto">

        {/* Label */}
        <div className="flex items-center gap-3 mb-8">
          <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-blue-600">
            03 // WHY THIS EXISTS
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Headline */}
        <div className="mb-14">
          <h2
            className="font-editorial font-extrabold uppercase leading-[0.95] tracking-tighter text-gray-900"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)' }}
          >
            AI IS POWERFUL.
            <br />
            <span className="text-gray-400">THAT'S EXACTLY WHY</span>
            <br />
            IT NEEDS LIMITS.
          </h2>
        </div>

        {/* Two-column split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left: What AI CAN do */}
          <div className="rounded-2xl p-8 flex flex-col gap-5 bg-white border border-gray-200 shadow-sm">
            <div>
              <div className="font-mono text-[10px] font-bold tracking-wider mb-1 text-blue-600">
                AI CAN
              </div>
              <p className="font-sans text-xs text-gray-500">
                Modern AI agents have genuine access to your payment methods
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {AI_CAN.map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <div className="font-sans text-sm font-semibold text-gray-900">{item.label}</div>
                    <div className="font-sans text-xs mt-0.5 text-gray-500">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Without limits → danger */}
          <div className="rounded-2xl p-8 flex flex-col gap-5 bg-white border border-rose-200 shadow-sm">
            <div>
              <div className="font-mono text-[10px] font-bold tracking-wider mb-1 text-rose-600">
                WITHOUT LIMITS, AI COULD
              </div>
              <p className="font-sans text-xs text-gray-500">
                Not from malicious intent — just from misunderstanding your actual needs
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {WITHOUT_LIMITS.map((item, i) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <span className="font-sans text-sm text-rose-700 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The bridge sentence */}
        <div className="mt-8 p-6 rounded-2xl text-center bg-blue-50 border border-blue-100 shadow-sm">
          <p
            className="font-editorial text-xl md:text-2xl font-bold uppercase tracking-tight text-gray-900"
            style={{ lineHeight: 1.3 }}
          >
            PayGuard sits between the AI and your money.
            <br />
            <span className="text-blue-700">It enforces your rules — automatically, deterministically.</span>
          </p>
          <p className="font-sans text-sm mt-3 text-blue-400">
            Technical label: Deterministic Authorization Runtime · POLICY_ENGINE · CAPTURE_GATE
          </p>
        </div>
      </div>
    </section>
  );
};
