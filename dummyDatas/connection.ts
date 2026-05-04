import images from '@/constants/image';

export type Connection = {
  id: number;
  name: string;
  role: string;
  company: string;
  image: string;
  compatibility: number;
};

/** Pool of available profile images */
const imagePool = [
  images.man1,
  images.man2,
  images.man3,
  images.man4,
  images.man5,
  images.man6,
];

/** Helper to pick a random image */
const randomImage = () =>
  imagePool[Math.floor(Math.random() * imagePool.length)];

/** Dummy connections (20) */
export const connections: Connection[] = [
  {
    id: 1,
    name: 'Jamal Agoro',
    role: 'CTO',
    company: 'AfriLaw',
    image: randomImage(),
    compatibility: 92,
  },
  {
    id: 2,
    name: 'Kwame Williams',
    role: 'CTO',
    company: 'AfriLaw',
    image: randomImage(),
    compatibility: 88,
  },
  {
    id: 3,
    name: 'Stephan Odili',
    role: 'Startup Founder',
    company: 'LaunchPad',
    image: randomImage(),
    compatibility: 95,
  },
  {
    id: 4,
    name: 'Tunde Adebayo',
    role: 'Growth Lead',
    company: 'ScaleX',
    image: randomImage(),
    compatibility: 90,
  },
  {
    id: 5,
    name: 'Michael James',
    role: 'Software Engineer',
    company: 'DevCore',
    image: randomImage(),
    compatibility: 85,
  },
  {
    id: 6,
    name: 'Ayo Benson',
    role: 'UX Researcher',
    company: 'DesignHub',
    image: randomImage(),
    compatibility: 89,
  },
  {
    id: 7,
    name: 'Kelvin Musa',
    role: 'DevOps Engineer',
    company: 'CloudNine',
    image: randomImage(),
    compatibility: 87,
  },
  {
    id: 8,
    name: 'Ibrahim Lawal',
    role: 'AI Engineer',
    company: 'NeuroTech',
    image: randomImage(),
    compatibility: 94,
  },
  {
    id: 9,
    name: 'Sola Ade',
    role: 'Marketing Lead',
    company: 'BrandCraft',
    image: randomImage(),
    compatibility: 91,
  },
  {
    id: 10,
    name: 'Daniel Smith',
    role: 'Tech Consultant',
    company: 'InnovateX',
    image: randomImage(),
    compatibility: 86,
  },
  {
    id: 11,
    name: 'Chinedu Okorie',
    role: 'Product Manager',
    company: 'BuildIt',
    image: randomImage(),
    compatibility: 90,
  },
  {
    id: 12,
    name: 'Sarah Johnson',
    role: 'Data Analyst',
    company: 'InsightLab',
    image: randomImage(),
    compatibility: 88,
  },
  {
    id: 13,
    name: 'Ahmed Bello',
    role: 'Security Engineer',
    company: 'SecureNet',
    image: randomImage(),
    compatibility: 93,
  },
  {
    id: 14,
    name: 'Grace Thompson',
    role: 'HR Lead',
    company: 'PeopleOps',
    image: randomImage(),
    compatibility: 84,
  },
  {
    id: 15,
    name: 'Victor Ojo',
    role: 'Mobile Engineer',
    company: 'AppForge',
    image: randomImage(),
    compatibility: 89,
  },
  {
    id: 16,
    name: 'Emily Carter',
    role: 'QA Engineer',
    company: 'TestRight',
    image: randomImage(),
    compatibility: 87,
  },
  {
    id: 17,
    name: 'Yusuf Abdullahi',
    role: 'Blockchain Developer',
    company: 'ChainWorks',
    image: randomImage(),
    compatibility: 92,
  },
  {
    id: 18,
    name: 'Oluwaseun Akinwale',
    role: 'Technical Writer',
    company: 'DocuPro',
    image: randomImage(),
    compatibility: 85,
  },
  {
    id: 19,
    name: 'Nathan Brooks',
    role: 'Solutions Architect',
    company: 'CloudBridge',
    image: randomImage(),
    compatibility: 94,
  },
  {
    id: 20,
    name: 'Zainab Mohammed',
    role: 'Business Analyst',
    company: 'StrategyLab',
    image: randomImage(),
    compatibility: 90,
  },
];
