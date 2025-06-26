import { hash } from "argon2";
import User, { IUser } from "../db/models/User";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import { RegisterInput, LoginInput } from "../validation/auth.validation";
import { config } from "../config";

export interface AuthUserData {
  _id: string;
  username: string;
  email: string;
}

/**
 * Hashes a plain text password using Argon2.
 * @param password The plain text password to hash.
 * @returns The hashed password string.
 */
async function hashPassword(password: string): Promise<string> {
  try {
    return await hash(password);
  } catch (error) {
    console.error("Password hashing failed:", error);
    throw new HTTPException(500, {
      message: "Failed to securely store password.",
    });
  }
}

/**
 * Generates a JSON Web Token (JWT) for a given user.
 * @param user The user object (AuthUserData) to include in the token payload.
 * @returns The signed JWT string.
 * @throws {Error} if token signing fails.
 */
async function generateToken(user: AuthUserData): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      _id: user._id,
      username: user.username,
      email: user.email,
      exp: now + 60 * 60 * 24 * 7, // 7 days
      iat: now,
    };

    const token = await sign(payload, config.JWT_SECRET);
    return token;
  } catch (error) {
    console.error("Failed to generate token:", error);
    throw new Error("Token generation failed");
  }
}



/**
 * Registers a new user.
 * @param userData The validated user registration input.
 * @returns The newly created user document (without password hash) and a JWT.
 * @throws HTTPException if username or email already exists, or other server errors.
 */
async function registerUser(userData: RegisterInput) {
  const { username, email, password } = userData;

  try {
    // check if user already exists by email or username
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      throw new HTTPException(409, { message: "Email already registered." });
    }
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      throw new HTTPException(409, { message: "Username already taken." });
    }

    // Hash the password securely
    const passwordHash = await hashPassword(password);

    // Create the new user document
    const newUser = new User({
      username,
      email,
      password: passwordHash,
    }) as IUser & { _id: any };

    await newUser.save();

    // Generate a JWT for the new user
    const token = await generateToken({
      _id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
    });

    return {
      user: {
        _id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      token,
    };
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error("Error in registerUser service:", error);
    throw new HTTPException(500, {
      message: "Failed to register user due to server error.",
    });
  }
}

/**
 * Logs in a user.
 * @param credentials The validated login credentials.
 * @returns The authenticated user document (without password hash) and a JWT.
 * @throws HTTPException if invalid credentials or server errors.
 */
async function loginUser(credentials: LoginInput) {
  const { email, password } = credentials;

  try {
    const user = (await User.findOne({ email })) as IUser & { _id: any };
    if (!user)
      throw new HTTPException(401, { message: "Invalid credentials." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      throw new HTTPException(401, { message: "Invalid credentials." });

    const token = await generateToken({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    return {
      user: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error("Error in loginUser service:", error);
    throw new HTTPException(500, {
      message: "Failed to log in due to server error.",
    });
  }
}

export { registerUser, loginUser };
