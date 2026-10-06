# Custom Headless Portfolio CMS

A production-oriented starter monorepo with:
- FastAPI + SQLAlchemy 2 + SQLite/PostgreSQL-compatible database layer
- JWT admin authentication
- CRUD API for About, Skills, Projects, Blogs, Experience, Testimonials, Services, Messages
- Next.js App Router admin dashboard
- Next.js App Router public portfolio using server-side fetching
- Tailwind CSS
- Axios for admin/client API requests

## 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

python seed.py
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

Default seeded admin:
- email: admin@example.com
- password: ChangeMe123!

**Change the password before production.**

## 2. Admin panel

```bash
cd admin
npm install
copy .env.local.example .env.local
npm run dev
```

Open http://localhost:3001

## 3. Public portfolio

```bash
cd web
npm install
copy .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

## Production

Use strong secrets and a PostgreSQL `DATABASE_URL`, for example:

DATABASE_URL=postgresql+psycopg://user:password@host:5432/portfolio
JWT_SECRET_KEY=<long-random-secret>
CORS_ORIGINS=https://admin.example.com,https://example.com
PUBLIC_API_URL=https://api.example.com

For production, put FastAPI behind HTTPS/reverse proxy and use a managed PostgreSQL database. Run migrations with Alembic rather than relying on `create_all`.
