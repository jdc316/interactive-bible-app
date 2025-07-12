# Interactive Bible App

## Overview
Interactive visualization of Bible cross-references using ESV, Neo4j graph, React/Three.js. Adheres to Creationism, no evolution references.

### Prerequisites for the Interactive Bible App

To run the app locally, ensure you have the following software and configurations. These are standard for a Node.js/React app with Dockerized services (Neo4j database, Redis caching). The setup assumes a development environment on macOS, Windows, or Linux.

#### Software and Tools Required
- **Node.js and npm**: Version 18 or higher (LTS recommended).  
  - Download from: [https://nodejs.org/](https://nodejs.org/)  
  - Why: Handles JavaScript runtime and package installation (e.g., `npm install`).

- **Docker**: Docker Desktop (includes Docker Compose).  
  - Download from: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)  
  - Why: Simplifies running the database and cache without manual installation. Ensure Docker is running before using `docker-compose up`.

- **Git**: For cloning the repository.  
  - Download from: [https://git-scm.com/](https://git-scm.com/)  
  - Why: To get the code: `git clone https://github.com/jdc316/interactive-bible-app`.

- **ESV API Key**: Required for fetching Bible text dynamically (from Crossway ESV API).  
  - How to obtain: Sign up for a free account at [https://api.esv.org/account/create-application/](https://api.esv.org/account/create-application/). Fill out the form with your app details (name, description, mark as non-commercial). It's free for non-commercial use, with fair-use limits (e.g., no bulk storage beyond 500 verses; dynamic fetching only). Approval is quick, and you'll get a token key via email or on the dashboard.  
  - Why: Complies with copyright; without it, text fetching will fail.

- **Optional: Redis**: If not using Docker (which includes it), install locally for caching.  
  - Why: Improves performance for repeated queries (e.g., verse text).

No other prerequisites like Python or additional libraries are needed, as everything runs in Node/Docker.

#### Local Environment Setup Steps
1. **Clone the Repo**:  
   ```
   git clone https://github.com/jdc316/interactive-bible-app
   cd interactive-bible-app
   ```

2. **Install Dependencies**:  
   - Backend: `cd backend && npm install`  
   - Frontend: `cd ../frontend && npm install`

3. **Configure .env** (in the backend folder):  
   - Copy `.env.example` to `.env`.  
   - Fill in the values:  
     ```
     NEO4J_URI=bolt://localhost:7687
     NEO4J_USER=neo4j
     NEO4J_PASSWORD=password  # Default; change if customized in Docker
     ESV_API_KEY=your_token_here  # From ESV signup
     REDIS_URL=redis://localhost:6379
     JWT_SECRET=some_secure_secret  # For future auth; can be random for now
     ```

4. **Start Services with Docker**:  
   - Run `docker-compose up -d` (detached mode).  
   - This starts Neo4j (browser at http://localhost:7474) and Redis.  
   - Verify: In the Neo4j browser, login with neo4j/password.

5. **Initialize Database Schema**:  
   - `cd backend && node db/init.js`  
   - This runs the schema.cypher to create constraints and indexes.

6. **Ingest Data**:  
   - `node scripts/ingestData.js`  
   - This parses, validates, and ingests Bible structure and cross-references (downloads ZIP if missing).  
   - Run analysis if needed: `node scripts/analysis.js` (for centrality scores).

7. **Start Servers**:  
   - Backend: `npm start` (runs on http://localhost:3001)  
   - Frontend: `cd ../frontend && npm start` (runs on http://localhost:3000)

8. **Test**:  
   - Visit http://localhost:3000 – should show the graph.  
   - API test: http://localhost:3001/api/v1/verses?reference=Gen.1.1 – returns verse with text.

#### Troubleshooting
- **Docker errors**: Ensure ports 7474/7687/6379 are free and Docker has sufficient resources (e.g., increase memory in Docker settings if ingestion is slow).
- **ESV fetch fails**: Verify API key validity and network connection.
- **Ingestion slow**: For full data, it processes in batches; expect 5-10 minutes on first run.
- **Other issues**: Check console logs; ensure all deps installed without errors.

This setup ensures the app's steps (e.g., ingestion, APIs, graph rendering) work as implemented. If expanding features (e.g., auth), add more .env variables as needed.

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
