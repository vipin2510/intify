import express, { Request, Response } from "express";
import spreadsheetRoute from "./routes/spreadsheet";
import CORS from "cors";

const allowedOrigins = ["http://localhost:5173", "https://intify.vercel.app"];

// Configure CORS middleware
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    // Check if the incoming origin is allowed
    if (allowedOrigins.indexOf(origin || "") !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const App = express();
App.use(CORS(corsOptions));
App.use(express.json());

App.get("/", (req: Request, res: Response) => {
  res.status(200).send("Server Running correctly");
});

App.use("/api", spreadsheetRoute);

App.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
