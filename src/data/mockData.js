// Sample AI model data - specialized use-case models
export const aiModels = [
  {
    id: 1,
    title: "AutoService Pro",
    description: "Automotive customer service AI trained on GPT-4 for handling vehicle inquiries, warranty claims, and technical support.",
    creator: "Emmett Myers",
    aiModel: "GPT-4",
    promptCost: 0.01,
    prize: 150,
    attempts: 15,
    jailbroken: false
  },
  {
    id: 2,
    title: "MedAssist AI",
    description: "Healthcare assistant model built on Claude 3 for patient triage, symptom analysis, and medical documentation.",
    creator: "HealthTech Innovations",
    aiModel: "Claude 3",
    promptCost: 0.025,
    prize: 80,
    attempts: 8,
    jailbroken: true
  },
  {
    id: 3,
    title: "EduTutor Pro",
    description: "Educational AI model based on Gemini 2.5 for personalized learning, homework help, and curriculum planning.",
    creator: "EduTech Systems",
    aiModel: "Gemini 2.5",
    promptCost: 0.02,
    prize: 120,
    attempts: 12,
    jailbroken: false
  },
  {
    id: 4,
    title: "FinanceBot Advisor",
    description: "Financial advisory AI built on GPT-4 for investment recommendations, risk assessment, and portfolio management.",
    creator: "FinTech Dynamics",
    aiModel: "GPT-4",
    promptCost: 0.015,
    prize: 60,
    attempts: 6
  },
  {
    id: 5,
    title: "LegalEase Assistant",
    description: "Legal research AI powered by Claude 3 for case analysis, document review, and contract drafting.",
    creator: "LawTech Partners",
    aiModel: "Claude 3",
    promptCost: 0.035,
    prize: 90,
    attempts: 9
  },
  {
    id: 6,
    title: "RetailBot Manager",
    description: "E-commerce AI model based on Gemini 2.5 for inventory management, customer service, and sales optimization.",
    creator: "RetailTech Solutions",
    aiModel: "Gemini 2.5",
    promptCost: 0.018,
    prize: 40,
    attempts: 4
  },
  {
    id: 7,
    title: "CodeReview Assistant",
    description: "Software development AI built on GPT-4 for code review, bug detection, and security vulnerability analysis.",
    creator: "DevTools Inc",
    aiModel: "GPT-4",
    promptCost: 0.03,
    prize: 220,
    attempts: 22,
    jailbroken: true
  },
  {
    id: 8,
    title: "TravelPlanner Pro",
    description: "Travel planning AI powered by Claude 3 for itinerary optimization, booking assistance, and travel recommendations.",
    creator: "WanderLust Tech",
    aiModel: "Claude 3",
    promptCost: 0.025,
    prize: 110,
    attempts: 11
  },
  {
    id: 9,
    title: "ContentModerator AI",
    description: "Social media moderation AI based on Gemini 2.5 for content filtering, hate speech detection, and community guidelines enforcement.",
    creator: "SocialSafe Systems",
    aiModel: "Gemini 2.5",
    promptCost: 0.02,
    prize: 180,
    attempts: 18
  },
  {
    id: 10,
    title: "SupplyChain Optimizer",
    description: "Logistics AI model built on GPT-4 for route optimization, demand forecasting, and inventory management.",
    creator: "LogiTech Solutions",
    aiModel: "GPT-4",
    promptCost: 0.015,
    prize: 70,
    attempts: 7
  },
  {
    id: 11,
    title: "PersonalTrainer AI",
    description: "Fitness coaching AI powered by Claude 3 for workout planning, nutrition advice, and health tracking.",
    creator: "FitTech Innovations",
    aiModel: "Claude 3",
    promptCost: 0.035,
    prize: 130,
    attempts: 13
  },
  {
    id: 12,
    title: "AgriGrow Assistant",
    description: "Agricultural AI model built on GPT-4 for crop monitoring, pest detection, and yield optimization recommendations.",
    creator: "AgriTech Solutions",
    aiModel: "GPT-4",
    promptCost: 0.03,
    prize: 200,
    attempts: 20
  },
  {
    id: 13,
    title: "RealEstate Analyzer",
    description: "Property investment AI powered by Claude 3 for market analysis, property valuation, and investment opportunity assessment.",
    creator: "PropTech Dynamics",
    aiModel: "Claude 3",
    promptCost: 0.025,
    prize: 160,
    attempts: 16
  },
  {
    id: 14,
    title: "CyberGuard Security",
    description: "Cybersecurity AI model based on Gemini 2.5 for threat detection, vulnerability assessment, and security incident response.",
    creator: "SecureTech Systems",
    aiModel: "Gemini 2.5",
    promptCost: 0.02,
    prize: 250,
    attempts: 25
  },
  {
    id: 15,
    title: "CodeMaster Pro",
    description: "Advanced coding assistant built on GPT-4 for complex algorithm development, code optimization, and debugging assistance.",
    creator: "Emmett Myers",
    aiModel: "GPT-4",
    promptCost: 0.05,
    prize: 300,
    attempts: 30
  },
  {
    id: 16,
    title: "DataInsight Analyzer",
    description: "Data science AI powered by Claude 3 for statistical analysis, machine learning model development, and data visualization.",
    creator: "Emmett Myers",
    aiModel: "Claude 3",
    promptCost: 0.04,
    prize: 200,
    attempts: 20
  }
];

