/**
 * Deterministic seed dataset for the Developer Skill & Job Recommendation Graph.
 *
 * Design notes
 * ------------
 * - Nothing here is random. The dataset is built from explicit records plus
 *   index arithmetic, so seeding twice always produces the identical graph and
 *   the screenshots in the README always match what a reviewer sees.
 *
 * - Skills are referenced by *name* throughout (projects, jobs, developers) and
 *   resolved to ids at the end of this file. That keeps the data readable and
 *   makes a typo a hard error instead of a silently missing relationship.
 *
 * - Developers are generated from 10 stack archetypes x 5 variants. Each
 *   variant differs in seniority, location and one or two extra skills, which
 *   is what produces the spread of strong / partial / weak matches the
 *   recommendation UI needs in order to be interesting.
 *
 * - Project skills are deliberately *not* a subset of their developers' listed
 *   skills. A developer who shipped the Payments Ledger Service may never have
 *   listed RabbitMQ on their profile - and surfacing exactly that gap is the
 *   point of the multi-hop Developer -> Project -> Skill -> Job query.
 *
 * Totals: 50 developers, 30 skills, 25 projects, 40 jobs, 10 companies.
 */

/* -------------------------------------------------------------------------- */
/* Skills (30)                                                                */
/* -------------------------------------------------------------------------- */

const SKILL_DEFINITIONS = [
  // Frontend
  ['React', 'Frontend'],
  ['Next.js', 'Frontend'],
  ['TypeScript', 'Frontend'],
  ['JavaScript', 'Frontend'],
  ['Tailwind CSS', 'Frontend'],
  ['Redux', 'Frontend'],
  ['HTML/CSS', 'Frontend'],
  // Backend
  ['Node.js', 'Backend'],
  ['Express.js', 'Backend'],
  ['Java', 'Backend'],
  ['Spring Boot', 'Backend'],
  ['Python', 'Backend'],
  ['Django', 'Backend'],
  ['FastAPI', 'Backend'],
  ['REST APIs', 'Backend'],
  // API & messaging
  ['GraphQL', 'API & Messaging'],
  ['RabbitMQ', 'API & Messaging'],
  // Data stores
  ['PostgreSQL', 'Database'],
  ['MongoDB', 'Database'],
  ['MySQL', 'Database'],
  ['Redis', 'Database'],
  ['Neo4j', 'Database'],
  ['Elasticsearch', 'Database'],
  // Cloud & DevOps
  ['Docker', 'Cloud & DevOps'],
  ['Kubernetes', 'Cloud & DevOps'],
  ['AWS', 'Cloud & DevOps'],
  ['CI/CD', 'Cloud & DevOps'],
  ['Terraform', 'Cloud & DevOps'],
  // Tooling & quality
  ['Git', 'Tooling & Quality'],
  ['Jest', 'Tooling & Quality'],
];

export const skills = SKILL_DEFINITIONS.map(([name, category], index) => ({
  id: `skill-${String(index + 1).padStart(3, '0')}`,
  name,
  category,
}));

const skillIdByName = new Map(skills.map((skill) => [skill.name, skill.id]));

/** Resolve a skill name to its id, failing loudly on a typo. */
function skillId(name) {
  const id = skillIdByName.get(name);
  if (!id) throw new Error(`Unknown skill in seed data: "${name}"`);
  return id;
}

/* -------------------------------------------------------------------------- */
/* Companies (10)                                                             */
/* -------------------------------------------------------------------------- */

export const companies = [
  {
    id: 'company-001',
    name: 'TechNova',
    industry: 'B2B SaaS',
    location: 'Bengaluru',
    description:
      'Workflow automation platform used by mid-market operations teams across Asia.',
  },
  {
    id: 'company-002',
    name: 'Finlytix',
    industry: 'Fintech',
    location: 'Mumbai',
    description:
      'Payments and reconciliation infrastructure for lending and wealth platforms.',
  },
  {
    id: 'company-003',
    name: 'MedGraph Health',
    industry: 'Healthtech',
    location: 'Hyderabad',
    description:
      'Clinical data platform connecting hospital records, labs and care pathways.',
  },
  {
    id: 'company-004',
    name: 'Kartway Commerce',
    industry: 'E-commerce',
    location: 'Pune',
    description:
      'Commerce and fulfilment stack powering multi-brand online retailers.',
  },
  {
    id: 'company-005',
    name: 'Streamline Labs',
    industry: 'Developer Tools',
    location: 'Bengaluru',
    description:
      'Developer tooling company building API gateways and component libraries.',
  },
  {
    id: 'company-006',
    name: 'Aurora Analytics',
    industry: 'Data & Analytics',
    location: 'Hyderabad',
    description:
      'Product analytics and search relevance platform for consumer applications.',
  },
  {
    id: 'company-007',
    name: 'CivicStack',
    industry: 'GovTech',
    location: 'Delhi NCR',
    description:
      'Citizen service portals and public records systems for state governments.',
  },
  {
    id: 'company-008',
    name: 'Voltaro Mobility',
    industry: 'Mobility',
    location: 'Chennai',
    description:
      'Fleet telemetry and route optimisation for electric commercial vehicles.',
  },
  {
    id: 'company-009',
    name: 'LearnLoop',
    industry: 'EdTech',
    location: 'Remote',
    description:
      'Cohort-based learning platform with live classes and progress tracking.',
  },
  {
    id: 'company-010',
    name: 'NimbusCloud Systems',
    industry: 'Cloud Infrastructure',
    location: 'Pune',
    description:
      'Managed Kubernetes and observability tooling for regulated industries.',
  },
];

