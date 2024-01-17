const { log, error } = require("console");
const express =require("express");
const app =express();
const path = require('path');
const fs =require('fs'); 
const session =require('express-session');
const multer=require('multer');
const db =require('./models/db');
const UserModel = require('./models/User');
const TodoModel= require('./models/Todo')


const upload=multer({dest:'uploads/'})//multer ko bta rhe data kha store krna h 

app.set("view engine","ejs"); //jo templating engine use krenge usko aise mention kr do 
//ar hr template engine ki apni file hoti h ejs ke liye views naam ka folder hota h usi m likhte h hm template wali file .
//NOTE:-folder by default view se hi banana h , pr agar chahte ho views naam nhi rkhna kuch ar naam rkhna h to ye kr do
//app.set("views", __dirname+"/todoViews");


app.use(session({
    secret:'meinkyubatau',
    resave:false,
    saveUninitialized:true,
})
);

app.use(express.static("uploads"));

app.use(express.json())
//ye middle ware global banya h to hr request k phle chalega .
// to kisi request k andar json body aa rha h to usko req se nikal k req k andar body naam se add krdega taki us req ko req.body krke access kr ske 

app.use(express.urlencoded({extended:true}));

//single method agar 1 hi photo le rhe to 
//ar agar multiple photos chahiye to upload.array() use krna 
//ar method k andar jo form se name field jo h inputfile ka wo dena h  
app.use(upload.single("pic"));

//doubt: we have to create this public folder and when i am not adding my style and script.js in public there functionality is not working in index.js 

// app.use(express.static(path.join(__dirname, 'public')));
//either put style.css and  script.js in public folder or do this app.get() request for both of this folder like this 
// app.get("/script.js",function(req,res){
//     res.sendFile(__dirname+"/todoViews/scripts/script.js")
// })

// app.get("/style.css",function(req,res){
//     res.sendFile(__dirname + "/todoViews/styles/style.css")
// })

//we have about two parsers one is json parser and other is for form parser but none of this parse can parse the file ,since we are uploading the image and for image we will
//need file parser so we will need multer.

// app.use(express.static("todoViews"))//jaise hmne kyi files ka req aya h to usko khud se handle kiya h like script.js and style.css. to jo files static h unko hm ek folder m rkhte h ar us folder ka naam isme pass kr dete h ar jb bhi req ata h h to check hota h ki file is folder m h agar h to express.static khud hi handle kr lega ,hme endpoint handle krne ki jarrorat nhi padegi to hm script.js ar styles.css ka endpoint delete kr de rhe jo hmne banaya h ar todoviews folder isme pass kr de rhe  



app.get("/", function(req,res){
    if(!req.session.isLoggedIn){
        res.redirect('/login');
        return;
    }
    // res.sendFile(__dirname+"/todoViews/index.html");
    res.render("index",{username:req.session.username,profilePic:req.session.profilePic,});
});



app.post("/",function(req,res){  
    //method post hoga bec res bhejna h
    // jo todo object aa rha h frontend(script.js) se wo req m ayega 
    //ar request m data chunks m ata h ar usko extract krna pdta ar usko krne ke liye hamare pass middleware h app.use(express.json())
    //  console.log(req.body);
    
    const todoText = req.body.todoText;
    
    const todo={
        todoText:todoText,
        completed:false
    }
    todo.userId=req.session.username;

    //database k liye file use krenge 
    
    //get data from request => ye to res m hii aa gya 
    //sava data in file
    //send respone 

    //const requestData=req.body;
    // fs.appendFile('data.txt',requestData + '\n',(err)=>{
    //     if(err){
    //         console.error('Error appending data to file',err);
    //         res.status(500).json({message:'Error appending data to file'});  
    //     }else{
    //         console.log('Data append to file successfully');
    //         res.status(200).json({message:'Data appended to file successfully'});
    //     }
    // });


    // fs.readFile('./todoData.txt', "utf-8", function(err,data){
    //     if(err){
    //         res.status(500).json({
    //             message:"Internal server error",
    //         });
    //         return;
    //     }

    //     if(data.length === 0){
    //         data="[]";
    //     }
    //     //maan lo file empty na ho usme kuch phle se ho ar array ki jagah kuch agdam bagdam ho to json.parse kam nhi krega to isliye ye cheej try m daalenge
    //     try {
    //         data=JSON.parse(data);
    //         data.push(req.body);

    //         fs.writeFile("./todoData.txt",JSON.stringify(data), function(err,res){
    //             if(err){
    //                 res.status(500).json({
    //                     message: "Internal server error",
    //                 });
    //                 return ;
    //             }

    //             res.status(200).json({
    //                 message:"Todo Saved successfully",
    //             });
    //         })
    //     }
    //     catch(err){
    //         res.status(500).json({
    //             meassge:"Internal server error",
    //         });
    //         return; 
    //     }
    // })
    const userId= req.session.username;

        saveTodoInFile(userId,todo,function(err,savedTodo){
            console.log("save krne ke liye");
            if(err){
                console.error('Error',err);
                res.status(500).send("error");
                return;
            }

            res.status(200).json(savedTodo);
        });

  

});


