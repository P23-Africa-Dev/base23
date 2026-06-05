// Comprehensive list of tags for Smart Match preferences
// Tags are organized by categories for better organization and searchability

export interface TagCategory {
    name: string;
    tags: string[];
}

export const TAG_CATEGORIES: TagCategory[] = [
    {
        name: 'Business Development',
        tags: [
            'Business Strategy',
            'Market Expansion',
            'Partnership Development',
            'Sales Growth',
            'Revenue Optimization',
            'Business Model Innovation',
            'Go-to-Market Strategy',
            'Customer Acquisition',
            'Client Retention',
            'Competitive Analysis',
            'Business Planning',
            'Scaling Operations',
        ],
    },
    {
        name: 'Funding & Investment',
        tags: [
            'Seed Funding',
            'Series A',
            'Series B+',
            'Angel Investment',
            'Venture Capital',
            'Private Equity',
            'Crowdfunding',
            'Grant Funding',
            'Debt Financing',
            'IPO Preparation',
            'Investor Relations',
            'Pitch Deck Review',
            'Valuation',
            'Due Diligence',
            'Financial Modeling',
        ],
    },
    {
        name: 'Technology & Digital',
        tags: [
            'Software Development',
            'Mobile App Development',
            'Web Development',
            'Cloud Computing',
            'Artificial Intelligence',
            'Machine Learning',
            'Data Analytics',
            'Blockchain',
            'Cybersecurity',
            'Digital Transformation',
            'IoT Solutions',
            'SaaS',
            'API Integration',
            'Tech Architecture',
            'DevOps',
            'Product Development',
        ],
    },
    {
        name: 'Marketing & Branding',
        tags: [
            'Digital Marketing',
            'Social Media Marketing',
            'Content Marketing',
            'Brand Strategy',
            'SEO/SEM',
            'Email Marketing',
            'Influencer Marketing',
            'Public Relations',
            'Marketing Automation',
            'Growth Hacking',
            'Brand Identity',
            'Market Research',
            'Customer Insights',
            'Advertising',
            'Community Building',
        ],
    },
    {
        name: 'Operations & Management',
        tags: [
            'Operations Management',
            'Supply Chain',
            'Logistics',
            'Process Optimization',
            'Quality Management',
            'Project Management',
            'Inventory Management',
            'Vendor Management',
            'Risk Management',
            'Compliance',
            'Business Automation',
            'Lean Operations',
            'Agile Methodology',
        ],
    },
    {
        name: 'Human Resources & Talent',
        tags: [
            'Talent Acquisition',
            'Employee Engagement',
            'Performance Management',
            'Leadership Development',
            'Team Building',
            'Executive Coaching',
            'Organizational Design',
            'HR Strategy',
            'Compensation & Benefits',
            'Remote Work Solutions',
            'Diversity & Inclusion',
            'Culture Building',
            'Training & Development',
        ],
    },
    {
        name: 'Finance & Accounting',
        tags: [
            'Financial Planning',
            'Bookkeeping',
            'Tax Strategy',
            'Cash Flow Management',
            'Budgeting',
            'Financial Reporting',
            'Audit Preparation',
            'Cost Reduction',
            'Treasury Management',
            'Mergers & Acquisitions',
            'Financial Compliance',
            'Profit Optimization',
        ],
    },
    {
        name: 'Legal & Compliance',
        tags: [
            'Contract Drafting',
            'Corporate Law',
            'Intellectual Property',
            'Regulatory Compliance',
            'Data Privacy (GDPR)',
            'Employment Law',
            'International Trade Law',
            'Licensing',
            'Dispute Resolution',
            'Legal Due Diligence',
            'Corporate Governance',
        ],
    },
    {
        name: 'Sales & Customer Success',
        tags: [
            'Sales Strategy',
            'B2B Sales',
            'B2C Sales',
            'Enterprise Sales',
            'Sales Training',
            'CRM Implementation',
            'Customer Success',
            'Account Management',
            'Lead Generation',
            'Sales Operations',
            'Negotiation',
            'Channel Sales',
        ],
    },
    {
        name: 'Product & Design',
        tags: [
            'Product Strategy',
            'Product Management',
            'UX Design',
            'UI Design',
            'User Research',
            'Prototyping',
            'Design Systems',
            'Product-Market Fit',
            'Feature Prioritization',
            'A/B Testing',
            'Product Launch',
            'Roadmap Planning',
        ],
    },
    {
        name: 'Sustainability & ESG',
        tags: [
            'Sustainability Strategy',
            'Carbon Footprint',
            'ESG Reporting',
            'Green Technology',
            'Social Impact',
            'Circular Economy',
            'Renewable Energy',
            'Sustainable Supply Chain',
            'Impact Investing',
            'Corporate Social Responsibility',
        ],
    },
    {
        name: 'International & Expansion',
        tags: [
            'International Expansion',
            'Market Entry Strategy',
            'Cross-border Trade',
            'Localization',
            'Global Partnerships',
            'Export/Import',
            'Foreign Investment',
            'Cultural Adaptation',
            'Multi-region Operations',
            'International Compliance',
        ],
    },
    {
        name: 'Innovation & R&D',
        tags: [
            'Innovation Strategy',
            'R&D Management',
            'Technology Scouting',
            'Patent Strategy',
            'Open Innovation',
            'Lab-to-Market',
            'Prototype Development',
            'Research Partnerships',
            'Technology Transfer',
            'Disruptive Innovation',
        ],
    },
    {
        name: 'Industry Specific',
        tags: [
            'Fintech Solutions',
            'Healthtech',
            'Edtech',
            'Agritech',
            'Proptech',
            'E-commerce',
            'Logistics Tech',
            'Media & Entertainment',
            'Clean Energy',
            'Biotech',
            'Fashion Tech',
            'Food Tech',
        ],
    },
    {
        name: 'Networking & Mentorship',
        tags: [
            'Mentorship',
            'Advisory Board',
            'Industry Connections',
            'Peer Networking',
            'Startup Community',
            'Investor Network',
            'Strategic Introductions',
            'Mastermind Groups',
            'Expert Consultation',
            'Board Membership',
        ],
    },
];

