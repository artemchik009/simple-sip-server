# Node.js simple SIP Server

A lightweight, fully functional SIP server written **100% in Node.js** that lets users call each other using **short phone numbers / extensions** (e.g. 100, 101, 202, 5000).

No Asterisk, no Kamailio, no FreeSWITCH required.

Perfect for:
- Private office PBX
- Home labs
- IoT telephony projects
- WebRTC gateways
- Learning SIP internals

Works today (November 2025) with Zoiper, Linphone, MicroSIP, Groundwire, Jitsi, Bria, etc.

## Features

- Dial by short extension/number (e.g. just dial **101**)
- User management via simple CLI script
- Persistent user database (SQLite)
- Secure password storage (bcrypt)
- Full registrar + location service
- Direct user-to-user calling (B2BUA)
- Zero external SIP servers needed
  

## Quick Start (less than 2 minutes)

```bash
git clone https://github.com/Artemchik-Studio/simple-sip-server.git
cd simple-sip-server  
npm install

# Create users with phone extensions
node register-user.js
# Example:
#   Extension: 100
#   Username : alice
#   Password : secret123

# Start the SIP server
node server.js
