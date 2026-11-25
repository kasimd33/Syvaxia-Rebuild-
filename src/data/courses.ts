/**
 * Syvaxia Canonical Course Catalog
 * --------------------------------
 * Typed, locally-authored curriculum data (PRD Task 1.3). Zero CMS — these
 * objects drive the home page grid, /courses explorer, SSG course detail
 * pages, JSON-LD structured data, and the AI advisor's grounding prompt.
 *
 * Credibility rule: every claim here is structural (cohort format, live
 * system access, deliverables, timelines) — never inflated placement or
 * salary guarantees.
 */

export type CourseCategory = "sap-functional" | "sap-technical" | "full-stack-cloud";

export type ExperienceLevel = "fresher-friendly" | "professional" | "advanced";

export type DeliveryMode = "live-virtual" | "onsite-bengaluru" | "hybrid";

export type CohortStatus = "open" | "filling" | "closed";

export interface CourseModule {
  /** Module code shown in JetBrains Mono (e.g. "M01"). */
  code: string;
  title: string;
  weeks: number;
  topics: string[];
  /** Hands-on system work performed in this module on the live SAP/client environment. */
  lab: string;
}

export interface Capstone {
  title: string;
  description: string;
  deliverables: string[];
}

export interface Trainer {
  name: string;
  role: string;
  yearsExperience: number;
  credentials: string[];
  bio: string;
}

export interface CohortSchedule {
  id: string;
  /** ISO date — rendered as "Starts Feb 2026" etc. */
  startDate: string;
  mode: DeliveryMode;
  timing: string;
  seatsTotal: number;
  seatsLeft: number;
  status: CohortStatus;
}

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface Course {
  slug: string;
  title: string;
  shortTitle: string;
  /** SAP module code where applicable (e.g. "ABAP", "FI-CO") — mono typeface chip. */
  code: string | null;
  category: CourseCategory;
  level: ExperienceLevel;
  tagline: string;
  description: string;
  durationWeeks: number;
  hoursPerWeek: number;
  deliveryModes: DeliveryMode[];
  language: string;
  liveSystemAccess: boolean;
  prerequisites: string[];
  recommendedFor: string[];
  tools: string[];
  roles: string[];
  modules: CourseModule[];
  capstone: Capstone;
  trainer: Trainer;
  cohorts: CohortSchedule[];
  faqs: CourseFaq[];
  syllabusFile: string;
}

