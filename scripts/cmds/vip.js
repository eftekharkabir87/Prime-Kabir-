/**
 * VIP Management Command
 * Author: GPT-5 (Styled for Goat Bot)
 */

const fs = require("fs");
const path = "./vipData.json";

// Load VIP data
function loadVIP() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(path, "utf-8"));
}

// Save VIP data
function saveVIP(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "vip",
    version: "1.0",
    author: "ACS KABIR⚡",
    role: 2, // admin only
    shortDescription: {
      en: "VIP Management System"
    },
    category: "admin",
    guide: {
      en:
        "vip add @user\n" +
        "vip remove @user\n" +
        "vip list\n" +
        "vip check"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const vipData = loadVIP();
    const senderID = event.senderID;

    // ===== VIP LIST =====
    if (args[0] === "list") {
      if (vipData.length === 0)
        return api.sendMessage("❌ No VIP users found!", event.threadID);

      let msg = "👑 PREMIUM VIP LIST 👑\n━━━━━━━━━━━━━━\n";
      for (let i = 0; i < vipData.length; i++) {
        const name = await usersData.getName(vipData[i]);
        msg += `${i + 1}. ${name}\n`;
      }
      msg += "━━━━━━━━━━━━━━\n✨ Total VIP: " + vipData.length;
      return api.sendMessage(msg, event.threadID);
    }

    // ===== VIP CHECK =====
    if (args[0] === "check") {
      if (vipData.includes(senderID))
        return api.sendMessage("✅ You are a VIP member 👑", event.threadID);
      else
        return api.sendMessage("❌ You are not a VIP", event.threadID);
    }

    // Mention required
    const mention = event.mentions;
    const targetID = Object.keys(mention)[0];
    if (!targetID)
      return api.sendMessage("⚠️ Please mention a user!", event.threadID);

    // ===== VIP ADD =====
    if (args[0] === "add") {
      if (vipData.includes(targetID))
        return api.sendMessage("⚠️ User already VIP!", event.threadID);

      vipData.push(targetID);
      saveVIP(vipData);

      return api.sendMessage(
        `👑 VIP ADDED\n━━━━━━━━━━━━━━\n${mention[targetID]} is now a Premium VIP ✨`,
        event.threadID
      );
    }

    // ===== VIP REMOVE =====
    if (args[0] === "remove") {
      if (!vipData.includes(targetID))
        return api.sendMessage("❌ User is not VIP!", event.threadID);

      const newData = vipData.filter(id => id !== targetID);
      saveVIP(newData);

      return api.sendMessage(
        `🗑 VIP REMOVED\n━━━━━━━━━━━━━━\n${mention[targetID]} removed from VIP list`,
        event.threadID
      );
    }

    return api.sendMessage("⚠️ Invalid option!\nUse: vip add/remove/list/check", event.threadID);
  }
};
