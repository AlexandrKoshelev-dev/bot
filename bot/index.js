const TelegramBot = require("node-telegram-bot-api")
const CronJob = require("cron").CronJob
require("dotenv").config()
const Raffle = require("../models/raffle")

const TOKEN = process.env.TOKEN
const CHANNEL = process.env.CHANNEL

const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 100,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
})

const newPost = (ctx) => {
  const dateEnding = new Date(Date.parse(ctx.dateOfEnd))
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
      const raffle = new Raffle(ctx.text, ctx.count, msg.message_id, dateEnding)
      await raffle.save()

      const job = new CronJob(
        `00 ${dateEnding.getMinutes()} ${dateEnding.getHours()} ${dateEnding.getDate()} ${dateEnding.getMonth()} ${dateEnding.getDay()}`,
        async () => {
          const defRaffle = await Raffle.getOne(msg.message_id)
          const winners = await Raffle.randomWinners(defRaffle)
          const textMessage = `А вот и список победителей розыгрыша:\n${winners
            .map((w) => `@${w.userName}\n`)
            .join("")}`
          bot.sendMessage(CHANNEL, textMessage)
        }
      )
      console.log("Задача поставлена")
      job.start()
    })
}

bot.on("callback_query", async (query) => {
  //проверка на подписку
  const status = await (await bot.getChatMember(CHANNEL, query.from.id)).status
  if (status === "member") {
    const raffle = await Raffle.getOne(query.message.message_id)
    raffle.members.push({
      userName: query.from.username,
      userId: query.from.id,
    })
    await Raffle.addMember(raffle).then(async (result) => {
      if (result != 0) {
        bot.answerCallbackQuery(
          query.id,
          `Теперь вы участник розыгрыша! Количество участников: ${await Raffle.countMembers(
            raffle
          )}`
        )
      } else {
        bot.answerCallbackQuery(
          query.id,
          `Вы уже участвуете! Количество участников: ${await Raffle.countMembers(
            raffle
          )}`
        )
      }
    })
  } else {
    bot.answerCallbackQuery(query.id, `Сначала подпишись на канал!`)
  }
})

const winnerMember = async (candidates) => {
  try {
    const promises = candidates.map(async (c) => {
      const status = await (await bot.getChatMember(CHANNEL, c.userId)).status
      const isMember = status === "member"
      return isMember ? c : null
    })
    const members = await (await Promise.all(promises)).filter((p) => p)
    return members
  } catch (e) {
    console.log(e)
  }
}

module.exports.newPost = newPost
module.exports.winnerMember = winnerMember
