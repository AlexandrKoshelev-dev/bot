const express = require("express")
const homeRoutes = require("./routes/home")
require("dotenv").config()

const PORT = process.env.PORT

const app = express()

app.set("views", "views")
app.use(express.urlencoded({ extended: true }))
app.use(homeRoutes)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

// const bot = new TelegramBot(TOKEN, {
//   polling: true,
// })

// bot.on("message", (msg) => {
//   console.log(msg)
// })
