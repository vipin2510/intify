import { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.API_KEY;

function processField(field: string) {
    return field.replace(/\n/g, '\\n');
}

function removeEmptyValues(obj: any) {
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            obj[key] = obj[key].filter((value: string) => value !== null && value !== undefined && value !== '');
        }
    }
    return obj;
}

export const getSpreadsheetData = async (req: Request, res: Response) => {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    if(!req.query.name)
        return res.status(404).send("No spreadsheet name provided");
    
    const name = (req.query.name as string).split("+").join(" ");

    // The ID and range of the spreadsheetlet rows: any = response.data.values;
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = `${name}!A1:Z`; // Adjust the range as needed

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        let rows: any = response.data.values;
        if (name.toLowerCase() === 'naxal profile') {
            rows = rows.shift();
            rows = response.data.values?.map(row => parseInt(row[0]) && ({
                id: processField(row[22] + row[24] || ''),
                name: processField(row[1] || ''),
                description: processField(row[3] || ''),
                rank: processField(row[4] || ''),
                level: processField(row[5] || ''),
                central: processField(row[6] || ''),
                zonal: processField(row[7] || ''),
                subZonal: processField(row[8] || ''),
                division: processField(row[9] || ''),
                areaCommittee: processField(row[10] || ''),
                company: processField(row[11] || ''),
                platoon: processField(row[12] || ''),
                rpc: processField(row[13] || ''),
                weapon: processField(row[14] || ''),
                electronicGadget: processField(row[15] || ''),
                status: processField(row[16] || ''),
                otherInfo: processField(row[17] || ''),
                resident: processField(row[18] || ''),
                district: processField(row[19] || ''),
                workArea: processField(row[20] || ''),
            }));
        }
        else if (name.toLowerCase() === 'db-naxal') {
            rows = rows.shift();
            let filterTypes: {
                rank: string[],
                level: string[],
                central: string[],
                zonal: string[],
                subZonal: string[],
                division: string[],
                areaCommittee: string[],
                company: string[],
                platoon: string[],
                weapon: string[],
                electronicGadget: string[],
                status: string[],
                rpc: string[]
            } = {
                rank: [],
                level: [],
                central: [],
                zonal: [],
                subZonal: [],
                division: [],
                areaCommittee: [],
                company: [],
                platoon: [],
                weapon: [],
                electronicGadget: [],
                status: [],
                rpc: []
            };
            response.data.values?.map(row => {
                filterTypes.rank.push(processField(row[12] || ''));
                filterTypes.level.push(processField(row[0] || ''));
                filterTypes.central.push(processField(row[1] || ''));
                filterTypes.zonal.push(processField(row[2] || ''));
                filterTypes.subZonal.push(processField(row[3] || ''));
                filterTypes.division.push(processField(row[4] || ''));
                filterTypes.areaCommittee.push(processField(row[5] || ''));
                filterTypes.company.push(processField(row[6] || ''));
                filterTypes.platoon.push(processField(row[7] || ''));
                filterTypes.rpc.push(processField(row[8] || ''));
                filterTypes.weapon.push(processField(row[9] || ''));
                filterTypes.electronicGadget.push(processField(row[10] || ''));
                filterTypes.status.push(processField(row[11] || ''));
            });
            filterTypes = removeEmptyValues(filterTypes);
            return res.status(200).json(filterTypes);
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

export const getSpreadsheetDataSukma = async (req: Request, res: Response) => {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    const name = (req.query.name as string).split("+").join(" ");

    // The ID and range of the spreadsheet
    const spreadsheetId = process.env.SPREADSHEET_ID_SUKMA;
    const range = `${name}!A1:Z`; // Adjust the range as needed

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        let rows: any = response.data.values;

        if (rows.length === 0) return res.status(404).send("No data found");

        if (name.toLowerCase() === 'all naxal') {
            rows = rows.shift();
            rows = response.data.values?.map(row => parseInt(row[0]) && ({
                id: processField(row[0] || ''),
                name: processField(row[1] || ''),
                description: processField(row[2] || ''),
                thana: processField(row[3] || ''),
                village: processField(row[4] || ''),
                stage: processField(row[5] || ''),
                rank: processField(row[6] || ''),
                regional: processField(row[7] || ''),
                zonal: processField(row[8] || ''),
                subZonal: processField(row[9] || ''),
                division: processField(row[10] || ''),
                areaCommittee: processField(row[11] || ''),
                rpc: processField(row[12] || ''),
                weapon: processField(row[13] || ''),
                status: processField(row[14] || ''),
                electronicGadget: processField(row[15] || ''),
            }));
        }

        res.status(200).json(rows);
    } catch (err: any) {
        console.error('The API returned an error:', err);
        res.status(500).send(err.message || "Error occured while fetching spreadsheet");
    }
};
