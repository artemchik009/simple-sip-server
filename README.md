# Node.js SIP Server with User-to-User Calling

A lightweight, production-ready SIP server built entirely in Node.js using **Drachtio**.  
Allows users to register with SIP clients and call each other by username (e.g., `sip:alice@mydomain.com` → `sip:bob@mydomain.com`).

Perfect for private VoIP networks, WebRTC gateways, IoT telephony, or learning SIP internals.

## Features

- Full SIP registrar with location service
- Direct user-to-user calling (B2BUA routing)
- Pre-register users via CLI script (no SIP REGISTER required for user creation)
- SQLite storage for users and registrations (persists across restarts)
- Passwords hashed with bcrypt
- Zero external dependencies (no Asterisk, Kamailio, FreeSWITCH required)
- Easy to extend: TLS, WebSocket, Redis, REST API, CDR, etc.

Tested and working in 2025 with all major softphones (Zoiper, Linphone, MicroSIP, Groundwire, Jitsi, etc.).

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/nodejs-sip-server.git
cd nodejs-sip-server

# 2. Install dependencies
npm install

# 3. Create your first users
node register-user.js
# → follow prompts (e.g., username: alice, password: secret123)

# 4. Start the SIP server
node server.js
