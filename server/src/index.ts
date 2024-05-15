import express, { Request, Response } from 'express';
import spreadsheetRoute from './routes/spreadsheet';

const App = express();

App.use(express.json());

App.get('/', (req: Request, res: Response) => {
    res.status(200).send("Server Running correctly");
});

App.use("/api", spreadsheetRoute);

App.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
});