/* -------------------------------------------------------------------------- */
/* Projects (25)                                                              */
/* -------------------------------------------------------------------------- */

const PROJECT_DEFINITIONS = [
  {
    name: 'Retail Storefront Revamp',
    type: 'Web Application',
    description:
      'Rebuilt a high-traffic storefront with server-side rendering and a Redis-backed catalogue cache.',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
  },
  {
    name: 'Payments Ledger Service',
    type: 'API Service',
    description:
      'Double-entry ledger handling settlement events, with an asynchronous reconciliation pipeline.',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'RabbitMQ', 'Docker'],
  },
  {
    name: 'Patient Records Portal',
    type: 'Web Application',
    description:
      'Clinician-facing portal for consolidated patient history, lab results and visit notes.',
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB'],
  },
  {
    name: 'Order Fulfilment Dashboard',
    type: 'Internal Tool',
    description:
      'Operations dashboard tracking order state transitions across warehouses in near real time.',
    skills: ['React', 'Redux', 'TypeScript', 'REST APIs', 'Tailwind CSS'],
  },
  {
    name: 'Recommendation Graph Prototype',
    type: 'Prototype',
    description:
      'Graph-backed content recommendation prototype exposed through a thin GraphQL layer.',
    skills: ['Neo4j', 'Node.js', 'GraphQL'],
  },
  {
    name: 'Realtime Analytics Pipeline',
    type: 'Data Platform',
    description:
      'Event ingestion and rollup pipeline feeding dashboards with sub-minute freshness.',
    skills: ['Python', 'FastAPI', 'Elasticsearch', 'Docker', 'AWS'],
  },
  {
    name: 'Multi-tenant Billing API',
    type: 'API Service',
    description:
      'Usage metering and invoicing API with per-tenant isolation and idempotent write paths.',
    skills: ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'Jest'],
  },
  {
    name: 'Infrastructure Migration to Kubernetes',
    type: 'Migration',
    description:
      'Moved 40+ services from virtual machines to a managed Kubernetes platform with zero downtime.',
    skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
  },
  {
    name: 'Course Delivery Platform',
    type: 'Web Application',
    description:
      'Learner-facing course player with offline progress sync and instructor scheduling.',
    skills: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
  },
  {
    name: 'Fraud Signal Detection Service',
    type: 'API Service',
    description:
      'Rules and velocity checks scoring transactions against historical behaviour windows.',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
  },
  {
    name: 'Fleet Telemetry Ingestion',
    type: 'Data Platform',
    description:
      'Ingests high-frequency vehicle telemetry and indexes it for operational search.',
    skills: ['Java', 'Spring Boot', 'RabbitMQ', 'Elasticsearch', 'Docker'],
  },
  {
    name: 'Design System Component Library',
    type: 'Open Source',
    description:
      'Accessible, themeable React component library published as an internal package.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Jest', 'Git'],
  },
  {
    name: 'Citizen Services Portal',
    type: 'Web Application',
    description:
      'Public portal for certificate applications, status tracking and grievance filing.',
    skills: ['React', 'Java', 'Spring Boot', 'MySQL'],
  },
  {
    name: 'Internal Admin Console',
    type: 'Internal Tool',
    description:
      'Role-scoped admin console for support staff to inspect and correct account state.',
    skills: ['React', 'Node.js', 'Express.js', 'PostgreSQL'],
  },
  {
    name: 'GraphQL Gateway Consolidation',
    type: 'API Service',
    description:
      'Replaced six overlapping REST endpoints with a single schema-stitched GraphQL gateway.',
    skills: ['GraphQL', 'Node.js', 'TypeScript', 'Redis'],
  },
  {
    name: 'CI/CD Pipeline Standardisation',
    type: 'Internal Tool',
    description:
      'Unified build, test and release pipelines across repositories with reusable templates.',
    skills: ['CI/CD', 'Docker', 'Git', 'AWS', 'Terraform'],
  },
  {
    name: 'Inventory Sync Microservice',
    type: 'API Service',
    description:
      'Reconciles stock levels between warehouse systems and the storefront via a message queue.',
    skills: ['Node.js', 'MongoDB', 'RabbitMQ', 'Docker'],
  },
  {
    name: 'Clinical Data Warehouse',
    type: 'Data Platform',
    description:
      'Batch pipelines normalising clinical records into a query-friendly warehouse schema.',
    skills: ['Python', 'PostgreSQL', 'AWS', 'Docker'],
  },
  {
    name: 'Mobile Banking Backend',
    type: 'Mobile Backend',
    description:
      'Account, transfer and statement APIs for a retail mobile banking application.',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'REST APIs'],
  },
  {
    name: 'Search Relevance Tuning',
    type: 'Data Platform',
    description:
      'Improved catalogue search precision through analyzer tuning and click-signal reranking.',
    skills: ['Elasticsearch', 'Python', 'FastAPI'],
  },
  {
    name: 'Marketing Site Rebuild',
    type: 'Web Application',
    description:
      'Statically generated marketing site with a content model editors can manage themselves.',
    skills: ['Next.js', 'React', 'Tailwind CSS', 'HTML/CSS'],
  },
  {
    name: 'Observability Stack Rollout',
    type: 'Internal Tool',
    description:
      'Centralised metrics, logs and alerting across clusters with per-team dashboards.',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'],
  },
  {
    name: 'Learner Progress Service',
    type: 'API Service',
    description:
      'Tracks lesson completion and streaks, exposed to clients through a GraphQL schema.',
    skills: ['Node.js', 'Express.js', 'MongoDB', 'GraphQL', 'Jest'],
  },
  {
    name: 'Loan Origination Workflow',
    type: 'Web Application',
    description:
      'Multi-step loan application workflow with document checks and approval routing.',
    skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
  },
  {
    name: 'Warehouse Route Optimiser',
    type: 'API Service',
    description:
      'Computes pick-path and delivery routes under vehicle capacity and time-window constraints.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
  },
];

