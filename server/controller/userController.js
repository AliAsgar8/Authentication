import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await db.select().from(users).where(eq(users.id, userId));
    const user = result[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
