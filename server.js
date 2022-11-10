const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoClient = mongodb.MongoClient;
const dotenv = require("dotenv").config();
const URL = process.env.DB;
const DB = "capstone_project"



const app = express();


//Middleware

app.use(express.json())

app.use(cors({
    origin: "https://darling-bublanina-9f8ad0.netlify.app/",
}));


let authenticate = (req, res, next) => {
    if (req.headers.authorization) {
        try {
            let decode = jwt.verify(req.headers.authorization, process.env.SECRET)
            if (decode) {
                next()
            }
        } catch (error) {
            res.status(401).json({ message: "Unauthorized" })
        }

    } else {
        res.status(401).json({ message: "Unauthorized" })
    }
}


app.post("/suggestions",authenticate, async function (req, res) {

    try {
        const connection = await mongoClient.connect(URL)

        const db = connection.db(DB)

        await db.collection("suggestions").insertOne(req.body)

        await connection.close()

        res.json({ message: "Data inserted" })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
});

app.post("/favourites",authenticate, async function (req, res) {

    try {
        const connection = await mongoClient.connect(URL)

        const db = connection.db(DB)

        await db.collection("favourites").insertOne(req.body)

        await connection.close()

        res.json({ message: "Data inserted" })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
});

app.post("/register", async function (req, res) {

    try {

        const connection = await mongoClient.connect(URL)

        const db = connection.db(DB)

        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password, salt)

        req.body.password = hash

        await db.collection("users").insertOne(req.body)

        await connection.close()

        res.json({ message: "User registered successfully" })

    } catch (error) {
        res.status(401).json({ message: "Something went wrong" })
    }
});

app.post("/login", async function (req, res) {

    try {

        const connection = await mongoClient.connect(URL);

        const db = connection.db(DB);

        let user = await db.collection("users").findOne({ email: req.body.email });

        if (user) {
            let compare = await bcrypt.compare(req.body.password, user.password);
            if (compare) {
                let token = jwt.sign({ _id: user._id },process.env.SECRET, { expiresIn: "1h"});
                res.json({token});
            } else {
                res.status(401).json({ message: "Email/Password is incorrect" });
            }
        } else {
            res.status(401).json({ message: "Email/Password is incorrect" });
        }

        await connection.close()
    } 
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});


app.listen(process.env.PORT || 3001);