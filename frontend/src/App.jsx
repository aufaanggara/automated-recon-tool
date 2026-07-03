import { useState, useEffect } from "react";

const BACKEND = "http://127.0.0.1:8000";

function parseNmapHosts(lines) {
  const hosts = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith("Nmap scan report for")) {
      if (current) hosts.push(current);
      const match = line.match(/for (.+?) \((.+?)\)/) || line.match(/for (.+)/);
      current = {
        host: match?.[1] || line,
        ip: match?.[2] || "",
        ports: [],
      };
    } else if (current && /^\d+\/tcp/.test(line)) {
      const parts = line.trim().split(/\s+/);
      current.ports.push({
        port: parts[0],
        state: parts[1],
        service: parts[2],
        version: parts.slice(3).join(" "),
      });
    }
  }
  if (current) hosts.push(current);
  return hosts;
}

function parseWhois(lines) {
  const fields = {
    "Domain Name": null,
    "Registrar": null,
    "Creation Date": null,
    "Registry Expiry Date": null,
    "Registrar Registration Expiration Date": null,
    "Updated Date": null,
    "Name Server": [],
    "Domain Status": [],
    "DNSSEC": null,
  };
  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    const k = key?.trim();
    const v = rest.join(":").trim();
    if (!v) continue;
    if (k === "Name Server") fields["Name Server"].push(v);
    else if (k === "Domain Status") {
      const status = v.split(" ")[0];
      if (!fields["Domain Status"].includes(status))
        fields["Domain Status"].push(status);
    } else if (fields[k] === null) fields[k] = v;
  }
  return fields;
}

