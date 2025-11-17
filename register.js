const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const readline = require('readline');

const db = new sqlite3.Database('./users.db');
const rl = readline.createInterface(process.stdin, process.stdout);

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

(async () => {
  console.log("=== Create / Update SIP User with Phone Extension ===\n");
  const extension = await ask('Extension (phone number, e.g. 101): ');
  const username = await ask('Username (optional, can be same as extension): ') || extension;
  const password = await ask('Password: ');
  const hash = await bcrypt.hash(password, 10);

  db.run(`
    INSERT OR REPLACE INTO users (username, extension, password_hash)
    VALUES (?, ?, ?)
  `, [username, extension, hash], (err) => {
    if (err) {
      console.error("Error:", err);
    } else {
      console.log(`\nUser created/updated!`);
      console.log(`   Extension : ${extension}`);
      console.log(`   Username  : ${username}`);
      console.log(`   Password  : ${password}`);
      console.log(`\n   Configure client as:`);
      console.log(`   SIP URI   : sip:${extension}@YOUR_SERVER_IP`);
      console.log(`   Username  : ${username}`);
      console.log(`   Password  : ${password}\n`);
    }
    rl.close();
    db.close();
    process.exit();
  });
})();
