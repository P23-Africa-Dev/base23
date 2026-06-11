import type { User, Message, ConversationListItem } from '@/types/messages';

export const DUMMY_CONNECTIONS: User[] = [
    { id: 101, name: 'Thabo Molefe',  profile_picture: 'https://randomuser.me/api/portraits/men/32.jpg',  title: 'Product Marketer, South Africa',   industry: 'Renewable Energy',     base_location: 'South Africa', operates_in: 'Ghana, South Africa', experience: '2 years', bio: 'Field Sales Agent specializing in clean energy and mobile money.' },
    { id: 102, name: 'Amina Diop',    profile_picture: 'https://randomuser.me/api/portraits/women/44.jpg', title: 'Sales Agent, Senegal',          industry: 'Financial Technology', base_location: 'Senegal', operates_in: 'Senegal', experience: '3 years', bio: 'Sales agent focused on payment integrations and WavePay expansion.' },
    { id: 103, name: 'Jamal Agoro',   profile_picture: 'https://randomuser.me/api/portraits/men/55.jpg',  title: 'Sales Manager, Nigeria',        industry: 'Fintech',              base_location: 'Nigeria', operates_in: 'Nigeria', experience: '5 years', bio: 'Sales manager with a focus on fintech solutions.' },
    { id: 104, name: 'Stephan Odili', profile_picture: 'https://randomuser.me/api/portraits/men/61.jpg',  title: 'Broker, Senegal',               industry: 'Real Estate',          base_location: 'Senegal', operates_in: 'Senegal', experience: '4 years', bio: 'Experienced real estate broker.' },
    { id: 105, name: 'Fatou Ndiaye',  profile_picture: 'https://randomuser.me/api/portraits/women/21.jpg', title: 'Business Development, Senegal', industry: 'Technology',           base_location: 'Senegal', operates_in: 'Senegal', experience: '3 years', bio: 'Business development manager in tech.' },
    { id: 106, name: 'Kwame Asante',  profile_picture: 'https://randomuser.me/api/portraits/men/76.jpg',  title: 'Account Executive, Ghana',    industry: 'Consulting',           base_location: 'Ghana', operates_in: 'Ghana', experience: '4 years', bio: 'Account executive in consulting.' },
    { id: 107, name: 'Ngozi Adeyemi', profile_picture: 'https://randomuser.me/api/portraits/women/68.jpg', title: 'Sales Consultant, Nigeria',     industry: 'Retail',               base_location: 'Nigeria', operates_in: 'Nigeria', experience: '3 years', bio: 'Retail sales consultant.' },
    { id: 108, name: 'Yusuf Ibrahim', profile_picture: 'https://randomuser.me/api/portraits/men/88.jpg',  title: 'Product Marketer, Kenya',     industry: 'Technology',           base_location: 'Kenya', operates_in: 'Kenya', experience: '2 years', bio: 'Product marketer in tech.' },
];

export function DEFAULT_DUMMY_CONVERSATIONS(currentUser: User): ConversationListItem[] {
    return [
        {
            id: 201,
            encrypted_id: 'conv_thabo_abc123',
            participants: [currentUser, DUMMY_CONNECTIONS[0]],
            unread_count: 2,
            last_message: { body: 'Yes, please.', created_at: '2026-06-09T06:30:00.000Z', is_read: false },
        },
        {
            id: 202,
            encrypted_id: 'conv_amina_def456',
            participants: [currentUser, DUMMY_CONNECTIONS[1]],
            unread_count: 0,
            last_message: { body: 'Thank you for the consideration.', created_at: '2026-06-09T05:15:00.000Z', is_read: true },
        },
        {
            id: 203,
            encrypted_id: 'conv_thabo_duplicate',
            participants: [currentUser, { ...DUMMY_CONNECTIONS[0], id: 109 }],
            unread_count: 0,
            last_message: { body: 'Yes, please.', created_at: '2026-06-09T04:30:00.000Z', is_read: true },
        },
    ];
}

export function createInitialMessagesMap(authUser: User): Record<string, Message[]> {
    return {
        'conv_thabo_abc123': [
            {
                id: 1001,
                body: "Hi Thabo, your profile came up as a top match for our expansion into Ghana. Your experience with merchant acquisitions in fintech looks very relevant.",
                user: authUser,
                created_at: "2026-06-09T04:30:00.000Z",
            },
            {
                id: 1002,
                body: "Good morning. Yes, I've spent the last two years onboarding merchants for a mobile money platform in South Africa. Happy to discuss how that could translate to your needs.",
                user: DUMMY_CONNECTIONS[0],
                created_at: "2026-06-09T05:30:00.000Z",
            },
        ],
        'conv_amina_def456': [
            {
                id: 2001,
                body: "Hello Amina, thank you for connecting. I saw you work at WavePay Senegal.",
                user: authUser,
                created_at: "2026-06-09T02:15:00.000Z",
            },
            {
                id: 2002,
                body: "Hi! Yes, that's correct. Thank you for the consideration.",
                user: DUMMY_CONNECTIONS[1],
                created_at: "2026-06-09T03:15:00.000Z",
            },
        ],
        'conv_thabo_duplicate': [
            {
                id: 3001,
                body: "Hi Thabo, checking in on the document you sent.",
                user: authUser,
                created_at: "2026-06-09T01:30:00.000Z",
            },
            {
                id: 3002,
                body: "Yes, please.",
                user: { ...DUMMY_CONNECTIONS[0], id: 109 },
                created_at: "2026-06-09T02:30:00.000Z",
            },
        ],
    };
}
