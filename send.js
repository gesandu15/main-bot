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
