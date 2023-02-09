if (process.env.NODE_ENV !== 'production')
{
    require('dotenv').config();
}
const Comment = require('./models/Comment');
const {geetSchema,userSchema} = require('./schemas.js');
const flash = require('connect-flash');
const express = require('express');
const app = express();
const path = require('path')
const ejsMate = require('ejs-mate');
const session = require('express-session');
const User = require('./models/User.js');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const passportLocal = require('passport-local');
const MongoDbStore = require('connect-mongo');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const {Geet} = require('./models/Geet');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/geet';
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const store = new MongoDbStore({
    mongoUrl: dbUrl,
    secret: 'thisisamazing',
    touchAfter: 24 * 60 * 60
});
const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisisamazing',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(mongoSanitize(
    {
        replaceWith:'_'
    }
));

passport.use(new passportLocal(
    User.authenticate()
));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const multer = require('multer');
const {storage} = require('./cloudinary/couldinary');
const upload = multer({storage});

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));

const validation = (req,res,next)=>
{
    const {error} = geetSchema.validate(req.body);
    if (error)
    {
        const msg = error.details.map((el)=> el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else
    {
        next();
    }
};
const validationUser = (req,res,next)=>
{
    const {error} = userSchema.validate(req.body);
    if (error)
    {
        const msg = error.details.map((el)=> el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else
    {
        next();
    }
};


app.use((req,res,next)=>
{
res.locals.currentUser = req.user;
res.locals.success = req.flash('success');
res.locals.error = req.flash('error');
next();
});

const isLoggedIn = (req,res,next)=>
{
    if (!req.isAuthenticated())
    {
        req.session.toUrl = req.originalUrl;
        req.flash('error','Please login first!');
        res.redirect('/login');
    }
    else
    {
        next();
    }
}
app.get('/',(req,res)=>
{
    res.render('home.ejs');
})
app.post('/geets/:id/comments',catchAsync(async (req,res)=>
{
    const {body} = req.body;
    console.log(body);
    const comment = new Comment(
        {
            body
        }
    );
    comment.author = req.user._id;
    const geet = await Geet.findById(req.params.id);
    geet.comments.push(comment);
    await comment.save();
    await geet.save();
    res.redirect(`/geets/${req.params.id}`);
}));


app.get('/register',(req,res)=>
{
  res.render('register');  
});
app.post('/register',validationUser,catchAsync(async (req,res)=>
{
 const {username,email,password} = req.body;
 const user = new User(
     {
         username,
         email
     }
 );
 const registeredUser = await User.register(user,password);
 req.login(registeredUser,(err)=>
 {
     if (err)
     return console.log(err.stack);
     res.redirect('/geets');

 });

})
);

 
app.delete('/geets/:id/comment/:commentId',catchAsync(async (req,res)=>
{
    const {id,commentId} = req.params;
    console.log(commentId);
    await Geet.findByIdAndUpdate(id,{$pull: {comments: commentId}});
    await Comment.findByIdAndDelete(commentId);
    console.log('deleted');
    req.flash('success','Deleted Successfully!!!');
    res.redirect(`/geets/${id}`);
}))
app.get('/logout',(req,res)=>
{
    req.logout();
    req.flash('success','See you next time!');
    res.redirect('/login');
})
app.get('/login',catchAsync(async (req,res)=>
{
    res.render('login');
}));

app.post('/login',passport.authenticate('local',{failureFlash: true,failureRedirect: '/login'}),(req,res)=>
{
    const redirectUrl = req.session.toUrl || '/geets';
    req.flash('You are successfully logged in !');
    res.redirect(redirectUrl);
})
app.get('/geets',catchAsync(async (req,res)=>
{
    const geets = await Geet.find({});
    console.log(geets);
    res.render('index',{geets});
}));
app.get('/geets/new',isLoggedIn,catchAsync(async(req,res)=>
{
    res.render('new.ejs');
}));
app.get('/geets/:id',catchAsync(async (req,res)=>
{
    console.log('Hitting');
    const id = req.params.id;
    const geet = await Geet.findById(id).populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');

    console.log('found');
    res.render('show.ejs',{geet});

}));
app.post('/geets',validation,upload.array('images'),catchAsync(async(req,res)=>
{
    const geet = req.body.geet;
    console.log(geet);
    const geet1 = new Geet(geet);
    geet1.images = req.files.map((f) => ({url: f.path, filename: f.filename}));
    geet1.author = req.user._id;
    await geet1.save();
    res.redirect('/geets');
}));
app.delete('/geets/:id',catchAsync(async(req,res)=>
{
    await Geet.findByIdAndDelete(req.params.id);
    res.redirect('/geets');
}));
app.get('/geets/:id/edit',catchAsync(async (req,res)=>
{
    const geet = await Geet.findById(req.params.id);
    res.render('edit.ejs',{geet});
}));
app.put('/geets/:id/edit',validation,upload.array('images'),catchAsync(async(req,res)=>
{
    
    const geet = await Geet.findByIdAndUpdate(req.params.id,req.body.geet);
    const imgs = req.files.map((f) => ({url: f.path, filename: f.filename}));
    geet.images.push(...imgs);
    await geet.save();
    res.redirect(`/geets/${req.params.id}`);
}));
app.all('*',(req,res,next)=>
{
    next(new ExpressError('Page not Found',404));
})
app.use((err,req,res,next)=>
{
    if(!err.message) err.message = 'Something Went Wrong!!!'; 
    if(!err.statusCode) err.statusCode = 404;
    res.status(err.statusCode).render('err',{err});
});

const port = process.env.PORT || 3000;
app.listen(port,()=>
{

    console.log('Server started & listening');
})