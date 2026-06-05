import images from '@/constants/image';


export type Message = {
    body: string;
    created_at: string; // ISO string
    is_read?: boolean;
};


export type Conversation = {
    id: number;
    encrypted_id: string;

    /** Optional title for group or named conversations */
    title?: string | null;

    /** All users in the conversation */
    participants: User[];

    /** Convenience reference (usually "the other user") */
    other_participant?: User;

    /** Number of unread messages for current user */
    unread_count?: number;

    /** Last message sent in the conversation */
    last_message?: Message | null;
};

export type MessageStats = {
    activeConversations: number;
    readMessages: number;
    unreadMessages: number;
};


export type User = {
    id: number;
    name: string;

    /* Basic profile */
    imageSrc?: string;
    title?: string;
    location?: string;
    industry?: string;
    rating?: number;

    /* Professional details */
    experience?: string;
    interest?: string;
    reviews?: string;
    leads?: string;

    /* Business & operations */
    baseLocation?: string;
    operatesIn?: string;
    bio?: string;
    companyStage?: string;
    keyStrength?: string;
    topGoal?: string;

    /* Engagement stats */
    brnMemberSince?: string;
    responseRate?: string;
    successfulDealsRate?: string;
};

export const dummyUsers: User[] = [
    {
        id: 1,
        name: 'Jamal Agoro',
        location: 'Johannesburg, South Africa',
        title: 'CTO, AfriLaw',
        industry: 'Renewable Energy',
        rating: 4.8,
        imageSrc: `${images.man2}`,
        experience: '8 years',
        interest: 'Strategy & Finance',
        reviews: '20+ Reviews',
        leads: 'connection',
        baseLocation: 'Lagos',
        operatesIn: 'Nigeria, Ghana, Kenya',
        bio: 'Seasoned renewable energy executive with 8 years of experience building solar infrastructure across East and West Africa. Founded GreenEnergy Africa in 2018, scaling to $5M annual revenue by establishing distribution partnerships in 3 countries. Passionate about bridging Africa’s energy gap while delivering investor returns.',
        companyStage: 'Growth ($5M annual revenue)',
        keyStrength: 'East Africa distribution networks',
        topGoal: 'Seeking $3M Series A investors to expand off-grid solar solutions in secondary African cities.',
        brnMemberSince: 'January, 2025',
        responseRate: '92% (<6 hours avg.)',
        successfulDealsRate: '92% Dealings',
    },
    {
        id: 2,
        name: 'Tunde Adebayo',
        location: 'Abuja, Nigeria',
        title: 'CEO, InnovateHub',
        industry: 'Technology',
        rating: 4.9,
        leads: 'smart-match',
        imageSrc: `${images.man3}`,
        experience: '12 years',
        interest: 'AI & Machine Learning',
        reviews: '50+ Reviews',
        baseLocation: 'Abuja',
        operatesIn: 'Nigeria, UK, USA',
        bio: 'Tech entrepreneur with 12 years of experience leading teams in AI innovation. Focused on building scalable solutions in emerging markets. Currently expanding AI-driven financial tools to new territories.',
        companyStage: 'Series B ($15M annual revenue)',
        keyStrength: 'AI product development & leadership',
        topGoal: 'Expand AI financial tools globally and secure strategic partnerships.',
        brnMemberSince: 'February, 2025',
        responseRate: '95% (<4 hours avg.)',
        successfulDealsRate: '98% Dealings',
    },
    {
        id: 3,
        name: 'Adeola Adebayo',
        location: 'Abuja, Nigeria',
        title: 'Founder, EcoBuild',
        industry: 'Real Estate',
        leads: 'active-lead',
        rating: 4.7,
        imageSrc: `${images.man4}`,
        experience: '15 years',
        interest: 'Sustainable Development',
        reviews: '35+ Reviews',
        baseLocation: 'Abuja, Nigeria',
        operatesIn: 'Nigeria, Cameroon',
        bio: 'Expert in sustainable real estate development focusing on affordable, eco-friendly housing. Dedicated to solving Nigeria’s housing deficit through innovative, green solutions.',
        companyStage: 'Startup ($2M annual revenue)',
        keyStrength: 'Sustainable building & project financing',
        topGoal: 'Secure $5M development loan for new housing project.',
        brnMemberSince: 'March, 2025',
        responseRate: '88% (<12 hours avg.)',
        successfulDealsRate: '85% Dealings',
    },
    {
        id: 4,
        name: 'Chioma Nwachukwu',
        location: 'Lagos, Nigeria',
        title: 'Venture Partner',
        leads: 'active-lead',
        industry: 'Venture Capital',
        rating: 4.9,
        imageSrc: `${images.man2}`,
        experience: '10 years',
        interest: 'Fintech, Healthtech',
        reviews: '60+ Reviews',
        baseLocation: 'Lagos',
        operatesIn: 'West Africa',
        bio: 'Venture capitalist with 10 years of experience funding high-potential startups across Africa. Focuses on fintech and healthtech sectors.',
        companyStage: 'Seed/Early Stage',
        keyStrength: 'Investment strategy & mentorship',
        topGoal: 'Source and fund the next generation of African unicorns.',
        brnMemberSince: 'January, 2025',
        responseRate: '98% (<2 hours avg.)',
        successfulDealsRate: '100% Dealings',
    },
    {
        id: 5,
        name: 'Emeka Okafor',
        location: 'Owerri, Nigeria',
        title: 'Founder, AgroConnect',
        industry: 'Agriculture',
        leads: 'connection',
        rating: 4.5,
        imageSrc: `${images.man4}`,
        experience: '7 years',
        interest: 'Agri-Tech, Supply Chain',
        reviews: '15+ Reviews',
        baseLocation: 'Owerri',
        operatesIn: 'Nigeria',
        bio: 'Agri-tech entrepreneur connecting small-scale farmers directly to urban markets, reducing waste and boosting income.',
        companyStage: 'Startup ($500K annual revenue)',
        keyStrength: 'Supply chain optimization',
        topGoal: 'Expand to two new states and onboard 1,000 farmers.',
        brnMemberSince: 'March, 2025',
        responseRate: '85% (<1 day avg.)',
        successfulDealsRate: '80% Dealings',
    },
    {
        id: 6,
        name: 'Amina Sani',
        location: 'Kano, Nigeria',
        title: 'Managing Partner, Sani & Co.',
        industry: 'Legal Services',
        leads: 'smart-match',
        rating: 4.6,
        imageSrc: `${images.man3}`,
        experience: '20 years',
        interest: 'Corporate Law, M&A',
        reviews: '40+ Reviews',
        baseLocation: 'Kano',
        operatesIn: 'Nigeria',
        bio: 'Corporate lawyer with two decades of experience advising on complex M&A and compliance for international firms entering Nigeria.',
        companyStage: 'Established Firm',
        keyStrength: 'Corporate law & compliance',
        topGoal: 'Advise on high-value M&A deals and international expansions.',
        brnMemberSince: 'February, 2025',
        responseRate: '90% (<8 hours avg.)',
        successfulDealsRate: '95% Dealings',
    },
    {
        id: 7,
        name: 'Obinna Eze',
        location: 'Lagos, Nigeria',
        title: 'Marketing Director, Digify',
        industry: 'Digital Marketing',
        leads: 'connection',
        rating: 4.7,
        imageSrc: `${images.man4}`,
        experience: '9 years',
        interest: 'SEO, Content Strategy',
        reviews: '25+ Reviews',
        baseLocation: 'Lagos',
        operatesIn: 'Nigeria, South Africa',
        bio: 'Digital marketing expert helping startups achieve scalable user acquisition through SEO and content strategy.',
        companyStage: 'Growth ($3M annual revenue)',
        keyStrength: 'Data-driven marketing & analytics',
        topGoal: 'Boost clients’ leads by 50% within 12 months.',
        brnMemberSince: 'April, 2025',
        responseRate: '93% (<5 hours avg.)',
        successfulDealsRate: '90% Dealings',
    },
    {
        id: 8,
        name: 'Ifeoma Chukwu',
        location: 'Enugu, Nigeria',
        title: 'Founder, HealthTrack',
        industry: 'Healthtech',
        leads: 'active-lead',
        rating: 4.8,
        imageSrc: `${images.man4}`,
        experience: '6 years',
        interest: 'Telemedicine, EMR systems',
        reviews: '18+ Reviews',
        baseLocation: 'Enugu',
        operatesIn: 'Nigeria',
        bio: 'Healthtech founder improving healthcare access in rural Nigeria through telemedicine and EMR systems.',
        companyStage: 'Pre-Seed',
        keyStrength: 'Telemedicine & clinical expertise',
        topGoal: 'Raise seed funding to expand nationwide.',
        brnMemberSince: 'January, 2025',
        responseRate: '90% (<6 hours avg.)',
        successfulDealsRate: '88% Dealings',
    },
    {
        id: 9,
        name: 'Ken Okoro',
        location: 'Lagos, Nigeria',
        title: 'Investment Analyst, CardinalStone',
        industry: 'Financial Services',
        leads: 'smart-match',
        rating: 4.7,
        imageSrc: `${images.man2}`,
        experience: '5 years',
        interest: 'Portfolio Management',
        reviews: '22+ Reviews',
        baseLocation: 'Lagos',
        operatesIn: 'Nigeria, UK',
        bio: 'Investment analyst specializing in portfolio management and alternative investments for corporate clients.',
        companyStage: 'Established Firm',
        keyStrength: 'Investment strategy & analysis',
        topGoal: 'Grow firm’s assets under management through diversified portfolios.',
        brnMemberSince: 'February, 2025',
        responseRate: '95% (<3 hours avg.)',
        successfulDealsRate: '94% Dealings',
    },
    {
        id: 10,
        name: 'Grace Akinwumi',
        location: 'Ibadan, Nigeria',
        title: 'Founder, KidCoders',
        industry: 'Education',
        leads: 'connection',
        rating: 4.9,
        imageSrc: `${images.man1}`,
        experience: '10 years',
        interest: 'Edtech, Child Education',
        reviews: '55+ Reviews',
        baseLocation: 'Ibadan',
        operatesIn: 'Nigeria',
        bio: 'EdTech founder promoting early-age coding and digital literacy through KidCoders. Partnered with multiple schools nationwide.',
        companyStage: 'Growth ($1.5M annual revenue)',
        keyStrength: 'Curriculum development & education tech',
        topGoal: 'Expand KidCoders to reach 10,000+ students.',
        brnMemberSince: 'March, 2025',
        responseRate: '96% (<4 hours avg.)',
        successfulDealsRate: '97% Dealings',
    },
];

