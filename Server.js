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
    const payments = new Payment({
      category: categories[category].name,
      amount,
      phone,
      icon: categories[category].icon,
      month,
      day,
      year,
      createdBy: userId,
    });
    await payments.save();
    response.status = true;
    response.message = "Payment created successfully";
    res.status(201).send(response);
  } catch (error) {
    console.log(error);
    response.errMessage = error.message;
    response.message = "Failed to create payments , please try again";
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
app.get("/stats/:userId/:month", async (req, res) => {
  let response = {
    status: false,
    data: {
      budget: 0,
      expense: 0,
      total: 0,
    },
  };
  let totalPayment = 0, totalBudget=0, netBalance=0, i;
  try {
    const { userId, month } = req.params;
    const data = await Payment.find({ month, createdBy: userId }).select("amount");
    const budget = await Budget.find({ month, createdBy: userId }).select("amount");
    for (i = 0; i < data.length; i++) totalPayment += parseInt(data[i].amount);
    for (i = 0; i < budget.length; i++) totalBudget += budget[i].amount;
    netBalance = totalBudget - totalPayment;
    response.status = true;
    response.data.budget = totalBudget.toString();
    response.data.expense = totalPayment.toString();
    response.data.total = netBalance.toString();
    console.log(response, "data");
    res.status(200).send(response);
  } catch (error) {
    console.log(error, "error");
    response.errMessage = error.message;
    response.message = "Failed to find monthly stats , please try again";
    res.status(400).send(response);
  }
});

//get monthly expense
app.get("/monthlyExpense/:userId/:month", async (req, res) => {
  let response = {
    status: false,
    payment: [],
  };
  let payments = [
    {
      category: "Auto",
      Total: 0,
      Percentage: 0,
      PercentageLabel: 0,
      Budget: 0,
    },
    {
      category: "Bank",
      Total: 0,
      Percentage: 0,
      PercentageLabel: 0,
      Budget: 0,
    },
    {
      category: "Cash",
      Total: 0,
      Percentage: 0,
      PercentageLabel: 0,
      Budget: 0,
    },
    {
      category: "Charity",
      Total: 0,
      Percentage: 0,
      PercentageLabel: 0,
      Budget: 0,
    },
    {
      category: "Eating",
      Total: 0,
      Percentage: 0,
      PercentageLabel: 0,
      Budget: 0,
    },
    {
      category: "Gift",
      Total: 0,
      Percentage: 0,
      PercentageLabel: 0,
      Budget: 0,
    },
    {
      category: "Money Transferred",
      Total: 0,
      Percentage: 0,
      PercentageLabel: 0,
      Budget: 0,
    },
  ];
  try {
    const { userId, month } = req.params;
    const payment = await Payment.find({ createdBy: userId, month }).select(
      "category amount"
    );
    const budget = await Budget.find({ createdBy: userId, month }).select(
      "category amount"
    );
    for (let i = 0; i < payment.length; i++) {
      if (payment[i].category === "Auto") {
        payments[0].Total += parseInt(payment[i].amount);
      } else if (payment[i].category === "Bank") {
        payments[1].Total += parseInt(payment[i].amount);
      } else if (payment[i].category === "Cash") {
        payments[2].Total += parseInt(payment[i].amount);
      } else if (payment[i].category === "Charity") {
        payments[3].Total += parseInt(payment[i].amount);
      } else if (payment[i].category === "Eating") {
        payments[4].Total += parseInt(payment[i].amount);
      } else if (payment[i].category === "Gift") {
        payments[5].Total += parseInt(payment[i].amount);
      } else if (payment[i].category === "Money Transferred") {
        payments[6].Total += parseInt(payment[i].amount);
      }
    }
    for (let i = 0; i < budget.length; i++) {
      if (budget[i].category === "Auto") {
        payments[0].Percentage += (payments[0].Total / budget[i].amount) * 100;
        payments[0].PercentageLabel += payments[0].Total / budget[i].amount;
        payments[0].Budget = parseInt(budget[i].amount);
      } else if (budget[i].category === "Bank") {
        payments[1].Percentage += (payments[1].Total / budget[i].amount) * 100;
        payments[1].PercentageLabel += payments[1].Total / budget[i].amount;
        payments[1].Budget = parseInt(budget[i].amount);
      } else if (budget[i].category === "Cash") {
        payments[2].Percentage += (payments[2].Total / budget[i].amount) * 100;
        payments[2].PercentageLabel += payments[2].Total / budget[i].amount;
        payments[2].Budget = parseInt(budget[i].amount);
      } else if (budget[i].category === "Charity") {
        payments[3].Budget += parseInt(budget[i].amount);
        payments[3].Percentage += (payments[3].Total / budget[i].amount) * 100;
        payments[3].PercentageLabel += payments[3].Total / budget[i].amount;
      } else if (budget[i].category === "Eating") {
        payments[4].Budget = parseInt(budget[i].amount);
        payments[4].Percentage += (payments[4].Total / budget[i].amount) * 100;
        payments[4].PercentageLabel += payments[4].Total / budget[i].amount;
      } else if (budget[i].category === "Gift") {
        payments[5].Budget = parseInt(budget[i].amount);
        payments[5].Percentage += (payments[5].Total / budget[i].amount) * 100;
        payments[5].PercentageLabel += payments[5].Total / budget[i].amount;
      } else if (budget[i].category === "Money Transferred") {
        payments[6].Budget = parseInt(budget[i].amount);
        payments[6].Percentage += (payments[6].Total / budget[i].amount) * 100;
        payments[6].PercentageLabel += payments[6].Total / budget[i].amount;
      }
    }

    for (let i = 0; i < payments.length; i++) {
      if (payments[i].Budget != 0) {
        payments[i].Total = payments[i].Total.toString();
        payments[i].Budget = payments[i].Budget.toString();
        payments[i].PercentageLabel = parseFloat(payments[i].PercentageLabel).toFixed(2);
        payments[i].Percentage = payments[i].Percentage.toFixed(0).toString();
        response.payment.push(payments[i]);
      }
    }
    console.log(response.payment);
    response.status = true;
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
    response.errMessage = error.message;
    response.message = "Failed to find monthly budget , please try again";
    res.status(400).send(response);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
