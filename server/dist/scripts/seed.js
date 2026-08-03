"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j_1 = require("../config/neo4j");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Helper to generate UUIDs
const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
// Seed arrays
const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Berlin, Germany', 'London, UK', 'Toronto, Canada', 'Remote', 'Chicago, IL', 'Denver, CO'];
const industries = ['AI & Machine Learning', 'FinTech', 'E-commerce', 'HealthTech', 'SaaS', 'EdTech', 'Cybersecurity', 'Cloud Infrastructure', 'Web3 & Blockchain'];
const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Edward', 'Stephanie'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
const companyNames = [
    'Wexa AI', 'Nebula Systems', 'Apex Ledger', 'Zeta Health', 'CloudForge', 'Cognitive Labs', 'ChainCraft', 'BioSphere', 'LogiTech Solutions', 'DevFlow',
    'ByteArmor', 'Zenith Fin', 'Aura Commerce', 'Vortex AI', 'Synthetix', 'DataVibe', 'SecureNet', 'Quantum Computing', 'HyperLoop Technologies', 'Stellar Media',
    'Pulse Systems', 'Omni Retail', 'SyncLabs', 'Veritas', 'Nova AI', 'EcoSphere', 'BlockScale', 'Optima Health', 'BlueHorizon', 'TrueSecure',
    'Elevate', 'AeroSpace.io', 'Peak Dev', 'CoreLogic', 'InnoWave', 'Delta Analytics', 'Matrix Solutions', 'MetaWork', 'SkyLine SaaS', 'SwiftPay',
    'Integra Tech', 'Prism AI', 'Apex Cyber', 'Helix Bio', 'CoreStack', 'Flux Ventures', 'Signal.io', 'Aether Labs', 'Enigma Security', 'Vivid Interactive'
];
const skillCategories = {
    Frontend: ['React', 'TypeScript', 'TailwindCSS', 'Next.js', 'Vue.js', 'Svelte', 'HTML5', 'CSS3', 'Redux', 'GraphQL', 'Apollo Client', 'Webpack', 'Cypress', 'Jest'],
    Backend: ['Node.js', 'Express', 'NestJS', 'Go', 'Python', 'FastAPI', 'Django', 'Ruby on Rails', 'Spring Boot', 'Java', 'Rust', 'gRPC', 'WebSockets', 'GraphQL API'],
    Database: ['PostgreSQL', 'MongoDB', 'Redis', 'Neo4j', 'openCypher', 'MySQL', 'DynamoDB', 'Cassandra', 'Elasticsearch', 'SQL Server'],
    DevOps: ['Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'Terraform', 'CI/CD', 'GitHub Actions', 'Jenkins', 'Linux', 'Ansible', 'Nginx'],
    AI: ['PyTorch', 'TensorFlow', 'OpenAI API', 'LangChain', 'Hugging Face', 'NLP', 'Computer Vision', 'Pandas', 'NumPy', 'Scikit-learn', 'LLMs'],
    Mobile: ['React Native', 'Swift', 'Kotlin', 'Flutter', 'iOS Development', 'Android Development']
};
const technologiesList = [
    { name: 'React', category: 'Frontend', desc: 'A JavaScript library for building user interfaces' },
    { name: 'TypeScript', category: 'Frontend', desc: 'Typed superset of JavaScript' },
    { name: 'Next.js', category: 'Frontend', desc: 'The React Framework for the Web' },
    { name: 'TailwindCSS', category: 'Frontend', desc: 'A utility-first CSS framework' },
    { name: 'GraphQL', category: 'API', desc: 'A query language for APIs' },
    { name: 'Node.js', category: 'Backend', desc: 'JavaScript runtime built on Chromes V8 engine' },
    { name: 'Express', category: 'Backend', desc: 'Fast, unopinionated, minimalist web framework for Node.js' },
    { name: 'NestJS', category: 'Backend', desc: 'A progressive Node.js framework for building efficient server-side apps' },
    { name: 'FastAPI', category: 'Backend', desc: 'A modern, fast, web framework for building APIs with Python' },
    { name: 'Python', category: 'Backend', desc: 'Programming language that lets you work quickly and integrate systems' },
    { name: 'Go', category: 'Backend', desc: 'An open-source programming language supported by Google' },
    { name: 'Rust', category: 'Backend', desc: 'A language empowering everyone to build reliable and efficient software' },
    { name: 'PostgreSQL', category: 'Database', desc: 'A powerful, open-source object-relational database system' },
    { name: 'Neo4j', category: 'Database', desc: 'A native graph database' },
    { name: 'Redis', category: 'Database', desc: 'In-memory data structure store used as a database, cache, and message broker' },
    { name: 'MongoDB', category: 'Database', desc: 'Document-based distributed database' },
    { name: 'Docker', category: 'DevOps', desc: 'Pack software into standardized units for development and deployment' },
    { name: 'Kubernetes', category: 'DevOps', desc: 'Open-source system for automating deployment, scaling, and management of containerized apps' },
    { name: 'Terraform', category: 'DevOps', desc: 'Infrastructure as Code software tool' },
    { name: 'AWS', category: 'Cloud', desc: 'Amazon Web Services cloud platform' },
    { name: 'Google Cloud', category: 'Cloud', desc: 'Google Cloud Platform' },
    { name: 'PyTorch', category: 'AI', desc: 'An open source machine learning library' },
    { name: 'LangChain', category: 'AI', desc: 'Framework for developing applications powered by language models' },
    { name: 'OpenAI API', category: 'AI', desc: 'Access to state-of-the-art models developed by OpenAI' }
];
const projectTemplates = [
    { name: 'GraphAI Agent', desc: 'An autonomous agent that reasons over Neo4j knowledge graphs' },
    { name: 'FinSecure Pay', desc: 'A decentralized micro-transaction payment gateway with fraud detection' },
    { name: 'HealthSync IoT', desc: 'Real-time patient telemetry monitoring using WebSockets and timeseries database' },
    { name: 'Nebula Commerce', desc: 'A high-performance storefront built with Next.js App Router and Redis caching' },
    { name: 'DevFlow Analytics', desc: 'Developer productivity tracking by ingesting Git events and displaying heatmaps' },
    { name: 'ChainScale Chain', desc: 'Layer 2 scaling solution for EVM-based blockchains using ZK-Rollups' },
    { name: 'SecureLocker Vault', desc: 'Zero-knowledge end-to-end encrypted file sharing and identity verification client' },
    { name: 'SmartOps Cloud', desc: 'Kubernetes autoscaling operator using predictive AI and resource usage metrics' },
    { name: 'Aura Chat', desc: 'Collaborative real-time design platform with multiplayer canvas using CRDTs' },
    { name: 'ModelHub LLM', desc: 'Distributed training dashboard for hosting and evaluating open-source LLMs' }
];
const jobsTemplates = [
    { title: 'Senior Full Stack Engineer', desc: 'Looking for a Senior React + Node developer to build interactive visual analytics dashboards.' },
    { title: 'Graph Database Architect', desc: 'Manage enterprise graph database clusters. Write optimized Cypher queries for recommendation engines.' },
    { title: 'AI Research Engineer', desc: 'Implement Retrieval-Augmented Generation (RAG) applications using LangChain, Neo4j, and Python.' },
    { title: 'DevOps Platform Engineer', desc: 'Manage Kubernetes infrastructure on AWS. Set up CI/CD pipelines with GitHub Actions.' },
    { title: 'Frontend Engineer (React)', desc: 'Build stunning interactive web experiences. Proficiency in TailwindCSS and Framer Motion is a must.' },
    { title: 'Backend Software Engineer (Go)', desc: 'Design high-throughput, low-latency microservices using Go, gRPC, and PostgreSQL.' }
];
const communityTemplates = [
    { name: 'Neo4j Builders', desc: 'Global community of developers building graph-powered software.' },
    { name: 'React 19 Early Adopters', desc: 'Discussing server components, actions, and features of React 19.' },
    { name: 'AI Engineering Roundtable', desc: 'A group of engineers building production-grade AI applications.' },
    { name: 'DevOps & GitOps Guild', desc: 'Sharing best practices on infrastructure as code, CI/CD, and kubernetes.' },
    { name: 'TypeScript Fanatics', desc: 'Deep dives into advanced type structures and compiler APIs.' }
];
const seedData = async () => {
    const session = (0, neo4j_1.getSession)();
    try {
        console.log('Generating seed data...');
        // 1. Generate Skills
        const skills = [];
        Object.entries(skillCategories).forEach(([category, skillNames]) => {
            skillNames.forEach((name) => {
                skills.push({
                    id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name,
                    category
                });
            });
        });
        // Add extra generic skills to hit 100
        for (let i = skills.length; i < 100; i++) {
            skills.push({
                id: `skill-${i}`,
                name: `Skill ${i}`,
                category: 'Other'
            });
        }
        // 2. Generate Technologies
        const technologies = technologiesList.map((t) => ({
            id: t.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: t.name,
            category: t.category,
            description: t.desc
        }));
        // 3. Generate Companies
        const companies = companyNames.map((name, index) => {
            const id = `company-${index + 1}`;
            return {
                id,
                name,
                industry: industries[index % industries.length],
                size: sizes[index % sizes.length],
                location: locations[index % locations.length],
                websiteUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.io`,
                logoUrl: `https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&auto=format&fit=crop&q=60`,
                description: `Leading innovator in ${industries[index % industries.length]} driving digital transformation with bleeding-edge tools.`
            };
        });
        // 4. Generate Communities
        const communities = communityTemplates.map((c, index) => {
            const id = `community-${index + 1}`;
            return {
                id,
                name: c.name,
                membersCount: Math.floor(Math.random() * 5000) + 500,
                url: `https://community.wexa.ai/${c.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                description: c.desc
            };
        });
        // 5. Generate Projects (200 Projects)
        const projects = [];
        for (let i = 1; i <= 200; i++) {
            const template = projectTemplates[i % projectTemplates.length];
            projects.push({
                id: `project-${i}`,
                name: `${template.name} v${Math.floor(i / 10) + 1}`,
                description: `${template.desc}. Created as open source tool, widely adopted.`,
                stars: Math.floor(Math.random() * 2000) + 50,
                status: Math.random() > 0.15 ? 'Active' : 'Completed'
            });
        }
        // 6. Generate Repositories
        // We map a repository to each project
        const repositories = projects.map((p, index) => {
            return {
                id: `repo-${index + 1}`,
                name: p.name.toLowerCase().replace(/\s+/g, '-'),
                url: `https://github.com/wexa-network/${p.name.toLowerCase().replace(/\s+/g, '-')}`,
                description: p.description,
                stars: p.stars,
                forks: Math.floor(p.stars / 4),
                language: ['TypeScript', 'Python', 'Go', 'Rust', 'JavaScript'][index % 5]
            };
        });
        // 7. Generate Jobs (100 Jobs)
        const jobs = [];
        for (let i = 1; i <= 100; i++) {
            const company = companies[i % companies.length];
            const template = jobsTemplates[i % jobsTemplates.length];
            jobs.push({
                id: `job-${i}`,
                title: `${company.name} - ${template.title}`,
                description: template.desc,
                salaryRange: `$${Math.floor(Math.random() * 80) + 100}k - $${Math.floor(Math.random() * 80) + 180}k`,
                location: Math.random() > 0.4 ? company.location : 'Remote',
                type: Math.random() > 0.2 ? 'Full-Time' : 'Contract',
                companyId: company.id
            });
        }
        // 8. Generate Developers (300 Developers)
        // Hash password for authentication
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        const developers = [];
        const roles = ['Senior Full Stack Engineer', 'Lead AI Engineer', 'Backend Devops Architect', 'Senior Developer', 'Principal Engineer', 'VP of Engineering', 'Frontend Lead', 'Cloud Specialist', 'Junior Full Stack Engineer', 'Staff Product Engineer'];
        for (let i = 1; i <= 300; i++) {
            const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
            const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
            const name = `${fn} ${ln}`;
            const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@wexa.ai`;
            const role = roles[i % roles.length];
            developers.push({
                id: `dev-${i}`,
                name,
                email,
                password: hashedPassword,
                role,
                bio: `Passionate developer building high-quality platforms. Specializing in Node.js, distributed systems, and graph analytics. Mentor, open-source contributor.`,
                experienceYears: Math.floor(Math.random() * 15) + 2,
                avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 1234}?w=150&auto=format&fit=crop&q=60`,
                githubUrl: `https://github.com/${fn.toLowerCase()}${ln.toLowerCase()}`,
                linkedinUrl: `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}`,
                location: locations[i % locations.length],
                hourlyRate: Math.floor(Math.random() * 100) + 60,
                verified: Math.random() > 0.3
            });
        }
        console.log('Injecting Nodes...');
        // Batch insert Skills
        await session.run(`
      UNWIND $batch AS s
      CREATE (skill:Skill {id: s.id, name: s.name, category: s.category})
    `, { batch: skills });
        console.log(`Seeded ${skills.length} Skill nodes.`);
        // Batch insert Technologies
        await session.run(`
      UNWIND $batch AS t
      CREATE (tech:Technology {id: t.id, name: t.name, category: t.category, description: t.description})
    `, { batch: technologies });
        console.log(`Seeded ${technologies.length} Technology nodes.`);
        // Batch insert Companies
        await session.run(`
      UNWIND $batch AS c
      CREATE (comp:Company {
        id: c.id, 
        name: c.name, 
        industry: c.industry, 
        size: c.size, 
        location: c.location, 
        websiteUrl: c.websiteUrl, 
        logoUrl: c.logoUrl, 
        description: c.description
      })
    `, { batch: companies });
        console.log(`Seeded ${companies.length} Company nodes.`);
        // Batch insert Communities
        await session.run(`
      UNWIND $batch AS com
      CREATE (comm:Community {
        id: com.id, 
        name: com.name, 
        membersCount: toInteger(com.membersCount), 
        url: com.url, 
        description: com.description
      })
    `, { batch: communities });
        console.log(`Seeded ${communities.length} Community nodes.`);
        // Batch insert Projects
        await session.run(`
      UNWIND $batch AS p
      CREATE (proj:Project {
        id: p.id, 
        name: p.name, 
        description: p.description, 
        stars: toInteger(p.stars), 
        status: p.status
      })
    `, { batch: projects });
        console.log(`Seeded ${projects.length} Project nodes.`);
        // Batch insert Repositories
        await session.run(`
      UNWIND $batch AS r
      CREATE (repo:Repository {
        id: r.id, 
        name: r.name, 
        url: r.url, 
        description: r.description, 
        stars: toInteger(r.stars), 
        forks: toInteger(r.forks), 
        language: r.language
      })
    `, { batch: repositories });
        console.log(`Seeded ${repositories.length} Repository nodes.`);
        // Batch insert Jobs
        await session.run(`
      UNWIND $batch AS j
      CREATE (job:Job {
        id: j.id, 
        title: j.title, 
        description: j.description, 
        salaryRange: j.salaryRange, 
        location: j.location, 
        type: j.type
      })
    `, { batch: jobs });
        console.log(`Seeded ${jobs.length} Job nodes.`);
        // Link Jobs to Companies
        const jobCompanyLinks = jobs.map((j) => ({ jobId: j.id, companyId: j.companyId }));
        await session.run(`
      UNWIND $batch AS link
      MATCH (j:Job {id: link.jobId})
      MATCH (c:Company {id: link.companyId})
      CREATE (c)-[:POSTED]->(j)
    `, { batch: jobCompanyLinks });
        console.log('Linked Jobs to Companies.');
        // Batch insert Developers
        await session.run(`
      UNWIND $batch AS d
      CREATE (dev:Developer:Person {
        id: d.id,
        name: d.name,
        email: d.email,
        password: d.password,
        role: d.role,
        bio: d.bio,
        experienceYears: toInteger(d.experienceYears),
        avatarUrl: d.avatarUrl,
        githubUrl: d.githubUrl,
        linkedinUrl: d.linkedinUrl,
        location: d.location,
        hourlyRate: toInteger(d.hourlyRate),
        verified: toBoolean(d.verified)
      })
    `, { batch: developers });
        console.log(`Seeded ${developers.length} Developer nodes.`);
        console.log('Linking Relationships...');
        // 9. Links: Developer -> HAS_SKILL
        // Assign random skills based on role
        const devSkills = [];
        developers.forEach((d, idx) => {
            // Choose 6 to 12 skills
            const count = Math.floor(Math.random() * 7) + 6;
            const shuffled = [...skills].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            // Boost with React and GraphQL for some developers to make specific query validation possible
            if (idx < 50) {
                if (!selected.some(s => s.name === 'React')) {
                    selected.push(skills.find(s => s.name === 'React') || skills[0]);
                }
                if (!selected.some(s => s.name === 'GraphQL')) {
                    selected.push(skills.find(s => s.name === 'GraphQL') || skills[1]);
                }
            }
            selected.forEach((s) => {
                devSkills.push({
                    devId: d.id,
                    skillId: s.id,
                    level: ['Beginner', 'Intermediate', 'Expert'][Math.floor(Math.random() * 3)]
                });
            });
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (d:Developer {id: link.devId})
      MATCH (s:Skill {id: link.skillId})
      CREATE (d)-[:HAS_SKILL {level: link.level}]->(s)
    `, { batch: devSkills });
        console.log(`Created ${devSkills.length} HAS_SKILL relationships.`);
        // 10. Links: Developer -> USES -> Technology
        const devTech = [];
        developers.forEach((d) => {
            const count = Math.floor(Math.random() * 5) + 4;
            const shuffled = [...technologies].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            selected.forEach((t) => {
                devTech.push({
                    devId: d.id,
                    techId: t.id,
                    yearsOfExperience: Math.floor(Math.random() * Math.min(d.experienceYears, 8)) + 1
                });
            });
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (d:Developer {id: link.devId})
      MATCH (t:Technology {id: link.techId})
      CREATE (d)-[:USES {yearsOfExperience: toInteger(link.yearsOfExperience)}]->(t)
    `, { batch: devTech });
        console.log(`Created ${devTech.length} USES (Technology) relationships.`);
        // 11. Links: Company -> USES -> Technology
        const companyTech = [];
        companies.forEach((c) => {
            const count = Math.floor(Math.random() * 6) + 5;
            const shuffled = [...technologies].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            selected.forEach((t) => {
                companyTech.push({
                    companyId: c.id,
                    techId: t.id
                });
            });
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (c:Company {id: link.companyId})
      MATCH (t:Technology {id: link.techId})
      CREATE (c)-[:USES]->(t)
    `, { batch: companyTech });
        console.log(`Created ${companyTech.length} Company -> USES -> Technology relationships.`);
        // 12. Links: Job -> REQUIRES -> Skill
        const jobSkills = [];
        jobs.forEach((j) => {
            const count = Math.floor(Math.random() * 4) + 3;
            const shuffled = [...skills].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            selected.forEach((s) => {
                jobSkills.push({
                    jobId: j.id,
                    skillId: s.id
                });
            });
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (j:Job {id: link.jobId})
      MATCH (s:Skill {id: link.skillId})
      CREATE (j)-[:REQUIRES]->(s)
    `, { batch: jobSkills });
        console.log(`Created ${jobSkills.length} Job -> REQUIRES -> Skill relationships.`);
        // 13. Links: Job -> REQUIRES -> Technology
        const jobTech = [];
        jobs.forEach((j) => {
            const count = Math.floor(Math.random() * 3) + 2;
            const shuffled = [...technologies].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            selected.forEach((t) => {
                jobTech.push({
                    jobId: j.id,
                    techId: t.id
                });
            });
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (j:Job {id: link.jobId})
      MATCH (t:Technology {id: link.techId})
      CREATE (j)-[:REQUIRES]->(t)
    `, { batch: jobTech });
        console.log(`Created ${jobTech.length} Job -> REQUIRES -> Technology relationships.`);
        // 14. Links: Project -> USES -> Technology & Repository -> USES -> Technology
        const projectTech = [];
        const repoTech = [];
        projects.forEach((p, idx) => {
            const count = Math.floor(Math.random() * 4) + 2;
            const shuffled = [...technologies].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            selected.forEach((t) => {
                projectTech.push({
                    projectId: p.id,
                    techId: t.id
                });
                repoTech.push({
                    repoId: repositories[idx].id,
                    techId: t.id
                });
            });
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (p:Project {id: link.projectId})
      MATCH (t:Technology {id: link.techId})
      CREATE (p)-[:USES]->(t)
    `, { batch: projectTech });
        await session.run(`
      UNWIND $batch AS link
      MATCH (r:Repository {id: link.repoId})
      MATCH (t:Technology {id: link.techId})
      CREATE (r)-[:USES]->(t)
    `, { batch: repoTech });
        console.log(`Linked Projects and Repositories to Technologies.`);
        // 15. Link Project to Repository
        const projectRepoLinks = projects.map((p, idx) => ({ projectId: p.id, repoId: repositories[idx].id }));
        await session.run(`
      UNWIND $batch AS link
      MATCH (p:Project {id: link.projectId})
      MATCH (r:Repository {id: link.repoId})
      CREATE (p)-[:HAS_REPOSITORY]->(r)
    `, { batch: projectRepoLinks });
        console.log('Linked Projects to their Repositories.');
        // 16. Links: Developer -> WORKED_AT -> Company
        const workedAt = [];
        developers.forEach((d) => {
            // 1 or 2 past/current companies
            const jobsCount = Math.random() > 0.4 ? 2 : 1;
            const shuffledCompanies = [...companies].sort(() => 0.5 - Math.random());
            for (let j = 0; j < jobsCount; j++) {
                const isCurrent = j === 0;
                workedAt.push({
                    devId: d.id,
                    companyId: shuffledCompanies[j].id,
                    role: d.role,
                    startDate: `20${Math.floor(Math.random() * 5) + 16}-01-15`,
                    endDate: isCurrent ? null : `2021-08-30`
                });
            }
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (d:Developer {id: link.devId})
      MATCH (c:Company {id: link.companyId})
      CREATE (d)-[:WORKED_AT {role: link.role, startDate: link.startDate, endDate: link.endDate}]->(c)
    `, { batch: workedAt });
        console.log(`Created ${workedAt.length} WORKED_AT relationships.`);
        // 17. Links: Developer -> CONTRIBUTED_TO -> Repository
        const contributions = [];
        developers.forEach((d) => {
            const count = Math.floor(Math.random() * 3) + 1; // 1 to 3 repos
            const shuffledRepos = [...repositories].sort(() => 0.5 - Math.random());
            const selected = shuffledRepos.slice(0, count);
            selected.forEach((r) => {
                contributions.push({
                    devId: d.id,
                    repoId: r.id,
                    commitsCount: Math.floor(Math.random() * 150) + 5
                });
            });
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (d:Developer {id: link.devId})
      MATCH (r:Repository {id: link.repoId})
      CREATE (d)-[:CONTRIBUTED_TO {commitsCount: toInteger(link.commitsCount)}]->(r)
    `, { batch: contributions });
        console.log(`Created ${contributions.length} CONTRIBUTED_TO relationships.`);
        // 18. Links: Developer -> MEMBER_OF -> Community
        const memberOf = [];
        developers.forEach((d) => {
            const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 communities
            const shuffledComm = [...communities].sort(() => 0.5 - Math.random());
            const selected = shuffledComm.slice(0, count);
            selected.forEach((c) => {
                memberOf.push({
                    devId: d.id,
                    communityId: c.id
                });
            });
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (d:Developer {id: link.devId})
      MATCH (c:Community {id: link.communityId})
      CREATE (d)-[:MEMBER_OF]->(c)
    `, { batch: memberOf });
        console.log(`Created ${memberOf.length} MEMBER_OF relationships.`);
        // 19. Links: Developer -> KNOWS -> Developer (Constructing network structure)
        // To ensure the network is connected and has clear path-finding patterns:
        // We link developers index to neighbors (e.g. index i knows i+1, i+2, and a few random ones)
        const knows = [];
        developers.forEach((d, idx) => {
            // Connect to next 3 devs to create a ring/backbone path structure
            for (let j = 1; j <= 3; j++) {
                const nextIdx = (idx + j) % developers.length;
                knows.push({
                    devId1: d.id,
                    devId2: developers[nextIdx].id,
                    since: '2022-05-10'
                });
            }
            // 4 more random dev connections
            const randomCount = 4;
            for (let j = 0; j < randomCount; j++) {
                const randIdx = Math.floor(Math.random() * developers.length);
                if (randIdx !== idx) {
                    knows.push({
                        devId1: d.id,
                        devId2: developers[randIdx].id,
                        since: '2023-11-20'
                    });
                }
            }
        });
        // Deduplicate knows links to avoid duplicates
        const uniqueKnowsMap = new Map();
        knows.forEach((k) => {
            const key = [k.devId1, k.devId2].sort().join('_');
            uniqueKnowsMap.set(key, k);
        });
        const uniqueKnows = Array.from(uniqueKnowsMap.values());
        await session.run(`
      UNWIND $batch AS link
      MATCH (d1:Developer {id: link.devId1})
      MATCH (d2:Developer {id: link.devId2})
      MERGE (d1)-[:KNOWS {since: link.since}]-(d2)
    `, { batch: uniqueKnows });
        console.log(`Created ${uniqueKnows.length} mutual KNOWS relationships.`);
        // 20. Links: Developer -> MENTORED_BY -> Developer
        // Linking younger devs to senior devs with more experience
        const mentorships = [];
        developers.forEach((d) => {
            if (d.experienceYears < 6) {
                // Find a mentor who has 8+ experience years
                const mentors = developers.filter((m) => m.experienceYears >= 10);
                if (mentors.length > 0) {
                    const mentor = mentors[Math.floor(Math.random() * mentors.length)];
                    mentorships.push({
                        menteeId: d.id,
                        mentorId: mentor.id
                    });
                }
            }
        });
        await session.run(`
      UNWIND $batch AS link
      MATCH (mentee:Developer {id: link.menteeId})
      MATCH (mentor:Developer {id: link.mentorId})
      CREATE (mentee)-[:MENTORED_BY]->(mentor)
    `, { batch: mentorships });
        console.log(`Created ${mentorships.length} MENTORED_BY relationships.`);
        console.log('Database seeding successfully completed.');
    }
    catch (error) {
        console.error('Error during database seeding:', error);
    }
    finally {
        await session.close();
        await (0, neo4j_1.closeDriver)();
    }
};
seedData();
