export interface PolicyMetric {
  policy: string;
  cases: number;
  passed: number;
  failed: number;
}

export const EVAL_SUITE_METRICS = {
  status: 'COMPLETE',
  totalScenarios: 106,
  passRate: '100.00%',
  passed: 106,
  failed: 0,
  decisionDistribution: {
    approve: 66,
    ask: 11,
    block: 29
  },
  securityIntegrity: {
    falseApprovals: 0,
    falseBlocks: 0,
    askMisclassifications: 0,
    criticalBypasses: 0,
    unauthorizedCaptures: 0
  },
  determinism: {
    casesRepeated: 1,
    totalExecutions: 100,
    decisionInconsistencies: 0
  },
  policyCoverage: [
    { policy: 'MAX_AMOUNT', cases: 5, passed: 5, failed: 0 },
    { policy: 'CURRENCY_MATCH', cases: 4, passed: 4, failed: 0 },
    { policy: 'BANNED_CATEGORY', cases: 6, passed: 6, failed: 0 },
    { policy: 'RECURRING_PAYMENT', cases: 4, passed: 4, failed: 0 },
    { policy: 'MAX_QUANTITY', cases: 4, passed: 4, failed: 0 },
    { policy: 'MERCHANT_BLOCKED', cases: 5, passed: 5, failed: 0 },
    { policy: 'COMBINATORIAL', cases: 76, passed: 76, failed: 0 },
    { policy: 'AI_INTENT', cases: 2, passed: 2, failed: 0 }
  ] as PolicyMetric[]
};
