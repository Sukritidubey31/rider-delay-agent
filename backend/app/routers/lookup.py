from fastapi import APIRouter
from app.database import supabase

router = APIRouter(tags=["lookup"])

@router.get("/riders")
def list_riders():
    return supabase.table("rider").select("id, name, phone").execute().data

@router.get("/customers")
def list_customers():
    return supabase.table("customer").select("id, name").execute().data

@router.get("/stores")
def list_stores():
    return supabase.table("store").select("id, name").execute().data