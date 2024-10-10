import express, { Request, Response } from "express";
import spreadsheetRoute from "./routes/spreadsheet";
import uploadRoute from "./routes/upload";
import searchRoute from "./routes/search";
import cors from "cors";
import { OAuth2Client } from 'google-auth-library';
import { AUTH_CONFIG } from './config';
import path from "path";
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = ["http://localhost:5173", "https://intify.vercel.app", "https://naxal-structure.vercel.app"];
const allowedEmails = AUTH_CONFIG.ALLOWED_EMAILS;

const App = express();

// Configure CORS middleware
App.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

App.use(express.json());

// Initialize Google OAuth client
const client = new OAuth2Client("31972503524-c5ao35e1arcjb53ruskm8cpr36gm4dg5.apps.googleusercontent.com");

App.get("/", (req: Request, res: Response) => {
  res.status(200).send("Server Running correctly");
});

// Endpoint for token verification
App.post('/api/verify-token', async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    console.log("Login attempt failed: No token provided");
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const userInfo = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const userData = await userInfo.json();

    if (!userData || !userData.email) {
      console.log("Login attempt failed: Invalid user data");
      return res.status(401).json({ error: 'Invalid user data' });
    }

    console.log("Login attempt details:");
    console.log(`- Email: ${userData.email}`);
    console.log(`- Name: ${userData.name || 'Not available'}`);
    console.log(`- Picture: ${userData.picture || 'Not available'}`);
    console.log(`- Google ID: ${userData.sub}`);

    if (userData.email && allowedEmails.includes(userData.email)) {
      console.log(`User authorized: ${userData.email}`);
      res.json({
        userId: userData.sub,
        email: userData.email,
        name: userData.name,
        picture: userData.picture
      });
    } else {
      console.log(`User not authorized. Email: ${userData.email}`);
      res.status(403).json({ error: 'User not authorized' });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// New endpoint for logging user activity
// New endpoint for logging user activity
App.post('/api/log-activity', async (req: Request, res: Response) => {
  const { email, lastDateOfAccess, timeStamp } = req.body;

  if (!email || !lastDateOfAccess || !timeStamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'intify-activity!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[email, lastDateOfAccess, timeStamp]],
      },
    });

    if (response.status === 200) {
      console.log(`Activity logged for user: ${email}`);
      res.status(200).json({ message: 'Activity logged successfully' });
    } else {
      console.error('Failed to log activity:', response.statusText);
      res.status(500).json({ error: 'Failed to log activity' });
    }
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


App.use("/api", spreadsheetRoute);
App.use("/api/upload", uploadRoute);
App.use("/api/search", searchRoute);
App.use("/images", express.static(path.join(__dirname, "..", 'uploads')));

App.listen(5001, () => {
  console.log("Server running at http://localhost:5001");
});