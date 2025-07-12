# Interactive Bible App

## Overview
Interactive visualization of Bible cross-references using ESV, Neo4j graph, React/Three.js. Adheres to Creationism, no evolution references.

## Setup Local Environment
1. Clone repo: `git clone https://github.com/jdc316/interactive-bible-app`
2. Install deps: `cd backend; npm install` and `cd ../frontend; npm install`
3. Set .env in backend: NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, ESV_API_KEY (get from https://api.esv.org/account/), REDIS_URL (optional)
4. Run Docker: `docker-compose up` (starts Neo4j, backend:3001, frontend:3000)
5. Ingest data: `cd backend; node scripts/ingestData.js` (downloads cross-refs if needed)
6. Access: http://localhost:3000
7. Tests: `npm test` in backend/frontend

## Deployment
- Cloud: AWS (EC2 for backend, S3 for frontend, Aura for Neo4j)
- CI/CD: GitHub Actions for build/test/deploy
- Monitoring: Prometheus/Sentry

## License
Non-commercial; ESV license compliance enforced.

interactive-bible-app/
├── backend/
│   ├── package.json  (from Step 1)
│   ├── server.js  (from Step 8, updated)
│   ├── services/
│   │   └── esvService.js  (Step 2)
│   ├── scripts/
│   │   ├── parseCrossRefs.js  (Step 3)
│   │   ├── validateCrossRefs.js  (Step 5)
│   │   ├── parseBibleStructure.js  (Step 4)
│   │   ├── ingestData.js  (Step 7, updated)
│   │   ├── analysis.js  (Step 12)
│   │   └── optimize.js  (Step 9)
│   ├── graphql/
│   │   └── schema.js  (Step 8)
│   ├── db/
│   │   ├── schema.cypher  (Step 6)
│   │   └── init.js  (Step 6)
│   └── .env.example  (NEO4J_URI=bolt://localhost:7687, etc.)
├── frontend/
│   ├── package.json  (Step 1)
│   ├── src/
│   │   ├── App.js  (Step 14)
│   │   ├── components/
│   │   │   └── Graph.js  (Step 14)
│   │   └── index.js  (standard React)
│   └── public/
│       └── index.html  (standard)
├── docker-compose.yml  (Step 1)
├── README.md  (below)
└── .gitignore  (standard Node/React)