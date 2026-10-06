from database import SessionLocal, User, About, Skill, Project, Experience, Service, init_db, SkillCategory
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

init_db()
db = SessionLocal()

try:
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        db.add(User(
            email="admin@example.com",
            password_hash=password_hash.hash("ChangeMe123!"),
            is_active=True,
        ))

    if not db.query(About).first():
        db.add(About(
            bio="B.Tech CSE student building practical software with Python, React and modern web technologies.",
            resume_link="https://example.com/resume.pdf",
        ))

    if not db.query(Skill).first():
        db.add_all([
            Skill(name="Python", category=SkillCategory.backend, proficiency=85),
            Skill(name="React / Next.js", category=SkillCategory.frontend, proficiency=80),
            Skill(name="FastAPI", category=SkillCategory.backend, proficiency=75),
            Skill(name="SQL", category=SkillCategory.database, proficiency=70),
        ])

    if not db.query(Project).first():
        db.add(Project(
            title="Custom Portfolio CMS",
            description="A headless portfolio CMS built from scratch.",
            tech_stack="FastAPI, SQLAlchemy, SQLite, Next.js, Tailwind",
            github_link="https://github.com/",
        ))

    if not db.query(Experience).first():
        db.add(Experience(
            role="B.Tech CSE Student",
            company="KL University",
            timeline="2025 — 2029",
            description="Studying computer science and building software projects.",
        ))

    if not db.query(Service).first():
        db.add(Service(
            title="Full-Stack Development",
            description="Modern web applications from API to polished frontend.",
            icon="Code2",
        ))

    db.commit()
    print("Database seeded. Login: admin@example.com / ChangeMe123!")
finally:
    db.close()
