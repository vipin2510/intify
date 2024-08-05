import { Router } from 'express';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs, { access } from 'fs';
import * as readline from 'readline';

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = './token.json';

const credentials = {
    installed: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
    },
};

const token = {
    access_token: process.env.ACCESS_TOKEN,
    scope: SCOPES,
    toke_type: "Bearer",
    expiry_date: process.env.EXPIRY_DATE
}

function getAccessToken(oAuth2Client: any, callback: any) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err: any, token: any) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function authorize(credentials: any, callback: any) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // fs.readFile(TOKEN_PATH, (err, token) => {
    //     if (err) return getAccessToken(oAuth2Client, callback);
    // });
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    callback(oAuth2Client);
}

function listFiles(auth: any) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list(
        {
            q: "name contains '.heic'", // Modify this line to search for specific files
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)',
        },
        (err: any, res: any) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                console.log('Files:');
                files.map((file: any) => {
                    console.log(`${file.name} (${file.id})`);
                });
            } else {
                console.log('No files found.');
            }
        }
    );
}

const router = Router();

router.get("/", async (req, res) => {
    try {
        authorize(credentials, listFiles);
        res.status(200).send("Success");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error");
    }
});

export default router;
