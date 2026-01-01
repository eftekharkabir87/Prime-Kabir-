const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "owner",
    author: "Tokodori",
    role: 0,
    shortDescription: "Show bot owner info",
    longDescription: "Display short & styled info about the bot owner",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const ownerInfo = {
        name: ' KABIR⚡',
        age: ' 17 ',
        nick: 'ITACHI',
        gender: '🚹 Male',
        tag: 'Acs kabir⚡'
      };

      const videoURL = 'https://files.catbox.moe/oevipj.mp4';
      const tempPath = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);

      const videoData = await axios.get(videoURL, { responseType: 'arraybuffer' });
      const videoPath = path.join(tempPath, 'owner.mp4');
      fs.writeFileSync(videoPath, Buffer.from(videoData.data, 'binary'));

      const msg = `
╭─────────────⭑
│ 🧸 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢
├─────────────
│ 🪪 𝗡𝗮𝗺𝗲   : ${ownerInfo.name}
│ 🎂 𝗔𝗴𝗲    : ${ownerInfo.age}
│ 🧿 𝗡𝗶𝗰𝗸   : ${ownerInfo.nick}
│ ⚧️ 𝗚𝗲𝗻𝗱𝗲𝗿 : ${ownerInfo.gender}
│ 🌀 𝗧𝗮𝗴    : ${ownerInfo.tag}
╰─────────────⭑

☠️ welcome to the hell ☠️
`;

      await api.sendMessage({
        body: msg,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, event.messageID);

    } catch (e) {
      console.error("OWNER CMD ERR:", e);
      return api.sendMessage("⚠️ Something went wrong while fetching owner info.", event.threadID);
    }
  },
};
