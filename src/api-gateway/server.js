import { createApp } from "./app.js";
import { env } from "../shared/config/env.js";
import { connectToDatabase } from "../shared/database/mongoose.js";
import { createServer } from "node:http";
import { createSocketServer } from "../shared/realtime/socket.js";
import { birthdayRewardService } from "../company-service/birthday/service.js";

const app = createApp();
const httpServer = createServer(app);

async function startServer() {
  await connectToDatabase();
  createSocketServer(httpServer);
  await birthdayRewardService.runDailyBirthdayRewards();
  setInterval(() => {
    birthdayRewardService.runDailyBirthdayRewards().catch((error) => {
      console.error("Scheduled birthday reward job failed", error);
    });
  }, 6 * 60 * 60 * 1000);

  httpServer.listen(env.port, () => {
    console.log(`API gateway listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start API gateway", error);
  process.exit(1);
});