export const projects = PROJECT_DEFINITIONS.map((project, index) => ({
  id: `project-${String(index + 1).padStart(3, '0')}`,
  name: project.name,
  description: project.description,
  type: project.type,
}));

const projectIdByName = new Map(projects.map((project) => [project.name, project.id]));

function projectId(name) {
  const id = projectIdByName.get(name);
  if (!id) throw new Error(`Unknown project in seed data: "${name}"`);
  return id;
}

/** Project -[:USES]-> Skill */
export const projectSkillRelationships = PROJECT_DEFINITIONS.flatMap((project) =>
  project.skills.map((skill) => ({
    projectId: projectId(project.name),
    skillId: skillId(skill),
  }))
);

/* -------------------------------------------------------------------------- */
/* Jobs (40) - four per company                                               */
/* -------------------------------------------------------------------------- */

const JOB_DEFINITIONS = [
  // --- TechNova ------------------------------------------------------------
  {
    company: 'TechNova',
    title: 'Full Stack Developer',
    location: 'Bengaluru',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Own features end to end across a React frontend and a Node service layer backed by PostgreSQL.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
  },
  {
    company: 'TechNova',
    title: 'Frontend Engineer',
    location: 'Bengaluru',
    experienceRequired: 2,
    employmentType: 'Full-time',
    description:
      'Build the workflow builder UI with a strong focus on state modelling and interaction detail.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Redux'],
  },
  {
    company: 'TechNova',
    title: 'Backend Engineer',
    location: 'Bengaluru',
    experienceRequired: 4,
    employmentType: 'Full-time',
    description:
      'Design and operate the automation execution APIs, including queueing and retry semantics.',
    skills: ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'REST APIs'],
  },
  {
    company: 'TechNova',
    title: 'Platform Engineer',
    location: 'Bengaluru',
    experienceRequired: 5,
    employmentType: 'Full-time',
    description:
      'Run the multi-tenant deployment platform and keep release pipelines fast and predictable.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
  },

  // --- Finlytix ------------------------------------------------------------
  {
    company: 'Finlytix',
    title: 'Java Backend Engineer',
    location: 'Mumbai',
    experienceRequired: 4,
    employmentType: 'Full-time',
    description:
      'Extend the settlement ledger and its asynchronous reconciliation workers.',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'RabbitMQ', 'Docker'],
  },
  {
    company: 'Finlytix',
    title: 'Senior Backend Engineer',
    location: 'Mumbai',
    experienceRequired: 6,
    employmentType: 'Full-time',
    description:
      'Lead the core banking integration layer and mentor engineers on transactional correctness.',
    skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Redis'],
  },
  {
    company: 'Finlytix',
    title: 'Risk Platform Engineer',
    location: 'Mumbai',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Build scoring services that evaluate transaction risk against historical behaviour.',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
  },
  {
    company: 'Finlytix',
    title: 'Frontend Developer',
    location: 'Mumbai',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Build reconciliation and reporting screens used daily by operations analysts.',
    skills: ['React', 'TypeScript', 'Redux', 'REST APIs'],
  },

  // --- MedGraph Health -----------------------------------------------------
  {
    company: 'MedGraph Health',
    title: 'Full Stack Developer',
    location: 'Hyderabad',
    experienceRequired: 2,
    employmentType: 'Full-time',
    description:
      'Ship clinician-facing features across the records portal and its Node API.',
    skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Git'],
  },
  {
    company: 'MedGraph Health',
    title: 'Data Engineer',
    location: 'Hyderabad',
    experienceRequired: 4,
    employmentType: 'Full-time',
    description:
      'Build and maintain the batch pipelines that normalise incoming clinical records.',
    skills: ['Python', 'PostgreSQL', 'AWS', 'Docker'],
  },
  {
    company: 'MedGraph Health',
    title: 'Graph Data Engineer',
    location: 'Hyderabad',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Model care pathways as a graph and expose traversals to product teams via GraphQL.',
    skills: ['Neo4j', 'Node.js', 'GraphQL', 'TypeScript'],
  },
  {
    company: 'MedGraph Health',
    title: 'QA Automation Engineer',
    location: 'Hyderabad',
    experienceRequired: 2,
    employmentType: 'Full-time',
    description:
      'Grow the automated regression suite and wire it into the release pipeline.',
    skills: ['Jest', 'JavaScript', 'Git', 'CI/CD'],
  },

  // --- Kartway Commerce ----------------------------------------------------
  {
    company: 'Kartway Commerce',
    title: 'Senior Full Stack Developer',
    location: 'Pune',
    experienceRequired: 5,
    employmentType: 'Full-time',
    description:
      'Lead checkout and fulfilment features across the storefront and its service layer.',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker'],
  },
  {
    company: 'Kartway Commerce',
    title: 'Search Engineer',
    location: 'Pune',
    experienceRequired: 4,
    employmentType: 'Full-time',
    description:
      'Improve catalogue search precision and latency across millions of listings.',
    skills: ['Elasticsearch', 'Python', 'FastAPI'],
  },
  {
    company: 'Kartway Commerce',
    title: 'Backend Developer',
    location: 'Pune',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Own inventory synchronisation between warehouse systems and the storefront.',
    skills: ['Node.js', 'MongoDB', 'RabbitMQ', 'Docker'],
  },
  {
    company: 'Kartway Commerce',
    title: 'UI Engineer',
    location: 'Pune',
    experienceRequired: 2,
    employmentType: 'Full-time',
    description:
      'Translate design work into fast, accessible storefront interfaces.',
    skills: ['React', 'Tailwind CSS', 'HTML/CSS', 'JavaScript'],
  },

  // --- Streamline Labs -----------------------------------------------------
  {
    company: 'Streamline Labs',
    title: 'Developer Experience Engineer',
    location: 'Bengaluru',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Improve the SDKs, examples and local tooling our customers build against.',
    skills: ['TypeScript', 'React', 'Jest', 'Git'],
  },
  {
    company: 'Streamline Labs',
    title: 'API Platform Engineer',
    location: 'Bengaluru',
    experienceRequired: 4,
    employmentType: 'Full-time',
    description:
      'Evolve the GraphQL gateway that fronts every internal service.',
    skills: ['Node.js', 'GraphQL', 'TypeScript', 'Redis'],
  },
  {
    company: 'Streamline Labs',
    title: 'Infrastructure Engineer',
    location: 'Bengaluru',
    experienceRequired: 5,
    employmentType: 'Full-time',
    description:
      'Own cluster provisioning, autoscaling policy and infrastructure as code.',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Docker'],
  },
  {
    company: 'Streamline Labs',
    title: 'Component Library Maintainer',
    location: 'Remote',
    experienceRequired: 4,
    employmentType: 'Contract',
    description:
      'Maintain and document the open source component library, including release management.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Jest', 'Git'],
  },

  // --- Aurora Analytics ----------------------------------------------------
  {
    company: 'Aurora Analytics',
    title: 'Analytics Engineer',
    location: 'Hyderabad',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Model product event data into the aggregates that power customer dashboards.',
    skills: ['Python', 'PostgreSQL', 'Elasticsearch', 'Docker'],
  },
  {
    company: 'Aurora Analytics',
    title: 'Backend Engineer (Python)',
    location: 'Hyderabad',
    experienceRequired: 4,
    employmentType: 'Full-time',
    description:
      'Build the query APIs that serve dashboard reads under tight latency budgets.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
  },
  {
    company: 'Aurora Analytics',
    title: 'Data Platform Engineer',
    location: 'Hyderabad',
    experienceRequired: 5,
    employmentType: 'Full-time',
    description:
      'Own the ingestion and storage layer end to end, from schema to cluster sizing.',
    skills: ['Python', 'AWS', 'Docker', 'Elasticsearch', 'Terraform'],
  },
  {
    company: 'Aurora Analytics',
    title: 'Frontend Engineer (Dashboards)',
    location: 'Remote',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Build the charting and exploration surfaces analysts use every day.',
    skills: ['React', 'TypeScript', 'Redux', 'HTML/CSS'],
  },

  // --- CivicStack ----------------------------------------------------------
  {
    company: 'CivicStack',
    title: 'Full Stack Developer (Java + React)',
    location: 'Delhi NCR',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Deliver citizen-facing services across a Spring Boot backend and React frontend.',
    skills: ['Java', 'Spring Boot', 'React', 'MySQL'],
  },
  {
    company: 'CivicStack',
    title: 'Java Developer',
    location: 'Delhi NCR',
    experienceRequired: 2,
    employmentType: 'Full-time',
    description:
      'Build and maintain records and certificate-issuance services.',
    skills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
  },
  {
    company: 'CivicStack',
    title: 'DevOps Engineer',
    location: 'Delhi NCR',
    experienceRequired: 4,
    employmentType: 'Full-time',
    description:
      'Automate deployments for on-premise and cloud environments under audit constraints.',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Git'],
  },
  {
    company: 'CivicStack',
    title: 'Accessibility Frontend Developer',
    location: 'Delhi NCR',
    experienceRequired: 2,
    employmentType: 'Full-time',
    description:
      'Bring public-facing screens to accessibility compliance and keep them there.',
    skills: ['React', 'HTML/CSS', 'JavaScript', 'Jest'],
  },

  // --- Voltaro Mobility ----------------------------------------------------
  {
    company: 'Voltaro Mobility',
    title: 'Telemetry Backend Engineer',
    location: 'Chennai',
    experienceRequired: 4,
    employmentType: 'Full-time',
    description:
      'Scale the ingestion path for high-frequency vehicle telemetry.',
    skills: ['Java', 'Spring Boot', 'RabbitMQ', 'Elasticsearch', 'Docker'],
  },
  {
    company: 'Voltaro Mobility',
    title: 'Mobile Backend Engineer',
    location: 'Chennai',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Build the APIs behind the driver and fleet-manager mobile applications.',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'REST APIs'],
  },
  {
    company: 'Voltaro Mobility',
    title: 'Route Optimisation Engineer',
    location: 'Chennai',
    experienceRequired: 4,
    employmentType: 'Full-time',
    description:
      'Improve routing quality under capacity, charging and time-window constraints.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
  },
  {
    company: 'Voltaro Mobility',
    title: 'Cloud Engineer',
    location: 'Chennai',
    experienceRequired: 5,
    employmentType: 'Full-time',
    description:
      'Own cloud topology, cost and reliability for the telemetry platform.',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD'],
  },

  // --- LearnLoop -----------------------------------------------------------
  {
    company: 'LearnLoop',
    title: 'Full Stack Developer (Next.js)',
    location: 'Remote',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Build learner-facing features across a Next.js frontend and Node services.',
    skills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'MongoDB'],
  },
  {
    company: 'LearnLoop',
    title: 'Backend Developer',
    location: 'Remote',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Own the progress-tracking service and the GraphQL schema clients read from.',
    skills: ['Node.js', 'Express.js', 'MongoDB', 'GraphQL', 'Jest'],
  },
  {
    company: 'LearnLoop',
    title: 'Frontend Developer',
    location: 'Remote',
    experienceRequired: 2,
    employmentType: 'Full-time',
    description:
      'Build the course player and instructor scheduling interfaces.',
    skills: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
  },
  {
    company: 'LearnLoop',
    title: 'Junior Full Stack Developer',
    location: 'Remote',
    experienceRequired: 1,
    employmentType: 'Full-time',
    description:
      'Work alongside senior engineers on learner-facing features and internal tooling.',
    skills: ['JavaScript', 'React', 'Node.js', 'Git'],
  },

  // --- NimbusCloud Systems -------------------------------------------------
  {
    company: 'NimbusCloud Systems',
    title: 'Site Reliability Engineer',
    location: 'Pune',
    experienceRequired: 5,
    employmentType: 'Full-time',
    description:
      'Define reliability targets and automate the response paths that protect them.',
    skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Python'],
  },
  {
    company: 'NimbusCloud Systems',
    title: 'Distributed Systems Engineer',
    location: 'Pune',
    experienceRequired: 6,
    employmentType: 'Full-time',
    description:
      'Work on the control plane that schedules and reconciles managed cluster workloads.',
    skills: ['Java', 'Spring Boot', 'RabbitMQ', 'Kubernetes', 'Docker'],
  },
  {
    company: 'NimbusCloud Systems',
    title: 'Platform Frontend Engineer',
    location: 'Pune',
    experienceRequired: 3,
    employmentType: 'Full-time',
    description:
      'Build the console customers use to provision and observe their clusters.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
  },
  {
    company: 'NimbusCloud Systems',
    title: 'Cloud Support Engineer',
    location: 'Pune',
    experienceRequired: 2,
    employmentType: 'Contract',
    description:
      'Debug customer environments and turn recurring issues into tooling fixes.',
    skills: ['Docker', 'AWS', 'Git', 'REST APIs'],
  },
];

