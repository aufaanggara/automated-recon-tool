import { useState } from "react";

export default function App() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("subdomains");

  const handleScan = async () => {
    if (!domain) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Gagal konek ke backend: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-green-400 tracking-widest">
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
          placeholder="masukkan domain target (contoh: tesla.com)"
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
            ✅ Scan selesai untuk:{" "}
            <span className="font-bold text-green-400">{result.domain}</span>
          </p>
          <p className="text-gray-500 text-xs mb-3">
            {result.subdomains?.length} subdomain ditemukan •{" "}
            {result.live_hosts?.length} host aktif
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-green-700 text-green-400 py-2 rounded text-sm transition-colors"
          >
            Lihat Hasil Lengkap
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-green-700 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-green-900">
              <h2 className="text-green-400 font-bold">
                Hasil Recon: {result.domain}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-400 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-green-900">
              {["subdomains", "live_hosts", "nmap_result", "whois_result"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-bold transition-colors ${
                      activeTab === tab
                        ? "text-green-400 border-b-2 border-green-400"
                        : "text-gray-500 hover:text-green-600"
                    }`}
                  >
                    {tab === "subdomains" && "Subdomains"}
                    {tab === "live_hosts" && "Live Hosts"}
                    {tab === "nmap_result" && "Nmap Result"}
                    {tab === "whois_result" && "Domain Info"}
                  </button>
                )
              )}
            </div>

            {/* Tab Content */}
            <div className="overflow-y-auto p-4 flex-1">
              {result[activeTab]?.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {result[activeTab].map((item, i) => (
                    <li key={i} className="text-green-300 border-b border-gray-800 py-1">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-sm">Tidak ada data.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}