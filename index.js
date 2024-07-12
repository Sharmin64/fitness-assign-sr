const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// *mongodb connection

// ? define product model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  stock: { type: Number, required: true },
});

const Product = mongoose.model("Product", productSchema);

//   Initialiize Express
const app = express();

// middleware

app.use(cors());
app.use(bodyParser.json());
// const PORT = process.env.PORT || 5000;

// *mongodb connection

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Routes

    // *Get all products
    app.get("/api/products", async (req, res) => {
      try {
        const products = await Product.find();
        res.json(products);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    //* Get product by id

    app.get("/api/products/:id", async (req, res) => {
      try {
        const product = await Product.findById(req.params.id);
        if (product) {
          res.json(product);
        } else {
          res.status(404).json({ message: "Product not found" });
        }
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // *Create a new product
    app.post("/api/products", async (req, res) => {
      const { name, price, category, description, images, stock } = req.body;
      const product = new Product({
        name,
        price,
        category,
        description,
        images,
        stock,
      });
      try {
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
      } catch (err) {
        res.status(400).json({
          message: err.message,
        });
      }
    });

    // *Update a product
    app.put("/api/products/:id", async (req, res) => {
      const { name, price, category, description, images, stock } = req.body;
      try {
        const product = await Product.findByIdAndUpdate(req.params.id);
        if (product) {
          product.name = name;
          product.price = price;
          product.category = category;
          product.description = description;
          product.images = images;

          const updatedProduct = await product.save();
          res.json(updatedProduct);
        } else {
          res.status(404).json({ message: "Product not found" });
        }
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });

    //* Delete a product
    app.delete("/api/products/:id", async (req, res) => {
      try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (product) {
          await product.remove();
          res.json({ message: "Product removed" });
        } else {
          res.status(404).json({ message: "Product not found" });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Fitness shop Cor-Muscles is running on Server");
});

app.listen(process.env.PORT, () => {
  console.log(`Cor Muscles is listening on port ${process.env.PORT}`);
});
