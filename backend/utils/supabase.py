import os
from supabase import create_client, Client
from icecream import ic

url: str = os.environ.get("SUPABASE_URL", "http://127.0.0.1:54321")
key: str = os.environ.get(
    "SUPABASE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
)

ic(url)
ic(key)


supabase: Client = create_client(url, key)
