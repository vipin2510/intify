import { Router } from "express";
import { getSpreadsheetData, getSpreadsheetDataSukma } from "../controller/spreadsheet-controller";

const router = Router();

router.get('/spreadsheet', getSpreadsheetData)
router.get('/spreadsheet-sukma', getSpreadsheetDataSukma)
router.get('/spreadsheet-bijapur', getSpreadsheetDataBijapur)


export default router;