// Flatten all tags for easy searching
export const ALL_TAGS: string[] = TAG_CATEGORIES.flatMap((category) => category.tags);

// Get unique tags (in case of duplicates)
export const UNIQUE_TAGS: string[] = [...new Set(ALL_TAGS)];

// Default/popular tags to show initially (most commonly needed)
export const DEFAULT_TAGS: string[] = [
    'Business Strategy',
    'Funding & Investment',
    'Digital Marketing',
    'Technology Solutions',
    'Partnership Development',
    'Sales Growth',
    'Talent Acquisition',
    'Financial Planning',
    'Market Expansion',
    'Product Development',
    'Mentorship',
    'Investor Relations',
];

// Industry to relevant tags mapping (for smart suggestions based on selected industries)
export const INDUSTRY_TAG_MAPPING: Record<string, string[]> = {
    'Technology & Digital Services': [
        'Software Development',
        'Cloud Computing',
        'Artificial Intelligence',
        'Cybersecurity',
        'Digital Transformation',
        'SaaS',
        'Tech Architecture',
        'DevOps',
        'Product Development',
        'API Integration',
        'Mobile App Development',
        'Data Analytics',
    ],
    'Financial & Professional Services': [
        'Financial Planning',
        'Fintech Solutions',
        'Regulatory Compliance',
        'Risk Management',
        'Treasury Management',
        'Financial Modeling',
        'Mergers & Acquisitions',
        'Tax Strategy',
        'Audit Preparation',
        'Contract Drafting',
        'Corporate Law',
        'Business Strategy',
    ],
    'Manufacturing & Industrial': [
        'Supply Chain',
        'Operations Management',
        'Quality Management',
        'Lean Operations',
        'Process Optimization',
        'Inventory Management',
        'Logistics',
        'Business Automation',
        'Sustainable Supply Chain',
        'Vendor Management',
        'Project Management',
    ],
    'Healthcare & Pharmaceuticals': [
        'Healthtech',
        'Regulatory Compliance',
        'Data Privacy (GDPR)',
        'Research Partnerships',
        'Product Development',
        'Biotech',
        'Quality Management',
        'R&D Management',
        'Patent Strategy',
        'Clinical Trials',
    ],
    'Energy & Utilities': [
        'Clean Energy',
        'Renewable Energy',
        'Sustainability Strategy',
        'Carbon Footprint',
        'Regulatory Compliance',
        'IoT Solutions',
        'Operations Management',
        'Green Technology',
        'Project Management',
        'ESG Reporting',
    ],
    'Retail & Consumer Goods': [
        'E-commerce',
        'Digital Marketing',
        'Customer Acquisition',
        'Inventory Management',
        'Supply Chain',
        'Customer Success',
        'CRM Implementation',
        'Brand Strategy',
        'Social Media Marketing',
        'Market Research',
    ],
    'Logistics & Transportation': [
        'Logistics Tech',
        'Supply Chain',
        'Operations Management',
        'Process Optimization',
        'IoT Solutions',
        'Business Automation',
        'International Expansion',
        'Export/Import',
        'Inventory Management',
        'Vendor Management',
    ],
    'Agriculture & Food Processing': [
        'Agritech',
        'Food Tech',
        'Supply Chain',
        'Sustainable Supply Chain',
        'Technology Transfer',
        'Research Partnerships',
        'Export/Import',
        'Green Technology',
        'Quality Management',
        'Regulatory Compliance',
    ],
    'Real Estate & Construction': [
        'Proptech',
        'Project Management',
        'Operations Management',
        'Financial Modeling',
        'Legal Due Diligence',
        'Contract Drafting',
        'Sustainability Strategy',
        'Market Expansion',
        'Vendor Management',
        'Quality Management',
    ],
    'Media & Communications': [
        'Content Marketing',
        'Digital Marketing',
        'Brand Strategy',
        'Social Media Marketing',
        'Influencer Marketing',
        'Public Relations',
        'Product Launch',
        'Community Building',
        'Advertising',
        'Market Research',
    ],
    'Education & Training': [
        'Edtech',
        'Content Marketing',
        'Digital Transformation',
        'Training & Development',
        'User Research',
        'Product Management',
        'Mobile App Development',
        'Leadership Development',
        'Community Building',
        'Curriculum Development',
    ],
    'Government & Public Services': [
        'Regulatory Compliance',
        'Digital Transformation',
        'Data Analytics',
        'Cybersecurity',
        'Project Management',
        'Process Optimization',
        'Grant Funding',
        'Social Impact',
        'Corporate Social Responsibility',
        'Stakeholder Engagement',
    ],
    'Environmental & Specialized Services': [
        'Sustainability Strategy',
        'Carbon Footprint',
        'ESG Reporting',
        'Green Technology',
        'Social Impact',
        'Circular Economy',
        'Renewable Energy',
        'Sustainable Supply Chain',
        'Impact Investing',
        'Corporate Social Responsibility',
    ],
};

