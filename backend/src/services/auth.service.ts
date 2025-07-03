import { hash } from "argon2";
import User, { IUser } from "../db/models/User";
import RefreshToken from "../db/models/RefreshToken";
import BlacklistedToken from "../db/models/BlacklistedToken";
import { HTTPException } from "hono/http-exception";
import { sign, decode } from "hono/jwt";
import { RegisterInput, LoginInput } from "../validation/auth.validation";
import { config } from "../config";
import { Types } from "mongoose";
import { randomBytes } from "crypto";

export interface AuthUserData {
  _id: string;
  username: string;
  email: string;
}

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

async function generateRefreshToken(userId: Types.ObjectId): Promise<string> {
  const token = randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Refresh token valid for 30 days

  const refreshToken = new RefreshToken({
    user: userId,
    token,
    expiresAt,
  });

  await refreshToken.save();
  return token;
}

async function generateTokens(user: AuthUserData) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      _id: user._id,
      username: user.username,
      email: user.email,
      exp: now + 60 * 15, // Access token valid for 15 minutes
      iat: now,
    };

    const accessToken = await sign(payload, config.JWT_SECRET);
    const refreshToken = await generateRefreshToken(
      new Types.ObjectId(user._id)
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Failed to generate tokens:", error);
    throw new Error("Token generation failed");
  }
}

async function registerUser(userData: RegisterInput) {
  const { username, email, password } = userData;

  try {
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      throw new HTTPException(409, { message: "Email already registered." });
    }
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      throw new HTTPException(409, { message: "Username already taken." });
    }

    const passwordHash = await hashPassword(password);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
    }) as IUser & { _id: any };

    await newUser.save();

    const { accessToken, refreshToken } = await generateTokens({
      _id: (newUser._id as Types.ObjectId).toString(),
      username: newUser.username as string,
      email: newUser.email,
    });

    return {
      user: {
        _id: (newUser._id as Types.ObjectId).toString(),
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      accessToken,
      refreshToken,
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

async function loginUser(credentials: LoginInput) {
  const { email, password } = credentials;

  try {
    const user = (await User.findOne({ email })) as IUser & { _id: any };
    if (!user)
      throw new HTTPException(401, { message: "Invalid credentials." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      throw new HTTPException(401, { message: "Invalid credentials." });

    const { accessToken, refreshToken } = await generateTokens({
      _id: (user._id as Types.ObjectId).toString(),
      username: user.username as string,
      email: user.email,
    });

    return {
      user: {
        _id: (user._id as Types.ObjectId).toString(),
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
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

async function OAuthHandler(c: any) {
  const code = c.req.query("code");
  const stateParam = c.req.query("state");

  if (!code) throw new HTTPException(400, { message: "No code provided" });
  if (!stateParam)
    throw new HTTPException(400, { message: "No state parameter provided" });

  let appRedirectPrefix: string | undefined;
  try {
    const statePayload = JSON.parse(decodeURIComponent(stateParam));
    appRedirectPrefix = statePayload.appRedirectPrefix;
  } catch (error) {
    console.error("Failed to parse state parameter:", error);
    throw new HTTPException(400, { message: "Invalid state parameter" });
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri:
        "https://archive-ctld.onrender.com/api/auth/google/callback",
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.ok) {
    console.error("Token error", tokenData);
    throw new HTTPException(401, { message: "Failed to get access token" });
  }

  const userInfoRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }
  );

  const googleUser = await userInfoRes.json();
  if (!userInfoRes.ok) {
    console.error("User info error", googleUser);
    throw new HTTPException(401, { message: "Failed to get user info" });
  }

  let user = await User.findOne({ googleId: googleUser.id });
  if (!user) {
    const fallbackUsername =
      googleUser.name?.replace(/\s+/g, "") || googleUser.email.split("@")[0];

    user = new User({
      googleId: googleUser.id,
      email: googleUser.email,
      username: fallbackUsername,
    });

    try {
      await user.save();
    } catch (err: any) {
      console.error("User creation failed", err);
      throw new HTTPException(500, { message: "User creation failed" });
    }
  }

  const { accessToken, refreshToken } = await generateTokens({
    _id: (user._id as Types.ObjectId).toString(),
    email: user.email,
    username: user.username as string,
  });

  const finalAppRedirectPrefix = appRedirectPrefix;

  const appRedirect = new URL(`${finalAppRedirectPrefix}auth-callback`);

  appRedirect.searchParams.set("accessToken", accessToken);
  appRedirect.searchParams.set("refreshToken", refreshToken);
  appRedirect.searchParams.set("email", user.email);
  appRedirect.searchParams.set("username", user.username as string);

  return c.redirect(appRedirect.toString());
}

async function refreshAccessToken(oldRefreshToken: string) {
  try {
    const storedToken = await RefreshToken.findOne({
      token: oldRefreshToken,
    }).populate("user");

    if (!storedToken) {
      throw new HTTPException(401, { message: "Invalid refresh token." });
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.findByIdAndDelete(storedToken._id);
      throw new HTTPException(401, { message: "Refresh token expired." });
    }

    const user = storedToken.user as IUser & { _id: any };
    if (!user) {
      throw new HTTPException(401, { message: "User not found for token." });
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      exp: now + 60 * 15, // New access token valid for 15 minutes
      iat: now,
    };

    const accessToken = await sign(payload, config.JWT_SECRET);

    return { accessToken };
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error("Error in refreshAccessToken service:", error);
    throw new HTTPException(500, {
      message: "Failed to refresh token due to server error.",
    });
  }
}

async function logoutUser(accessToken: string, refreshToken: string) {
  try {
    const { payload } = decode(accessToken);
    if (!payload || !payload.exp) {
      throw new HTTPException(400, { message: "Invalid access token." });
    }

    const expiresAt = new Date(payload.exp * 1000);
    const blacklistedToken = new BlacklistedToken({
      token: accessToken,
      expiresAt,
    });
    await blacklistedToken.save();

    await RefreshToken.deleteOne({ token: refreshToken });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    console.error("Error in logoutUser service:", error);
    throw new HTTPException(500, {
      message: "Failed to logout due to server error.",
    });
  }
}

export {
  registerUser,
  loginUser,
  OAuthHandler,
  refreshAccessToken,
  logoutUser,
};
