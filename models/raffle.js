const fs = require("fs")
const path = require("path")

class Raffle {
  constructor(text, countWinners, id) {
    this.text = text
    this.members = []
    this.countWinners = countWinners
    this.dateBegin = Date.now()
    // this.dateEnding = dateEnding
    this.id = id
  }

  toJSON() {
    return {
      text: this.text,
      countWinners: this.countWinners,
      id: this.id,
      dateBegin: this.dateBegin,
      members: this.members,
    }
  }

  async save() {
    const raffles = await Raffle.getAll()
    raffles.push(this.toJSON())

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, "..", "data", "raffles.json"),
        JSON.stringify(raffles),
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, "..", "data", "raffles.json"),
        "utf-8",
        (err, content) => {
          if (err) {
            reject(err)
          } else {
            resolve(JSON.parse(content))
          }
        }
      )
    })
  }

  static getOne(id) {
    return new Promise(async (resolve, reject) => {
      const raffles = await Raffle.getAll()
      raffles.find((value, index) => {
        if (value.id === id) {
          resolve(value)
        }
      })
    })
  }

  async addMember() {
    const raffles = await Raffle.getAll()
    raffles.push(this)

    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, "..", "data", "raffles.json"),
        JSON.stringify(raffles),
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })
  }
}

module.exports = Raffle
