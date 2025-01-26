import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import cors from 'cors'
import User, { IUser } from "./models/users.model";
import { loginResponse } from "./utils/login-response";
import Dashboard, { IDashboard } from "./models/dashboard.model";
import Order, { IOrder } from "./models/order.model";
import Wallet, { IWallet } from "./models/wallets.model";
import { waitForDebugger } from "inspector";

const app: Application = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());



app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, '../public')));

const requireLogin = (req: Request, res: Response, next: NextFunction) => {
  const authCookie = req.cookies.auth;
  if (authCookie) {
    // User is logged in
    next();
  } else {
    res.redirect("/login"); // Redirect to the login page
  }
};

app.get("/", (req: Request, res: Response) => {
  res.render("index.ejs");
});

app.get("/signup", (req: Request, res: Response) => {
  const message = ""
  res.render("signup.ejs", { message });
})

app.get("/login", (req: Request, res: Response) => {
  const message = ""
  res.render("login.ejs", { message });
})

app.get("/faqs", (req: Request, res: Response) => {
  res.render("faqs.ejs")
})

app.get("/about-us", (req: Request, res: Response) => {
  res.render("about-us.ejs")
})

app.get("/contact", (req: Request, res: Response) => {
  res.render("contact.ejs")
})


app.get("/fund/step1", (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  res.render("step1.ejs", {userId})
})

app.get("/create-wallet", (req: Request, res: Response) => {
  res.render("create-wallet.ejs")
})

app.get("/withdraw", async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const user = await User.findOne({ _id: userId });
  res.render("withdraw.ejs", { user })
})

app.get("/profile", async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const user = await User.findOne({ _id: userId });
  res.render("profile", { user })
})

app.get("/traders", (req: Request, res: Response) => {
  res.render("traders.ejs")
})

app.get("/users", async (req: Request, res: Response) => {
  const users = await User.find();
  res.render("users.ejs", {users})
})

app.get('/users/:id/edit', async (req, res) => {
  const userId = req.params.id;
  const userFunds = await Dashboard.findOne({userId})
  const orders = await Order.find({userId})
  // Fetch the user by ID and render an edit page
  res.render('edit-user', { user: userFunds, orders });
});

app.post('/edit-user', async (req, res) => {
  try {
    const { userId, deposit, profit, netProfit, todaysProfit } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).send('User ID is required');
    }

    // Update the fields in the database
    await Dashboard.updateOne(
      {  userId },
      {
        $set: {
          deposit: deposit ? parseFloat(deposit) : undefined,
          profit: profit ? parseFloat(profit) : undefined,
          netProfit: netProfit ? parseFloat(netProfit) : undefined,
          todaysProfit: todaysProfit ? parseFloat(todaysProfit) : undefined,
        },
      }
    );

    // Redirect or send a success response
    res.redirect('/users'); // Assuming there's a dashboard page
  } catch (error) {
    console.error('Error updating dashboard:', error);
    res.status(500).send('An error occurred while updating the dashboard.');
  }
});
app.get("/fund/pay-crypto", async (req: Request, res: Response) => {
  const orderId = req.query.orderId as string;
  const order = await Order.findOne({ _id: orderId })

  const wallet = await Wallet.findOne({ name: order?.standardToken })

  res.render("pay-crypto", { order, wallet })
})

app.get("/pricing", (req: Request, res: Response) => {
  res.render("pricing.ejs")
})

app.get("/tc", (req: Request, res: Response) => {
  res.render("tc.ejs")
})

app.get("/privacy-policy", (req: Request, res: Response) => {
  res.render("privacy-policy.ejs")
})

app.get("/cookie-policy", (req: Request, res: Response) => {
  res.render("cookie-policy.ejs")
})

app.get("/dashboard", requireLogin, async (req: Request, res: Response) => {
  const authCookie = req.cookies.auth;
  const userId = req.query.userId as string;
  if (!authCookie) {
    return res.redirect("/login"); // Redirect to the login page if the user data cookie is not found
  }
  const user = await User.findOne({ _id: userId });
  const trx = await Dashboard.findOne({ userId })
  if (!user) {
    return res.redirect("/login"); // Redirect to the login page if the user is not found
  }
  res.render("dashboard", { user, trx }); // Pass the user object to the dashboard template

});

//POST FUNCTIONS
app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, firstname, lastname, currency, password, country, phone, city, cpassword, tc } = req.body;
    const exist = await User.findOne({ email })
    if (exist) {
      const message = "emailExist"
      return res.render("signup", { message })
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const data: Partial<IUser> = {
      email,
      firstname,
      lastname,
      currency,
      country,
      phone,
      city,
      password: hashedPassword,
      unhashedPassword: password
    };
    if (password !== cpassword) {
      const message = "PasswordsDoNotMatch";
      return res.render("signup", { message });
    }
    if (!tc) {
      const message = "noTC";
      return res.render("signup", { message });
    }
    const user = await User.create(data);

    const data2: Partial<IDashboard> = {
      userId: user?._id
    }
    await Dashboard.create(data2);

    const message = "signup"
    res.render("login.ejs", { message })
  } catch (error) {

  }

})

app.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      const message = "invalid";
      return res.render("login", { message });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const message = "invalid";
      return res.render("login", { message });
    }

    // Get the user and accessToken from loginResponse
    const { user: usercreds, accessToken } = await loginResponse(user._id.toString());

    // Set the access token in a cookie
    res.cookie('auth', accessToken, { httpOnly: true });
    // const trx = await Dashboard.findOne({ userId: user?._id })
    // Redirect to the dashboard
    res.redirect(`/dashboard?userId=${user._id}`);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('An error occurred while logging in');
  }
});

app.post("/step1", async (req: Request, res: Response) => {
  try {
    const { amount, type, standardToken, userId } = req.body;
    const data: Partial<IOrder> = {
      amount,
      type,
      standardToken,
      status: "pending",
      userId,
     createdAt: new Date()
    }
    const order = await Order.create(data)

    res.redirect(`/fund/pay-crypto?orderId=${order._id}`);

  } catch (error) {
    // console.error('Login error:', error);
    res.status(500).send('An error occurred while logging in');
  }
});

app.post("/create-wallet", async (req: Request, res: Response) => {
  try {
    const { name, address, barcode } = req.body;
    const data: Partial<IWallet> = {
      name,
      address,
      barcode
    }
    const wallet = await Wallet.create(data)

    res.redirect(`/fund/pay-crypto?orderId=${wallet._id}`);

  } catch (error) {
    // console.error('Login error:', error);
    res.status(500).send('An error occurred while logging in');
  }
});
export default app;