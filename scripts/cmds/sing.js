const axios = require("axios");

module.exports = {
  config: {
    name: "sing",
    version: "1.4",
    author: "Eren Yeager",
    countDown: 5,
    role: 0,
    shortDescription: "Play music via custom API",
    longDescription: "Stream music from custom API; handles JSON response with audio URL or direct audio stream.",
    category: "media"
  },

  onStart: async function ({ args, message, api }) {
    if (!args.length) return message.reply("⚠️ Please type a song name.\nUsage: -sing <song name>");

    const query = args.join(" ");
    let loadingMsgID = null;

    try {
      const loading = await message.reply(`🎧 Searching: ${query}\nPlease wait...`);
      loadingMsgID = loading.messageID || loading.messageId || loading.mid || null;

      const apiUrl = `https://www.dur4nto-yeager.rf.gd/api/sing2?query=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl, { timeout: 0, responseType: "stream" });
      const contentType = (res.headers && res.headers["content-type"]) ? res.headers["content-type"] : "";

      if (contentType.includes("application/json") || contentType.includes("text/json")) {
        const chunks = [];
        for await (const chunk of res.data) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString("utf8");
        let parsed;
        try { parsed = JSON.parse(raw); } catch (e) { throw new Error("Invalid JSON from API"); }
        const audioURL = parsed && (parsed.url || parsed.audio_url);
        const title = parsed && (parsed.title || query);
        if (!audioURL) throw new Error("No audio URL in API JSON");
        let stream;
        if (global && global.utils && typeof global.utils.getStreamFromURL === "function") {
          stream = await global.utils.getStreamFromURL(audioURL);
        } else {
          const audioRes = await axios.get(audioURL, { timeout: 0, responseType: "stream" });
          stream = audioRes.data;
        }
        if (loadingMsgID && api && typeof api.unsendMessage === "function") {
          try { await api.unsendMessage(loadingMsgID); } catch (e) {}
        }
        await message.reply({ body: `🎵 Now playing: ${title}`, attachment: stream });
        return;
      }

      if (contentType.startsWith("audio/") || contentType === "application/octet-stream") {
        const title = query;
        const stream = res.data;
        if (loadingMsgID && api && typeof api.unsendMessage === "function") {
          try { await api.unsendMessage(loadingMsgID); } catch (e) {}
        }
        await message.reply({ body: `🎵 Now playing: ${title}`, attachment: stream });
        return;
      }

      const fallbackChunks = [];
      for await (const chunk of res.data) fallbackChunks.push(chunk);
      const fallbackRaw = Buffer.concat(fallbackChunks).toString("utf8");
      let fallbackParsed;
      try { fallbackParsed = JSON.parse(fallbackRaw); } catch (e) { throw new Error("Unknown response from API"); }
      const audioURL = fallbackParsed && (fallbackParsed.url || fallbackParsed.audio_url);
      const title = fallbackParsed && (fallbackParsed.title || query);
      if (!audioURL) throw new Error("No audio URL found in fallback JSON");
      let stream;
      if (global && global.utils && typeof global.utils.getStreamFromURL === "function") {
        stream = await global.utils.getStreamFromURL(audioURL);
      } else {
        const audioRes = await axios.get(audioURL, { timeout: 0, responseType: "stream" });
        stream = audioRes.data;
      }
      if (loadingMsgID && api && typeof api.unsendMessage === "function") {
        try { await api.unsendMessage(loadingMsgID); } catch (e) {}
      }
      await message.reply({ body: `🎵 Now playing: ${title}`, attachment: stream });

    } catch (err) {
      if (loadingMsgID && api && typeof api.unsendMessage === "function") {
        try { await api.unsendMessage(loadingMsgID); } catch (e) {}
      }
      await message.reply("❌ Could not fetch audio. API connection or response issue.");
    }
  }
};
