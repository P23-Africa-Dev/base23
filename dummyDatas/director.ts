import images from '@/constants/image';

export type WorkExperience = {
    role: string;
    company: string;
    location: string;
    period: string;
    achievements: string[];
    successfulDealsRate?: string;
};

export type DirectorUser = {
    id: number;
    name: string;
    location: string;
    rating: number;
    title: string;
    imageSrc: string;
    industry?: string;
    experience?: string;
    interest?: string;
    // extended profile fields
    bio?: string;
    languages?: string;
    expectedRate?: string;
    availability?: string;
    reviews?: number;
    baseLocation?: string;
    operatesIn?: string;
    workExperience?: WorkExperience[];
};

export const dummyDirectorLeads: DirectorUser[] = [
    {
        id: 1,
        name: 'Jamal Agoro',
        location: 'Dakar, Senegal',
        rating: 4.6,
        title: 'Sales Manager',
        imageSrc: images.businessMan1,
        experience: '8 years',
        interest: 'Strategy & Finance',
        industry: 'Fintech',
        bio: 'Experienced field sales professional with 8 years covering Nigeria and Ghana. Specialized in FMCG and FinTech products. Consistently exceeded quarterly targets by 25%+.',
        languages: 'English (Fluent), Yoruba (Native), French (Basic)',
        expectedRate: '£1,800 - £2,200 / month',
        availability: 'Full-time, open to travel',
        reviews: 12,
        baseLocation: 'Nigeria',
        operatesIn: 'Nigeria, Ghana, Kenya',
        workExperience: [
            {
                role: 'Senior Field Agent',
                company: 'PaySwift Africa',
                location: 'Lagos',
                period: '2021 - Present',
                achievements: [
                    'Managed 150+ merchant relationships',
                    'Grew active users by 40% in Lagos region',
                ],
                successfulDealsRate: '92% Dealings',
            },
        ],
    },
    {
        id: 2,
        name: 'Stephan Odili',
        location: 'Dakar, Senegal',
        rating: 4.6,
        title: 'Broker',
        imageSrc: images.man2,
        experience: '5 years',
        interest: 'B2B Sales',
        industry: 'Real Estate',
        bio: 'Seasoned broker with 5 years in B2B sales across West Africa. Expert in real estate transactions and client relationship management.',
        languages: 'English (Fluent), Igbo (Native)',
        expectedRate: '£1,500 - £1,800 / month',
        availability: 'Full-time',
        reviews: 8,
        baseLocation: 'Senegal',
        operatesIn: 'Senegal, Ivory Coast, Benin',
        workExperience: [
            {
                role: 'Senior Broker',
                company: 'AfricaRealty Group',
                location: 'Dakar',
                period: '2020 - Present',
                achievements: [
                    'Closed deals worth $3M+ in 2023',
                    'Built a portfolio of 80+ corporate clients',
                ],
                successfulDealsRate: '88% Dealings',
            },
        ],
    },
    {
        id: 3,
        name: 'Stephan Odili',
        location: 'Dakar, Senegal',
        rating: 4.6,
        title: 'Product Marketer',
        imageSrc: images.man3,
        experience: '4 years',
        interest: 'Growth Marketing',
        industry: 'Technology',
        bio: 'Growth-focused product marketer with a track record of scaling SaaS products in emerging markets. Data-driven approach to campaigns.',
        languages: 'English (Fluent), French (Intermediate)',
        expectedRate: '£1,400 - £1,700 / month',
        availability: 'Full-time or contract',
        reviews: 6,
        baseLocation: 'Senegal',
        operatesIn: 'Senegal, Ghana, Rwanda',
        workExperience: [
            {
                role: 'Product Marketing Lead',
                company: 'TechBridge Africa',
                location: 'Dakar',
                period: '2021 - Present',
                achievements: [
                    'Grew user acquisition by 60% YoY',
                    'Led GTM for 3 product launches',
                ],
                successfulDealsRate: '85% Campaigns',
            },
        ],
    },
    {
        id: 4,
        name: 'Stephan Odili',
        location: 'Dakar, Senegal',
        rating: 4.6,
        title: 'Sales Consultant',
        imageSrc: images.man4,
        experience: '7 years',
        interest: 'Enterprise Sales',
        industry: 'Consulting',
        bio: 'Enterprise sales consultant specializing in B2B solutions for Fortune 500 clients across Africa and MENA. Strong negotiation and CRM skills.',
        languages: 'English (Fluent), Arabic (Conversational)',
        expectedRate: '£2,000 - £2,500 / month',
        availability: 'Full-time',
        reviews: 15,
        baseLocation: 'Senegal',
        operatesIn: 'Senegal, Nigeria, South Africa, Egypt',
        workExperience: [
            {
                role: 'Enterprise Sales Consultant',
                company: 'GlobalSales Corp',
                location: 'Dakar',
                period: '2018 - Present',
                achievements: [
                    'Secured $5M+ in enterprise contracts',
                    'Maintained 95% client retention rate',
                ],
                successfulDealsRate: '94% Dealings',
            },
        ],
    },
];

