import { authenticateToken } from "../utils/jwtToken";

export const authentication = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({
      message: "Acced Denied. No token provided.",
    });
  }

  try {
    const userId = authenticateToken(token);
    req.user_id = userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};