/**
 * Get suggested tags based on user's selected industry
 */
export function getSuggestedTags(selectedIndustry: string | null): string[] {
    if (!selectedIndustry) {
        return DEFAULT_TAGS;
    }

    const suggestedSet = new Set<string>();

    // Add tags from selected industry
    const industryTags = INDUSTRY_TAG_MAPPING[selectedIndustry];
    if (industryTags) {
        industryTags.forEach((tag) => suggestedSet.add(tag));
    }

    // If we have less than 12 suggestions, fill with default tags
    if (suggestedSet.size < 12) {
        DEFAULT_TAGS.forEach((tag) => {
            if (suggestedSet.size < 15) {
                suggestedSet.add(tag);
            }
        });
    }

    return Array.from(suggestedSet).slice(0, 15);
}

/**
 * Search tags by query string
 */
export function searchTags(query: string, excludeTags: string[] = []): string[] {
    if (!query || query.trim().length === 0) {
        return UNIQUE_TAGS.filter((tag) => !excludeTags.includes(tag)).slice(0, 20);
    }

    const normalizedQuery = query.toLowerCase().trim();

    return UNIQUE_TAGS.filter((tag) => tag.toLowerCase().includes(normalizedQuery) && !excludeTags.includes(tag)).slice(0, 20);
}

/**
 * Get tags by category
 */
export function getTagsByCategory(categoryName: string): string[] {
    const category = TAG_CATEGORIES.find((cat) => cat.name.toLowerCase() === categoryName.toLowerCase());
    return category ? category.tags : [];
}
