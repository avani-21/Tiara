import jwt, { decode } from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

const jwtsecret = process.env.JWT_SECRETKEY;

const verifyToken = (req, res, next) => {
  try {
    const authHeaders = req.headers.authorization;

    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
      return res.status(403).json({ message: "Autherization failed" });
    }
    const token = authHeaders ? authHeaders.split(" ")[1] : null;
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }
    const decoded = jwt.verify(token, jwtsecret);
 
    req.user = decoded;
    next();
  } catch (error) {
 
    return res.status(403).json({ message: "unautherized user" });
  }
};

export default verifyToken;
