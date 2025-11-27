const express = require('express');
const multer = require('multer');
const puppeteer = require('puppeteer');

const router = express.Router();

// Secret from env (dotenv is already loaded in app.js)
const SHARED_SECRET = process.env.SHARED_SECRET;

if (!SHARED_SECRET) {
    console.error('SHARED_SECRET is not set!');
    // you can throw or just log; throwing will crash on startup:
    throw new Error('SHARED_SECRET is required');
}

// Multer config
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Auth middleware
function authenticate(req, res, next) {
    const provided = req.headers['x-shared-secret'];
    if (!provided || provided !== SHARED_SECRET) {
        console.warn(
            'Unauthorized request',
            { provided, expected: SHARED_SECRET ? '(set)' : '(missing)' }
        );
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// POST /  (mounted under /pdf → final route: POST /pdf)
router.post('/', authenticate, upload.single('file'), async (req, res) => {
    let browser;
    let page;

    try {
        console.log(
            'Incoming /pdf request',
            'hasFile=', !!req.file,
            'fileSize=', req.file?.buffer?.length || 0
        );

        if (!req.file) {
            console.warn('No file received on /pdf');
            return res
                .status(400)
                .json({ error: 'No HTML file uploaded. Use field name "file".' });
        }

        const html = req.file.buffer.toString('utf8');
        console.log('HTML length:', html.length);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm',
            },
        });

        console.log('Generated PDF size (bytes):', pdfBuffer.length);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="document.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to generate PDF' });
    } finally {
        if (page) await page.close().catch(() => {});
        if (browser) await browser.close().catch(() => {});
    }
});

module.exports = router;