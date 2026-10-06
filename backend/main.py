from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any, Type

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import (
    About, Blog, Experience, Message, Project, Service, Skill, SkillCategory,
    Testimonial, User, get_db, init_db
)


class Settings(BaseSettings):
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

app = FastAPI(title="Custom Portfolio CMS API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(",") if x.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# ---------- Schemas ----------

class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class UserOut(ORM):
    id: int
    email: EmailStr
    is_active: bool


class AboutIn(BaseModel):
    bio: str = ""
    resume_link: str | None = None


class AboutOut(ORM):
    id: int
    bio: str
    resume_link: str | None


class SkillIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: SkillCategory = SkillCategory.other
    proficiency: int = Field(default=50, ge=0, le=100)


class SkillOut(SkillIn, ORM):
    id: int


class ProjectIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    tech_stack: str = ""
    live_link: str | None = None
    github_link: str | None = None
    image: str | None = None


class ProjectOut(ProjectIn, ORM):
    id: int
    created_at: datetime


class BlogIn(BaseModel):
    title: str = Field(min_length=1, max_length=250)
    content: str = ""
    date: date = Field(default_factory=date.today)
    slug: str = Field(min_length=1, max_length=250)


class BlogOut(BlogIn, ORM):
    id: int


class ExperienceIn(BaseModel):
    role: str
    company: str
    timeline: str
    description: str = ""


class ExperienceOut(ExperienceIn, ORM):
    id: int


class TestimonialIn(BaseModel):
    name: str
    role: str
    quote: str


class TestimonialOut(TestimonialIn, ORM):
    id: int


class ServiceIn(BaseModel):
    title: str
    description: str = ""
    icon: str = "Code2"


class ServiceOut(ServiceIn, ORM):
    id: int


class MessageIn(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    subject: str | None = Field(default=None, max_length=250)
    message: str = Field(min_length=1, max_length=10000)


class MessageOut(MessageIn, ORM):
    id: int
    created_at: datetime


# ---------- Auth ----------

def authenticate(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == email.lower().strip()))
    if not user or not user.is_active:
        return None
    return user if password_hash.verify(password, user.password_hash) else None


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": subject, "exp": expire},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        email = payload.get("sub")
        if not email:
            raise credentials_error
    except JWTError:
        raise credentials_error

    user = db.scalar(select(User).where(User.email == email))
    if not user or not user.is_active:
        raise credentials_error
    return user


@app.post("/api/auth/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_access_token(user.email), "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


# ---------- Generic helpers ----------

def get_or_404(db: Session, model: Type[Any], item_id: int):
    item = db.get(model, item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return item


def update_model(item: Any, data: BaseModel):
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)


# ---------- About ----------

@app.get("/api/about", response_model=list[AboutOut])
def public_about(db: Session = Depends(get_db)):
    return db.scalars(select(About).order_by(About.id)).all()


@app.post("/api/about", response_model=AboutOut)
def create_about(data: AboutIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = About(**data.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return item


@app.put("/api/about/{item_id}", response_model=AboutOut)
def update_about(item_id: int, data: AboutIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, About, item_id)
    update_model(item, data); db.commit(); db.refresh(item)
    return item


@app.delete("/api/about/{item_id}")
def delete_about(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, About, item_id)
    db.delete(item); db.commit()
    return {"ok": True}


# ---------- Skills ----------

@app.get("/api/skills", response_model=list[SkillOut])
def public_skills(db: Session = Depends(get_db)):
    return db.scalars(select(Skill).order_by(Skill.id)).all()


@app.post("/api/skills", response_model=SkillOut)
def create_skill(data: SkillIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Skill(**data.model_dump())
    db.add(item); db.commit(); db.refresh(item); return item


@app.put("/api/skills/{item_id}", response_model=SkillOut)
def update_skill(item_id: int, data: SkillIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Skill, item_id); update_model(item, data); db.commit(); db.refresh(item); return item


@app.delete("/api/skills/{item_id}")
def delete_skill(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Skill, item_id); db.delete(item); db.commit(); return {"ok": True}


# ---------- Projects ----------

@app.get("/api/projects", response_model=list[ProjectOut])
def public_projects(db: Session = Depends(get_db)):
    return db.scalars(select(Project).order_by(Project.created_at.desc())).all()


@app.post("/api/projects", response_model=ProjectOut)
def create_project(data: ProjectIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Project(**data.model_dump())
    db.add(item); db.commit(); db.refresh(item); return item


@app.put("/api/projects/{item_id}", response_model=ProjectOut)
def update_project(item_id: int, data: ProjectIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Project, item_id); update_model(item, data); db.commit(); db.refresh(item); return item


@app.delete("/api/projects/{item_id}")
def delete_project(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Project, item_id); db.delete(item); db.commit(); return {"ok": True}


# ---------- Blogs ----------

@app.get("/api/blogs", response_model=list[BlogOut])
def public_blogs(db: Session = Depends(get_db)):
    return db.scalars(select(Blog).order_by(Blog.date.desc())).all()


@app.get("/api/blogs/{slug}", response_model=BlogOut)
def public_blog(slug: str, db: Session = Depends(get_db)):
    item = db.scalar(select(Blog).where(Blog.slug == slug))
    if not item: raise HTTPException(status_code=404, detail="Blog not found")
    return item


@app.post("/api/blogs", response_model=BlogOut)
def create_blog(data: BlogIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Blog(**data.model_dump()); db.add(item)
    try:
        db.commit(); db.refresh(item)
    except Exception:
        db.rollback(); raise HTTPException(status_code=409, detail="Slug already exists")
    return item


@app.put("/api/blogs/{item_id}", response_model=BlogOut)
def update_blog(item_id: int, data: BlogIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Blog, item_id); update_model(item, data)
    try: db.commit(); db.refresh(item)
    except Exception:
        db.rollback(); raise HTTPException(status_code=409, detail="Slug already exists")
    return item


@app.delete("/api/blogs/{item_id}")
def delete_blog(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Blog, item_id); db.delete(item); db.commit(); return {"ok": True}


# ---------- Experience ----------

@app.get("/api/experience", response_model=list[ExperienceOut])
def public_experience(db: Session = Depends(get_db)):
    return db.scalars(select(Experience).order_by(Experience.id.desc())).all()


@app.post("/api/experience", response_model=ExperienceOut)
def create_experience(data: ExperienceIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Experience(**data.model_dump()); db.add(item); db.commit(); db.refresh(item); return item


@app.put("/api/experience/{item_id}", response_model=ExperienceOut)
def update_experience(item_id: int, data: ExperienceIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Experience, item_id); update_model(item, data); db.commit(); db.refresh(item); return item


@app.delete("/api/experience/{item_id}")
def delete_experience(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Experience, item_id); db.delete(item); db.commit(); return {"ok": True}


# ---------- Testimonials ----------

@app.get("/api/testimonials", response_model=list[TestimonialOut])
def public_testimonials(db: Session = Depends(get_db)):
    return db.scalars(select(Testimonial).order_by(Testimonial.id.desc())).all()


@app.post("/api/testimonials", response_model=TestimonialOut)
def create_testimonial(data: TestimonialIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Testimonial(**data.model_dump()); db.add(item); db.commit(); db.refresh(item); return item


@app.put("/api/testimonials/{item_id}", response_model=TestimonialOut)
def update_testimonial(item_id: int, data: TestimonialIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Testimonial, item_id); update_model(item, data); db.commit(); db.refresh(item); return item


@app.delete("/api/testimonials/{item_id}")
def delete_testimonial(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Testimonial, item_id); db.delete(item); db.commit(); return {"ok": True}


# ---------- Services ----------

@app.get("/api/services", response_model=list[ServiceOut])
def public_services(db: Session = Depends(get_db)):
    return db.scalars(select(Service).order_by(Service.id)).all()


@app.post("/api/services", response_model=ServiceOut)
def create_service(data: ServiceIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Service(**data.model_dump()); db.add(item); db.commit(); db.refresh(item); return item


@app.put("/api/services/{item_id}", response_model=ServiceOut)
def update_service(item_id: int, data: ServiceIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Service, item_id); update_model(item, data); db.commit(); db.refresh(item); return item


@app.delete("/api/services/{item_id}")
def delete_service(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Service, item_id); db.delete(item); db.commit(); return {"ok": True}


# ---------- Messages ----------

@app.post("/api/messages", response_model=MessageOut, status_code=201)
def create_message(data: MessageIn, db: Session = Depends(get_db)):
    item = Message(**data.model_dump()); db.add(item); db.commit(); db.refresh(item); return item


@app.get("/api/messages", response_model=list[MessageOut])
def admin_messages(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.scalars(select(Message).order_by(Message.created_at.desc())).all()


@app.delete("/api/messages/{item_id}")
def delete_message(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = get_or_404(db, Message, item_id); db.delete(item); db.commit(); return {"ok": True}


@app.get("/api/health")
def health():
    return {"status": "ok"}
