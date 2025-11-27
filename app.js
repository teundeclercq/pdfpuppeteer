require('dotenv').config();

const express = require('express');
const pdfRouter = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/pdf', pdfRouter)


if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`PDF service listening on port ${PORT}`);
    });
}

module.exports = app;