//jb bhi page refresh hoga ye load hoga route chalega hamare data base m jo bhi data h ye behj dega frontend pe
app.get('/todo-data', function(req,res){

    console.log("refresh hua pura deta client ko bhej rha hu... ");
    
    if(!req.session.isLoggedIn){
        res.status(401).send("error");
        return ;
    }

    const userId= req.session.username;
    readAllTodos( userId, function (err,data){
      if(err){
        console.error('Error',err);
        res.status(500).send("error");
        return;
      }

      res.status(200).json(data);//json function object ko string m convert krke send kr dega 
         
});
});






app.get("/scriptcopy.js",function(req,res){
    res.sendFile(__dirname+"/todoViews/scripts/scriptcopy.js")
})

app.get("/style.css",function(req,res){
    res.sendFile(__dirname + "/todoViews/styles/style.css")
})

app.get("/about",function(req,res){
    // res.sendFile(__dirname+"/todoViews/about");
    res.render("about",{username:req.session.username,profilePic:req.session.profilePic})
})

app.get("/contact",function(req,res){
    // res.sendFile(__dirname+"/todoViews/about");
    res.render("contact",{username:req.session.username,profilePic:req.session.profilePic})
})


app.post('/delete',function(req,res){
    const todoText = req.body.todoText;

    const todoId = req.body.id;
    
    const userId= req.session.username;

    readAllTodos(userId,function(err,data){
        if(err){
            console.error("Error:",err);
            res.status(500).send('Error');
            return ;
        }

        //Find the index of the todo item with the specified todoid
        const index= data.findIndex((todo)=>todo.id === todoId); //ye data array me se ek ek item aata jaega todo m ar todo object h to todo.id ko todoId se check kr rhe jo index match ho jaega wo return kr dega  
        if(index !== -1){
            // data.splice(index,1)//Remove the todo item from the array
            // fs.writeFile('./todoData.txt',JSON.stringify(data),function(err){
            //     if(err){
            //         res.status(500).send('Error');
            //         return;
            //     }
            //     res.status(200).send('Deleted successfully');
            // }) ;
            
            
            TodoModel.deleteOne({id:todoId}).then( (deleteddocument)=>{
               
                // callback(null,todos);
                res.status(200).send("deleted sucessfully");
                
            })
            .catch(err =>{
                console.error(err);
            })

        }else{
            res.status(404).send('Todo not found');
        }
    });
});

app.post('/update',function(req,res){
    //const todoText = req.body.todoText;

    const todoId = req.body.id;
    const userId= req.session.username;
    readAllTodos(userId,function(err,data){
        if(err){
            console.error("Error:",err);
            res.status(500).send('Error');
            return ;
        }

        //Find the index of the todo item with the specified todoid
        const index= data.findIndex((todo)=>todo.id === todoId); //ye data array me se ek ek item aata jaega todo m ar todo object h to todo.id ko todoId se check kr rhe jo index match ho jaega wo return kr dega  
        if(index !== -1){
            
            //update the todo item with new todoText and completed status
            data[index].todoText = req.body.todoText;
            data[index].completed = req.body.completed;

            // fs.writeFile('./todoData.txt',JSON.stringify(data),function(err){
            //     if(err){
            //         res.status(500).send('Error');
            //         return;
            //     }
            //     res.status(200).send('Deleted successfully');
            // }) ;

            TodoModel.create(data).then( (todos)=>{
                // console.log(todos);
                // callback(null,todos);
                res.status(200).send("updated sucessfully");
                
            })
    
            .catch(err =>{
                console.error(err);
            })
        }else{
            res.status(404).send('Todo not found');
        }
    });
});


