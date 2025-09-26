from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import databases
import sqlalchemy

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/postdb")
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

posts = sqlalchemy.Table(
    "posts", metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("title", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("body", sqlalchemy.Text, nullable=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, server_default=sqlalchemy.func.now())
)

engine = sqlalchemy.create_engine(DATABASE_URL)
metadata.create_all(engine)

app = FastAPI()

class PostIn(BaseModel):
    title: str
    body: str = ""

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/api/posts")
async def create_post(payload: PostIn):
    query = posts.insert().values(title=payload.title, body=payload.body)
    last_id = await database.execute(query)
    return {"id": last_id}

@app.get("/api/posts")
async def list_posts():
    query = posts.select().order_by(posts.c.created_at.desc())
    return await database.fetch_all(query)

@app.get("/health")
async def health():
    return {"service":"post-service","ok":True}
