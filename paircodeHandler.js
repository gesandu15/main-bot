const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");

// Generate random ID
function generateId(length = 6, digits = 4) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const num = Math.floor(Math.random() * Math.pow(10, digits));
  return `${id}${num}`;
}

async function paircodeHandler(req, res) {
  const rawNum = req.query.number;
  if (!rawNum || rawNum.length < 10) {
    return res.send({ code: "Invalid number" });
  }

  const number = rawNum.replace(/[^0-9]/g, "");

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: number }),
    puppeteer: { headless: true },
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    if (!res.headersSent) {
      res.send({ code: qr });
    }
  });

  client.on("ready", async () => {
    console.log(`✅ WhatsApp Client for ${number} ready!`);
    await client.sendMessage(number + "@c.us", "✅ Bot Connected Successfully!");
  });

  client.on("auth_failure", () => {
    console.error("Authentication failed!");
    if (!res.headersSent) {
      res.send({ code: "Auth failed" });
    }
  });

  client.initialize();
}

module.exports = paircodeHandler;
