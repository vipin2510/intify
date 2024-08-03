import { Request, Router } from "express";
import multer from 'multer';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage })

router
    .get("/", async (req, res) => {
        res.send("Hello World");
    })
    .post("/", upload.array("images", 100), async (req, res) => {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) return res.status(404).send("No files uploaded");

        const fileUrls = files.map((file) => `https://intify-server.vercel.app/images/${file.filename}`);

        res.status(200).json({ urls: fileUrls });
    });

export default router;