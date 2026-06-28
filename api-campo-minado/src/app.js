const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorMiddleware } = require("./modules/http");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);

app.get("/", (req, res) => {
    res.json({
        mensagem: "API Campo Minado funcionando"
    });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});