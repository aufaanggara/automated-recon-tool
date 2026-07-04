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
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
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
    print(f"[DEBUG] Mulai scan: {request.domain}")
    result = subprocess.run(
        ["/home/aufa/go/bin/subfinder", "-d", request.domain, "-timeout", "30"],
        capture_output=True,
        text=True,
    )
    print(f"[DEBUG] Subfinder selesai: {len(result.stdout.splitlines())} subdomain")

    subdomains = [s for s in result.stdout.split("\n") if s]
    httpx_result = subprocess.run(
        ["/home/aufa/go/bin/httpx", "-silent"],
        input="\n".join(subdomains),
        capture_output=True,
        text=True,
    )
    print(f"[DEBUG] httpx selesai: {len(httpx_result.stdout.splitlines())} live hosts")

    live_hosts = [s for s in httpx_result.stdout.split("\n") if s]
    live_hosts_clean = [
        h.removeprefix("https://").removeprefix("http://") for h in live_hosts
    ]
    live_hosts_clean = live_hosts_clean[:10]

    print(f"[DEBUG] Mulai nmap untuk {len(live_hosts_clean)} hosts")
    nmap = subprocess.run(
        # ["time", "nmap", "-sV", "-sC", "--open", "-F"] + live_hosts_clean,
        ["nmap", "--open", "-F"] + live_hosts_clean,    
        # ["nmap", "-sV", "--open", "-F", "--version-intensity", "0"] + live_hosts_clean,
        # ["nmap", "-sV", "--open", "-F", "--host-timeout", "30s"] + live_hosts_clean,
        capture_output=True,
        text=True,
    )
    print(f"[DEBUG] nmap selesai")
    nmap_result = [s for s in nmap.stdout.split("\n") if s]

    whois = subprocess.run(["whois", request.domain], capture_output=True, text=True)
    print(f"[DEBUG] whois selesai")
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

    print("[DEBUG] OPTIONS /scan diterima")
    return {
        "domain": request.domain,
        "subdomains": subdomains,
        "live_hosts": live_hosts,
        "nmap_result": nmap_result,
        "whois_result": whois_result,
    }


@app.get("/history")
def get_history():
    db = SessionLocal()
    scans = db.query(ScanResult).order_by(ScanResult.scan_time.desc()).limit(10).all()
    db.close()
    return [
        {
            "id": s.id,
            "domain": s.domain,
            "scan_time": str(s.scan_time),
            "subdomains_count": len(json.loads(s.subdomains)) if s.subdomains else 0,
            "live_hosts_count": len(json.loads(s.live_hosts)) if s.live_hosts else 0,
        }
        for s in scans
    ]
