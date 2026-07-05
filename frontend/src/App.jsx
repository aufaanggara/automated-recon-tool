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
  const [selectedNmapHost, setSelectedNmapHost] = useState(null);

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

      if (res.status === 429) {
        alert("Terlalu banyak request. Tunggu 1 menit sebelum scan lagi.");
        return;
      }
      if (res.status === 422) {
        alert("Format domain tidak valid.");
        return;
      }

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
    <div className="min-h-screen bg-[#0a0f16] text-gray-300 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-stretch gap-12 md:gap-16">
        
        {/* Left Column - Description */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <p className="text-green-500 font-bold text-sm tracking-widest mb-4 uppercase">
            About Tool
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-6 leading-tight">
            Automated <br /> reconnaissance
          </h1>
          
          <div className="text-gray-400 space-y-4 text-base md:text-lg leading-relaxed mb-8">
            <p>
              Project ini adalah alat otomatisasi recon (pengumpulan informasi) untuk sebuah domain target yang menggabungkan beberapa tool keamanan dalam satu antarmuka.
            </p>
            <p>
              Alat ini akan secara otomatis mencari subdomain, memvalidasi host yang aktif, melakukan pemindaian port terbuka, dan mengambil informasi WHOIS.
            </p>
            <p>
              Cukup masukkan nama domain di form sebelah kanan untuk memulai pemindaian otomatis.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {["Subfinder", "HTTPX", "Nmap", "Whois"].map((tool) => (
              <span key={tool} className="bg-gray-900 border border-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column - App Tool */}
        <div className="w-full md:w-1/2 flex flex-col items-center bg-[#0d131b] border border-gray-800 rounded-2xl shadow-2xl p-8 font-mono text-green-400 h-full">
          {/* Header */}
          <div className="mb-8 text-center">
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
            <div className="border border-gray-800 rounded overflow-y-auto max-h-56 custom-scrollbar">
              {history.map((h, i) => (
                <div
                  key={h.id}
                  className={`flex justify-between items-center px-4 py-3 text-sm ${
                    i % 2 === 0 ? "bg-gray-900/50" : "bg-transparent"
                  }`}
                >
                  <span className="text-green-300 font-bold">{h.domain}</span>
                  <span className="text-gray-500 text-xs text-right">
                    {h.subdomains_count} sub &bull; {h.live_hosts_count} live <br className="md:hidden" />
                    <span className="hidden md:inline"> &bull; </span>
                    {new Date(h.scan_time).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Nmap Detail Modal */}
      {selectedNmapHost && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#0d131b] border border-green-800 rounded-xl w-full max-w-md flex flex-col shadow-2xl modal-animate font-mono">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div>
                <h3 className="text-green-400 font-bold">{selectedNmapHost.host}</h3>
                {selectedNmapHost.ip && <p className="text-gray-500 text-xs mt-0.5">{selectedNmapHost.ip}</p>}
              </div>
              <button onClick={() => setSelectedNmapHost(null)} className="text-gray-500 hover:text-red-400 text-2xl leading-none px-2">&times;</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {selectedNmapHost.ports.length > 0 ? (
                <div className="space-y-2">
                  {selectedNmapHost.ports.map((p, j) => (
                    <div key={j} className="flex flex-col gap-1 border border-gray-800 bg-gray-900/50 rounded p-3 text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="bg-green-900 text-green-300 px-2 py-0.5 rounded text-xs font-bold">
                          Port {p.port}
                        </span>
                        <span className="text-gray-400 text-xs uppercase font-semibold">{p.state}</span>
                      </div>
                      <div className="text-gray-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span className="font-bold text-blue-400">{p.service}</span>
                      </div>
                      {p.version && (
                        <div className="text-gray-500 text-xs ml-3.5 mt-0.5">
                          {p.version}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Tidak ada port terbuka yang terdeteksi.</p>
              )}
            </div>
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
            <div className="overflow-y-auto custom-scrollbar flex-1 p-4">
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
                <div className="space-y-6">
                  {(() => {
                    const httpsHosts = result.live_hosts?.filter(h => h.startsWith("https")) || [];
                    const httpHosts = result.live_hosts?.filter(h => h.startsWith("http") && !h.startsWith("https")) || [];
                    
                    return (
                      <>
                        {httpsHosts.length > 0 && (
                          <div>
                            <h3 className="text-green-500 font-bold mb-3 border-b border-green-900 pb-2">HTTPS ({httpsHosts.length})</h3>
                            <ul className="text-sm space-y-1">
                              {httpsHosts.map((h, i) => (
                                <li key={i} className="border-b border-gray-800/50 py-1.5 flex items-center gap-2">
                                  <span className="text-[10px] bg-green-900/80 text-green-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">HTTPS</span>
                                  <span className="text-green-300">{h.replace("https://", "")}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {httpHosts.length > 0 && (
                          <div>
                            <h3 className="text-yellow-500 font-bold mb-3 border-b border-yellow-900 pb-2">HTTP ({httpHosts.length})</h3>
                            <ul className="text-sm space-y-1">
                              {httpHosts.map((h, i) => (
                                <li key={i} className="border-b border-gray-800/50 py-1.5 flex items-center gap-2">
                                  <span className="text-[10px] bg-yellow-900/80 text-yellow-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">HTTP</span>
                                  <span className="text-green-300">{h.replace("http://", "")}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Nmap */}
              {activeTab === "nmap_result" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nmapHosts.length === 0 ? (
                    <p className="text-gray-600 text-sm col-span-full">Tidak ada data.</p>
                  ) : (
                    nmapHosts.map((host, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedNmapHost(host)}
                        className="border border-gray-800 bg-gray-900/40 hover:bg-gray-800 cursor-pointer rounded-lg p-4 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-green-400 font-bold text-sm truncate pr-2">{host.host}</span>
                          </div>
                          {host.ip && <span className="text-gray-500 text-xs mb-3 block">{host.ip}</span>}
                        </div>
                        <div className="text-xs text-gray-400 border-t border-gray-800 pt-2 mt-2">
                          <span className="text-green-500 font-bold">{host.ports.length}</span> port terbuka ditemukan
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Whois */}
              {activeTab === "whois_result" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5 col-span-full shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Primary Info</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                      {[
                        ["Domain", whoisData["Domain Name"]],
                        ["Registrar", whoisData["Registrar"]],
                        ["Created", whoisData["Creation Date"]],
                        ["Expires", whoisData["Registry Expiry Date"] || whoisData["Registrar Registration Expiration Date"]],
                        ["Updated", whoisData["Updated Date"]],
                        ["DNSSEC", whoisData["DNSSEC"]],
                      ].map(([label, value]) =>
                        value ? (
                          <div key={label} className="flex flex-col">
                            <span className="text-gray-500 text-xs mb-1 uppercase tracking-wider">{label}</span>
                            <span className="text-green-300 font-semibold break-all text-sm">{value}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>

                  {whoisData["Name Server"]?.length > 0 && (
                    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5 shadow-sm">
                      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Name Servers</h3>
                      <ul className="space-y-2">
                        {whoisData["Name Server"].map((ns, i) => (
                          <li key={i} className="text-green-300 text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                            <span className="truncate">{ns}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {whoisData["Domain Status"]?.length > 0 && (
                    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-5 shadow-sm">
                      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Domain Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {whoisData["Domain Status"].map((s, i) => (
                          <span key={i} className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-md">
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
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #166534;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #15803d;
        }
      `}</style>
    </div>
  );
}