import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function ConnectDevicesModal({ onClose, activeClientsCount }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [activeTab, setActiveTab] = useState('wifi'); // 'wifi' | 'cloud' | 'tunnel'

  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setNetworkInfo(json);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading network info:', err);
        setLoading(false);
      });
  }, []);

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 3000);
  };

  const primaryUrl = networkInfo?.networkUrls?.[0]?.url || (window.location.origin.includes('localhost') ? `http://192.168.1.X:5000` : window.location.origin);

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0">
          {/* Header */}
          <div className="modal-header bg-dark text-white py-3 px-4">
            <div className="d-flex align-items-center gap-2">
              <span className="fs-4">📱</span>
              <div>
                <h5 className="modal-title fw-bold mb-0">Multi-Device Live Sync & Deployment</h5>
                <small className="text-warning">
                  Connect mobile phones, tablets, or other billing counters with real-time live database sync
                </small>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Live Sync Status Bar */}
          <div className="bg-success bg-opacity-10 border-bottom border-success border-opacity-25 px-4 py-2 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2 text-success fw-semibold small">
              <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
              <span>Central Database Live Sync Active — All edits reflect across all devices instantly!</span>
            </div>
            <span className="badge bg-success rounded-pill px-3 py-1">
              <i className="fa-solid fa-users me-1"></i> {activeClientsCount || networkInfo?.activeClients || 1} Device(s) Connected
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 pt-3 border-bottom">
            <ul className="nav nav-tabs border-bottom-0">
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${activeTab === 'wifi' ? 'active text-primary' : 'text-secondary'}`}
                  onClick={() => setActiveTab('wifi')}
                >
                  <i className="fa-solid fa-wifi me-2"></i> 1. Shop Wi-Fi / Hotspot (Instant & Free)
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${activeTab === 'cloud' ? 'active text-primary' : 'text-secondary'}`}
                  onClick={() => setActiveTab('cloud')}
                >
                  <i className="fa-solid fa-cloud me-2"></i> 2. Cloud Hosting (Render / VPS)
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-semibold ${activeTab === 'tunnel' ? 'active text-primary' : 'text-secondary'}`}
                  onClick={() => setActiveTab('tunnel')}
                >
                  <i className="fa-solid fa-globe me-2"></i> 3. Free Instant Tunnel (Ngrok / Localtunnel)
                </button>
              </li>
            </ul>
          </div>

          <div className="modal-body p-4">
            {/* TAB 1: Shop Wi-Fi / Local Network */}
            {activeTab === 'wifi' && (
              <div>
                <div className="row g-4 align-items-center">
                  {/* Left: QR Code */}
                  <div className="col-md-5 text-center">
                    <div className="p-3 bg-light border rounded-3 shadow-sm d-inline-block">
                      <QRCodeSVG
                        value={primaryUrl}
                        size={170}
                        level="H"
                        includeMargin={true}
                      />
                      <div className="mt-2 text-muted fw-bold small">
                        <i className="fa-solid fa-qrcode me-1"></i> Scan to open on Mobile / iPad
                      </div>
                    </div>
                  </div>

                  {/* Right: Steps */}
                  <div className="col-md-7">
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="fa-solid fa-bolt text-warning me-1"></i> How to connect devices in your shop:
                    </h6>
                    <ol className="small text-secondary ps-3 mb-3" style={{ lineHeight: '1.7' }}>
                      <li>
                        Connect your mobile phone, tablet, or secondary laptop to the <strong>same Wi-Fi router or Mobile Hotspot</strong> as this computer.
                      </li>
                      <li>
                        Scan the QR code on the left with your phone camera, OR type this URL in Chrome / Safari on your device:
                      </li>
                    </ol>

                    {/* Network URLs list */}
                    {loading ? (
                      <div className="text-muted small">Detecting local IP address...</div>
                    ) : (
                      <div className="d-flex flex-column gap-2 mb-3">
                        {networkInfo?.networkUrls?.length > 0 ? (
                          networkInfo.networkUrls.map((item, idx) => (
                            <div key={idx} className="input-group input-group-sm">
                              <span className="input-group-text bg-white fw-bold font-monospace text-primary">
                                {item.name}
                              </span>
                              <input
                                type="text"
                                className="form-control font-monospace fw-bold bg-white"
                                readOnly
                                value={item.url}
                              />
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleCopy(item.url)}
                              >
                                <i className="fa-solid fa-copy me-1"></i> {copiedUrl === item.url ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="alert alert-info py-2 small mb-0">
                            Open command prompt, run <code>ipconfig</code>, and access <code>http://YOUR_PC_IP:5000</code>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-2 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded small text-dark">
                      💡 <strong>Instant Sync:</strong> When cashier A bills or adds products from any device, cashier B's screen will update automatically in real-time!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Cloud Deployment */}
            {activeTab === 'cloud' && (
              <div>
                <h6 className="fw-bold text-dark mb-2">
                  <i className="fa-solid fa-cloud-arrow-up text-primary me-2"></i> Free 24/7 Cloud Hosting (Render / Railway)
                </h6>
                <p className="small text-muted mb-3">
                  Deploy online so your managers, cashiers, and branches can access the POS from anywhere across the city or country using a single web link (e.g. <code>https://my-cracker-pos.onrender.com</code>).
                </p>

                <div className="card bg-light border p-3 rounded-3 mb-3">
                  <h6 className="fw-bold small mb-2 text-dark">Easy 3-Step Setup on Render.com (100% Free):</h6>
                  <ol className="small text-secondary ps-3 mb-0" style={{ lineHeight: '1.8' }}>
                    <li>Push your code to GitHub / GitLab (or upload zip).</li>
                    <li>
                      Go to <a href="https://render.com" target="_blank" rel="noreferrer" className="fw-bold text-primary">Render.com</a> ➔ Click <strong>New +</strong> ➔ <strong>Web Service</strong>.
                    </li>
                    <li>
                      Select your repo and enter:
                      <ul className="list-unstyled mt-1 ms-2 font-monospace text-dark">
                        <li>• <strong>Build Command:</strong> <code>npm run build && cd server && npm install</code></li>
                        <li>• <strong>Start Command:</strong> <code>npm start</code></li>
                      </ul>
                    </li>
                    <li>Click <strong>Deploy</strong>! You get a live HTTPS URL instantly.</li>
                  </ol>
                </div>

                <div className="alert alert-success py-2 small mb-0 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-success fs-5"></i>
                  <div>
                    The unified Node + React architecture is already configured with pre-built production serving!
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Instant Remote Tunnel */}
            {activeTab === 'tunnel' && (
              <div>
                <h6 className="fw-bold text-dark mb-2">
                  <i className="fa-solid fa-globe text-success me-2"></i> Instant Public Internet Link via Localtunnel / Ngrok
                </h6>
                <p className="small text-muted mb-3">
                  If you want to access your local machine from outside the shop without deploying to cloud, run a quick free tunnel:
                </p>

                <div className="card bg-dark text-white p-3 rounded-3 mb-3 font-monospace small">
                  <div className="text-secondary mb-1"># Option A: Instant Free Localtunnel (No signup needed)</div>
                  <div className="text-warning">npx localtunnel --port 5000</div>
                  <div className="text-secondary mt-3 mb-1"># Option B: Cloudflare Quick Tunnel (Super Fast & Free)</div>
                  <div className="text-warning">npx cloudflared tunnel --url http://localhost:5000</div>
                </div>

                <p className="small text-muted mb-0">
                  This gives you an instant public HTTPS link that you can open on any mobile or laptop anywhere in the world!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light py-2 px-4 justify-content-between">
            <small className="text-muted">
              <i className="fa-solid fa-shield-halved text-success me-1"></i> Data is stored securely in central database and synced in real-time.
            </small>
            <button type="button" className="btn btn-secondary btn-sm px-4 fw-semibold" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
