const { Router } = require("express")
const path = require("path")
const router = Router()
const Post = require("../bot/index")

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../", "views", "index.html"))
})

router.post("/", async (req, res) => {
  console.log(req.body)

  Post.newPost(req.body)
  res.redirect("/")
})

module.exports = router
