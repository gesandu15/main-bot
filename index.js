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

        if (command === "hi") await sock.sendMessage(from, { text: `Hello 👋 I'm ${BOT_NAME}!` });
        else if (command === "menu") await sock.sendMessage(from, { text: `📌 ${BOT_NAME} Menu:\n1. Hi\n2. Menu\n3. About\n4. Owner\n5. Time\n6. Joke\n7. Image\n8. Sticker` });
        else if (command === "about") await sock.sendMessage(from, { text: `🤖 ${BOT_NAME} - Multi-User WhatsApp Bot powered by Baileys.` });
        else if (command === "owner") await sock.sendMessage(from, { text: `👨‍💻 Owner: wa.me/${OWNER_CONTACT}` });
        else if (command === "time") await sock.sendMessage(from, { text: `⏰ Current Time: ${moment().format("YYYY-MM-DD HH:mm:ss")}` });
        else if (command === "joke") {
            const jokes = [
                "Why did the developer go broke? Because he used up all his cache!",
                "Why do programmers prefer dark mode? Because light attracts bugs!",
                "Why did the JavaScript developer leave? Because she didn't get 'closure'!"
            ];
            await sock.sendMessage(from, { text: jokes[Math.floor(Math.random() * jokes.length)] });
        }
        else if (command === "image") await sock.sendMessage(from, { image: { url: BOT_PHOTO }, caption: `Here is an image from ${BOT_NAME}` });
        else if (command === "sticker") await sock.sendMessage(from, { sticker: { url: BOT_PHOTO } });
    });
}

startBot();
