

const fs = require("fs");
const path = "./commands/slotData.json";

module.exports = {
  config: {
    name: "top",
    version: "1.0",
    author: "Kabir✨",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "🏆 Slot Top Leaderboard"
    },
    longDescription: {
      en: "View top richest players from slot machine"
    },
    category: "game"
  },

  onStart: async function ({ message }) {
    if (!fs.existsSync(path)) {
      return message.reply("❌ Slot data not found!");
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(path, "utf-8"));
    } catch (e) {
      return message.reply("❌ Slot data corrupted!");
    }

    const users = Object.entries(data)
      .map(([uid, info]) => ({
        uid,
        name: info.name || "Unknown",
        coin: info.coin || 0,
        win: info.win || 0,
        lose: info.lose || 0
      }))
      .sort((a, b) => b.coin - a.coin)
      .slice(0, 10);

    if (users.length === 0) {
      return message.reply("😴 No players found yet!");
    }

    let msg = `🏆 𝗦𝗟𝗢𝗧 𝗧𝗢𝗣 𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗 🏆\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n\n`;

    const medals = ["🥇", "🥈", "🥉"];

    users.forEach((user, index) => {
      const rankIcon = medals[index] || `#${index + 1}`;
      msg += `${rankIcon} ${user.name}\n`;
      msg += `💰 Coins: ${user.coin.toLocaleString()}\n`;
      msg += `🎯 Win: ${user.win} | ❌ Lose: ${user.lose}\n`;
      msg += `━━━━━━━━━━━━━━━━━━\n`;
    });

    msg += `✨ Keep spinning & climb the leaderboard!`;

    return message.reply(msg);
  }
};
