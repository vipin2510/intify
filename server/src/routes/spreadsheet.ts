import { Router } from "express";
import {
  getSheetData,
  getSheetNames,
  getSpreadsheetData,
  getSpreadsheetDataSukma,
} from "../controller/spreadsheet-controller";

const router = Router();

router
  .get("/spreadsheet", getSpreadsheetData)
  .get("/spreadsheet-sukma", getSpreadsheetDataSukma)
  .get("/sheet", getSheetData)
  .get("/sheet-names", getSheetNames);

export default router;
