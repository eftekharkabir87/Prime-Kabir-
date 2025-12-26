module.exports = {
  config: {
    name: "slot",
    version: "1.3",
    author: "Nirob+kabir",
    shortDescription: {
      en: "Play a slot game",
    },
    longDescription: {
      en: "Spin the slots and try your luck to win big!",
    },
    category: "game",
  },
  langs: {
    en: {
      invalid_amount: "Enter a valid amount to bet 🌝.",
      not_enough_money: "You don't have enough money 🌝🤣. Check your balance!",
      spin_message: "Spinning... 🎰\n[ %1$ | %2$ | %3$ ]",
      final_spin_message: "Final Spin! 🎰\n[ %1$ | %2$ | %3$ ]",
      win_message: "You won %1$💗! Your luck is shining today!",
      lose_message: "You lost %1$🥲. Better luck next time!",
      jackpot_message: "JACKPOT!!! 🎉 You won %1$💎! You're unstoppable!",
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang, api }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    const slots = ["🍒", "🍇", "🍊", "🍉", "🍋", "🍎", "🍓", "🍑", "🥝"];
    const randomSlot = () => slots[Math.floor(Math.random() * slots.length)];

    let slot1, slot2, slot3;

    // Send initial message and store its ID
    const animationMessage = await message.reply(getLang("spin_message", "❓", "❓", "❓"));

    // Simulate spinning animation by editing the message
    for (let i = 0; i < 5; i++) {
      slot1 = randomSlot();
      slot2 = randomSlot();
      slot3 = randomSlot();
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between edits
      await api.editMessage(
        getLang("spin_message", slot1, slot2, slot3),
        animationMessage.messageID
      );
    }

    // Final spin result
    slot1 = randomSlot();
    slot2 = randomSlot();
    slot3 = randomSlot();
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before final result
    await api.editMessage(
      getLang("final_spin_message", slot1, slot2, slot3),
      animationMessage.messageID
    );

    // Calculate winnings and update user data
    const winnings = calculateWinnings(slot1, slot2, slot3, amount);
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    // Send final result message
    const resultMessage = getSpinResultMessage(slot1, slot2, slot3, winnings, getLang);
    return message.reply(resultMessage);
  },
};

function calculateWinnings(slot1, slot2, slot3, betAmount) {
  if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
    return betAmount * 10;
  } else if (slot1 === "🍇" && slot2 === "🍇" && slot3 === "🍇") {
    return betAmount * 5;
  } else if (slot1 === slot2 && slot2 === slot3) {
    return betAmount * 3;
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    return betAmount * 2;
  } else {
    return -betAmount;
  }
}

function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  if (winnings > 0) {
    if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
      return getLang("jackpot_message", winnings);
    } else {
      return getLang("win_message", winnings) + `\n[ ${slot1} | ${slot2} | ${slot3} ]`;
    }
  } else {
    return getLang("lose_message", -winnings) + `\n[ ${slot1} | ${slot2} | ${slot3} ]`;
  }
}
