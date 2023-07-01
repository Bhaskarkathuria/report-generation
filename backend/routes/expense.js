const express = require("express");
const router = express.Router();
const User = require("../model/expensemodel");
const User2 = require("../model/user");
const sequelize = require("../config/database");
const Download = require("../model/download");
const AWS = require("aws-sdk");

const userAuthentication = require("../midleware/auth");

router.post("/", userAuthentication.authenticate, async (req, res, next) => {
  try {
    const result = await User.create({
      date: req.body.date,
      amount: req.body.amount,
      description: req.body.description,
      category: req.body.category,
      income: req.body.category == "SALARY" ? req.body.amount : 0,
      expense: req.body.category !== "SALARY" ? req.body.amount : 0,
      userInfoId: req.user.id,
    });

    const totalexpense =
      parseInt(User2.rawAttributes.totalexpense.defaultValue) +
      parseInt(result.expense);
    User2.rawAttributes.totalexpense.defaultValue = totalexpense;

    User2.update(
      {
        totalexpense: totalexpense,
      },
      {
        where: { id: req.user.id },
      }
    );

    res.json({
      date: result.date,
      amount: result.amount,
      description: result.description,
      category: result.category,
      income: result.income,
      expense: result.expense,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.get("/", userAuthentication.authenticate, (req, res, next) => {
  //console.log(req.user);
  User.findAll({ where: { userInfoId: req.user.id } })
    .then((result) => {
      console.log("rrrreeesssuulllttt", result);
      res.status(200).json(result);
    })
    .catch((error) => {
      console.log(error);
    });
});

router.delete("/:id", userAuthentication.authenticate, (req, res, next) => {
  const prodid = req.params.id;
  User.findByPk(prodid)
    .then((product) => {
      // console.log("PRODUCT====>>>>>", product);
      //console.log("DELETED AMOUNT======>>>>>",product.amount)
      const response = User2.findByPk(product.id);
      if (response) {
        User2.update(
          {
            totalexpense:
              parseInt(User2.rawAttributes.totalexpense.defaultValue) -
              parseInt(product.amount),
          },
          {
            where: { id: req.user.id },
          }
        );
      }

      return product
        .destroy()
        .then((result) => {
          console.log("Product destroyed");
          res.send(result);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch();
});

router.get(
  "/download",
  userAuthentication.authenticate,
  async (req, res, next) => {
    expenses = await User.findAll({ where: { id: req.user.id } });
    Data = JSON.stringify(expenses);
    let s3 = new AWS.S3({
      region: "ap-south-1",
      accessKeyId: process.env.IAM_USER_KEY,
      secretAccessKey: process.env.IAM_USER_SECRET,
    });
    s3.upload(
      {
        Bucket: "expensetrackersharpenerproject",
        Key: `Expense${req.user.name}/ ${new Date()}.txt`,
        Body: Data,
        ACL: "public-read",
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          Download.create({
            link: data.Location,
            userId: req.user.id,
          });
          res.send(data);
        }
      }
    );
  }
);

module.exports = router;