//checkbox
app.post('/checkbox',function(req,res){
    //const todoText = req.body.todoText;

    const todoId = req.body.id;
    const userId= req.session.username;
    readAllTodos(userId,function(err,data){
        if(err){
            console.error("Error:",err);
            res.status(500).send('Error');
            return ;
        }

        //Find the index of the todo item with the specified todoid
        const index= data.findIndex((todo)=>todo.id === todoId); //ye data array me se ek ek item aata jaega todo m ar todo object h to todo.id ko todoId se check kr rhe jo index match ho jaega wo return kr dega  
        if(index !== -1){
            //update the todo item with the new todoText and completed status 
            //data[index].todoText =req.body.todoText;
            
            if(data[index].completed === false)
            data[index].completed =req.body.completed;

            else{
                data[index].completed =false;
            }

            // fs.writeFile('./todoData.txt',JSON.stringify(data),function(err){
            //     if(err){
            //         res.status(500).send('Error');
            //         return;
            //     }
            //     res.status(200).send('Deleted successfully');
            // }) ;
           
            console.log("Printing data in checkbox", data);
            TodoModel.create(data).then( (todos)=>{
                // console.log(todos);
                // callback(null,todos);
                res.status(200).send("updated sucessfully");
                
            })


        }else{
            res.status(404).send('Todo not found');
        }
    });
});

app.get("/login",function(req,res){
    // res.sendFile(__dirname +"/todoViews/login.html")
    //ab ejs se bne page ko hm res.render krenge ar res.render se express smhj jati h ki hm koi templating engine use krenge
     res.render("login",{error:null});//isme bs us ejs file ka naam de dena h
    //yha error:null isliye dena pd rha kyuki login.ejs m to variable banaya h error naam ka to jb ye chalega to usko kuch milega nhiyha se us variable k liye to usko not defined error show krega  
})

app.post("/login",function(req,res){
    const username =req.body.username;
    const password = req.body.password;
     
    // readAllUsers(function(err,data){
    //     if(err){
    //         console.log("Error",err);
    //         res.status(500).send("error");
    //         return ;
    //     }

    //     const index = data.findIndex((users)=>((users.username === username) && (users.password === password)));

    //     if(index !==-1){
    //         req.session.isLoggedIn = true;
    //         req.session.username= username; //age jarrot padegi is jis cheej ki wo sb rkh lo ,jaise header k andar user ka naam dikhana h 
    //         req.session.profilePic =data[index].profilePic;
    //         //session k andar login k time pe hmne username ar profile pic save kra liya h ab inko aage use kr skte h yani ye cheeje apne webpage pr use kr skte h like username display kr skte h ar profile pic show kr skte h , to ye dono cheej pass kr denge index.ejs render krte time ar ye dono cheej store ho jaegi kisi variable m index file m  

    //         res.redirect('/');//jb server redirect krta h to response jo jaega uska status code hoga 301 ar uske sath ek url bhi bhejega, to 301 ko dekh k smhj jata h redirect krne k liye bola ja rha h , to jb browser dekhega redirect krna h to automatically ek nyi request server pr jaegi with new url to server us url ko handle kr lega.
    //         // to redirect k case m 2 request jati h  
    //         return;
    //       }
    
    //     //   res.status(401).send("Invalid userCredentials");
    //     //ab login m galat data hoga to wapas se yhi page khul jaega error doosre page pe nhi ayega jo upar wali line k wajah se ho rha tha 
    //     //ar ye bhi chahte h ki error message usi page m aa jae 
    //     // to iska tareeka ye h ki jb render kr rhe ho usi time data pass kr skte h object m .
    //     res.render("login",{error:"Invalid username or password"});
    //     //ye jo data h wo login.ejs m jaega ar ejs file m javascript jaise code likh skte h 
        
        
    // });
    
    //we will use database for this 

    //using databse for this 
    //if using findone then result will be null or the user object
    //if using find then result will be an array of user objects 
    //there are manny methods explore it .
    UserModel.findOne({username: username, password: password})
    .then(function(user){
        if(user){
            req.session.isLoggedIn = true;
            req.session.username =username;
            req.session.profilePic = user.profilePic;
            res.redirect("/");
            return ;
        }

        res.render("login",{error:"Invalid usename or password"});
    })
    .catch(function(err){
        res.render("login",{error:"something went wrong"}); // ye tb chalega jb querry wagera ya db wagera m koi fault hoga tb
    })
     //findone mtlb ek document leke ayega k=jika username and password ye hoga 

    
});