export const dummyDirectorList: DirectorUser[] = [
    {
        id: 5,
        name: 'Thabo Molefe',
        location: 'Johannesburg, South Africa',
        rating: 4.6,
        title: 'Field Sales Agent',
        industry: 'Renewable Energy',
        imageSrc: images.man1,
        bio: 'Dedicated field sales agent in the renewable energy space. Passionate about clean energy solutions across Southern Africa.',
        languages: 'English (Fluent), Zulu (Native), Sotho (Conversational)',
        expectedRate: '£1,200 - £1,500 / month',
        availability: 'Full-time',
        reviews: 10,
        baseLocation: 'South Africa',
        operatesIn: 'South Africa, Zimbabwe, Botswana',
        experience: '6 years',
        interest: 'Clean Energy',
        workExperience: [
            {
                role: 'Field Sales Agent',
                company: 'SolarWave Africa',
                location: 'Johannesburg',
                period: '2019 - Present',
                achievements: [
                    'Installed 200+ solar units across rural communities',
                    'Exceeded sales targets by 30% for 3 consecutive years',
                ],
                successfulDealsRate: '90% Dealings',
            },
        ],
    },
    {
        id: 6,
        name: 'Amina Diop',
        location: 'Dakar, Senegal',
        rating: 4.6,
        title: 'Sales Agent',
        industry: 'Financial Technology',
        imageSrc: images.man6,
        bio: 'Results-driven sales agent with expertise in financial technology products. Strong community outreach and client onboarding skills.',
        languages: 'French (Fluent), Wolof (Native), English (Intermediate)',
        expectedRate: '£1,100 - £1,400 / month',
        availability: 'Full-time',
        reviews: 7,
        baseLocation: 'Senegal',
        operatesIn: 'Senegal, Mali, Guinea',
        experience: '3 years',
        interest: 'FinTech & Payments',
        workExperience: [
            {
                role: 'Sales Agent',
                company: 'WavePay Senegal',
                location: 'Dakar',
                period: '2022 - Present',
                achievements: [
                    'Onboarded 500+ merchants onto the platform',
                    'Top sales agent for Q3 and Q4 2023',
                ],
                successfulDealsRate: '87% Dealings',
            },
        ],
    },
    {
        id: 7,
        name: 'Thabo Molefe',
        location: 'Johannesburg, South Africa',
        rating: 4.6,
        title: 'Field Sales Agent',
        industry: 'Renewable Energy',
        imageSrc: images.man1,
        experience: '6 years',
        interest: 'Clean Energy',
        reviews: 10,
        baseLocation: 'South Africa',
        operatesIn: 'South Africa, Zimbabwe, Botswana',
    },
    {
        id: 8,
        name: 'Amina Diop',
        location: 'Dakar, Sengal',
        rating: 4.6,
        title: 'Sales Agent',
        industry: 'Financial Technology',
        imageSrc: images.man6,
        experience: '3 years',
        interest: 'FinTech & Payments',
        reviews: 7,
        baseLocation: 'Senegal',
        operatesIn: 'Senegal, Mali, Guinea',
    },
];
