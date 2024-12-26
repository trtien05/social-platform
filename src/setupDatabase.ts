import mongoose from "mongoose"
import { config } from "./config";

export default () => {
  const connect = () => {
    mongoose.connect(`${config.DATABASE_URL}`)
      .then(() => {
        console.log("Successfully connected to MongoDB");
      })
      .catch((e) => {
        console.log('Error connecting to MongoDB', e);
        return process.exit(1);
      });
  }
  connect();

  mongoose.connection.on('disconnected', connect);
}