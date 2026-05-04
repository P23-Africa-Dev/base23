/**
 * Company Description Templates
 *
 * These templates are used during user onboarding to generate
 * pre-filled company descriptions based on prefill data.
 *
 * Available placeholders:
 * - {company_name} - The company's name
 * - {industry} - The industry/sector
 * - {country} - Company's country/location
 * - {years_of_operation} - How long the company has been operating
 * - {year_established} - The year the company was founded
 * - {number_of_employees} - Employee count/range
 * - {name} - User's name (CEO/Leader name)
 * - {offer_value} - What the company offers/delivers
 */

export type CompanyData = {
    company_name?: string;
    industry?: string;
    country?: string;
    years_of_operation?: string;
    year_established?: string;
    number_of_employees?: string;
    name?: string;
    offer_value?: string;
};

type TemplateFunction = (data: CompanyData) => string;

const templates: TemplateFunction[] = [
    // Template 1
    (data) =>
        `${data.company_name || '[Company Name]'} is a leading force in the ${data.industry || '[industry]'} industry, operating in ${data.country || '[country]'} for over ${data.years_of_operation || '[years_of_operation]'} years. Founded in ${data.year_established || '[year_established]'}, the company has grown to a team of ${data.number_of_employees || '[number_of_employees]'} professionals dedicated to excellence. Under the leadership of ${data.name || '[name]'}, the organization delivers ${data.offer_value || '[offer_value]'} with a commitment to quality, innovation, and long-term impact.`,

    // Template 2
    (data) =>
        `Founded in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has established a strong footprint within the ${data.industry || '[industry]'} sector in ${data.country || '[country]'}. With a workforce of ${data.number_of_employees || '[number_of_employees]'}, the company leverages cutting-edge technology and progressive strategies to deliver ${data.offer_value || '[offer_value]'}. Led by ${data.name || '[name]'}, ${data.company_name || '[company_name]'} continues to innovate and expand after ${data.years_of_operation || '[years_of_operation]'} years of consistent growth.`,

    // Template 3
    (data) =>
        `For over ${data.years_of_operation || '[years_of_operation]'} years, ${data.company_name || '[company_name]'} has served as a trusted provider in the ${data.industry || '[industry]'} sector across ${data.country || '[country]'}. Established in ${data.year_established || '[year_established]'}, the company now employs more than ${data.number_of_employees || '[number_of_employees]'} skilled professionals committed to customer satisfaction. Guided by ${data.name || '[name]'}, the organization focuses on delivering ${data.offer_value || '[offer_value]'} that meets the evolving needs of its clients.`,

    // Template 4
    (data) =>
        `${data.company_name || '[company_name]'}, headquartered in ${data.country || '[country]'}, has operated in the ${data.industry || '[industry]'} landscape since ${data.year_established || '[year_established]'}. With ${data.years_of_operation || '[years_of_operation]'} years of industry expertise and a team of ${data.number_of_employees || '[number_of_employees]'}, the company offers ${data.offer_value || '[offer_value]'} to clients across international markets. Led by ${data.name || '[name]'}, ${data.company_name || '[company_name]'} continues to strengthen its role as a globally competitive brand.`,

    // Template 5
    (data) =>
        `Since its inception in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has experienced consistent growth in the ${data.industry || '[industry]'} sector. Operating in ${data.country || '[country]'} with ${data.number_of_employees || '[number_of_employees]'} employees, the company leverages ${data.offer_value || '[offer_value]'} to drive its expansion. Under the visionary leadership of ${data.name || '[name]'}, the organization celebrates ${data.years_of_operation || '[years_of_operation]'} years of purpose-driven success.`,

    // Template 6
    (data) =>
        `Led by ${data.name || '[name]'}, ${data.company_name || '[company_name]'} is a respected name in the ${data.industry || '[industry]'} industry in ${data.country || '[country]'}. Founded in ${data.year_established || '[year_established]'}, the company has grown over ${data.years_of_operation || '[years_of_operation]'} years to employ ${data.number_of_employees || '[number_of_employees]'} dedicated professionals. ${data.company_name || '[company_name]'} stands out for providing ${data.offer_value || '[offer_value]'}, backed by strong leadership and operational excellence.`,

    // Template 7
    (data) =>
        `Established in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has become one of ${data.country || '[country]'}'s most reliable brands in the ${data.industry || '[industry]'} industry. With ${data.number_of_employees || '[number_of_employees]'} employees and ${data.years_of_operation || '[years_of_operation]'} years of solid performance, the company delivers ${data.offer_value || '[offer_value]'} with a focus on reliability, professionalism, and long-lasting value. The company is spearheaded by ${data.name || '[name]'}.`,

    // Template 8
    (data) =>
        `${data.company_name || '[company_name]'} is a technology-forward organization transforming the ${data.industry || '[industry]'} landscape in ${data.country || '[country]'}. Since ${data.year_established || '[year_established]'}, the company has utilized advanced tools, a workforce of ${data.number_of_employees || '[number_of_employees]'}, and progressive leadership under ${data.name || '[name]'} to deliver ${data.offer_value || '[offer_value]'}. After ${data.years_of_operation || '[years_of_operation]'} years, the company continues to set new benchmarks in innovation.`,

    // Template 9
    (data) =>
        `Driven by a clear mission and purpose, ${data.company_name || '[company_name]'} has operated in the ${data.industry || '[industry]'} sector since ${data.year_established || '[year_established]'}. Based in ${data.country || '[country]'}, the organization employs ${data.number_of_employees || '[number_of_employees]'} professionals dedicated to delivering ${data.offer_value || '[offer_value]'}. Over ${data.years_of_operation || '[years_of_operation]'} years, ${data.name || '[name]'} has guided the company toward impactful and sustainable growth.`,

    // Template 10
    (data) =>
        `For ${data.years_of_operation || '[years_of_operation]'} years, ${data.company_name || '[company_name]'} has provided world-class solutions within the ${data.industry || '[industry]'} industry. Operating from ${data.country || '[country]'} with a team of ${data.number_of_employees || '[number_of_employees]'}, the company specializes in delivering ${data.offer_value || '[offer_value]'} tailored to client needs. Founded in ${data.year_established || '[year_established]'} and led by ${data.name || '[name]'}, the company continues to exceed expectations.`,

    // Template 11
    (data) =>
        `${data.company_name || '[company_name]'} is a high-impact organization known for excellence in the ${data.industry || '[industry]'} field. Established in ${data.year_established || '[year_established]'} and based in ${data.country || '[country]'}, the company now employs ${data.number_of_employees || '[number_of_employees]'} skilled experts offering ${data.offer_value || '[offer_value]'}. With ${data.years_of_operation || '[years_of_operation]'} years of growth under ${data.name || '[name]'}, the brand remains a benchmark for quality and performance.`,

    // Template 12
    (data) =>
        `With a legacy spanning ${data.years_of_operation || '[years_of_operation]'} years, ${data.company_name || '[company_name]'} stands as a respected leader in the ${data.industry || '[industry]'} industry. Founded in ${data.year_established || '[year_established]'} in ${data.country || '[country]'}, the organization employs ${data.number_of_employees || '[number_of_employees]'} exceptional professionals delivering ${data.offer_value || '[offer_value]'}. The company continues to evolve and thrive under the direction of ${data.name || '[name]'}.`,

    // Template 13
    (data) =>
        `Since ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has built a strategic presence in ${data.country || '[country]'}'s ${data.industry || '[industry]'} industry. With a team of ${data.number_of_employees || '[number_of_employees]'} and over ${data.years_of_operation || '[years_of_operation]'} years of operational excellence, the company is known for offering ${data.offer_value || '[offer_value]'}. Led by ${data.name || '[name]'}, the organization continues to shape the future of its sector.`,

    // Template 14
    (data) =>
        `Operating in ${data.country || '[country]'} for ${data.years_of_operation || '[years_of_operation]'} years, ${data.company_name || '[company_name]'} has grown into a regional leader within the ${data.industry || '[industry]'} sector. Founded in ${data.year_established || '[year_established]'}, the company employs ${data.number_of_employees || '[number_of_employees]'} experts focusing on ${data.offer_value || '[offer_value]'}. Its steady rise is driven by the strategic leadership of ${data.name || '[name]'}.`,

    // Template 15
    (data) =>
        `${data.company_name || '[company_name]'} is a trusted partner in the ${data.industry || '[industry]'} industry, serving clients across ${data.country || '[country]'}. Since its founding in ${data.year_established || '[year_established]'}, the company has expanded to ${data.number_of_employees || '[number_of_employees]'} employees and delivers ${data.offer_value || '[offer_value]'} with unmatched consistency. With ${data.years_of_operation || '[years_of_operation]'} years of experience, the company thrives under ${data.name || '[name]'}'s leadership.`,

    // Template 16
    (data) =>
        `Established in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} continues to position itself as a competitive leader in the ${data.industry || '[industry]'} market in ${data.country || '[country]'}. With ${data.years_of_operation || '[years_of_operation]'} years of operations and a team of ${data.number_of_employees || '[number_of_employees]'}, the company provides ${data.offer_value || '[offer_value]'} with a future-focused mindset. Guided by ${data.name || '[name]'}, the brand remains agile and forward-thinking.`,

    // Template 17
    (data) =>
        `Over the past ${data.years_of_operation || '[years_of_operation]'} years, ${data.company_name || '[company_name]'} has built a reputation for excellence in the ${data.industry || '[industry]'} industry. Based in ${data.country || '[country]'} and founded in ${data.year_established || '[year_established]'}, the company employs ${data.number_of_employees || '[number_of_employees]'} staff known for delivering ${data.offer_value || '[offer_value]'}. Led by ${data.name || '[name]'}, the organization continues to prioritize high performance and innovation.`,

    // Template 18
    (data) =>
        `With ${data.number_of_employees || '[number_of_employees]'} dedicated professionals, ${data.company_name || '[company_name]'} is a strong player in the ${data.industry || '[industry]'} market. Founded in ${data.year_established || '[year_established]'} and operating in ${data.country || '[country]'} for ${data.years_of_operation || '[years_of_operation]'} years, the company offers ${data.offer_value || '[offer_value]'} backed by operational excellence. The leadership of ${data.name || '[name]'} continues to fuel the organization's growth.`,

    // Template 19
    (data) =>
        `${data.company_name || '[company_name]'} was founded in ${data.year_established || '[year_established]'} with a mission to redefine the ${data.industry || '[industry]'} landscape in ${data.country || '[country]'}. With ${data.years_of_operation || '[years_of_operation]'} years of experience and a workforce of ${data.number_of_employees || '[number_of_employees]'}, the company focuses on delivering ${data.offer_value || '[offer_value]'} that creates lasting value. At the helm is ${data.name || '[name]'}, whose vision drives the company's evolution.`,

    // Template 20
    (data) =>
        `Since its establishment in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has taken a holistic approach to delivering ${data.offer_value || '[offer_value]'} within the ${data.industry || '[industry]'} sector. Operating in ${data.country || '[country]'} with a team of ${data.number_of_employees || '[number_of_employees]'}, the company has maintained steady growth throughout its ${data.years_of_operation || '[years_of_operation]'} years of operation. Under ${data.name || '[name]'}'s leadership, the company continues to build meaningful impact across its market.`,

    // Template 21
    (data) =>
        `Since its establishment in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has set the gold standard in the ${data.industry || '[industry]'} industry across ${data.country || '[country]'}. With a refined team of ${data.number_of_employees || '[number_of_employees]'} specialists and over ${data.years_of_operation || '[years_of_operation]'} years of mastery, the company delivers ${data.offer_value || '[offer_value]'} with unmatched precision. Led by ${data.name || '[name]'}, the brand represents elegance, excellence, and timeless craftsmanship.`,

    // Template 22
    (data) =>
        `Founded in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} is redefining the future of the ${data.industry || '[industry]'} sector in ${data.country || '[country]'}. In just ${data.years_of_operation || '[years_of_operation]'} years, the team of ${data.number_of_employees || '[number_of_employees]'} innovators has created groundbreaking solutions offering ${data.offer_value || '[offer_value]'}. Under ${data.name || '[name]'}'s leadership, the company continues to challenge the status quo and accelerate impactful change.`,

    // Template 23
    (data) =>
        `${data.company_name || '[company_name]'} is a cutting-edge fintech company transforming ${data.industry || '[industry]'} services across ${data.country || '[country]'}. Established in ${data.year_established || '[year_established]'}, the company uses digital innovation and a team of ${data.number_of_employees || '[number_of_employees]'} experts to deliver ${data.offer_value || '[offer_value]'}. With ${data.years_of_operation || '[years_of_operation]'} years of industry disruption, ${data.name || '[name]'} leads the mission to make financial ecosystems smarter, faster, and more inclusive.`,

    // Template 24
    (data) =>
        `Since ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has been committed to creating sustainable impact within the ${data.industry || '[industry]'} sector in ${data.country || '[country]'}. With ${data.number_of_employees || '[number_of_employees]'} passionate team members and ${data.years_of_operation || '[years_of_operation]'} years of service, the organization focuses on ${data.offer_value || '[offer_value]'} that strengthens communities and empowers people. Guided by ${data.name || '[name]'}, the mission continues to transform lives.`,

    // Template 25
    (data) =>
        `${data.company_name || '[company_name]'}, established in ${data.year_established || '[year_established]'}, operates in the ${data.industry || '[industry]'} sector in ${data.country || '[country]'}. For ${data.years_of_operation || '[years_of_operation]'} years, the company has relied on a dedicated team of ${data.number_of_employees || '[number_of_employees]'} to deliver ${data.offer_value || '[offer_value]'} with clarity, simplicity, and consistency. Under the direction of ${data.name || '[name]'}, the organization stands for precision and reliability.`,

    // Template 26
    (data) =>
        `For over ${data.years_of_operation || '[years_of_operation]'} years, ${data.company_name || '[company_name]'} has been shaking up the ${data.industry || '[industry]'} industry in ${data.country || '[country]'}. Founded in ${data.year_established || '[year_established]'}, the company's ${data.number_of_employees || '[number_of_employees]'}-strong team delivers ${data.offer_value || '[offer_value]'} with passion and unstoppable energy. Led by ${data.name || '[name]'}, the company continues to grow, innovate, and dominate its market space.`,

    // Template 27
    (data) =>
        `Established in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} is a technology-led organization pioneering AI-powered solutions in the ${data.industry || '[industry]'} sector. Operating in ${data.country || '[country]'} with ${data.number_of_employees || '[number_of_employees]'} engineers and professionals, the company delivers ${data.offer_value || '[offer_value]'} through intelligent automation. With ${data.name || '[name]'} at the helm and ${data.years_of_operation || '[years_of_operation]'} years of advancement, the company remains a leader in next-generation innovation.`,

    // Template 28
    (data) =>
        `Since ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has upheld a legacy of excellence in the ${data.industry || '[industry]'} field in ${data.country || '[country]'}. With ${data.years_of_operation || '[years_of_operation]'} years in practice and a dedicated workforce of ${data.number_of_employees || '[number_of_employees]'}, the company provides ${data.offer_value || '[offer_value]'} rooted in tradition, integrity, and trust. Under ${data.name || '[name]'}'s steady leadership, the organization continues to honor its heritage.`,

    // Template 29
    (data) =>
        `${data.company_name || '[company_name]'} has spent the past ${data.years_of_operation || '[years_of_operation]'} years strengthening communities across ${data.country || '[country]'} through its work in the ${data.industry || '[industry]'} sector. Founded in ${data.year_established || '[year_established]'}, the company employs ${data.number_of_employees || '[number_of_employees]'} caring professionals focused on delivering ${data.offer_value || '[offer_value]'} that improves everyday lives. ${data.name || '[name]'} leads with compassion and commitment to social progress.`,

    // Template 30
    (data) =>
        `Founded in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} is an environmentally conscious leader in the ${data.industry || '[industry]'} industry in ${data.country || '[country]'}. With ${data.number_of_employees || '[number_of_employees]'} eco-driven experts and over ${data.years_of_operation || '[years_of_operation]'} years of sustainable operations, the company delivers ${data.offer_value || '[offer_value]'} while prioritizing the planet. Guided by ${data.name || '[name]'}, the organization remains committed to green transformation.`,

    // Template 31
    (data) =>
        `${data.company_name || '[company_name]'} is a powerhouse in the ${data.industry || '[industry]'} sector, established in ${data.year_established || '[year_established]'} and headquartered in ${data.country || '[country]'}. With a robust team of ${data.number_of_employees || '[number_of_employees]'} and ${data.years_of_operation || '[years_of_operation]'} years of industrial excellence, the company delivers ${data.offer_value || '[offer_value]'} using advanced engineering and precision technology. Under ${data.name || '[name]'}'s leadership, the company sets new technical standards.`,

    // Template 32
    (data) =>
        `Since ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has operated as a boutique provider within the ${data.industry || '[industry]'} sector in ${data.country || '[country]'}. With a specialized team of ${data.number_of_employees || '[number_of_employees]'}, the company delivers tailored ${data.offer_value || '[offer_value]'} built on expertise and personal attention. Led by ${data.name || '[name]'}, the brand offers exclusive, high-quality services refined over ${data.years_of_operation || '[years_of_operation]'} years.`,

    // Template 33
    (data) =>
        `${data.company_name || '[company_name]'} started in ${data.year_established || '[year_established]'} with a simple mission: to make ${data.industry || '[industry]'} better in ${data.country || '[country]'}. Today, with ${data.number_of_employees || '[number_of_employees]'} passionate creators and ${data.years_of_operation || '[years_of_operation]'} years of learning, the company delivers ${data.offer_value || '[offer_value]'} designed to help people thrive. Under ${data.name || '[name]'}'s leadership, the company grows with heart and purpose.`,

    // Template 34
    (data) =>
        `Established in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} operates within the ${data.industry || '[industry]'} sector in ${data.country || '[country]'} and has upheld high standards for ${data.years_of_operation || '[years_of_operation]'} years. Supported by a workforce of ${data.number_of_employees || '[number_of_employees]'}, the organization provides ${data.offer_value || '[offer_value]'} in alignment with national development priorities. Under the stewardship of ${data.name || '[name]'}, the institution continues to contribute to public advancement.`,

    // Template 35
    (data) =>
        `${data.company_name || '[company_name]'} is a premier B2B organization specializing in ${data.industry || '[industry]'} solutions across ${data.country || '[country]'}. Since ${data.year_established || '[year_established]'}, the company has expanded to ${data.number_of_employees || '[number_of_employees]'} professionals delivering ${data.offer_value || '[offer_value]'} designed for enterprise-level performance. With ${data.years_of_operation || '[years_of_operation]'} years of excellence under ${data.name || '[name]'}'s leadership, the company remains a trusted strategic partner to top-tier businesses.`,

    // Template 36
    (data) =>
        `Launched in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} is a creative powerhouse in the ${data.industry || '[industry]'} field in ${data.country || '[country]'}. With a vibrant team of ${data.number_of_employees || '[number_of_employees]'} creators and ${data.years_of_operation || '[years_of_operation]'} years of artistic expression, the company delivers ${data.offer_value || '[offer_value]'} through imagination and craftsmanship. Guided by ${data.name || '[name]'}, the brand brings ideas to life with flair.`,

    // Template 37
    (data) =>
        `With ${data.years_of_operation || '[years_of_operation]'} years of dynamic growth since ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} stands as one of the most modern brands in ${data.country || '[country]'}'s ${data.industry || '[industry]'} sector. Supported by ${data.number_of_employees || '[number_of_employees]'} energetic professionals, the company offers ${data.offer_value || '[offer_value]'} designed for the next generation. Under ${data.name || '[name]'}'s forward-thinking leadership, the brand continues to evolve at speed.`,

    // Template 38
    (data) =>
        `Founded in ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has devoted ${data.years_of_operation || '[years_of_operation]'} years to serving the ${data.industry || '[industry]'} needs of communities across ${data.country || '[country]'}. With ${data.number_of_employees || '[number_of_employees]'} compassionate staff, the organization delivers ${data.offer_value || '[offer_value]'} that uplifts and protects vulnerable populations. Led by ${data.name || '[name]'}, the mission remains rooted in empathy and compassion.`,

    // Template 39
    (data) =>
        `${data.company_name || '[company_name]'}, established in ${data.year_established || '[year_established]'}, operates at the intersection of data and ${data.industry || '[industry]'} in ${data.country || '[country]'}. With ${data.number_of_employees || '[number_of_employees]'} analytical professionals and ${data.years_of_operation || '[years_of_operation]'} years of measurable success, the company delivers ${data.offer_value || '[offer_value]'} powered by insights and evidence. Under ${data.name || '[name]'}'s guidance, the organization continues to make precision-driven decisions.`,

    // Template 40
    (data) =>
        `Since ${data.year_established || '[year_established]'}, ${data.company_name || '[company_name]'} has pursued a bold vision to transform the ${data.industry || '[industry]'} landscape in ${data.country || '[country]'}. Now in its ${data.years_of_operation || '[years_of_operation]'} year of growth with ${data.number_of_employees || '[number_of_employees]'} dedicated employees, the company provides ${data.offer_value || '[offer_value]'} shaped by ambition and long-term thinking. Under ${data.name || '[name]'}'s visionary leadership, the organization continues to reach new heights.`,
];

/**
 * Get a random company description template populated with company data
 * @param data - Company data to populate the template
 * @returns A populated company description string
 */
export function getRandomCompanyDescription(data: CompanyData): string {
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex](data);
}

/**
 * Get a specific template by index (0-39)
 * @param index - Template index (0-39)
 * @param data - Company data to populate the template
 * @returns A populated company description string
 */
export function getCompanyDescriptionByIndex(index: number, data: CompanyData): string {
    const safeIndex = Math.max(0, Math.min(index, templates.length - 1));
    return templates[safeIndex](data);
}

/**
 * Get all templates populated with company data
 * @param data - Company data to populate the templates
 * @returns Array of all populated company descriptions
 */
export function getAllCompanyDescriptions(data: CompanyData): string[] {
    return templates.map((template) => template(data));
}

/**
 * Get the total number of available templates
 * @returns Number of templates (40)
 */
export function getTemplateCount(): number {
    return templates.length;
}

export default templates;
