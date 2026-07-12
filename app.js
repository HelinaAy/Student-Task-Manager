const express = require("express");
const app = express();
const PORT = 5000;
const users = [];
const tasks = [];
const session = require("express-session");
const cookieParser = require("cookie-parser");
const isAuthenticated = require("./middleware/auth.js");
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
    session ({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false
}));
app.use(cookieParser());
app.get("/", (req,res) => {
    res.sendFile(__dirname + "/views/index.html");
});
app.get("/register", (req,res) => {
    res.sendFile(__dirname + "/views/register.html");
});
app.post("/register", (req,res) =>{
    const {username, email,password} = req.body;
    const user = {
        id: users.length + 1,
        username,
        email,
        password
    }
    users.push(user);
    console.log(user);
    res.redirect("/login")
});
app.get("/login", (req,res) => {
    res.sendFile(__dirname + "/views/login.html");
});
app.post("/login", (req,res) => {
    const {email, password} = req.body;
    const user = users.find(u => u.email===email && u.password===password);
    if(user){
        res.cookie("username", user.username);
        req.session.user = user;
        return res.redirect("/dashboard");
    }
});
app.get("/dashboard", isAuthenticated, (req,res)=>{
    res.sendFile(__dirname + "/views/dashboard.html");
});
app.get("/logout", (req,res)=>{
    req.session.destroy(()=>{
        res.clearCookie("username");
        res.clearCookie("connect.sid");
        res.redirect("/login");
    })
});
app.get("/tasks/me",isAuthenticated, (req,res)=>{
   res.sendFile(__dirname + "/views/create-task.html");

});
app.post("/tasks/me", isAuthenticated, (req,res)=>{
    const {title} = req.body;
    const task = {
        id: tasks.length +1,
        title,
        userId: req.session.user.id
    }
    tasks.push(task);
    res.redirect("/tasks");
})
app.get("/tasks", isAuthenticated, (req,res)=>{
    const userTasks = tasks.filter(t=> t.userId === req.session.user.id);
    let html = `<h1>Your tasks</h1>`
    html+=`<a href="/tasks/me>Create a task</a>`
    html+= `<ul>
        ${userTasks.map(task=> `<li>task.title</li>`).join("")}
    </ul>`
    res.send(html);
})
app.listen(PORT, ()=> console.log("Server started"));