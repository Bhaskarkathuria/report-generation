const express = require("express");
const router = express.Router();
const path = require("path");
const Sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const user = require("../model/user");
const forgotPasswordRequest = require("../model/forgotPasswordRequest");
require("dotenv").config();

router.post("/forgot", async (req, res, next) => {
  // console.log(req.body.registeredEmail);
  // console.log(process.env.SIB_API_KEY);

  uuid = uuidv4();
  const user1 = await user.findOne({
    where: { email: req.body.registeredEmail },
  });
  if (user1) {
    await forgotPasswordRequest.create({
      id: uuid,
      isactive: true,
      userid: user1.id,
      userInfoId: user1.id,
    });
  }

  const client = Sib.ApiClient.instance;
  const apiKey = client.authentications["api-key"];
  apiKey.apiKey = process.env.SIB_API_KEY;

  const tranEmailApi = new Sib.TransactionalEmailsApi();

  const sender = {
    email: "kathuriabhaskar712@gmail.com",
    name: "Bhaskar Kathuria",
  };
  const receivers = [{ email: req.body.registeredEmail }];

  tranEmailApi
    .sendTransacEmail({
      sender,
      to: receivers,
      subject: "Password reset link",
      textContent: `<h3>Click on the link given to reset your password.Link will only work ONCE!!</h3>
      http://localhost:5000/passwordrequest/reset/${uuid}`,
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/reset/:id", async (req, res, next) => {
  const result = await forgotPasswordRequest.findOne({
    where: { id: req.params.id },
  });
  if (result) {
    if (result.isactive == true) {
      res.sendFile(path.join(__dirname, "../", "views", "newpassword.html"));
      await result.update({ isActive: false });
    }
  }
});

router.post("/update", (req, res, next) => {
  bcrypt.hash(req.body.password, 10, (err, hashed) => {
    user
      .findOne({ where: { email: req.body.email } })
      .then((result) => {
        result.update({ password: hashed });
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

module.exports = router;
