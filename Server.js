require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
morgan("dev");

//models
const Budget = require("./models/Budget");
const Payment = require("./models/Payment");
const User = require("./models/User");

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((error) => console.log(error));

app.get("/hello", (req, res) => {
  res.send("hello");
});

//signup post
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phNumber } = req.body;
    const data = await User.find({ email });
    if (data) {
      response.message = "Email already exist";
      return res.status(400).send(response);
    } else {
      const user = new User({
        name,
        email,
        password,
        phNumber,
      });
      response.message = "User registered successfully";
      return res.status(200).send(response);
    }
  } catch {
    response.message = "Failed to register , please try again";
    return res.status(400).send(response);
  }
});

//login post
app.post("/signIn", async (req, res) => {
  console.log("route hit ho");
  let response = { status: false, message: "", data: {} };
  const { email, password } = req.body;
  await User.findOne({ email })
    .then((data) => {
      console.log(data);
      if (password == data.password) {
        response.status = true;
        response.message = "login successful";
        response.data = data;
        return res.status(200).send(response);
      } else {
        response.message = "incorrect password , please try again";
        return res.status(401).send(response);
      }
    })
    .catch((e) => {
      response.message = "Failed to signIn , please try again";
      return res.status(401).send(response);
    });
});

//get profile
app.get("/user/:userId", async (req, res) => {
  let response = {
    status: false,
    data: "",
  };
  try {
    const { userId } = req.params;
    // userId = "61e137d188086b0f5577acdc"; // Todo: body mai lelo
    const data = await User.findOne({ _id: userId });
    if (data) {
      response.status = true;
      response.data = data;
      return res.status(200).send(response);
    } else {
      response.message = "could not get the user , please try again";
      return res.status(400).send(response);
    }
  } catch (error) {
    response.errMessage = error.message;
    response.message = "could not get the user , please try again";
    return res.status(400).send(response);
  }
});

//post budget api
app.post("/budget", async (req, res) => {
  let response = { status: false, message: "" };
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  try {
    const d = new Date();
    let month = months[d.getMonth()];
    let year = d.getFullYear();
    const { category, amount, userId } = req.body;
    const data = new Budget({
      category,
      amount,
      createdBy: userId,
      date: new Date().toISOString().slice(0, 10),
      month,
      year,
    });
    await data.save();
    response.status = true;
    response.message = "Budget created successfully";
    return res.status(201).send(response);
  } catch (error) {
    response.errMessage = error.message;
    response.message = "Failed to create , please try again";
    return res.status(400).send(response);
  }
});

//post payment api
app.post("/payment", async (req, res) => {
  console.log("payment");
  let response = { status: false, message: "" };
  const categories = [
    { name: "Auto", icon: "assets/images/auto.png" },
    { name: "Bank", icon: "assets/images/bank.png" },
    { name: "Cash", icon: "assets/images/cash.png" },
    { name: "Charity", icon: "assets/images/charity.png" },
    { name: "Eating", icon: "assets/images/eating.png" },
    { name: "Gift", icon: "assets/images/gift.png" },
    { name: "Money Transferred", icon: "assets/images/gift.png" },
  ];
  const monthConst = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  try {
    const d = new Date();
    let day = d.getDate();
    let month = monthConst[d.getMonth()];
    let year = d.getFullYear();
    const { category, amount, phone, userId } = req.body;
    const payment = new Payment({
      category: categories[category].name,
      amount,
      phone,
      icon: categories[category].icon,
      month,
      day,
      year,
      createdBy: userId,
    });
    await payment.save();
    response.status = true;
    response.message = "Payment created successfully";
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    response.errMessage = error.message;
    response.message = "Failed to create payment , please try again";
    res.status(400).send(response);
  }
});

//post income api
app.post("/income", async (req, res) => {
  let response = { status: false, message: "" };
  try {
    const { income, userId } = req.body;
    console.log(req.body, "body");
    const data = await User.findOne({
      _id: userId,
    });
    data.income += `+${income}`;
    data.income = eval(data.income);
    await data.save();
    if (!data) {
      response.message = "failed to add income , please try again";
      res.status(400).send(response);
    }
    response.status = true;
    response.message = "income added successfully";
    res.status(201).send(response);
  } catch (error) {
    response.errMessage = error.message;
    response.message = "Failed to create , please try again";
    console.log(error);
    res.status(400).send(response);
  }
});

//get daily expense api
app.get("/expense", async (req, res) => {
  let response = {
    status: false,
    message: "",
    data: [],
    totalPayment: 0,
  };
  let totalPayment = 0,
    i;
  try {
    const { userId, day } = req.body;
    const data = await Payment.find({ day: day, createdBy: userId });

    for (i = 0; i < data.length; i++) {
      totalPayment += parseInt(data[i].amount);
    }

    response.status = true;
    response.data = data;
    response.totalPayment = totalPayment;
    response.message = "Success";
    console.log(response, "data");
    res.status(200).send(response);
  } catch (error) {
    console.log(error, "error");
    response.errMessage = error.message;
    response.message = "Failed to get daily expense , please try again";
    res.status(400).send(response);
  }
});

//get monthly stats
app.get("/stats", async (req, res) => {
  let response = {
    status: false,
    data: {
      budget: "",
      income: 0,
      expense: 0,
      total: 0,
    },
  };
  let totalPayment = 0,
    i;
  try {
    const { month, userId } = req.body;
    const data = await Payment.find({ month }).select("amount");
    const user = await User.find({ _id: userId }).select("income");
    income = user.income.filter((item) => item.month === month);
    for (i = 0; i < data.length; i++) totalPayment += data.amount;
    response.status = true;
    response.data.income = income;
    response.data.expense = income - totalPayment;
    response.data.total = totalPayment;
    res.status(200).send(response);
  } catch (error) {
    response.errMessage = error.message;
    response.message = "Failed to find monthly stats , please try again";
    res.status(400).send(response);
  }
});

//get monthly expense
app.get("/monthlyExpense", async (req, res) => {
  let response = {
    status: false,
    data: {
      budget: "",
      income: 0,
      expense: 0,
      total: 0,
    },
  };
  try {
    const { month, userId } = req.body;
    const user = await User.find({ _id: userId }).select("income payment");
    income = user.income.filter((item) => item.month === month);
    payment = user.payment.filter((item) => item.month === month);
    response.status = true;
    response.data.income = income;
    response.data.payment = payment;
    res.status(200).send(response);
  } catch (error) {
    response.errMessage = error.message;
    response.message = "Failed to find monthly budget , please try again";
    res.status(400).send(response);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
