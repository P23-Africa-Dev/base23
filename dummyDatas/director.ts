import images from '@/constants/image';

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
};

export const dummyDirectorLeads: DirectorUser[] = [
    {
        id: 1,
        name: 'Jamal Agoro',
        location: 'Dakar, Senegal',
        rating: 4.6,
        title: 'Sales Manager',
        imageSrc: images.businessMan1, // replace with actual mapped image if needed
        experience: '8 years',
        interest: 'Strategy & Finance',
        industry: 'Fintech',
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
    },
    {
        id: 6,
        name: 'Amina Diop',
        location: 'Dakar, Sengal',
        rating: 4.6,
        title: 'Sales Agent',
        industry: 'Financial Technology',
        imageSrc: images.man6, // placeholder
    },
    {
        id: 7,
        name: 'Thabo Molefe',
        location: 'Johannesburg, South Africa',
        rating: 4.6,
        title: 'Field Sales Agent',
        industry: 'Renewable Energy',
        imageSrc: images.man1,
    },
    {
        id: 8,
        name: 'Amina Diop',
        location: 'Dakar, Sengal',
        rating: 4.6,
        title: 'Sales Agent',
        industry: 'Financial Technology',
        imageSrc: images.man6, // placeholder
    },
];
