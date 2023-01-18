import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
import blogRouter from "./api/blogs/index.js";
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler
} from "./errorHandlers.js";

const server = express();
const port = process.env.PORT || 3001;

server.use(cors());
server.use(express.json());

server.use("/blogs", blogRouter);

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_CONNECTION);

mongoose.connection.on("connected", () => {
  console.log("Connected to Mongo!");
  server.listen(port, () => {
    console.log("Server is running on port: ", port);
    console.table(listEndpoints(server));
  });
});