export default function App() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("subdomains");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND}/history`)
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {});
  }, []);

  const handleScan = async () => {
    if (!domain) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${BACKEND}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      setResult(data);
      fetch(`${BACKEND}/history`)
        .then((r) => r.json())
        .then(setHistory)
        .catch(() => {});
    } catch (err) {
      alert("Gagal konek ke backend: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const nmapHosts = result ? parseNmapHosts(result.nmap_result || []) : [];
  const whoisData = result ? parseWhois(result.whois_result || []) : {};

  const tabs = [
    { key: "subdomains", label: "Subdomains", count: result?.subdomains?.length },
    { key: "live_hosts", label: "Live Hosts", count: result?.live_hosts?.length },
    { key: "nmap_result", label: "Nmap", count: nmapHosts.length },
    { key: "whois_result", label: "Domain Info", count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono flex flex-col items-center p-6">
      {/* Header */}
      <div className="mt-12 mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-widest text-green-400">
          RECON TOOL
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Automated Reconnaissance Web Interface
        </p>
      </div>

      {/* Input */}
      <div className="w-full max-w-xl flex gap-2">
        <input
          type="text"
          placeholder="masukkan domain target (contoh: hackerone.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScan()}
          className="flex-1 bg-gray-900 border border-green-700 text-green-300 placeholder-gray-600 px-4 py-2 rounded focus:outline-none focus:border-green-400"
        />
        <button
          onClick={handleScan}
          disabled={loading}
          className="bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold px-5 py-2 rounded transition-colors"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 text-green-500 animate-pulse text-sm">
          Menjalankan recon... ini mungkin memakan waktu beberapa menit
        </div>
      )}

      {/* Hasil */}
      {result && !loading && (
        <div className="mt-6 w-full max-w-xl bg-gray-900 border border-green-800 rounded p-4">
          <p className="text-green-300 text-sm mb-1">
            Scan selesai untuk:{" "}
            <span className="font-bold text-green-400">{result.domain}</span>
          </p>
          <p className="text-gray-500 text-xs mb-3">
            {result.subdomains?.length} subdomains ditemukan &bull;{" "}
            {result.live_hosts?.length} host aktif &bull;{" "}
            {nmapHosts.length} host di-scan
          </p>
          <button
            onClick={() => { setShowModal(true); setActiveTab("subdomains"); }}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-green-700 text-green-400 py-2 rounded text-sm transition-colors"
          >
            Lihat Hasil Lengkap
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8 w-full max-w-xl">
          <p className="text-gray-500 text-xs mb-2 uppercase tracking-widest">
            Riwayat Scan
          </p>
          <div className="border border-gray-800 rounded overflow-hidden">
            {history.map((h, i) => (
              <div
                key={h.id}
                className={`flex justify-between items-center px-4 py-2 text-sm ${
                  i % 2 === 0 ? "bg-gray-900" : "bg-gray-950"
                }`}
              >
                <span className="text-green-300">{h.domain}</span>
                <span className="text-gray-600 text-xs">
                  {h.subdomains_count} sub &bull; {h.live_hosts_count} live &bull;{" "}
                  {new Date(h.scan_time).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-green-700 rounded-lg w-full max-w-3xl h-[80vh] flex flex-col modal-animate">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-green-900 shrink-0">
              <div>
                <h2 className="text-green-400 font-bold">{result.domain}</h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  {result.subdomains?.length} subdomains &bull;{" "}
                  {result.live_hosts?.length} live hosts &bull;{" "}
                  {nmapHosts.length} hosts scanned
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-400 text-xl px-2"
              >
                x
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-green-900 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-xs font-bold transition-colors ${
                    activeTab === tab.key
                      ? "text-green-400 border-b-2 border-green-400"
                      : "text-gray-500 hover:text-green-600"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-1 text-gray-600">({tab.count})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto flex-1 p-4">
              {/* Subdomains */}
              {activeTab === "subdomains" && (
                <ul className="text-sm space-y-1">
                  {result.subdomains?.map((s, i) => (
                    <li key={i} className="text-green-300 border-b border-gray-800 py-1">
                      {s}
                    </li>
                  ))}
                </ul>
              )}

              {/* Live Hosts */}
              {activeTab === "live_hosts" && (
                <ul className="text-sm space-y-1">
                  {result.live_hosts?.map((h, i) => (
                    <li key={i} className="border-b border-gray-800 py-1 flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                        h.startsWith("https") ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"
                      }`}>
                        {h.startsWith("https") ? "HTTPS" : "HTTP"}
                      </span>
                      <span className="text-green-300">
                        {h.replace("https://", "").replace("http://", "")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Nmap */}
              {activeTab === "nmap_result" && (
                <div className="space-y-3">
                  {nmapHosts.length === 0 ? (
                    <p className="text-gray-600 text-sm">Tidak ada data.</p>
                  ) : (
                    nmapHosts.map((host, i) => (
                      <div key={i} className="border border-gray-800 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-green-400 font-bold text-sm">{host.host}</span>
                          {host.ip && <span className="text-gray-500 text-xs">{host.ip}</span>}
                        </div>
                        {host.ports.length > 0 ? (
                          <div className="space-y-1">
                            {host.ports.map((p, j) => (
                              <div key={j} className="flex gap-2 items-center text-xs">
                                <span className="bg-green-900 text-green-300 px-1.5 py-0.5 rounded font-bold">
                                  {p.port}
                                </span>
                                <span className="text-gray-400">{p.service}</span>
                                {p.version && (
                                  <span className="text-gray-600">{p.version}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 text-xs">Tidak ada port terbuka.</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Whois */}
              {activeTab === "whois_result" && (
                <div className="space-y-2 text-sm">
                  {[
                    ["Domain", whoisData["Domain Name"]],
                    ["Registrar", whoisData["Registrar"]],
                    ["Created", whoisData["Creation Date"]],
                    ["Expires", whoisData["Registry Expiry Date"] || whoisData["Registrar Registration Expiration Date"]],
                    ["Updated", whoisData["Updated Date"]],
                    ["DNSSEC", whoisData["DNSSEC"]],
                  ].map(([label, value]) =>
                    value ? (
                      <div key={label} className="flex gap-3 border-b border-gray-800 py-1.5">
                        <span className="text-gray-500 w-20 shrink-0">{label}</span>
                        <span className="text-green-300 break-all">{value}</span>
                      </div>
                    ) : null
                  )}
                  {whoisData["Name Server"]?.length > 0 && (
                    <div className="flex gap-3 border-b border-gray-800 py-1.5">
                      <span className="text-gray-500 w-20 shrink-0">NS</span>
                      <div className="space-y-0.5">
                        {whoisData["Name Server"].map((ns, i) => (
                          <div key={i} className="text-green-300">{ns}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {whoisData["Domain Status"]?.length > 0 && (
                    <div className="flex gap-3 py-1.5">
                      <span className="text-gray-500 w-20 shrink-0">Status</span>
                      <div className="flex flex-wrap gap-1">
                        {whoisData["Domain Status"].map((s, i) => (
                          <span key={i} className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}