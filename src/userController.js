import bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";
import joi from "joi";
import { userCollection, sessionsCollection } from "../index.js";

const newUserSchema = joi.object({
  name: joi.string().min(5).required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export async function signUpUser(req, res) {
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
}

export async function loginUser(req, res) {
  const { email, password } = req.body;
  const token = uuidV4();

  try {
    const userExists = await userCollection.findOne({ email });
    if (!userExists) {
      return res
        .status(401)
        .send({ message: "Este usuário não está cadastrado" });
    }

    // const sessionExists = await sessionsCollection.findOne({
    //   userId: userExists._id,
    // });
    // if (sessionExists) {
    //   await sessionsCollection.deleteOne({ userId: userExists._id });
    //   return res.send(200);
    // }

    const passwordOk = bcrypt.compareSync(password, userExists.password);
    if (!passwordOk) {
      return res.sendStatus(401);
    }

    await sessionsCollection.insertOne({
      token,
      userId: userExists._id,
    });

    res.send({ token, name: userExists.name });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function getUsers(req, res) {
  try {
    const users = await userCollection.find().toArray();
    res.send(users);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function getSession(req, res) {
  try {
    const session = await sessionsCollection.find().toArray();
    console.log(session);
    res.send(session);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}
