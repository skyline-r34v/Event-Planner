import express from 'express'

const router = express.Router();

router.post('/clientinput', (req, res) => {
    console.log('Received Project Input:', req.body);
    const { purpose, functionality, frontend, backend, database, designPreference, responsive, transition, colorScheme } = req.body

    if (responsive == true && transition == true) {
        const prompt = `Build a responsive ${purpose} using ${frontend} for the frontend, ${backend} for the backend, and ${database} as the database. The application should include ${functionality}. I prefer a ${designPreference} with smooth transitions/animations and a ${colorScheme} color scheme.`
        console.log(prompt)
    }
    else {
        const prompt = `Build a  ${purpose} using ${frontend} for the frontend, ${backend} for the backend, and ${database} as the database. The application should include ${functionality}. I prefer a ${designPreference} with smooth transitions/animations and a ${colorScheme} color scheme.`
        console.log(prompt)
    }

    res.status(200).json({ message: 'Requirements submitted successfully!' });
})

export default router;