// Statistics data for the statistics page
export const statisticsData = {
  timeRanges: [
    { label: 'Last 24 Hours', value: '24h' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'All Time', value: 'all' }
  ],
  
  // Mock statistics data for different time ranges
  stats: {
    '24h': {
      totalPrompts: 8,
      totalSbcSpent: 0.24,
      successfulJailbreaks: [
        { jailbrokenModel: 'AutoService Pro', aiModel: 'GPT-4', payout: 15, promptsTaken: 3, totalPrompts: 8 },
        { jailbrokenModel: 'MedAssist AI', aiModel: 'Claude 3', payout: 8, promptsTaken: 2, totalPrompts: 5 }
      ]
    },
    '7d': {
      totalPrompts: 23,
      totalSbcSpent: 0.69,
      successfulJailbreaks: [
        { jailbrokenModel: 'AutoService Pro', aiModel: 'GPT-4', payout: 15, promptsTaken: 3, totalPrompts: 8 },
        { jailbrokenModel: 'MedAssist AI', aiModel: 'Claude 3', payout: 8, promptsTaken: 2, totalPrompts: 5 },
        { jailbrokenModel: 'EduTutor Pro', aiModel: 'Gemini 2.5', payout: 12, promptsTaken: 4, totalPrompts: 7 },
        { jailbrokenModel: 'FinanceBot Advisor', aiModel: 'GPT-4', payout: 6, promptsTaken: 1, totalPrompts: 3 }
      ]
    },
    '30d': {
      totalPrompts: 67,
      totalSbcSpent: 2.01,
      successfulJailbreaks: [
        { jailbrokenModel: 'AutoService Pro', aiModel: 'GPT-4', payout: 15, promptsTaken: 3, totalPrompts: 8 },
        { jailbrokenModel: 'MedAssist AI', aiModel: 'Claude 3', payout: 8, promptsTaken: 2, totalPrompts: 5 },
        { jailbrokenModel: 'EduTutor Pro', aiModel: 'Gemini 2.5', payout: 12, promptsTaken: 4, totalPrompts: 7 },
        { jailbrokenModel: 'FinanceBot Advisor', aiModel: 'GPT-4', payout: 6, promptsTaken: 1, totalPrompts: 3 },
        { jailbrokenModel: 'LegalEase Assistant', aiModel: 'Claude 3', payout: 9, promptsTaken: 3, totalPrompts: 6 },
        { jailbrokenModel: 'RetailBot Manager', aiModel: 'Gemini 2.5', payout: 4, promptsTaken: 1, totalPrompts: 2 },
        { jailbrokenModel: 'CodeReview Assistant', aiModel: 'GPT-4', payout: 22, promptsTaken: 5, totalPrompts: 12 },
        { jailbrokenModel: 'TravelPlanner Pro', aiModel: 'Claude 3', payout: 11, promptsTaken: 3, totalPrompts: 8 },
        { jailbrokenModel: 'ContentModerator AI', aiModel: 'Gemini 2.5', payout: 18, promptsTaken: 6, totalPrompts: 10 },
        { jailbrokenModel: 'SupplyChain Optimizer', aiModel: 'GPT-4', payout: 7, promptsTaken: 2, totalPrompts: 5 },
        { jailbrokenModel: 'PersonalTrainer AI', aiModel: 'Claude 3', payout: 13, promptsTaken: 4, totalPrompts: 9 },
        { jailbrokenModel: 'AgriGrow Assistant', aiModel: 'GPT-4', payout: 20, promptsTaken: 5, totalPrompts: 11 }
      ]
    },
    '90d': {
      totalPrompts: 156,
      totalSbcSpent: 4.68,
      successfulJailbreaks: [
        { jailbrokenModel: 'AutoService Pro', aiModel: 'GPT-4', payout: 15, promptsTaken: 3, totalPrompts: 8 },
        { jailbrokenModel: 'MedAssist AI', aiModel: 'Claude 3', payout: 8, promptsTaken: 2, totalPrompts: 5 },
        { jailbrokenModel: 'EduTutor Pro', aiModel: 'Gemini 2.5', payout: 12, promptsTaken: 4, totalPrompts: 7 },
        { jailbrokenModel: 'FinanceBot Advisor', aiModel: 'GPT-4', payout: 6, promptsTaken: 1, totalPrompts: 3 },
        { jailbrokenModel: 'LegalEase Assistant', aiModel: 'Claude 3', payout: 9, promptsTaken: 3, totalPrompts: 6 },
        { jailbrokenModel: 'RetailBot Manager', aiModel: 'Gemini 2.5', payout: 4, promptsTaken: 1, totalPrompts: 2 },
        { jailbrokenModel: 'CodeReview Assistant', aiModel: 'GPT-4', payout: 22, promptsTaken: 5, totalPrompts: 12 },
        { jailbrokenModel: 'TravelPlanner Pro', aiModel: 'Claude 3', payout: 11, promptsTaken: 3, totalPrompts: 8 },
        { jailbrokenModel: 'ContentModerator AI', aiModel: 'Gemini 2.5', payout: 18, promptsTaken: 6, totalPrompts: 10 },
        { jailbrokenModel: 'SupplyChain Optimizer', aiModel: 'GPT-4', payout: 7, promptsTaken: 2, totalPrompts: 5 },
        { jailbrokenModel: 'PersonalTrainer AI', aiModel: 'Claude 3', payout: 13, promptsTaken: 4, totalPrompts: 9 },
        { jailbrokenModel: 'AgriGrow Assistant', aiModel: 'GPT-4', payout: 20, promptsTaken: 5, totalPrompts: 11 },
        { jailbrokenModel: 'RealEstate Analyzer', aiModel: 'Claude 3', payout: 16, promptsTaken: 4, totalPrompts: 9 },
        { jailbrokenModel: 'CyberGuard Security', aiModel: 'Gemini 2.5', payout: 25, promptsTaken: 8, totalPrompts: 15 },
        { jailbrokenModel: 'FinanceBot Advisor', aiModel: 'GPT-4', payout: 8, promptsTaken: 2, totalPrompts: 4 },
        { jailbrokenModel: 'LegalEase Assistant', aiModel: 'Claude 3', payout: 9, promptsTaken: 3, totalPrompts: 7 },
        { jailbrokenModel: 'RetailBot Manager', aiModel: 'Gemini 2.5', payout: 5, promptsTaken: 1, totalPrompts: 3 },
        { jailbrokenModel: 'AutoService Pro', aiModel: 'GPT-4', payout: 17, promptsTaken: 4, totalPrompts: 9 },
        { jailbrokenModel: 'MedAssist AI', aiModel: 'Claude 3', payout: 14, promptsTaken: 3, totalPrompts: 7 },
        { jailbrokenModel: 'EduTutor Pro', aiModel: 'Gemini 2.5', payout: 19, promptsTaken: 5, totalPrompts: 8 }
      ]
    },
    'all': {
      totalPrompts: 234,
      totalSbcSpent: 7.02,
      successfulJailbreaks: [
        { jailbrokenModel: 'AutoService Pro', aiModel: 'GPT-4', payout: 15, promptsTaken: 3, totalPrompts: 8 },
        { jailbrokenModel: 'MedAssist AI', aiModel: 'Claude 3', payout: 8, promptsTaken: 2, totalPrompts: 5 },
        { jailbrokenModel: 'EduTutor Pro', aiModel: 'Gemini 2.5', payout: 12, promptsTaken: 4, totalPrompts: 7 },
        { jailbrokenModel: 'FinanceBot Advisor', aiModel: 'GPT-4', payout: 6, promptsTaken: 1, totalPrompts: 3 },
        { jailbrokenModel: 'LegalEase Assistant', aiModel: 'Claude 3', payout: 9, promptsTaken: 3, totalPrompts: 6 },
        { jailbrokenModel: 'RetailBot Manager', aiModel: 'Gemini 2.5', payout: 4, promptsTaken: 1, totalPrompts: 2 },
        { jailbrokenModel: 'CodeReview Assistant', aiModel: 'GPT-4', payout: 22, promptsTaken: 5, totalPrompts: 12 },
        { jailbrokenModel: 'TravelPlanner Pro', aiModel: 'Claude 3', payout: 11, promptsTaken: 3, totalPrompts: 8 },
        { jailbrokenModel: 'ContentModerator AI', aiModel: 'Gemini 2.5', payout: 18, promptsTaken: 6, totalPrompts: 10 },
        { jailbrokenModel: 'SupplyChain Optimizer', aiModel: 'GPT-4', payout: 7, promptsTaken: 2, totalPrompts: 5 },
        { jailbrokenModel: 'PersonalTrainer AI', aiModel: 'Claude 3', payout: 13, promptsTaken: 4, totalPrompts: 9 },
        { jailbrokenModel: 'AgriGrow Assistant', aiModel: 'GPT-4', payout: 20, promptsTaken: 5, totalPrompts: 11 },
        { jailbrokenModel: 'RealEstate Analyzer', aiModel: 'Claude 3', payout: 16, promptsTaken: 4, totalPrompts: 9 },
        { jailbrokenModel: 'CyberGuard Security', aiModel: 'Gemini 2.5', payout: 25, promptsTaken: 8, totalPrompts: 15 },
        { jailbrokenModel: 'FinanceBot Advisor', aiModel: 'GPT-4', payout: 8, promptsTaken: 2, totalPrompts: 4 },
        { jailbrokenModel: 'LegalEase Assistant', aiModel: 'Claude 3', payout: 9, promptsTaken: 3, totalPrompts: 7 },
        { jailbrokenModel: 'RetailBot Manager', aiModel: 'Gemini 2.5', payout: 5, promptsTaken: 1, totalPrompts: 3 },
        { jailbrokenModel: 'AutoService Pro', aiModel: 'GPT-4', payout: 17, promptsTaken: 4, totalPrompts: 9 },
        { jailbrokenModel: 'MedAssist AI', aiModel: 'Claude 3', payout: 14, promptsTaken: 3, totalPrompts: 7 },
        { jailbrokenModel: 'EduTutor Pro', aiModel: 'Gemini 2.5', payout: 19, promptsTaken: 5, totalPrompts: 8 },
        { jailbrokenModel: 'CodeReview Assistant', aiModel: 'GPT-4', payout: 28, promptsTaken: 6, totalPrompts: 14 },
        { jailbrokenModel: 'TravelPlanner Pro', aiModel: 'Claude 3', payout: 19, promptsTaken: 5, totalPrompts: 10 },
        { jailbrokenModel: 'ContentModerator AI', aiModel: 'Gemini 2.5', payout: 31, promptsTaken: 9, totalPrompts: 16 },
        { jailbrokenModel: 'SupplyChain Optimizer', aiModel: 'GPT-4', payout: 12, promptsTaken: 3, totalPrompts: 7 },
        { jailbrokenModel: 'PersonalTrainer AI', aiModel: 'Claude 3', payout: 21, promptsTaken: 6, totalPrompts: 12 },
        { jailbrokenModel: 'AgriGrow Assistant', aiModel: 'Gemini 2.5', payout: 9, promptsTaken: 2, totalPrompts: 4 },
        { jailbrokenModel: 'RealEstate Analyzer', aiModel: 'GPT-4', payout: 24, promptsTaken: 5, totalPrompts: 11 },
        { jailbrokenModel: 'CyberGuard Security', aiModel: 'Claude 3', payout: 18, promptsTaken: 4, totalPrompts: 9 },
        { jailbrokenModel: 'AutoService Pro', aiModel: 'Gemini 2.5', payout: 26, promptsTaken: 7, totalPrompts: 13 }
      ]
    }
  }
};
