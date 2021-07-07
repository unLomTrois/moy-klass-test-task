import { app } from "./app.js";

const port = process.env.PORT ?? 3000;

app.listen(port, async () => {
  // await db.sync();
  console.log(`Example app listening at http://localhost:${port}`);
});