const companyIdByName = new Map(companies.map((company) => [company.name, company.id]));

export const jobs = JOB_DEFINITIONS.map((job, index) => ({
  id: `job-${String(index + 1).padStart(3, '0')}`,
  title: job.title,
  description: job.description,
  location: job.location,
  experienceRequired: job.experienceRequired,
  employmentType: job.employmentType,
}));

/** Job -[:REQUIRES {importance}]-> Skill */
export const jobSkillRelationships = JOB_DEFINITIONS.flatMap((job, jobIndex) =>
  job.skills.map((skill, skillIndex) => ({
    jobId: jobs[jobIndex].id,
    skillId: skillId(skill),
    // The first two listed skills are treated as the non-negotiables.
    importance: skillIndex < 2 ? 'Must have' : 'Nice to have',
  }))
);

/** Job -[:POSTED_BY]-> Company */
export const jobCompanyRelationships = JOB_DEFINITIONS.map((job, jobIndex) => {
  const companyId = companyIdByName.get(job.company);
  if (!companyId) throw new Error(`Unknown company in seed data: "${job.company}"`);
  return { jobId: jobs[jobIndex].id, companyId };
});

/* -------------------------------------------------------------------------- */
/* Developers (50) - 10 archetypes x 5 variants                               */
/* -------------------------------------------------------------------------- */

