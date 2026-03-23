from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.scheduler.poller import start_scheduler, stop_scheduler
from app.routers import webhooks, orders, delays, lookup


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="Rider Delay Agent",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhooks.router)
app.include_router(orders.router)
app.include_router(delays.router)
app.include_router(lookup.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Rider Delay Agent running"}
