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
  let response = { status: false, message: "" };
  const { email, password } = req.body;
  await User.find({ email })
    .then((data) => {
      if (data == undefined) {
        response.message = "Failed to signIn , please try again";
        return res.status(400).send(response);
      }
      if (password === data.password) {
        response.message = "login successful";
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
app.get("/", async (req, res) => {
  let response = {
    status: false,
    data: "",
  };
  try {
    // const { date } = req.body
    userId = "61e137d188086b0f5577acdc"; // Todo: body mai lelo
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
    const { category, amount } = req.body;
    userId = "61e137d188086b0f5577acdc"; // Todo: body mai lelo
    const data = new Budget({
      category,
      amount,
      createdBy: userId,
      month: name,
      date: new Date().toISOString().slice(0, 10),
      year,
    });
    data.save();
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
    // const { date } = req.body
    userId = "61e137d188086b0f5577acdc"; // Todo: body mai lelo
    let today = new Date().toISOString().slice(0, 10);
    const data = await Budget.find({ date: today, createdBy: userId }).select(
      "category amount"
    );
    for (i = 0; i < data.length; i++) {
      totalBudget += data[i].amount;
    }
    response.status = true;
    response.data.budget = data;
    response.data.total = totalBudget;
    response.message = "Budget created successfully";
    console.log(response.data, "data");
    res.status(200).send(response);
  } catch (error) {
    console.log(error, "error");
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
