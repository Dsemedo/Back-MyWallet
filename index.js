import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import {
  loginUser,
  signUpUser,
  getUsers,
  getSession,
} from "./src/userController.js";
import {
  getInputs,
  getOutputs,
  postInputs,
  postOutputs,
} from "./src/messageController.js";

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();
const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
  console.log("Mongodb conectado");
} catch (err) {
  console.log(err);
}

app.post("/login", loginUser);

app.post("/sign-up", signUpUser);

app.get("/users", getUsers);

app.get("/inputs", getInputs);

app.get("/outputs", getOutputs);

app.post("/inputs", postInputs);

app.post("/outputs", postOutputs);

app.get("/sessions", getSession);

app.get("/statement", (req, res) => {});

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});
