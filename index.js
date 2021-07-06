import express from 'express'
import { db } from './db.js'
const app = express()
const port = 3000


app.get('/', async (req, res) => {
  const lesson = await db.query("select * from lessons")

  console.log(lesson)

  res.send(lesson)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
