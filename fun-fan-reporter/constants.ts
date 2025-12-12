export const ZONES = [
  { id: 'N', name: 'North Stand' },
  { id: 'S', name: 'South Stand' },
  { id: 'E', name: 'East Stand' },
  { id: 'W', name: 'West Stand' },
  { id: 'VIP', name: 'VIP Boxes' },
  { id: 'G', name: 'Ground / Pitch' },
];

export const MOCK_REPORTS = [
  {
    id: 'r-001',
    timestamp: Date.now() - 1000 * 60 * 5,
    text: "Long lines at Gate A, people getting impatient.",
    location: "North Stand",
    category: "LOGISTICS",
    threatLevel: "LOW",
    status: 'analyzed',
    author: 'Fan_42',
    upvotes: 12,
    tips: 5
  },
  {
    id: 'r-002',
    timestamp: Date.now() - 1000 * 60 * 2,
    text: "Amazing atmosphere in the south stand! Flares popped!",
    location: "South Stand",
    category: "VIBE",
    threatLevel: "MEDIUM",
    status: 'analyzed',
    author: 'Ultra_99',
    upvotes: 45,
    tips: 0
  }
];