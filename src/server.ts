import 'dotenv/config'
import app from "./app";
import mongoose from 'mongoose';
import Logger from './utils/logger';

const logger = new Logger("server");

async function bootstrap() {
  try {
    await mongoose.connect(process.env.DATABASE_URL ?? "");
    logger.log("datasource initialized", { name: "gifted-trades" });
  } catch (err) {
    logger.error("unable to initialize datasource", {
      name: "Gifted Trades",
      //reason: err.message,
    });
  }

  // console.log(process.env.DATABASE_URL)
  const PORT = process.env.PORT || 5001
  const server = app.listen(PORT, () => {
    console.log(`connected to port`, { PORT })
  })

  const exitHandler = () => server.close(() => {
    console.log('server closed', { PORT });
    process.exit(0);
  });
}
bootstrap();