export const courses: Course[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // SAP ABAP on S/4HANA
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "sap-abap",
    title: "SAP ABAP Development on S/4HANA",
    shortTitle: "ABAP on S/4HANA",
    code: "ABAP",
    category: "sap-technical",
    level: "fresher-friendly",
    tagline: "From ABAP foundations to RAP-based S/4HANA extensions on a live system.",
    description:
      "A cohort for engineers and fresh graduates who want to build, extend, and modernise SAP applications on S/4HANA. You progress from classic ABAP syntax through object-oriented ABAP, CDS views and AMDP, and finish with the RESTful Application Programming Model (RAP) — the standard for all new S/4HANA development. Every module pairs concept sessions with hands-on work on a live SAP system using real business scenarios.",
    durationWeeks: 16,
    hoursPerWeek: 10,
    deliveryModes: ["live-virtual", "onsite-bengaluru", "hybrid"],
    language: "English",
    liveSystemAccess: true,
    prerequisites: [
      "Any programming background (C, Java, Python, or even academic-level C++)",
      "Comfort with basic SQL concepts (SELECT, JOIN, WHERE)",
      "No prior SAP experience required",
    ],
    recommendedFor: [
      "Fresh graduates (B.E./B.Tech/MCA) targeting SAP development careers",
      "Working IT professionals moving from legacy support or other languages into SAP",
      "Functional consultants who want to add technical extension skills",
    ],
    tools: [
      "SAP S/4HANA (live sandbox system access)",
      "Eclipse ADT (ABAP Development Tools)",
      "ABAP Development in SAP Business Application Studio",
      "ABAP RESTful Application Programming Model (RAP)",
      "SAP GUI",
      "Git for ABAP source versioning basics",
    ],
    roles: [
      "SAP ABAP Consultant",
      "S/4HANA Technical Consultant",
      "SAP Application Developer",
      "ABAP on HANA Specialist",
    ],
    modules: [
      {
        code: "M01",
        title: "SAP Ecosystem & ABAP Foundations",
        weeks: 2,
        topics: [
          "SAP architecture, clients, and the S/4HANA landscape",
          "ABAP Workbench vs Eclipse ADT",
          "Data types, declarations, and control structures",
          "Open SQL SELECTs, joins, and inline declarations",
          "Debugging fundamentals: breakpoints, watchpoints",
        ],
        lab: "Write and debug your first reports on a live SAP system against transparent tables.",
      },
      {
        code: "M02",
        title: "ABAP Dictionary (DDIC) & Data Modelling",
        weeks: 2,
        topics: [
          "Tables, data elements, domains, and structures",
          "Foreign keys, technical settings, and buffering",
          "Views, lock objects, and search helps",
          "Table maintenance generators",
          "Change documents and logging",
        ],
        lab: "Model a complete custom business object (header + item tables) in the DDIC.",
      },
      {
        code: "M03",
        title: "Internal Tables, Modularisation & Reports",
        weeks: 2,
        topics: [
          "Standard, sorted, and hashed internal tables — when each wins",
          "LOOP, READ, COLLECT, and modern value expressions",
          "Subroutines, function modules, and includes",
          "Classical & interactive reports with selection screens",
          "ALV Grid reporting with CL_SALV_TABLE",
        ],
        lab: "Build an interactive ALV purchase-order analysis report with drill-down.",
      },
      {
        code: "M04",
        title: "Object-Oriented ABAP",
        weeks: 2,
        topics: [
          "Classes, objects, visibility, and constructors",
          "Inheritance, interfaces, and polymorphism",
          "Events and delegations",
          "Design patterns in ABAP (singleton, factory, observer)",
          "Unit testing with ABAP Unit",
        ],
        lab: "Refactor a procedural report into a testable OO design with ABAP Unit tests.",
      },
      {
        code: "M05",
        title: "Enhancements, Exits & BAdIs",
        weeks: 2,
        topics: [
          "User exits, customer exits, and where they still apply",
          "BAdIs: classic and new enhancement spot framework",
          "Implicit & explicit enhancement points",
          "Modifying standard SAP behaviour safely",
          "Upgrade-safe extension strategy",
        ],
        lab: "Add validated custom logic to the standard purchase order flow via BAdI.",
      },
      {
        code: "M06",
        title: "CDS Views & HANA Pushdown",
        weeks: 2,
        topics: [
          "Core Data Services: associations, annotations, access control",
          "Analytical vs transactional CDS view types",
          "AMDP: SQLScript procedures from ABAP",
          "Code pushdown philosophy — why HANA changes everything",
          "Performance analysis: SQL trace and runtime analysis",
        ],
        lab: "Replace a data-heavy report loop with a CDS view + AMDP pushdown and measure the speed-up.",
      },
      {
        code: "M07",
        title: "RESTful Application Programming Model (RAP)",
        weeks: 3,
        topics: [
          "RAP architecture: behaviour definitions and implementations",
          "Managed vs unmanaged scenarios",
          "OData V4 service binding and Fiori Elements preview",
          "Actions, validations, determinations, and draft handling",
          "Clean-core extension strategy for S/4HANA",
        ],
        lab: "Deliver a full-stack custom application: CDS data model → RAP behaviour → OData V4 → Fiori UI.",
      },
      {
        code: "M08",
        title: "Integration, Transports & Professional Practice",
        weeks: 1,
        topics: [
          "BAPIs, RFCs, and IDoc fundamentals",
          "Transport management across dev → quality → prod",
          "Code review standards and naming conventions",
          "Working with functional consultants — reading specs",
          "Interview preparation: 40+ real ABAP interview questions",
        ],
        lab: "Ship your capstone through a full transport release cycle with a mock code review.",
      },
    ],
    capstone: {
      title: "Custom S/4HANA Procurement Analytics & Extension Suite",
      description:
        "Design and deliver a production-style extension on a live S/4HANA system: a CDS-based procurement analytics data model exposed via RAP as an OData V4 service, a Fiori Elements UI, and a BAdI extension that enforces custom business validation in the standard purchasing flow — released through a full transport cycle.",
      deliverables: [
        "CDS view data model with access control and analytical annotations",
        "RAP behaviour definition with actions, validations, and draft support",
        "Fiori Elements list-report application",
        "BAdI enhancement with unit tests",
        "Technical design document and transport release notes",
      ],
    },
    trainer: {
      name: "Ramesh Kulkarni",
      role: "Lead SAP Technical Architect",
      yearsExperience: 14,
      credentials: [
        "SAP Certified Development Associate – ABAP with SAP NetWeaver 7.5",
        "SAP Certified Development Specialist – ABAP for SAP HANA",
        "Delivered 9 S/4HANA conversion programs across manufacturing and retail",
      ],
      bio: "Ramesh has spent 14 years building and modernising SAP applications — from classic ECC exits to clean-core RAP extensions on S/4HANA. He has led development tracks in 9 S/4HANA conversions and mentors cohorts in the same code-review discipline used on delivery projects.",
    },
    cohorts: [
      {
        id: "abap-2026-02-weekend",
        startDate: "2026-02-07",
        mode: "hybrid",
        timing: "Sat–Sun, 9:30 AM – 1:30 PM IST",
        seatsTotal: 25,
        seatsLeft: 11,
        status: "filling",
      },
      {
        id: "abap-2026-03-weekday",
        startDate: "2026-03-09",
        mode: "live-virtual",
        timing: "Mon–Fri, 7:00 – 9:00 PM IST",
        seatsTotal: 30,
        seatsLeft: 30,
        status: "open",
      },
    ],
    faqs: [
      {
        question: "Do I need SAP experience to join the ABAP cohort?",
        answer:
          "No. The cohort starts from ABAP fundamentals. You need comfort with basic programming logic and SQL concepts — from academics or work — and we build SAP expertise from there on a live system.",
      },
      {
        question: "Will I get access to a real SAP system?",
        answer:
          "Yes. Every participant works on a live SAP S/4HANA sandbox for the full 16 weeks — exercises, labs, and your capstone all run on the same system used in delivery projects, not slides.",
      },
      {
        question: "Is this ABAP course relevant for S/4HANA, or just old ECC syntax?",
        answer:
          "It is an S/4HANA-first curriculum. Classic foundations (DDIC, reports, OO ABAP) are covered because every S/4 project still touches them, but the second half is built around CDS views, AMDP, and RAP — the technologies all new S/4HANA development uses.",
      },
    ],
    syllabusFile: "/syllabi/sap-abap.pdf",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SAP FICO (S/4HANA Finance)
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "sap-fico",
    title: "SAP FICO — Financial Accounting & Controlling on S/4HANA",
    shortTitle: "SAP FICO",
    code: "FI-CO",
    category: "sap-functional",
    level: "professional",
    tagline: "Master finance & controlling configuration on S/4HANA with the Universal Journal.",
    description:
      "A configuration-intensive cohort covering Financial Accounting (FI) and Controlling (CO) on SAP S/4HANA. You configure the General Ledger, Accounts Payable/Receivable, Asset Accounting, and the full CO module — then learn what S/4HANA changes: the Universal Journal (ACDOCA), machine learning in cash application, and Fiori-based finance analytics. Real month-end closing simulations run on a live system throughout.",
    durationWeeks: 16,
    hoursPerWeek: 10,
    deliveryModes: ["live-virtual", "onsite-bengaluru", "hybrid"],
    language: "English",
    liveSystemAccess: true,
    prerequisites: [
      "Commerce/finance background (B.Com, MBA Finance, CA-Inter) OR 1+ year in accounting/finance operations",
      "Basic understanding of the accounting cycle (journal → ledger → trial balance)",
      "No prior SAP experience required",
    ],
    recommendedFor: [
      "Accounting & finance professionals transitioning into SAP functional roles",
      "Fresh commerce graduates targeting ERP consulting careers",
      "SAP end-users in FI/CO who want consultant-level configuration skills",
    ],
    tools: [
      "SAP S/4HANA (live sandbox system access)",
      "SAP GUI & Fiori Launchpad",
      "Universal Journal (ACDOCA) reporting",
      "SAP Fiori analytical apps for finance",
      "LSMW / Migration Cockpit basics",
    ],
    roles: [
      "SAP FICO Consultant",
      "S/4HANA Finance Consultant",
      "SAP FI Analyst",
      "Finance Process Consultant",
    ],
    modules: [
      {
        code: "M01",
        title: "ERP & Financial Accounting Foundations",
        weeks: 1,
        topics: [
          "ERP concepts and the SAP S/4HANA finance landscape",
          "Enterprise structure: company code, controlling area, currency settings",
          "Posting period variants and fiscal year variants",
          "Document types, number ranges, and field status groups",
          "Chart of accounts design",
        ],
        lab: "Configure a complete company code from scratch on a live system.",
      },
      {
        code: "M02",
        title: "General Ledger & the Universal Journal",
        weeks: 2,
        topics: [
          "G/L master data and account groups",
          "Document splitting and segment reporting",
          "Universal Journal (ACDOCA): how S/4HANA merges FI and CO line items",
          "Ledger approach vs accounts approach for parallel accounting",
          "G/L reporting: Fiori apps vs classic reports",
        ],
        lab: "Post and analyse entries through the Universal Journal and reconcile across ledgers.",
      },
      {
        code: "M03",
        title: "Accounts Payable & Accounts Receivable",
        weeks: 3,
        topics: [
          "Vendor/customer master data and account groups",
          "The procure-to-pay and order-to-cash postings FI touches",
          "Payment terms, payment runs, and dunning",
          "Automatic payment program configuration",
          "Correspondence and interest calculation",
          "Machine-learning cash application in S/4HANA",
        ],
        lab: "Execute a full automatic payment run and dunning cycle with real open items.",
      },
      {
        code: "M04",
        title: "Asset Accounting & Bank Accounting",
        weeks: 2,
        topics: [
          "Asset classes, depreciation areas, and charts of depreciation",
          "Acquisition, transfer, retirement, and impairment postings",
          "New Asset Accounting in S/4HANA — what changed",
          "Periodic asset closing and reconciliation to G/L",
          "House banks, payment methods, and bank reconciliation",
        ],
        lab: "Configure a depreciation area and run a month-end asset close with reconciliation.",
      },
      {
        code: "M05",
        title: "Month-End & Year-End Closing",
        weeks: 1,
        topics: [
          "The financial closing cockpit",
          "Accruals, provisions, and foreign currency valuation",
          "GR/IR clearing and regrouping",
          "Reconciliation of sub-ledgers to G/L",
          "Closing checklist design and F.01-style reporting",
        ],
        lab: "Run a simulated month-end close end-to-end and produce a closing checklist.",
      },
      {
        code: "M06",
        title: "Controlling: Cost Elements, Cost Centers & Internal Orders",
        weeks: 2,
        topics: [
          "Cost element master data in S/4HANA (G/L-account-based)",
          "Cost center accounting: planning, splitting, and assessment",
          "Activity types and price calculation",
          "Internal orders: budgeting, status management, settlement",
          "Statistical key figures and allocations",
        ],
        lab: "Design a cost center hierarchy with planning and periodic allocations.",
      },
      {
        code: "M07",
        title: "Product Costing & Profitability Analysis",
        weeks: 3,
        topics: [
          "Cost object controlling and product cost planning",
          "Material cost estimates with BOMs and routings",
          "Standard cost estimates and variance calculation",
          "Profitability Analysis (COPA): costing-based vs account-based",
          "Account-based COPA in S/4HANA and margin analysis",
          "Market segment reporting in Fiori",
        ],
        lab: "Execute a full costing run: standard cost estimate → production variance → COPA margin report.",
      },
      {
        code: "M08",
        title: "Integration, Cutover & Consulting Practice",
        weeks: 2,
        topics: [
          "FI/MM and FI/SD integration points and account determination",
          "Data migration with the Migration Cockpit",
          "UAT, cutover planning, and hypercare",
          "Writing functional specs for RICEFW objects",
          "Certification roadmap and 50+ interview scenarios",
        ],
        lab: "Document your capstone configuration as a client-ready blueprint and present it in a mock workshop.",
      },
    ],
    capstone: {
      title: "End-to-End S/4HANA Finance Configuration Blueprint",
      description:
        "Configure a simulated manufacturing company on a live S/4HANA system: full company code setup with parallel ledgers, AP/AR with an automatic payment run, new asset accounting, cost center planning with allocations, a standard cost estimate with variance analysis, and account-based COPA reporting — documented as a client-ready configuration blueprint.",
      deliverables: [
        "Configured company code with fiscal year, currencies, and parallel ledgers",
        "AP/AR setup including an executed automatic payment run",
        "New Asset Accounting with a completed month-end close",
        "Cost center & internal order structure with periodic allocations",
        "Product costing run with variance and COPA margin analysis",
        "Configuration blueprint document (fit-gap style)",
      ],
    },
    trainer: {
      name: "Deepa Krishnan",
      role: "Principal SAP Finance Consultant",
      yearsExperience: 16,
      credentials: [
        "SAP Certified Application Associate – S/4HANA Finance",
        "Chartered Accountant (CA)",
        "Led FI/CO workstreams in 11 SAP rollouts across pharma, FMCG, and auto components",
      ],
      bio: "Deepa combines a Chartered Accountancy background with 16 years of SAP FI/CO delivery. She has led finance workstreams in 11 rollouts and specialises in S/4HANA Finance transitions — teaching configuration the way it is actually deployed, closing books included.",
    },
    cohorts: [
      {
        id: "fico-2026-02-weekend",
        startDate: "2026-02-14",
        mode: "onsite-bengaluru",
        timing: "Sat–Sun, 9:30 AM – 1:30 PM IST",
        seatsTotal: 25,
        seatsLeft: 8,
        status: "filling",
      },
      {
        id: "fico-2026-04-virtual",
        startDate: "2026-04-06",
        mode: "live-virtual",
        timing: "Tue–Thu, 7:00 – 9:00 PM IST",
        seatsTotal: 30,
        seatsLeft: 30,
        status: "open",
      },
    ],
    faqs: [
      {
        question: "I'm a B.Com graduate with no ERP exposure. Can I manage this cohort?",
        answer:
          "Yes — the cohort assumes accounting knowledge, not SAP knowledge. We start with ERP concepts and enterprise structure before any configuration, and commerce graduates consistently form the largest group in our FICO cohorts.",
      },
      {
        question: "Does this cover S/4HANA Finance specifically, or only classic ECC FICO?",
        answer:
          "It is an S/4HANA-first curriculum. Classic topics are taught where they remain foundational, but the Universal Journal (ACDOCA), new asset accounting, account-based COPA, and Fiori finance apps are core to the syllabus.",
      },
      {
        question: "Is a CA/MBA required to be hired as an SAP FICO consultant?",
        answer:
          "No. Hiring teams look for configuration depth plus process understanding. Our capstone blueprint — a documented end-to-end configuration on a live system — is the artefact that demonstrates both to interviewers.",
      },
    ],
    syllabusFile: "/syllabi/sap-fico.pdf",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SAP MM (S/4HANA Sourcing & Procurement)
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "sap-mm",
    title: "SAP MM — Materials Management & Sourcing on S/4HANA",
    shortTitle: "SAP MM",
    code: "MM",
    category: "sap-functional",
    level: "fresher-friendly",
    tagline: "Procure-to-pay, inventory, and valuation configuration on live S/4HANA.",
    description:
      "A hands-on cohort covering the full Materials Management cycle on S/4HANA: master data, procurement, MRP, inventory management, valuation, and invoice verification. You run the procure-to-pay cycle repeatedly — as a user, then as a configurator — until you can design the process, not just execute it. S/4HANA-specific topics (business partner model, embedded analytics, Fiori procurement apps) are woven throughout.",
    durationWeeks: 12,
    hoursPerWeek: 10,
    deliveryModes: ["live-virtual", "onsite-bengaluru", "hybrid"],
    language: "English",
    liveSystemAccess: true,
    prerequisites: [
      "Any graduation; supply chain, operations, or engineering backgrounds fit naturally",
      "Basic business process awareness (purchasing, stock, billing concepts)",
      "No prior SAP experience required",
    ],
    recommendedFor: [
      "Fresh graduates targeting SAP functional consulting",
      "Procurement, stores, and logistics professionals moving to consulting",
      "SAP MM end-users seeking configuration-level expertise",
    ],
    tools: [
      "SAP S/4HANA (live sandbox system access)",
      "SAP GUI & Fiori Launchpad",
      "MRP Live (S/4HANA)",
      "SAP Fiori procurement apps (Manage Purchase Orders, My Inbox)",
      "Migration Cockpit basics",
    ],
    roles: [
      "SAP MM Consultant",
      "S/4HANA Sourcing & Procurement Consultant",
      "SAP Materials Management Analyst",
      "P2P Process Consultant",
    ],
    modules: [
      {
        code: "M01",
        title: "SAP Navigation & Enterprise Structure",
        weeks: 1,
        topics: [
          "SAP GUI and Fiori Launchpad navigation",
          "MM organisational units: plant, storage location, purchasing organisation",
          "Assignment of organisational units",
          "The procure-to-pay cycle at a conceptual level",
          "S/4HANA business partner (BP) model for vendors",
        ],
        lab: "Set up plant, storage locations, and purchasing organisations on a live system.",
      },
      {
        code: "M02",
        title: "Master Data",
        weeks: 2,
        topics: [
          "Material master: views, industries, and data maintenance strategy",
          "Material types and number ranges",
          "Vendor master and business partner roles",
          "Purchasing info records and source lists",
          "Master data governance basics",
        ],
        lab: "Maintain complete material and vendor masters with info records across org levels.",
      },
      {
        code: "M03",
        title: "Procurement Cycle & Purchasing",
        weeks: 3,
        topics: [
          "Purchase requisition → RFQ → quotation comparison → PO",
          "Purchasing document types and release procedures",
          "Outline agreements: contracts and scheduling agreements",
          "Message determination and output management",
          "Vendor evaluation and supplier collaboration in S/4HANA",
        ],
        lab: "Execute the complete requisition-to-PO flow including an RFQ round and contract.",
      },
      {
        code: "M04",
        title: "Inventory Management & Physical Inventory",
        weeks: 2,
        topics: [
          "Goods receipt, goods issue, transfers, and reservations",
          "Movement types and their account postings",
          "Special stock: consignment, subcontracting, stock transport orders",
          "Return to vendor and customer returns touchpoints",
          "Physical inventory: annual, continuous, and cycle counting",
        ],
        lab: "Perform a stock transport order across plants plus a cycle counting exercise.",
      },
      {
        code: "M05",
        title: "Valuation & Account Determination",
        weeks: 2,
        topics: [
          "Material valuation: standard vs moving average price",
          "Split valuation",
          "Automatic account determination (valuation grouping, modification)",
          "Price change documents and material ledger introduction",
          "Currency and valuation control in S/4HANA",
        ],
        lab: "Configure automatic account determination and trace every P2P posting it generates.",
      },
      {
        code: "M06",
        title: "Invoice Verification (MIRO) & Logistics Invoice Verification",
        weeks: 1,
        topics: [
          "Logistics invoice verification workflow",
          "Three-way match: PO, GR, invoice",
          "Blocking reasons and release of blocked invoices",
          "Subsequent credits/debits and credit memos",
          "Invoice monitoring via Fiori apps",
        ],
        lab: "Post invoices against POs — including a deliberately blocked invoice you then release.",
      },
      {
        code: "M07",
        title: "MRP, Consumption-Based Planning & Reporting",
        weeks: 1,
        topics: [
          "Consumption-based planning parameters",
          "MRP Live in S/4HANA and planning results",
          "Lot sizing, safety stock, and reorder points",
          "Stock/requirement analysis and embedded analytics",
          "Inventory & procurement Fiori analytical apps",
        ],
        lab: "Configure MRP for a plant and analyse planning results in the stock/requirement list.",
      },
    ],
    capstone: {
      title: "Full Procure-to-Pay Configuration for a Manufacturing Client",
      description:
        "Configure a complete P2P cycle on a live S/4HANA system for a simulated manufacturer: enterprise structure, business-partner-integrated vendor master, document types with release strategy, movement-type postings with account determination, and a three-way-match invoice verification flow — then demonstrate the entire cycle in a mock client workshop.",
      deliverables: [
        "Configured MM enterprise structure and business partner setup",
        "Purchasing document configuration with release strategy",
        "Valuation and automatic account determination setup",
        "Executed P2P demonstration: requisition → PO → GR → MIRO → payment readiness",
        "Configuration blueprint and workshop presentation",
      ],
    },
    trainer: {
      name: "Arjun Menon",
      role: "Senior SAP Supply Chain Consultant",
      yearsExperience: 13,
      credentials: [
        "SAP Certified Application Associate – S/4HANA Sourcing and Procurement",
        "B.E. Industrial Engineering",
        "Led MM workstreams in 14 implementations, including 3 global P2P templates",
      ],
      bio: "Arjun has spent 13 years implementing SAP MM across manufacturing and retail, leading P2P template rollouts for multi-plant operations. His cohorts run the procure-to-pay cycle on live systems until configuration decisions — not menu paths — become second nature.",
    },
    cohorts: [
      {
        id: "mm-2026-01-weekend",
        startDate: "2026-01-24",
        mode: "live-virtual",
        timing: "Sat–Sun, 9:30 AM – 1:30 PM IST",
        seatsTotal: 30,
        seatsLeft: 6,
        status: "filling",
      },
      {
        id: "mm-2026-03-hybrid",
        startDate: "2026-03-21",
        mode: "hybrid",
        timing: "Sat, 10:00 AM – 2:00 PM IST (onsite option, HSR Layout)",
        seatsTotal: 25,
        seatsLeft: 25,
        status: "open",
      },
    ],
    faqs: [
      {
        question: "Is SAP MM a good entry module for fresh graduates?",
        answer:
          "Yes — MM is the most common entry point into SAP functional consulting. The concepts map directly to business operations everyone understands (buying, storing, invoicing), and demand for P2P consultants remains steady across manufacturing and retail.",
      },
      {
        question: "What is the difference between this course and learning MM on ECC?",
        answer:
          "S/4HANA changed MM meaningfully: the business partner model, MRP Live, Fiori-first procurement apps, and embedded analytics. This cohort teaches the current system, with classic concepts introduced only where they still underpin configuration.",
      },
      {
        question: "Will I practise on a live SAP system or only slides?",
        answer:
          "On a live system. Every module ends with a lab on our S/4HANA sandbox, and the capstone is a full configuration you build and present there.",
      },
    ],
    syllabusFile: "/syllabi/sap-mm.pdf",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SAP EWM
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "sap-ewm",
    title: "SAP EWM — Extended Warehouse Management on S/4HANA",
    shortTitle: "SAP EWM",
    code: "EWM",
    category: "sap-functional",
    level: "advanced",
    tagline: "Warehouse structure, inbound/outbound flows, RF, and wave management on embedded EWM.",
    description:
      "An advanced cohort for supply chain professionals who want warehouse-depth SAP expertise. Built on embedded EWM in S/4HANA, it covers warehouse structure design, inbound and outbound processing, slotting, wave management, RF framework, and replenishment — with a warehouse simulation that runs the physical flows your configuration creates. Prior SAP or strong warehouse domain knowledge recommended.",
    durationWeeks: 14,
    hoursPerWeek: 10,
    deliveryModes: ["live-virtual", "onsite-bengaluru"],
    language: "English",
    liveSystemAccess: true,
    prerequisites: [
      "SAP MM/SD or WM background, OR 2+ years in warehouse/logistics operations",
      "Understanding of goods receipt, picking, and packing processes",
      "Comfort with process-oriented learning (flow diagrams, scenario walkthroughs)",
    ],
    recommendedFor: [
      "SAP MM/WM consultants upskilling into EWM",
      "Warehouse operations leads transitioning to SAP consulting",
      "Supply chain professionals in 3PL, e-commerce, or manufacturing",
    ],
    tools: [
      "SAP S/4HANA embedded EWM (live sandbox system access)",
      "SAP GUI & Fiori Launchpad",
      "RF framework (RFUI simulation)",
      "Slotting & Condition Technique tools",
      "Labor Management and MFS overview environments",
    ],
    roles: [
      "SAP EWM Consultant",
      "S/4HANA Warehouse Management Consultant",
      "Warehouse Process Consultant",
      "EWM Functional Analyst",
    ],
    modules: [
      {
        code: "M01",
        title: "EWM Overview & Warehouse Structure",
        weeks: 2,
        topics: [
          "EWM vs WM vs stock room management — the S/4HANA decision",
          "Embedded vs decentralised EWM deployment",
          "Warehouse structure: storage types, sections, bins, and quant",
          "Warehouse number, party entitled to dispose, and storage bin master",
          "Storage type roles and warehouse process types",
        ],
        lab: "Design and configure a multi-storage-type warehouse on a live embedded EWM system.",
      },
      {
        code: "M02",
        title: "Master Data & Product/Resource Setup",
        weeks: 1,
        topics: [
          "Product master integration from MM",
          "Packaging specifications and handling units",
          "Resources, users, and queue assignment",
          "Bins and bin types/bin status management",
          "Measurement documents basics",
        ],
        lab: "Configure packaging specs and set up RF resources with queue assignments.",
      },
      {
        code: "M03",
        title: "Inbound Processing",
        weeks: 2,
        topics: [
          "Inbound delivery creation from ASN and PO",
          "Yard management basics and gate check-in",
          "Goods receipt process: deconsolidation, counting, putaway",
          "Putaway strategies and storage type search sequences",
          "Value-added services in inbound",
        ],
        lab: "Run a full ASN-based inbound flow with putaway strategy determination.",
      },
      {
        code: "M04",
        title: "Outbound Processing & Wave Management",
        weeks: 3,
        topics: [
          "Outbound delivery request → delivery order → warehouse task",
          "Picking strategies: FIFO, partial pallets, near-line picking",
          "Wave management: wave templates, release methods, filters",
          "Packing, HU management, and goods issue",
          "PPF (Post Processing Framework) actions in outbound",
        ],
        lab: "Release a sales-order wave, pick via RF simulation, pack, and ship — end to end.",
      },
      {
        code: "M05",
        title: "Slotting, Replenishment & Internal Warehouse Processes",
        weeks: 2,
        topics: [
          "Slotting determination and rearrangement",
          "Replenishment: planned, order-based, and minimum stock",
          "Internal warehouse movements and stock transfers",
          "Ad hoc movements and warehouse task merging",
          "Cycle counting and physical inventory in EWM",
        ],
        lab: "Execute slotting for a product range and configure fixed-bin replenishment.",
      },
      {
        code: "M06",
        title: "RF Framework, Labor Management & MFS Overview",
        weeks: 2,
        topics: [
          "RF framework: screens, logic, and queue management",
          "RF menu design and user experience",
          "Labor management: work sequences and performance measurement",
          "Material Flow System (MFS) for automation — architecture overview",
          "Integration points with conveyor/automation vendors",
        ],
        lab: "Configure a custom RF menu with exception handling for a pick-pack queue.",
      },
      {
        code: "M07",
        title: "Deployment, Testing & Consulting Practice",
        weeks: 2,
        topics: [
          "Embedded EWM activation and scoping",
          "Testing strategy: unit, integration, and operational walkthroughs",
          "Go-live cutover: stock migration and cut-off planning",
          "Hypercare and exception management in live warehouses",
          "Interview scenarios: 40+ EWM case questions",
        ],
        lab: "Write and execute an integration test script for your capstone warehouse and present the cutover plan.",
      },
    ],
    capstone: {
      title: "Embedded EWM Warehouse Go-Live Blueprint",
      description:
        "Design and configure a complete distribution-centre warehouse on live embedded EWM: storage structure with putaway and picking strategies, ASN-driven inbound, wave-managed outbound with RF pick-pack, fixed-bin replenishment, and slotting — culminating in a scripted operational walkthrough and a go-live cutover plan.",
      deliverables: [
        "Configured warehouse structure with putaway/picking strategies",
        "Inbound ASN-to-putaway flow demonstrated end to end",
        "Wave-managed outbound flow with RF picking simulation",
        "Slotting and replenishment configuration",
        "Integration test scripts and cutover/migration plan",
      ],
    },
    trainer: {
      name: "Sneha Ravindran",
      role: "Lead SAP EWM Consultant",
      yearsExperience: 12,
      credentials: [
        "SAP Certified Application Associate – EWM in S/4HANA",
        "Implemented EWM for 8 distribution centres including 2 automation-led (MFS) sites",
        "B.E. Logistics Engineering",
      ],
      bio: "Sneha has configured EWM for 8 distribution centres — from 3PL fast-catalogue operations to automation-led sites. She teaches EWM the way warehouses actually run: structure first, then flows, then exceptions, all on embedded S/4HANA systems.",
    },
    cohorts: [
      {
        id: "ewm-2026-02-virtual",
        startDate: "2026-02-21",
        mode: "live-virtual",
        timing: "Sat–Sun, 9:30 AM – 1:30 PM IST",
        seatsTotal: 20,
        seatsLeft: 14,
        status: "open",
      },
    ],
    faqs: [
      {
        question: "I know SAP MM/WM. Will this EWM cohort feel redundant?",
        answer:
          "No — EWM is a different depth of warehouse management: bin-level granularity, wave management, RF execution, and slotting that WM never had. MM/WM knowledge accelerates your start; the cohort builds warehouse-consulting depth on top of it.",
      },
      {
        question: "Why 'advanced' level — is it not for freshers?",
        answer:
          "EWM consultants are typically hired with prior SAP or warehouse domain exposure, so the cohort assumes process context. Fresh graduates are better served starting with MM and adding EWM 6–12 months later — we advise this path honestly.",
      },
      {
        question: "Is this embedded EWM in S/4HANA or standalone SCM-EWM?",
        answer:
          "Embedded EWM in S/4HANA — the strategic direction for all new deployments. Standalone deployment differences are covered where relevant for legacy projects.",
      },
    ],
    syllabusFile: "/syllabi/sap-ewm.pdf",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Enterprise Full-Stack Engineering
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: "full-stack-java",
    title: "Enterprise Full-Stack Engineering with Java & React",
    shortTitle: "Full Stack Java",
    code: null,
    category: "full-stack-cloud",
    level: "fresher-friendly",
    tagline: "Java 17, Spring Boot microservices, and React — shipped to the cloud in one portfolio.",
    description:
      "A project-first cohort for engineers who want to build and ship production-grade web applications. You go from modern Java fundamentals through Spring Boot REST APIs, security, and microservice patterns, then build React frontends, containerise with Docker, and deploy to the cloud with CI/CD. No slides-first teaching: you commit working code weekly, and finish with two deployed portfolio projects reviewed in mock technical interviews.",
    durationWeeks: 20,
    hoursPerWeek: 12,
    deliveryModes: ["live-virtual", "onsite-bengaluru", "hybrid"],
    language: "English",
    liveSystemAccess: true,
    prerequisites: [
      "Basic programming familiarity (any language — academic level is fine)",
      "A laptop capable of running IntelliJ IDEA, Docker Desktop, and Node.js",
      "Consistency: 12 hours/week including lab time",
    ],
    recommendedFor: [
      "Fresh graduates (B.E./B.Tech/MCA/BCA) targeting product & service company roles",
      "Support/QA/manual testers moving into development",
      "Developers from other stacks (PHP, legacy Java) modernising to current tooling",
    ],
    tools: [
      "Java 17 (LTS) & IntelliJ IDEA",
      "Spring Boot 3 & Spring Security",
      "PostgreSQL & Redis",
      "React 19, TypeScript & Next.js",
      "Docker & Docker Compose",
      "GitHub Actions CI/CD",
      "AWS free tier (EC2/RDS deployment target)",
    ],
    roles: [
      "Full Stack Developer",
      "Java Backend Developer",
      "Software Engineer (Java + React)",
      "Backend Engineer",
    ],
    modules: [
      {
        code: "M01",
        title: "Modern Java Foundations",
        weeks: 3,
        topics: [
          "Java 17 syntax, OOP, and collections in depth",
          "Streams, lambdas, and functional interfaces",
          "Records, sealed classes, and switch expressions",
          "Exception strategy and clean code practices",
          "JUnit 5 & test-driven habits from week one",
        ],
        lab: "Build a tested console domain library (invoicing engine) with full unit coverage.",
      },
      {
        code: "M02",
        title: "Spring Boot & REST API Engineering",
        weeks: 3,
        topics: [
          "Spring core: DI, beans, and configuration",
          "Spring Boot autoconfiguration and profiles",
          "REST API design: resources, status codes, versioning, pagination",
          "Spring Data JPA & PostgreSQL: entities, repositories, transactions",
          "Validation, exception handling, and API documentation (OpenAPI)",
        ],
        lab: "Ship a production-structured REST API with OpenAPI docs and integration tests.",
      },
      {
        code: "M03",
        title: "Security & Application Hardening",
        weeks: 2,
        topics: [
          "Spring Security filter chain architecture",
          "JWT authentication & refresh token flows",
          "Role-based authorization",
          "OWASP Top 10 applied: injection, XSS, CSRF, secrets handling",
          "Password hashing and secure configuration",
        ],
        lab: "Secure your API with JWT + role-based access and pass an OWASP checklist review.",
      },
      {
        code: "M04",
        title: "Microservices & System Design Fundamentals",
        weeks: 3,
        topics: [
          "Monolith → microservices: when the trade-off pays",
          "Service discovery, API gateway, and config management",
          "Inter-service communication: REST, messaging with Kafka basics",
          "Resilience: timeouts, circuit breakers, retries",
          "Caching with Redis; idempotency and consistency patterns",
        ],
        lab: "Split your API into two communicating services with a gateway and Kafka event flow.",
      },
      {
        code: "M05",
        title: "React, TypeScript & the Modern Frontend",
        weeks: 3,
        topics: [
          "React 19 fundamentals: components, hooks, and state patterns",
          "TypeScript for typed UI contracts",
          "Data fetching, caching, and error/loading states",
          "Forms, validation, and accessible UI components",
          "Routing and protected routes",
        ],
        lab: "Build the React/TypeScript frontend for your API with full auth flow.",
      },
      {
        code: "M06",
        title: "Docker, CI/CD & Cloud Deployment",
        weeks: 3,
        topics: [
          "Docker: images, layers, Compose for local environments",
          "Environment configuration & secrets management",
          "GitHub Actions: build, test, and deploy pipelines",
          "Deploying Spring Boot + Postgres to AWS (free tier)",
          "Monitoring basics: structured logging and health checks",
        ],
        lab: "Containerise your full stack and deploy it through a CI/CD pipeline to a live URL.",
      },
      {
        code: "M07",
        title: "Portfolio, Interviews & Professional Practice",
        weeks: 3,
        topics: [
          "Portfolio project polish: READMEs, architecture diagrams, API docs",
          "DSA refresher tuned to Java interview rounds",
          "System design interview basics (load, caching, scaling)",
          "Mock technical interviews: live coding and project defence",
          "Code review etiquette and Git workflow in teams",
        ],
        lab: "Defend both portfolio projects in two recorded mock interviews with written feedback.",
      },
    ],
    capstone: {
      title: "Deployed SaaS-Style Application (Two-Service Architecture)",
      description:
        "Design, build, secure, and deploy a working SaaS-style application — e.g., a team expense tracker or appointment booking system — with a Spring Boot microservice backend (JWT auth, PostgreSQL, Redis caching, Kafka event flow), a React/TypeScript frontend, containerised deployment via GitHub Actions to a live cloud URL. Defended in a recorded mock technical interview.",
      deliverables: [
        "Two-service Spring Boot backend with OpenAPI documentation",
        "JWT-secured auth with role-based access",
        "React 19 + TypeScript frontend with full auth and CRUD flows",
        "Docker Compose local environment + GitHub Actions deployment pipeline",
        "Live deployed URL with health checks and structured logs",
        "Architecture decision record and recorded project defence",
      ],
    },
    trainer: {
      name: "Vikram Deshpande",
      role: "Principal Engineer & Full-Stack Mentor",
      yearsExperience: 15,
      credentials: [
        "Oracle Certified Professional: Java SE 17",
        "AWS Certified Solutions Architect – Associate",
        "Scaled platforms serving 2M+ monthly users across fintech and SaaS",
      ],
      bio: "Vikram has built and scaled Java/React platforms for 15 years, leading teams from monolith-to-microservice transitions and mentoring dozens of engineers into product companies. His cohorts run on the same review-and-ship cadence as his delivery teams: working code, every week.",
    },
    cohorts: [
      {
        id: "fsj-2026-01-evening",
        startDate: "2026-01-19",
        mode: "live-virtual",
        timing: "Mon–Fri, 7:30 – 9:30 PM IST",
        seatsTotal: 30,
        seatsLeft: 9,
        status: "filling",
      },
      {
        id: "fsj-2026-03-weekend",
        startDate: "2026-03-14",
        mode: "hybrid",
        timing: "Sat–Sun, 9:30 AM – 2:30 PM IST",
        seatsTotal: 30,
        seatsLeft: 30,
        status: "open",
      },
    ],
    faqs: [
      {
        question: "Can I join without knowing Java?",
        answer:
          "Yes, if you have basic programming familiarity from academics or work. Module 1 is a rigorous modern-Java ramp-up (Java 17 features included) designed exactly for this — it assumes logic, not syntax.",
      },
      {
        question: "Will I finish with something to show employers?",
        answer:
          "Two deployed, reviewable projects: a secured REST API and the capstone SaaS-style application with a live URL, CI/CD pipeline, and architecture documentation — plus two recorded mock interviews defending them.",
      },
      {
        question: "Does the cohort cover cloud and DevOps, or only coding?",
        answer:
          "Deployment is part of the curriculum, not an afterthought: Docker, GitHub Actions CI/CD, and a real AWS free-tier deployment are graded modules — employers increasingly expect engineers to ship what they build.",
      },
    ],
    syllabusFile: "/syllabi/full-stack-java.pdf",
  },
];

// ─── Lookups & Helpers ───────────────────────────────────────────────────────

export const courseSlugs = courses.map((course) => course.slug);

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function getCoursesByCategory(category: CourseCategory): Course[] {
  return courses.filter((course) => course.category === category);
}

export function getTotalModuleCount(course: Course): number {
  return course.modules.length;
}

export function getCourseDurationLabel(course: Course): string {
  const months = Math.round((course.durationWeeks / 4) * 10) / 10;
  return `${course.durationWeeks} weeks (~${months} months)`;
}

export function getEarliestOpenCohort(course: Course): CohortSchedule | undefined {
  return (
    [...course.cohorts]
      .filter((cohort) => cohort.status !== "closed")
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? undefined
  );
}

/** Display-safe month label, e.g. "2026-02-07" → "Feb 2026". */
export function formatCohortStart(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });
}
