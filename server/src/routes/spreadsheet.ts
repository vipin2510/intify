import { Router } from "express";
import { getSpreadsheetData } from "../controller/spreadsheet-controller";

const router = Router();

router.get('/spreadsheet', getSpreadsheetData)


export default router;