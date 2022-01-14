require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

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

//post budget api
app.post("/budget", (req, res) => {
  let response = { status: false, message: "" };
  const month = [
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
    let name = month[d.getMonth()];
    let year = d.getFullYear();
    console.log(req.body);
    const { category, amount } = req.body;
    userId = "61e137d188086b0f5577acdc"; // Todo: body mai lelo
    const data = new Budget({
      category,
      amount,
      createdBy: userId,
      month: name,
      year,
    });
    data.save();
    response.status = true;
    response.message = "Budget created successfully";
    res.status(201).send(response);
  } catch (error) {
    response.errMessage = error.message;
    response.message = "Failed to create , please try again";
    res.status(400).send(response);
  }
});

//post payment api
app.post("/payment", async (req, res) => {
  let response = { status: false, message: "" };
  const month = [
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
    let name = month[d.getMonth()];
    const { category, amount, number, userId } = req.body;
    const data = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $push: {
          payment: {
            category,
            amount,
            number,
            month: name,
          },
        },
      }
    );
    if (!data) {
      response.message = "failed to add income , please try again";
      res.status(400).send(response);
    }
    response.status = true;
    response.message = "Payment created successfully";
    res.status(201).send(response);
  } catch (error) {
    response.errMessage = error.message;
    response.message = "Failed to create payment , please try again";
    res.status(400).send(response);
  }
});

//post income api
app.put("/income", async (req, res) => {
  let response = { status: false, message: "" };
  try {
    const { salary, month, userId } = req.body;
    const data = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $push: {
          income: {
            month,
            salary,
          },
        },
      }
    );
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
    res.status(400).send(response);
  }
});

//get daily expense api
app.get("/", async (req, res) => {
  let response = {
    status: false,
    message: "",
    data: {
      budget: "",
      total: 0,
    },
  };
  let totalBudget = 0,
    i;
  try {
    const { date } = req.body;
    const data = await Budget.find({ createdBy: date }).select(
      "category amount"
    );
    for (i = 0; i < data.length; i++) totalBudget += data.amount;
    response.status = true;
    response.data.budget = data;
    response.data.total = totalBudget;
    response.message = "Budget created successfully";
    res.status(200).send(response);
  } catch (error) {
    response.errMessage = error.message;
    response.message = "Failed to get daily expense , please try again";
    res.status(400).send(response);
  }
});

//get monthly stats
app.get("/", async (req, res) => {
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
app.get("/", async (req, res) => {
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
