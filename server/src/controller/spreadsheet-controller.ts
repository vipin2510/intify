import { Request, Response } from 'express';
import { google } from 'googleapis';
const apiKey = 'AIzaSyCxrvxY0Nmf5txZwCIuTBWEEIw7HVC8bro';

export const getSpreadsheetData = async (req: Request, res: Response) => {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });

    // The ID and range of the spreadsheet
    const spreadsheetId = '1u0wz3jnjb50T_6D8YCqHnpaT7Cejyg5Rafu7FBA1vZk';
    const range = 'Int Main Sheet!A1:Z'; // Adjust the range as needed

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows: any = response.data.values;
        if (rows.length) {
            res.status(200).json(rows);
        } else {
            res.status(404).send('No data found.');
        }
    } catch (err: any) {
        console.error('The API returned an error:', err);
        res.status(500).send(err.message || "Error occured while fetching spreadsheet");
    }
};
