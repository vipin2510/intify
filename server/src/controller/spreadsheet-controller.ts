import { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.API_KEY;

function processField(field: string) {
    return field.replace(/\n/g, '\\n');
}

export const getSpreadsheetData = async (req: Request, res: Response) => {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    const name = (req.query.name as string).split("+").join(" ");

    // The ID and range of the spreadsheet
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = `${name}!A1:Z`; // Adjust the range as needed

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        let rows: any = response.data.values;

        if (name.toLowerCase() === 'profile') {
            rows = rows.shift();
            rows = response.data.values?.map(row => ({
                id: processField(row[0] || ''),
                name: processField(row[1] || ''),
                rank: processField(row[2] || ''),
                reward: processField(row[3] || ''),
                weapon: processField(row[4] || ''),
                division: processField(row[5] || ''),
                areaCommittee: processField(row[6] || ''),
                company: processField(row[7] || ''),
                platoon: processField(row[8] || ''),
                workArea: processField(row[9] || ''),
                los: processField(row[10] || ''),
                lgs: processField(row[11] || ''),
                jury: processField(row[12] || ''),
                alive: processField(row[13] || ''),
            }));
        }

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
