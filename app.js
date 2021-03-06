// require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


app.use(session({
  secret: "This is my secret which i won't tell you",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
  res.render("home");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/login", function(req,res){
  res.render("login");
});


app.post("/register", function(req,res){
User.register({username: req.body.username}, req.body.password, function(err, user){
  if(err){
    console.log("There is an error in adding the new user");
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req,res, function(){
      res.redirect("/secrets");
    });
  }
});


});

app.get("/secrets", function(req,res){
  if(req.isAuthenticated){
    res.render("secrets");
  }else{
    res.redirect("/Login");
  }
});

app.post("/login", function(req,res){
const user = new User({
  username:req.body.username,
  password:req.body.password
});

req.login(user, function(err){
  if(err){
    console.log(err);
  }else{
    passport.authenticate("local")(req,res, function(){
      res.redirect("/secrets");
    });
  }
});

});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
});


app.listen(3000, function(){
  console.log("Server started running on port 3000.");
});
