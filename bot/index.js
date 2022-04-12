const TelegramBot = require("node-telegram-bot-api")
require("dotenv").config()
const Raffle = require("../models/raffle")

const TOKEN = process.env.TOKEN

const bot = new TelegramBot(TOKEN, {
  polling: true,
})

const newPost = (ctx) => {
  bot
    .sendMessage("@testmybotfor", ctx.text, {
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
      const raffle = new Raffle(ctx.text, ctx.cont, msg.message_id)
      await raffle.save()
    })
}

bot.on("callback_query", async (query) => {
  const candidate = await Raffle.getOne(query.message.message_id).then(
    async (ctx) => {
      return ctx
    }
  )
  candidate.members.push(query.from.username)

  console.log(candidate)

  // candidate.addMember()

  bot.answerCallbackQuery(query.id, "Теперь вы участник розыгрыша!")
})

module.exports.newPost = newPost
