import express from 'express'
import { db, Lesson } from './db.js'

const app = express()
const port = 3000

app.get('/', async (req, res) => {
  const lessons = await Lesson.findAll()

  console.log(lessons)

  res.send(lessons)
})

app.listen(port, async () => {
  await db.sync()
  console.log(`Example app listening at http://localhost:${port}`)
})
