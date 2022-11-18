import { ObjectId } from "mongodb";
import joi from "joi";
import dayjs from "dayjs";
import {
  userCollection,
  inputsCollection,
  outputsCollection,
  sessionsCollection,
} from "../index.js";

const moneySchema = joi.object({
  moneyValue: joi.number().required(),
  description: joi.string(),
});

export async function postInputs(req, res) {
  const { authorization } = req.headers;
  const { moneyValue, description } = req.body;
  const now = dayjs().format("DD/MM/YYYY");

  const { error } = moneySchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(401).send(errors);
  }

  const token = authorization?.replace("Bearer ", "");

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const session = await sessionsCollection.findOne({ token });
    console.log(session);

    const user = await userCollection.findOne({ _id: session.userId });

    await inputsCollection.insertOne({
      moneyValue,
      description,
      userId: user._id,
      now,
    });

    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
}

export async function getInputs(req, res) {
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");

  try {
    if (!token) {
      return res.sendStatus(401);
    }

    const session = await sessionsCollection.findOne({ token });
    const user = await userCollection.findOne({ _id: session.userId });

    const inputs = await inputsCollection.find({ userId: user._id }).toArray();

    res.send(inputs);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function postOutputs(req, res) {
  const { authorization } = req.headers;
  const { moneyValue, description } = req.body;
  const now = dayjs().format("DD/MM/YYYY");

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

    await outputsCollection.insertOne({
      moneyValue,
      description,
      userId: user._id,
      now,
    });

    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
}

export async function getOutputs(req, res) {
  const { authorization } = req.headers;

  const token = authorization?.replace("Bearer ", "");
  try {
    if (!token) {
      res.sendStatus(401);
    }

    const sessions = await sessionsCollection.findOne({ token });
    console.log(sessions);

    const user = await userCollection.findOne({ _id: sessions.userId });

    const outputs = await outputsCollection
      .find({ userId: user._id })
      .toArray();

    res.send(outputs);
  } catch (err) {
    console.log(err);
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

    const inputs = await inputsCollection.find({ userId: user._id }).toArray();
    const outputs = await outputsCollection
      .find({ userId: user._id })
      .toArray();

    res.send({ outputs, inputs });
  } catch (err) {
    return res.sendStatus(500);
  }
}
