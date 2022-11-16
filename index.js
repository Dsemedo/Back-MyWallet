import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import bcrypt from "bcrypt";

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
const userCollection = db.collection("users");

const newUserSchema = joi.object({
  name: joi.string().min(5).required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
});

const moneySchema = joi.object({
  moneyValue: joi.number().required(),
  description: joi.string(),
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await userCollection.findOne({ email });

    if (!userExists) {
      return res
        .status(401)
        .send({ message: "Este usuário não está cadastrado" });
    }

    const passwordOk = bcrypt.compareSync(password, userExists.password);

    if (!passwordOk) {
      return res.sendStatus(401);
    }

    res.send({ message: `olá ${userExists.name}, seja bem vindo(a)` });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/sign-up", async (req, res) => {
  const user = req.body;

  try {
    const userExists = await userCollection.findOne({ email: user.email });
    console.log(userExists);

    if (userExists) {
      return res.status(409).send({ message: "Esse email já existe!" });
    }

    const { error } = newUserSchema.validate(user, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).send(errors);
    }

    const hashPassword = bcrypt.hashSync(user.password, 10);

    await userCollection.insertOne({ ...user, password: hashPassword });
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await db.collection("users").find().toArray();
    res.send(users);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get("/inputs", async (req, res) => {
  try {
    const inputs = await inputsCollection.find().toArray();
    res.send(inputs);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.get("/outputs", async (req, res) => {
  try {
    const outputs = await outputsCollection.find().toArray();
    res.send(outputs);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

app.post("/inputs", async (req, res) => {
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
});

app.post("/outputs", async (req, res) => {
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
});

app.get("/statement", (req, res) => {});

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});
