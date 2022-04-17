const fs = require("fs")
const path = require("path")
const WinnerMember = require("../bot/index")

class Raffle {
  constructor(text, countWinners, id, dateEnding) {
    this.text = text
    this.members = []
    this.countWinners = countWinners
    this.dateBegin = Date.now()
    this.dateEnding = dateEnding
    this.id = id
  }

  toJSON() {
    return {
      text: this.text,
      countWinners: this.countWinners,
      id: this.id,
      dateBegin: this.dateBegin,
      dateEnding: this.dateEnding,
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
    if (
      raffle.members.find(
        (v) => JSON.stringify(v) === JSON.stringify(candidate.members.at(-1))
      )
    ) {
      console.log("Вы уже участник!")
      return 0
    } else {
      try {
        const newRaffles = raffles.filter((v) => v.id !== candidate.id)
        newRaffles.push(candidate)
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

  static async randomWinners(raffle) {
    try {
      const members = await WinnerMember.winnerMember(raffle.members)
      return getRandom(members, raffle.countWinners)
    } catch (e) {
      console.log(e)
    }
  }
}

function getRandom(arr, n) {
  let result = new Array(n)
  let len = arr.length
  let taken = new Array(len)
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available")
  while (n--) {
    let x = Math.floor(Math.random() * len)
    result[n] = arr[x in taken ? taken[x] : x]
    taken[x] = --len in taken ? taken[len] : len
  }
  return result
}
module.exports = Raffle
