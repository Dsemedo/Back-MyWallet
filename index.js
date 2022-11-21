import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import {
  loginUser,
  signUpUser,
  getUsers,
  getSession,
  deleteSession,
} from "./src/userController.js";
import {
  getStatement,
  postInputs,
  postOutputs,
} from "./src/messageController.js";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
const db = mongoClient.db("backWallet");
export const userCollection = db.collection("users");
export const sessionsCollection = db.collection("sessions");
export const transactionsCollection = db.collection("transactions");

try {
  await mongoClient.connect();
  console.log("Mongodb conectado");
} catch (err) {
  console.log(err);
}

app.post("/login", loginUser);

app.post("/sign-up", signUpUser);

app.get("/users", getUsers);

app.post("/inputs", postInputs);

app.post("/outputs", postOutputs);

app.get("/sessions", getSession);

app.get("/statement", getStatement);

app.delete("/statement", deleteSession);

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});
