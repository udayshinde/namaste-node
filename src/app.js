const express = require('express');

const app = express();

app.use("/test", (req, res) => {
    res.send('Hello from server Uday');
});

app.listen(3000, () => {
    console.log('Server running');
})