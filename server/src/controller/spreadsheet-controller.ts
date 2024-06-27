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
        console.log(name.toLowerCase() === 'naxal profile');
        if (name.toLowerCase() === 'naxal profile') {
            rows = rows.shift();
            rows = response.data.values?.map(row => ({
                id: processField(row[0] || ''),
                name: processField(row[1] || ''),
                description: processField(row[2] || ''),
                rank: processField(row[3] || ''),
                level: processField(row[4] || ''),
                central: processField(row[5] || ''),
                zonal: processField(row[6] || ''),
                subZonal: processField(row[7] || ''),
                division: processField(row[8] || ''),
                areaCommittee: processField(row[9] || ''),
                company: processField(row[10] || ''),
                platoon: processField(row[11] || ''),
                rpc: processField(row[12] || ''),
                weapon: processField(row[13] || ''),
                electronicGadget: processField(row[14] || ''),
                status: processField(row[15] || ''),
                otherInfo: processField(row[16] || ''),
                resident: processField(row[17] || ''),
                district: processField(row[18] || ''),
                workArea: processField(row[19] || ''),
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
