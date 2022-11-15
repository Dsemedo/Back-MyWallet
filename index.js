import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

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

const db = mongoClient.db("backWallet");
const outputs = db.collection("outputMoney");
const inputs = db.collection("inputMoney");

const newUserSchema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().pattern("/^(?=.*d)(?=.*[a-z])[0-9a-zA-Z$*&@#]{5,}$/"),
});

app.post("/login", (req, res) => {});

app.post("/sign-in", (req, res) => {});

app.post("/inputs", (req, res) => {});

app.post("/outputs", (req, res) => {});

app.get("/statement", (req, res) => {});

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});
