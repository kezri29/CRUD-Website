const express = require('express');
const router  = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

//image upload
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,"./uploads");
    },
    filename : function(req,file,cb){
        cb(null,file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage
}).single('file');

//insert the data from form to database route - add user page route (post)
router.post("/add", upload, async (req,res)=>{
    try{
        const user = new User({     //insertion of data from form to db
            name: req.body.name,
            email: req.body.email,
            phone:req.body.phone,
            image : req.file.filename,
        });
        await user.save(); //user.save is a mongoose library where above data are saved to db
        req.session.message = {
            type : 'success',
            message : 'User data added successfully!'
        };
        res.redirect('/');

    }catch(err){
        res.json({message: err.message,type : 'danger'});
    }
});


//get all the data from db
router.get('/', (req, res) => {
    User.find().exec()
        .then(users => {
            res.render('index', {
                title: 'Home Page',
                users: users
            });
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});

//add user page route(get)
router.get('/add',(req,res)=>{
    res.render('add_user',{
        title : "Add User Page"
    })
})
//about user page route(get)
router.get('/about',(req,res)=>{
    res.render('about',{
        title : "About Page"
    })
})
//contact user page route(get)
router.get('/contact',(req,res)=>{
    res.render('contact',{
        title : "Conatact Page"
    })
})

//edit user route
router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let user = await User.findById(id);

        if (!user) {
            res.redirect('/');
        } else {
            res.render('edit_user', {
                title: "Edit User",
                user: user
            });
        }
    } catch (err) {
        res.redirect('/');
    }
});

//update user route (for image)
router.post('/update/:id', upload, async (req,res)=>{
    let id = req.params.id;
    let new_image = "";
    if(req.file){
        new_image = req.file.filename;
        try{
            fs.unlinkSync('./uploads/' + req.body.old_image);
        }catch(err){
            console.log(err);
        }
    }else{
        new_image = req.body.old_image;
    }
    try {
        let result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image
        });
        if (!result) {
            res.json({ message: 'User not found', type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'User data updated successfully!'
            };
            res.redirect('/');
        }
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
})

//delete a user record route
router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;

        // Find the user to get the image filename
        let user = await User.findById(id);

        if (!user) {
            res.json({ message: 'User not found', type: 'danger' });
            return;
        }

        // Delete the image file if it exists
        if (user.image) {
            try {
                fs.unlinkSync('./uploads/' + user.image);
            } catch (err) {
                console.log(err);
            }
        }

        // Delete the user from the database
        let result = await User.findByIdAndDelete(id);

        if (!result) {
            res.json({ message: 'User not found', type: 'danger' });
        } else {
            req.session.message = {
                type: 'info',
                message: 'User data deleted successfully!'
            };
            res.redirect('/');
        }
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});
module.exports = router;