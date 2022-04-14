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

  static async getOne(id) {
    try {
      const raffles = await Raffle.getAll()
      const raffle = raffles.find((v) => v.id === id)
      return raffle
    } catch (e) {
      console.log(e)
    }
  }

  static async addMember(candidate) {
    const raffles = await Raffle.getAll()
    const raffle = await raffles.find((v) => v.id === candidate.id)
    if (raffle.members.find((v) => v === candidate.members[0])) {
      console.log("Вы уже участник!")
      return 0
    } else {
      const newRaffles = raffles.filter((v) => v.id !== candidate.id)
      newRaffles.push(candidate)
      try {
        fs.writeFile(
          path.join(__dirname, "..", "data", "raffles.json"),
          JSON.stringify(newRaffles),
          (e) => {
            if (e) {
              console.log(e)
            } else console.log("member added")
          }
        )
      } catch (e) {
        console.log(e)
      }
    }
  }

  static async countMembers(candidate) {
    try {
      const raffles = await Raffle.getAll()
      const raffle = await raffles.find((v) => v.id === candidate.id)
      return raffle.members.length
    } catch (e) {
      console.log(e)
    }
  }

  static async randomWinners(candidate) {
    try {
      const raffle = await Raffle.getOne(candidate.id)
      const winners = []
      for (let w = 0; w < raffle.countWinners; w++) {
        winners.push(
          raffle.members[Math.floor(Math.random() * raffle.members.length)]
        )
      }
      return winners
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = Raffle
