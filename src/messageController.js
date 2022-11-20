import joi from "joi";
import dayjs from "dayjs";
import {
  userCollection,
  transactionsCollection,
  sessionsCollection,
} from "../index.js";

const moneySchema = joi.object({
  moneyValue: joi.number().required(),
  description: joi.string(),
});

export async function postInputs(req, res) {
  const { authorization } = req.headers;
  const { moneyValue, description } = req.body;
  const now = dayjs().format("DD/MM");

  const { error } = moneySchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(401).send(errors);
  }
  const token = authorization?.replace("Bearer ", "");
  if (!token) {
    return res.sendStatus(409);
  }

  try {
    const session = await sessionsCollection.findOne({ token });
    const user = await userCollection.findOne({ _id: session.userId });

    await transactionsCollection.insertOne({
      moneyValue,
      description,
      userId: user._id,
      now,
      status: true,
    });
    console.log(transactionsCollection);
    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
}

export async function postOutputs(req, res) {
  const { authorization } = req.headers;
  const { moneyValue, description } = req.body;
  const now = dayjs().format("DD/MM");

  try {
    const { error } = moneySchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(401).send(errors);
    }

    const token = authorization?.replace("Bearer ", "");
    if (!token) {
      return res.sendStatus(401);
    }

    const session = await sessionsCollection.findOne({ token });
    const user = await userCollection.findOne({ _id: session.userId });

    await transactionsCollection.insertOne({
      moneyValue,
      description,
      userId: user._id,
      now,
      status: false,
    });

    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
}

export async function getStatement(req, res) {
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const sessions = await sessionsCollection.findOne({ token });
    const user = await userCollection.findOne({ _id: sessions.userId });

    const transactions = await transactionsCollection
      .find({ userId: user._id })
      .toArray();

    res.send({ transactions, name: user.name });
  } catch (err) {
    return res.sendStatus(500);
  }
}