export const dummyCards = [
    {
        id: 1,
        name: 'Jamal Agoro',
        location: 'Johannesburg, South Africa',
        title: 'CTO, AfriLaw',
        industry: 'Renewable Energy',
        rating: 4.8,
        imageSrc: `${images.man2}`,
        experience: '8 years',
        interest: 'Strategy & Finance',
        reviews: '20+ Reviews',
        leads: 'connection',
        baseLocation: 'Lagos',
        operatesIn: 'Nigeria, Ghana, Kenya',
        bio: 'Seasoned renewable energy executive with 8 years of experience building solar infrastructure across East and West Africa. Founded GreenEnergy Africa in 2018, scaling to $5M annual revenue by establishing distribution partnerships in 3 countries. Passionate about bridging Africa’s energy gap while delivering investor returns.',
        companyStage: 'Growth ($5M annual revenue)',
        keyStrength: 'East Africa distribution networks',
        topGoal: 'Seeking $3M Series A investors to expand off-grid solar solutions in secondary African cities.',
        brnMemberSince: 'January, 2025',
        responseRate: '92% (<6 hours avg.)',
        successfulDealsRate: '92% Dealings',
    },
    {
        id: 2,
        name: 'Tunde Adebayo',
        location: 'Abuja, Nigeria',
        title: 'CEO, InnovateHub',
        industry: 'Technology',
        rating: 4.9,
        leads: 'smart-match',
        imageSrc: `${images.man3}`,
        experience: '12 years',
        interest: 'AI & Machine Learning',
        reviews: '50+ Reviews',
        baseLocation: 'Abuja',
        operatesIn: 'Nigeria, UK, USA',
        bio: 'Tech entrepreneur with 12 years of experience leading teams in AI innovation. Focused on building scalable solutions in emerging markets. Currently expanding AI-driven financial tools to new territories.',
        companyStage: 'Series B ($15M annual revenue)',
        keyStrength: 'AI product development & leadership',
        topGoal: 'Expand AI financial tools globally and secure strategic partnerships.',
        brnMemberSince: 'February, 2025',
        responseRate: '95% (<4 hours avg.)',
        successfulDealsRate: '98% Dealings',
    },
    {
        id: 3,
        name: 'Adeola Adebayo',
        location: 'Abuja, Nigeria',
        title: 'Founder, EcoBuild',
        industry: 'Real Estate',
        leads: 'active-lead',
        rating: 4.7,
        imageSrc: `${images.man4}`,
        experience: '15 years',
        interest: 'Sustainable Development',
        reviews: '35+ Reviews',
        baseLocation: 'Abuja, Nigeria',
        operatesIn: 'Nigeria, Cameroon',
        bio: 'Expert in sustainable real estate development focusing on affordable, eco-friendly housing. Dedicated to solving Nigeria’s housing deficit through innovative, green solutions.',
        companyStage: 'Startup ($2M annual revenue)',
        keyStrength: 'Sustainable building & project financing',
        topGoal: 'Secure $5M development loan for new housing project.',
        brnMemberSince: 'March, 2025',
        responseRate: '88% (<12 hours avg.)',
        successfulDealsRate: '85% Dealings',
    },
    {
        id: 4,
        name: 'Chioma Nwachukwu',
        location: 'Lagos, Nigeria',
        title: 'Venture Partner',
        leads: 'active-lead',
        industry: 'Venture Capital',
        rating: 4.9,
        imageSrc: `${images.man2}`,
        experience: '10 years',
        interest: 'Fintech, Healthtech',
        reviews: '60+ Reviews',
        baseLocation: 'Lagos',
        operatesIn: 'West Africa',
        bio: 'Venture capitalist with 10 years of experience funding high-potential startups across Africa. Focuses on fintech and healthtech sectors.',
        companyStage: 'Seed/Early Stage',
        keyStrength: 'Investment strategy & mentorship',
        topGoal: 'Source and fund the next generation of African unicorns.',
        brnMemberSince: 'January, 2025',
        responseRate: '98% (<2 hours avg.)',
        successfulDealsRate: '100% Dealings',
    },
    {
        id: 5,
        name: 'Emeka Okafor',
        location: 'Owerri, Nigeria',
        title: 'Founder, AgroConnect',
        industry: 'Agriculture',
        leads: 'connection',
        rating: 4.5,
        imageSrc: `${images.man4}`,
        experience: '7 years',
        interest: 'Agri-Tech, Supply Chain',
        reviews: '15+ Reviews',
        baseLocation: 'Owerri',
        operatesIn: 'Nigeria',
        bio: 'Agri-tech entrepreneur connecting small-scale farmers directly to urban markets, reducing waste and boosting income.',
        companyStage: 'Startup ($500K annual revenue)',
        keyStrength: 'Supply chain optimization',
        topGoal: 'Expand to two new states and onboard 1,000 farmers.',
        brnMemberSince: 'March, 2025',
        responseRate: '85% (<1 day avg.)',
        successfulDealsRate: '80% Dealings',
    },
    {
        id: 6,
        name: 'Amina Sani',
        location: 'Kano, Nigeria',
        title: 'Managing Partner, Sani & Co.',
        industry: 'Legal Services',
        leads: 'smart-match',
        rating: 4.6,
        imageSrc: `${images.man3}`,
        experience: '20 years',
        interest: 'Corporate Law, M&A',
        reviews: '40+ Reviews',
        baseLocation: 'Kano',
        operatesIn: 'Nigeria',
        bio: 'Corporate lawyer with two decades of experience advising on complex M&A and compliance for international firms entering Nigeria.',
        companyStage: 'Established Firm',
        keyStrength: 'Corporate law & compliance',
        topGoal: 'Advise on high-value M&A deals and international expansions.',
        brnMemberSince: 'February, 2025',
        responseRate: '90% (<8 hours avg.)',
        successfulDealsRate: '95% Dealings',
    },
    {
        id: 7,
        name: 'Obinna Eze',
        location: 'Lagos, Nigeria',
        title: 'Marketing Director, Digify',
        industry: 'Digital Marketing',
        leads: 'connection',
        rating: 4.7,
        imageSrc: `${images.man4}`,
        experience: '9 years',
        interest: 'SEO, Content Strategy',
        reviews: '25+ Reviews',
        baseLocation: 'Lagos',
        operatesIn: 'Nigeria, South Africa',
        bio: 'Digital marketing expert helping startups achieve scalable user acquisition through SEO and content strategy.',
        companyStage: 'Growth ($3M annual revenue)',
        keyStrength: 'Data-driven marketing & analytics',
        topGoal: 'Boost clients’ leads by 50% within 12 months.',
        brnMemberSince: 'April, 2025',
        responseRate: '93% (<5 hours avg.)',
        successfulDealsRate: '90% Dealings',
    },
    {
        id: 8,
        name: 'Ifeoma Chukwu',
        location: 'Enugu, Nigeria',
        title: 'Founder, HealthTrack',
        industry: 'Healthtech',
        leads: 'active-lead',
        rating: 4.8,
        imageSrc: `${images.man4}`,
        experience: '6 years',
        interest: 'Telemedicine, EMR systems',
        reviews: '18+ Reviews',
        baseLocation: 'Enugu',
        operatesIn: 'Nigeria',
        bio: 'Healthtech founder improving healthcare access in rural Nigeria through telemedicine and EMR systems.',
        companyStage: 'Pre-Seed',
        keyStrength: 'Telemedicine & clinical expertise',
        topGoal: 'Raise seed funding to expand nationwide.',
        brnMemberSince: 'January, 2025',
        responseRate: '90% (<6 hours avg.)',
        successfulDealsRate: '88% Dealings',
    },
    {
        id: 9,
        name: 'Ken Okoro',
        location: 'Lagos, Nigeria',
        title: 'Investment Analyst, CardinalStone',
        industry: 'Financial Services',
        leads: 'smart-match',
        rating: 4.7,
        imageSrc: `${images.man2}`,
        experience: '5 years',
        interest: 'Portfolio Management',
        reviews: '22+ Reviews',
        baseLocation: 'Lagos',
        operatesIn: 'Nigeria, UK',
        bio: 'Investment analyst specializing in portfolio management and alternative investments for corporate clients.',
        companyStage: 'Established Firm',
        keyStrength: 'Investment strategy & analysis',
        topGoal: 'Grow firm’s assets under management through diversified portfolios.',
        brnMemberSince: 'February, 2025',
        responseRate: '95% (<3 hours avg.)',
        successfulDealsRate: '94% Dealings',
    },
    {
        id: 10,
        name: 'Grace Akinwumi',
        location: 'Ibadan, Nigeria',
        title: 'Founder, KidCoders',
        industry: 'Education',
        leads: 'connection',
        rating: 4.9,
        imageSrc: `${images.man1}`,
        experience: '10 years',
        interest: 'Edtech, Child Education',
        reviews: '55+ Reviews',
        baseLocation: 'Ibadan',
        operatesIn: 'Nigeria',
        bio: 'EdTech founder promoting early-age coding and digital literacy through KidCoders. Partnered with multiple schools nationwide.',
        companyStage: 'Growth ($1.5M annual revenue)',
        keyStrength: 'Curriculum development & education tech',
        topGoal: 'Expand KidCoders to reach 10,000+ students.',
        brnMemberSince: 'March, 2025',
        responseRate: '96% (<4 hours avg.)',
        successfulDealsRate: '97% Dealings',
    },
];

