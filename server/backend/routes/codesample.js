import express from 'express';
import fs from 'fs';

const router = express.Router();

const rawData = fs.readFileSync('./sample.json');
const data = JSON.parse(rawData);

router.get('/reading', (req,res)=>{
    res.json(data)
})

export default router;