app.get("/signup", function(req,res){
    // res.sendFile(__dirname + "/todoViews/signup.html");
    res.render("signup",{error:null});
});


app.post('/signup', (req,res)=>{
    
    const data = {
      username:req.body.username,
      password:req.body.password,
    //   profilePic:req.body.pic,
      profilePic:req.file.filename,//because hamara file m store h ab image 
    //   req.file jb single photo h ar agar multiple h to files
    }

    if(data.password !== req.body.confirmPassword)
   {
    //  res.status(500).send("password and confirm passwords are not matching")
      res.render("signup",{error:"Password and confirm password is not matching"}); //render isliye kr rhe ki error aaye to bhi signup page wale pe hi rhe ar error pass kr de rhe us variable k liye 
    return ; //return nhi karogi to pasword ar confirm password match nhi krenge tb bhi database m save ho jaenge
   }

//   saveUsersInFile(data, function(err, savedUsers){
//       if(err){
//         console.error("Error", err);
//         res.status(500).send("error");
//         return ;
//       }

//       // res.status(200).send("user saved successfully");
//       res.redirect('/login');
//       // res.redirect('/');
//     })

    // using database for this;
    
    UserModel.create(data).then(function(){
       res.redirect('/login');
    })
    .catch(function(err){
        res.render("signup",{error:err});
    });


  })




//phle db connect hoga uske baad server start hoga 
//agar database k wajah se kuch error aya hoga to server start nhi hoga
db.init().then(function(){
    console.log("db connected");
    app.listen(3000, function(){
        console.log("server on port 3000");
    })
}).catch(function(err){
    console.log(err);
});



function readAllTodos(userId, callback){
    // fs.readFile('./todoData.txt', 'utf-8', function(err,data){
    //     if(err){
    //         callback(err);
    //         return;
    //     }

    //     if(data.length === 0){
    //         data="[]"
    //     }

    //     try{
    //         data=JSON.parse(data);
    //         callback(null,data);
    //     }catch(err){
    //         callback(err);
    //     }
    // });

     try{
        TodoModel.find({ userId }).then(data=>{
           console.log("Reading",data);
            callback(null,data);
        });
        
     }
     catch(err){
        callback(err);
     }
}


function saveTodoInFile(userId,todo,callback){
    readAllTodos(userId,function(err,data){
        if(err){
            callback(err);
            return;
        }


//find the maximum Id from existing todos and add 1 to generate a new unique ID
  
const maxId =data.reduce((max, todo)=>Math.max(max,todo.id),0);
todo.id =maxId + 1;
        

        // fs.writeFile('./todoData.txt',JSON.stringify(data),function(err){
        //     if(err){
        //         callback(err);
        //         return;
        //     }

        //     callback(null,todo);
        // });

      
        // data.push(todo);

        TodoModel.create(todo).then( (todos)=>{
            console.log(todos);
            callback(null,todos);
            
        })

        .catch(err =>{
            console.error(err);
        })
    });
}

function readAllUsers(callback){
    fs.readFile('./userData.txt','utf-8',function(err,data){
        console.log(data);
        
        if(err){
         callback(err);
         return;
        }

        if(data.length === 0){
           data= '[]'
        }

        try{
            data = JSON.parse(data);
            callback(null,data);
        }catch(err){
         callback(err);
        }
    });
}


function saveUsersInFile(user, callback){
 readAllUsers(function(err,data){
   if(err){
     callback(err);
     return ;
   }

   const maxId= data.reduce((max,user) => Math.max(max,user.id),0);

   user.id =maxId+1;

   data.push(user);

   fs.writeFile('./userData.txt',JSON.stringify(data),function(err){
       if(err){
         callback(err);
         return ;
       }

       callback(null,user);
   });
 });
}