const ARCHETYPES = [
  {
    role: 'Full Stack Developer',
    focus: 'JavaScript product work across the stack',
    baseExperience: 2,
    coreSkills: ['React', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Git'],
    variantSkills: [
      ['REST APIs'],
      ['REST APIs', 'Docker'],
      ['TypeScript'],
      ['Redux', 'HTML/CSS'],
      ['Jest', 'REST APIs'],
    ],
    projectPool: [
      'Patient Records Portal',
      'Internal Admin Console',
      'Inventory Sync Microservice',
      'Learner Progress Service',
    ],
    names: ['Arjun Kumar', 'Neha Sharma', 'Rohit Menon', 'Kavya Iyer', 'Siddharth Rao'],
  },
  {
    role: 'Frontend Engineer',
    focus: 'design-system-driven interface engineering',
    baseExperience: 2,
    coreSkills: ['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS', 'Git'],
    variantSkills: [
      ['Redux'],
      ['Redux', 'Jest'],
      ['Next.js'],
      ['REST APIs'],
      ['Jest', 'REST APIs'],
    ],
    projectPool: [
      'Order Fulfilment Dashboard',
      'Design System Component Library',
      'Marketing Site Rebuild',
      'Retail Storefront Revamp',
    ],
    names: ['Ananya Desai', 'Farhan Qureshi', 'Meera Nambiar', 'Tanvi Bhatt', 'Karthik Reddy'],
  },
  {
    role: 'Backend Engineer',
    focus: 'Node service design and data modelling',
    baseExperience: 3,
    coreSkills: ['Node.js', 'Express.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Git'],
    variantSkills: [
      ['Redis'],
      ['Redis', 'Jest'],
      ['Docker'],
      ['MongoDB'],
      ['Redis', 'Docker', 'Jest'],
    ],
    projectPool: [
      'Multi-tenant Billing API',
      'Internal Admin Console',
      'GraphQL Gateway Consolidation',
      'Retail Storefront Revamp',
    ],
    names: ['Vikram Joshi', 'Priya Nair', 'Aditya Bose', 'Shruti Kulkarni', 'Imran Sheikh'],
  },
  {
    role: 'Java Backend Developer',
    focus: 'transactional JVM services',
    baseExperience: 3,
    coreSkills: ['Java', 'Spring Boot', 'PostgreSQL', 'REST APIs', 'Git'],
    variantSkills: [
      ['Docker'],
      ['Docker', 'RabbitMQ'],
      ['MySQL'],
      ['Redis'],
      ['Docker', 'Redis', 'MySQL'],
    ],
    projectPool: [
      'Payments Ledger Service',
      'Mobile Banking Backend',
      'Loan Origination Workflow',
      'Citizen Services Portal',
    ],
    names: ['Rahul Verma', 'Deepa Krishnan', 'Nikhil Agarwal', 'Sneha Pillai', 'Manish Gupta'],
  },
  {
    role: 'Backend Engineer (Python)',
    focus: 'Python APIs and service performance',
    baseExperience: 2,
    coreSkills: ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs', 'Git'],
    variantSkills: [
      ['Docker'],
      ['Docker', 'Redis'],
      ['Elasticsearch'],
      ['AWS'],
      ['Docker', 'AWS', 'Redis'],
    ],
    projectPool: [
      'Warehouse Route Optimiser',
      'Realtime Analytics Pipeline',
      'Search Relevance Tuning',
      'Clinical Data Warehouse',
    ],
    names: ['Sanjana Rao', 'Harsh Vardhan', 'Ritika Sen', 'Abhishek Dutta', 'Pooja Malhotra'],
  },
  {
    role: 'Python Developer',
    focus: 'Django applications and background processing',
    baseExperience: 2,
    coreSkills: ['Python', 'Django', 'PostgreSQL', 'Git'],
    variantSkills: [
      ['Redis'],
      ['Redis', 'REST APIs'],
      ['Docker'],
      ['MySQL'],
      ['Redis', 'Docker', 'REST APIs'],
    ],
    projectPool: ['Fraud Signal Detection Service', 'Clinical Data Warehouse'],
    names: ['Varun Chatterjee', 'Ishita Ghosh', 'Naveen Kumar', 'Swati Deshmukh', 'Yash Thakur'],
  },
  {
    role: 'DevOps Engineer',
    focus: 'container platforms and delivery automation',
    baseExperience: 3,
    coreSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git'],
    variantSkills: [
      ['Terraform'],
      ['Terraform', 'Python'],
      ['Python'],
      ['Terraform', 'Elasticsearch'],
      ['Terraform', 'Python', 'REST APIs'],
    ],
    projectPool: [
      'Infrastructure Migration to Kubernetes',
      'CI/CD Pipeline Standardisation',
      'Observability Stack Rollout',
    ],
    names: ['Gaurav Saxena', 'Lakshmi Menon', 'Zoya Ansari', 'Praveen Nair', 'Divya Ramesh'],
  },
  {
    role: 'Full Stack Developer',
    focus: 'Next.js applications and rendering strategy',
    baseExperience: 2,
    coreSkills: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Git'],
    variantSkills: [
      ['MongoDB'],
      ['MongoDB', 'Jest'],
      ['PostgreSQL'],
      ['GraphQL'],
      ['MongoDB', 'GraphQL', 'Jest'],
    ],
    projectPool: [
      'Course Delivery Platform',
      'Marketing Site Rebuild',
      'Learner Progress Service',
      'Design System Component Library',
    ],
    names: ['Aakash Bhandari', 'Ruchi Kapoor', 'Sameer Khanna', 'Trisha Mohan', 'Dev Patel'],
  },
  {
    role: 'Data Engineer',
    focus: 'ingestion pipelines and search infrastructure',
    baseExperience: 3,
    coreSkills: ['Python', 'PostgreSQL', 'Elasticsearch', 'Docker', 'Git'],
    variantSkills: [
      ['AWS'],
      ['AWS', 'Terraform'],
      ['FastAPI'],
      ['MySQL'],
      ['AWS', 'FastAPI'],
    ],
    projectPool: [
      'Clinical Data Warehouse',
      'Search Relevance Tuning',
      'Realtime Analytics Pipeline',
      'Fleet Telemetry Ingestion',
    ],
    names: ['Nandini Prasad', 'Omkar Joshi', 'Radhika Balan', 'Sarthak Jain', 'Bhavna Kaur'],
  },
  {
    role: 'API & Graph Engineer',
    focus: 'graph modelling and API gateways',
    baseExperience: 3,
    coreSkills: ['Node.js', 'GraphQL', 'Neo4j', 'TypeScript', 'Git'],
    variantSkills: [
      ['Redis'],
      ['Redis', 'Express.js'],
      ['PostgreSQL'],
      ['MongoDB'],
      ['Redis', 'Express.js', 'Jest'],
    ],
    projectPool: [
      'Recommendation Graph Prototype',
      'GraphQL Gateway Consolidation',
      'Learner Progress Service',
    ],
    names: ['Aryan Malhotra', 'Sonal Wadhwa', 'Kabir Suri', 'Anjali Vaidya', 'Rehan Merchant'],
  },
];

const LOCATIONS = [
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Remote',
  'Chennai',
  'Delhi NCR',
];

const PROJECT_ROLES = ['Contributor', 'Core Contributor', 'Tech Lead'];

/** Seniority prefix derived from years of experience, not stored separately. */
function seniorityTitle(role, experienceYears) {
  if (experienceYears >= 6) return `Senior ${role}`;
  if (experienceYears <= 1) return `Junior ${role}`;
  return role;
}

/**
 * Confidence label for a HAS_SKILL relationship. Earlier skills in a
 * developer's list are their strongest - a simple, explainable rule rather than
 * an invented score.
 */
function skillLevel(position) {
  if (position < 3) return 'Advanced';
  if (position < 6) return 'Intermediate';
  return 'Working knowledge';
}

const developerRecords = [];
const developerSkillRows = [];
const developerProjectRows = [];

ARCHETYPES.forEach((archetype, archetypeIndex) => {
  archetype.variantSkills.forEach((extraSkills, variantIndex) => {
    const sequence = archetypeIndex * archetype.variantSkills.length + variantIndex;
    const id = `dev-${String(sequence + 1).padStart(3, '0')}`;
    const name = archetype.names[variantIndex];

    // Spread experience across the archetype so seniority (and therefore the
    // set of jobs a developer clears the bar for) genuinely varies.
    const experienceYears = archetype.baseExperience + variantIndex;
    const location = LOCATIONS[(archetypeIndex + variantIndex) % LOCATIONS.length];
    const skillNames = [...archetype.coreSkills, ...extraSkills];
    const title = seniorityTitle(archetype.role, experienceYears);

    developerRecords.push({
      id,
      name,
      title,
      experienceYears,
      location,
      bio: `${title} based in ${location} with ${experienceYears} year${
        experienceYears === 1 ? '' : 's'
      } of experience, focused on ${archetype.focus}.`,
    });

    skillNames.forEach((skill, position) => {
      developerSkillRows.push({
        developerId: id,
        skillId: skillId(skill),
        level: skillLevel(position),
      });
    });

    // One to three projects, walking the archetype's pool so that different
    // variants pick up different project histories.
    const projectCount = 1 + (variantIndex % 3);
    for (let offset = 0; offset < projectCount; offset += 1) {
      const projectName =
        archetype.projectPool[(variantIndex + offset) % archetype.projectPool.length];
      developerProjectRows.push({
        developerId: id,
        projectId: projectId(projectName),
        role: PROJECT_ROLES[(variantIndex + offset) % PROJECT_ROLES.length],
      });
    }
  });
});

export const developers = developerRecords;
export const developerSkillRelationships = developerSkillRows;

/** De-duplicated, because a pool shorter than the project count can repeat. */
export const developerProjectRelationships = developerProjectRows.filter(
  (row, index, rows) =>
    rows.findIndex(
      (other) => other.developerId === row.developerId && other.projectId === row.projectId
    ) === index
);

/** Convenience summary printed by the seed script. */
export const seedSummary = {
  developers: developers.length,
  skills: skills.length,
  projects: projects.length,
  jobs: jobs.length,
  companies: companies.length,
  relationships:
    developerSkillRelationships.length +
    developerProjectRelationships.length +
    projectSkillRelationships.length +
    jobSkillRelationships.length +
    jobCompanyRelationships.length,
};
