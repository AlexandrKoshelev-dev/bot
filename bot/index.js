const TelegramBot = require("node-telegram-bot-api")
require("dotenv").config()
const Raffle = require("../models/raffle")

const TOKEN = process.env.TOKEN
const CHANNEL = process.env.CHANNEL

const bot = new TelegramBot(TOKEN, {
  polling: true,
})

const newPost = (ctx) => {
  bot
    .sendMessage(CHANNEL, ctx.text, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Участвовать!",
              callback_data: "1",
            },
          ],
        ],
      },
    })
    .then(async (msg) => {
      const raffle = new Raffle(ctx.text, ctx.count, msg.message_id)
      await raffle.save()
    })
}

bot.on("callback_query", async (query) => {
  const candidate = await Raffle.getOne(query.message.message_id)
  candidate.members.push(query.from.username)
  await Raffle.addMember(candidate).then(async (result) => {
    if (result != 0) {
      bot.answerCallbackQuery(
        query.id,
        `Теперь вы участник розыгрыша! Количество участников: ${await Raffle.countMembers(
          candidate
        )}`
      )
      // обновить сообщение количество участников
    } else {
      bot.answerCallbackQuery(
        query.id,
        `Вы уже участвуете! Количество участников: ${await Raffle.countMembers(
          candidate
        )}`
      )
      console.log(await Raffle.randomWinners(candidate))
    }
  })
})

module.exports.newPost = newPost
