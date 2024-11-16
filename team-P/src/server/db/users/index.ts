import bcrypt from "bcrypt";
import { createHash } from "crypto";
import db from "../connection";
import { REGISTER_SQL, FIND_BY_EMAIL_SQL  } from "./sql";

type User = {
  id: number;
  username: string;
  email: string;
  gravatar: string;
};

const register = async (
  username: string,
  email: string,
  clearTextPassword: string
): Promise<User> => {
  const password = await bcrypt.hash(clearTextPassword, 10);
  const gravatar =
createHash("sha256").update(email).digest("hex");
  return await db.one(REGISTER_SQL, [username, email, password,
gravatar]);
};

type UserWithPassword = User & {
    password: string;
  };
  const login = async (email: string, clearTextPassword: string) =>
  {
    const user = await findByEmail(email);
    const isValid = await bcrypt.compare(clearTextPassword,
  user.password);
    if (isValid) {
      return user;
    } else {
      throw new Error("Invalid credentials provided");
  } };
  const findByEmail = (email: string): Promise<UserWithPassword> =>
  {
    return db.one(FIND_BY_EMAIL_SQL, [email]);
  };



export default { register, login, findByEmail };