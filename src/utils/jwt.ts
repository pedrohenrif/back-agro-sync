import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret";

export const generateToken = (id: number) => {
  return jwt.sign({ id }, SECRET, { expiresIn: "1h" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