export const dummyLeads = [
    {
        name: 'Thabo Ladi',
        email: 'username@gmail.com',
        title: 'COO, EasyAccount',
        rating: 4.6,
        iconSrc: `${images.userCheck}`,
    },
    {
        name: 'P23 Africa',
        email: 'p23africa.com',
        title: 'Business & Tech',
        rating: 4.6,
        iconSrc: `${images.userCheck}`,
    },
    {
        name: 'Kwame Nkrumah',
        email: 'kwame.n@example.com',
        title: 'CEO',
        rating: 4.6,
        iconSrc: `${images.userCheck}`,
    },
    {
        name: 'M-Pesa Holdings',
        email: 'contact@mpesa.com',
        title: 'Fintech Company',
        rating: 4.6,
        iconSrc: `${images.userCheck}`,
    },
    {
        name: 'Lola Adeoye',
        email: 'lola.a@example.com',
        title: 'CTO, FinEdge',
        rating: 4.6,
        iconSrc: `${images.userCheck}`,
    },
];



export const dummyConversations: Conversation[] = [
  {
    id: 101,
    encrypted_id: 'conv_kwame_101',
    participants: [dummyUsers[0], dummyUsers[1]],
    other_participant: dummyUsers[1],
    unread_count: 2,
    last_message: {
      body: 'Looking forward to reviewing the proposal.',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
      is_read: false,
    },
  },
  {
    id: 102,
    encrypted_id: 'conv_aisha_102',
    participants: [dummyUsers[0], dummyUsers[2]],
    other_participant: dummyUsers[2],
    unread_count: 0,
    last_message: {
      body: 'Thanks! Let’s sync tomorrow.',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      is_read: true,
    },
  },
  {
    id: 103,
    encrypted_id: 'conv_fatima_103',
    participants: [dummyUsers[0], dummyUsers[3]],
    other_participant: dummyUsers[3],
    unread_count: 1,
    last_message: {
      body: 'I’ve shared the investment memo.',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
      is_read: false,
    },
  },
];


export const dummyMessageStats: MessageStats = {
  activeConversations: 3,
  readMessages: 12,
  unreadMessages: 3,
};
