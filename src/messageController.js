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
const outputsCollection = db.collection("outputMoney");
const inputsCollection = db.collection("inputMoney");

const moneySchema = joi.object({
  moneyValue: joi.number().required(),
  description: joi.string(),
});

export async function getInputs(req, res) {
  try {
    const inputs = await inputsCollection.find().toArray();
    res.send(inputs);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function getOutputs(req, res) {
  try {
    const outputs = await outputsCollection.find().toArray();
    res.send(outputs);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function postInputs(req, res) {
  const { email } = req.headers;
  const { moneyValue, description } = req.body;

  try {
    const { error } = moneySchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(401).send(errors);
    }

    if (email) {
      await inputsCollection.insertOne({ email, moneyValue, description });
    }

    res.sendStatus(201);
  } catch (err) {
    console.log(err);
  }
}

export async function postOutputs(req, res) {
  const { email } = req.headers;
  const { moneyValue, description } = req.body;

  try {
    const { error } = moneySchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(401).send(errors);
    }

    if (email) {
      await outputsCollection.insertOne({ email, moneyValue, description });
    }

    res.sendStatus(201);
  } catch (err) {
    console.log(err);
  }
}
