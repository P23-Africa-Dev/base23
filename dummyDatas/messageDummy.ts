// messageDummy.ts
export const dummyAuthUser = {
  id: 1,
  name: 'Rasheed Tolulope',
  profile_picture: 'https://ui-avatars.com/api/?name=Rasheed+Tolulope',
};

export const dummyUserA = {
  id: 2,
  name: 'Jane Cyber',
  title: 'Cyber Security Analyst',
  profile_picture: 'https://ui-avatars.com/api/?name=Jane+Cyber',
};

export const dummyUserB = {
  id: 3,
  name: 'Alex Writer',
  title: 'Content Writer',
  profile_picture: 'https://ui-avatars.com/api/?name=Alex+Writer',
};

export const dummyConversations = [
  {
    id: 101,
    encrypted_id: 'conv-101',
    title: null,
    participants: [dummyAuthUser, dummyUserA],
    last_message: {
      body: 'Are you available for a quick call?',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  },
  {
    id: 102,
    encrypted_id: 'conv-102',
    title: null,
    participants: [dummyAuthUser, dummyUserB],
    last_message: {
      body: 'I’ve sent the draft already',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dummyMessagesByConversation: Record<string, any[]> = {
  'conv-101': [
    {
      id: 1,
      body: 'Hi Jane 👋',
      user: dummyAuthUser,
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 2,
      body: 'Are you available for a quick call?',
      user: dummyUserA,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],

  'conv-102': [
    {
      id: 3,
      body: 'I’ve sent the draft already',
      user: dummyUserB,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 4,
      body: 'Great, I’ll review it shortly',
      user: dummyAuthUser,
      created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    },
  ],
};
