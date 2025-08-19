const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const moment = require("moment");

const BOT_NAME = "M.R.Gesa";
const OWNER_CONTACT = "94784525290";
const BOT_PHOTO = "https://github.com/gesandu1111/ugjv/blob/main/WhatsApp%20Image%202025-08-14%20at%2020.56.15_d6d69dfa.jpg?raw=true";

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            } else {
                console.log("Logged out. Delete auth_info folder to restart.");
            }
        } else if (connection === "open") {
            console.log("✅ Bot Connected!");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (msg) => {
        const m = msg.messages[0];
        if (!m.message) return;

        const from = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text;
        const command = text?.toLowerCase();

        console.log("📩 From:", from, "->", text);

        // START / MENU
        if (command === "start") {
            await sock.sendMessage(from, { text: `👋 Hello! I'm ${BOT_NAME}\nOwner: wa.me/${OWNER_CONTACT}\nUse 'menu' to see all commands.` });
        } else if (command === "menu") {
            const menuText = `
╭─「 ⚙ Download 」
│ ⚡ .gdrive
│ ⚖ .download <direct_url>
│ ⚡ .facebook
│ ⚡ .instagram <url>
│ ⚡ .tiktok <url>
│ ⚡ .tiktoksearch <query>
│ ⚡ .ytmp3 <youtube_url>
│ ⚡ .ytmp4 <youtube_url>
╰─────────────

╭─「 🎨 Edit 」
│ ⚡ .filter
╰─────────────

╭─「 ⚙ Group 」
│ ⚡ .antibot
│ ⚡ .antilink
│ ⚡ .grouplink
│ ⚡ .groupmute
│ ⚡ .groupunmute
│ ⚡ .kick
│ ⚡ .setgcpp
│ ⚡ .setgroupdesc
│ ⚡ .tagall
╰─────────────

╭─「 🏠 Main 」
│ ⚡ .creator
│ ⚡ .owner
╰─────────────

╭─「 🔍 Search 」
│ ⚡ .anime
│ ⚡ .hentai
│ ⚡ .yt <search query>
╰─────────────

╭─「 🔧 Tools 」
│ ⚡ .channeljid
│ ⚡ .jid
│ ⚡ .link
│ ⚡ .msgid
│ ⚡ .pp
╰─────────────

╭─「 🛠 Utility 」
│ ⚡ .forward <jid1,jid2,...> [custom_caption]
│ ⚡ .ipinfo <ip_address>
│ ⚡ .vv
╰─────────────
`;
            await sock.sendMessage(from, { text: menuText });
        }

        // OTHER COMMANDS
        else if (command === "hi") {
            await sock.sendMessage(from, { text: `Hello 👋 I'm ${BOT_NAME}!` });
        } else if (command === "about") {
            await sock.sendMessage(from, { text: `🤖 ${BOT_NAME} - Multi-User WhatsApp Bot powered by Baileys.` });
        } else if (command === "owner") {
            await sock.sendMessage(from, { text: `👨‍💻 Owner: wa.me/${OWNER_CONTACT}` });
        } else if (command === "time") {
            await sock.sendMessage(from, { text: `⏰ Current Time: ${moment().format("YYYY-MM-DD HH:mm:ss")}` });
        } else if (command === "image") {
            await sock.sendMessage(from, { image: { url: BOT_PHOTO }, caption: `Here is an image from ${BOT_NAME}` });
        } else if (command === "sticker") {
            await sock.sendMessage(from, { sticker: { url: BOT_PHOTO } });
        } else if (command === "joke") {
            const jokes = [
                "Why did the developer go broke? Because he used up all his cache!",
                "Why do programmers prefer dark mode? Because light attracts bugs!",
                "Why did the JavaScript developer leave? Because she didn't get 'closure'!"
            ];
            await sock.sendMessage(from, { text: jokes[Math.floor(Math.random() * jokes.length)] });
        }
    });
}
const fs = require("fs");
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// Function to download status/media
async function downloadStatus(message) {
    try {
        const media = message.message?.imageMessage || message.message?.videoMessage;
        if (!media) return null;

        const stream = await downloadContentFromMessage(media, media.mimetype.split("/")[1]);
        const filename = `status_${Date.now()}.${media.mimetype.split("/")[1]}`;
        const downloadDir = path.join(__dirname, "downloads");
        if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

        const filepath = path.join(downloadDir, filename);
        const writeStream = fs.createWriteStream(filepath);
        for await (const chunk of stream) writeStream.write(chunk);
        writeStream.end();

        console.log(`✅ Status saved: ${filepath}`);
        return filepath;
    } catch (err) {
        console.error("❌ Failed to download status:", err);
        return null;
    }
}

module.exports = { downloadStatus };
startBot();
