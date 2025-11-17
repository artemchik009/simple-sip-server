const Srf = require('drachtio-srf');
const srf = new Srf();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./users.db');

// Updated schema – we now have extension column
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    extension TEXT UNIQUE,
    password_hash TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS locations (
    aor TEXT PRIMARY KEY,
    contact TEXT,
    expires INTEGER
  )`);
});

const locations = new Map();   // aor → contact info
const extToAor = new Map();    // extension → aor (e.g. "101" → "sip:101@mydomain.com")

srf.connect({
  host: '0.0.0.0',
  port: 5060,
  secret: 'mysecret'
});

// Helper: rebuild extension → AOR map when needed
async function rebuildExtensionMap() {
  const rows = await new Promise(r => db.all("SELECT extension, username FROM users WHERE extension IS NOT NULL", (e, rows) => r(rows || [])));
  extToAor.clear();
  rows.forEach(row => {
    const aor = `sip:${row.extension}@mydomain.com`;   // or use your real domain/IP
    extToAor.set(row.extension, aor);
    // Also allow calling by username if different
    if (row.username !== row.extension) {
      extToAor.set(row.username, `sip:${row.username}@mydomain.com`);
    }
  });
}
rebuildExtensionMap();

// ------------------ REGISTRATION ------------------
srf.register(async (req, res) => {
  const aor = req.registration.aor;
  const userPart = aor.split(':')[1].split('@')[0];

  // Find user by username OR extension
  const row = await new Promise(r => db.get(`
    SELECT * FROM users WHERE username = ? OR extension = ?
  `, [userPart, userPart], (e, row) => r(row)));

  if (!row) return res.send(404, { headers: { 'Reason': 'User not found' }});

  const contact = req.get('Contact');
  const expires = req.registration.expires || 3600;
  const until = Date.now() + expires * 1000;

  await new Promise(r => db.run(
    "REPLACE INTO locations (aor, contact, expires) VALUES (?, ?, ?)",
    [aor, contact, until], r
  ));

  locations.set(aor, { contact, expires: until });
  console.log(`Extension ${row.extension} (${row.username}) registered from ${req.source_address}`);
  res.send(200, { headers: { Expires: expires }});
});

// ------------------ INVITE ROUTING BY NUMBER ------------------
srf.invite(async (req, res) => {
  const requestUri = req.uri;                    // e.g. sip:101@1.2.3.4
  const calledNumber = requestUri.split(':')[1].split('@')[0];

  // Look up which extension was dialed
  const targetAor = extToAor.get(calledNumber);
  if (!targetAor) {
    console.log(`Extension ${calledNumber} not found in dialplan`);
    return res.send(404);
  }

  const location = locations.get(targetAor);
  if (!location || Date.now() > location.expires) {
    console.log(`Extension ${calledNumber} not registered`);
    return res.send(480);
  }

  console.log(`${req.getParsedHeader('From').uri} → ${calledNumber}`);

  // Forward the call
  const proxy = srf.createB2BUA(req, res, {
    proxyRequestHeaders: ['from', 'to', 'call-id', 'cseq', 'record-route', 'via'],
    proxyResponseHeaders: ['via', 'record-route'],
    localSdp: req.body   // simple direct media (add RTPengine later if needed)
  });

  proxy.on('error', err => console.error('Call error:', err));
});

console.log('SIP server with phone extensions running on UDP 5060');
console.log('Dial any registered extension directly (e.g. 101, 202, 5000)');
