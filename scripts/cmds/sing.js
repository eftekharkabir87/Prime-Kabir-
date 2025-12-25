const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const https = require("https");

function deleteAfterTimeout(filePath, timeout = 15000) {
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (!err) console.log(`✅ Deleted: ${filePath}`);
        else console.error(`❌ Delete error: ${filePath}`);
      });
    }
  }, timeout);
}

module.exports = {
  config: {
    name: "song",
    aliases: ["music","song"],
    version: "3.2",
    prefix: false,
    author: "‎MR᭄﹅ MAHABUB﹅ メꪜ",//fixed by kabir
    countDown: 5,
    role: 0,
    shortDescription: "Download MP3 using YouTube search",
    longDescription: "Search YouTube then fetch MP3 from Mahabub CDN API",
    category: "media",
    guide: "{p}{n} <song name>",
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length)
      return api.sendMessage(
        "» উফফ কি গান শুনতে চাস তার ২/১ লাইন তো লেখবি নাকি 😾",
        event.threadID,
        event.messageID
      );

    const songName = args.join(" ");
    let searchMsgID;

    try {
      // 🔍 Send Searching message
      const waitMsg = await api.sendMessage(
        `✨ Discovering "${songName}"...`,
        event.threadID
      );
      searchMsgID = waitMsg.messageID;

      // 🔎 YouTube search
      const result = await ytSearch(songName);
      if (!result.videos.length) throw new Error("No YouTube results.");

      const top = result.videos[0];
      const ytUrl = `https://youtu.be/${top.videoId}`;

      // 🌐 Fetch MP3 link from Mahabub CDN API
      const cdnUrl = `https://mahabub-ytmp3.vercel.app/api/cdn?url=${encodeURIComponent(
        ytUrl
      )}`;
      const { data } = await axios.get(cdnUrl);

      if (!data.status || !data.cdna)
        throw new Error("Audio link not found in API.");

      const title = data.title || "Unknown Title";
      const audioLink = data.cdna;

      // ✅ Unsend Searching message
      if (searchMsgID) api.unsendMessage(searchMsgID);

      // 📂 File handling
      const safeFile = title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
      const ext = audioLink.includes(".mp3") ? "mp3" : "m4a";
      const filePath = path.join(__dirname, "cache", `${safeFile}.${ext}`);

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      const file = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        https
          .get(audioLink, (res) => {
            if (res.statusCode === 200) {
              res.pipe(file);
              file.on("finish", () => file.close(resolve));
            } else reject(new Error(`Download failed [${res.statusCode}]`));
          })
          .on("error", reject);
      });

      // 🎵 Send final message with title + audio
      await api.sendMessage(
        {
          body: `✨ Download complete!\n🎶 TITLE: ${title}\n🔗 ${ytUrl}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        event.messageID
      );

      // Delete file after 15s
      deleteAfterTimeout(filePath, 15000);
    } catch (err) {
      console.error("❌ Error:", err.message);
      if (searchMsgID) api.unsendMessage(searchMsgID);
      api.sendMessage(
        `❌ Failed: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
