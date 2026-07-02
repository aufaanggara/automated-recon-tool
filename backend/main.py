from fastapi import FastAPI
from pydantic import BaseModel
import subprocess
import json
from database import SessionLocal, ScanResult, init_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScanRequest(BaseModel):
    domain: str


@app.get("/")
def local():
    return {"status": "on"}


@app.post("/scan")
def scan_domain(request: ScanRequest):
    result = subprocess.run(
        ["/home/aufa/go/bin/subfinder", "-d", request.domain, "-timeout", "30"],
        capture_output=True,
        text=True,
    )
    subdomains = [s for s in result.stdout.split("\n") if s]

    httpx_result = subprocess.run(
        ["/home/aufa/go/bin/httpx", "-silent"],
        input="\n".join(subdomains),
        capture_output=True,
        text=True,
    )
    live_hosts = [s for s in httpx_result.stdout.split("\n") if s]

    live_hosts_clean = [
        h.removeprefix("https://").removeprefix("http://") for h in live_hosts
    ]
    live_hosts_clean = live_hosts_clean[:10]

    nmap = subprocess.run(
        ["nmap", "-sV", "-sC", "--open", "-F"] + live_hosts_clean,
        capture_output=True,
        text=True,
    )
    nmap_result = [s for s in nmap.stdout.split("\n") if s]

    whois = subprocess.run(["whois", request.domain], capture_output=True, text=True)
    whois_result = [s for s in whois.stdout.split("\n") if s]

    db = SessionLocal()
    scan = ScanResult(
        domain=request.domain,
        subdomains=json.dumps(subdomains),
        live_hosts=json.dumps(live_hosts),
        nmap_result=json.dumps(nmap_result),
        whois_result=json.dumps(whois_result),
    )
    db.add(scan)
    db.commit()
    db.close()

    return {
        "domain": request.domain,
        "subdomains": subdomains,
        "live hosts": live_hosts,
        "nmap result": nmap_result,
        "domain information": whois_result,
    }
