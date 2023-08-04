const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "pimdesk",
  password: "kikukri76",
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

app.post("/save", (req, res) => {
  const {
    product_name,
    product_number,
    variant_name,
    load_date,
    gender,
    code,
    category,
  } = req.body;

  pool.query(
    "INSERT INTO product_data (product_name, product_number, variant_name, load_date, gender, code, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
    [
      product_name,
      product_number,
      variant_name,
      load_date,
      gender,
      code,
      category,
    ],
    (error, results) => {
      if (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ success: false, error: "Failed to save data" });
      } else {
        console.log("Data saved successfully!");
        const savedId = results.rows[0].id;
        res.status(200).json({ success: true, id: savedId });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
