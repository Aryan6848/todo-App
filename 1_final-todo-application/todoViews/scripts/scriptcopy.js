



document.addEventListener('DOMContentLoaded', () => {


  const todoListNode = document.getElementById('todo-list');
  const userInputNode = document.getElementById('userInput');
  const addBtn = document.getElementById('add-btn');







  function createTodoElement(todo){
  
  const todoItem=document.createElement('div');//mtlb ek div create kiya ar uska naam de diya todoItem ar id de di todo-Item
  //corresponding HTML for this would be <div id='todo-list'></div>
  todoItem.id=`todo-item-${todo.id}`;
  todoItem.style.display = 'flex';
  todoItem.style.alignItems = 'center';
  todoItem.style.padding = '10px';
  todoItem.style.borderBottom ='1px solid #ddd';
  todoItem.style.marginBottom = '10px';
  
  const checkbox=document.createElement('input');//mtlb ek input field create krega jisko hm naam de diye checkbox , ar ye jo input field h uska type de diye checkbox. 
  //corresponding HTML for this would be <input type=checkbox class=checkbox>  ar is poore ko naam de diya check
  checkbox.id='check-box';
  checkbox.type='checkbox';
  checkbox.classList.add('checkbox');
  checkbox.checked = todo.completed;


  const todoContent =document.createElement('div');
  todoContent.id='todo-content';
  todoContent.innerText= todo.todoText;
  if(checkbox.checked === true){
    todoContent.style.textDecoration ='line-through';
  }

  const editBtn = document.createElement('button');
  editBtn.id = 'edit-btn';
  editBtn.innerText = 'Edit';

  const deleteBtn = document.createElement('button');
  deleteBtn.id = 'delete-btn';
  deleteBtn.innerText  ='Delete';

  todoItem.appendChild(checkbox);
  todoItem.appendChild(todoContent);
  todoItem.appendChild(editBtn);
  todoItem.appendChild(deleteBtn);

  return todoItem;

}



function showTodoInUI(todo){
  //jo bhi todo add krna h uske liye ye function todolega argument m ar phir uska text pass kr dega createTodoElement m ar createTodoElement return krega ek todo item jisme ki ek checkbox hoga ar todoText hoga ar editbtn and delete btn hoga .Ar is todoItem ko hm le lenge recievedTodoItem m ar isko html m jo todo-list h usme append kr denge .
  const todoItem = createTodoElement(todo);
  todoListNode.appendChild(todoItem);

  if(todo.completed){
    todoItem.classList.add('completed');
  }

}


addBtn.addEventListener('click', () =>{
  const todoText = userInputNode.value;

  if(!todoText){
    alert('Please enter a todo');
    return;
  }

  const todo = {
    todoText:todoText,
    completed:false
  };
  
//todo enter krke add button pr click kiye ar todo bhej diye server fetch call krke to string k form m jaega ye.
//ar phir server m ye todo hamari text file m write hoga ar phir successfully write ho chuka hoga to wha se response ayega agar response status shi h to ye jo todo banaya h sirf wo jake append hojaega hamare todoList mar ye sb ho rha h showTodoInUI
//showTodoInUI yha pr bs 1 bar chalega jo todo m hoga wo append ho jaega.
  fetch('/', {
   method: 'POST',
   headers:{
    'Content-Type': 'application/json',
   },
   body:JSON.stringify(todo)
  }).then(function(response){
    if(response.status === 200){
        return response.json(); //parse the response to get the todo object with generated ID
    }else{
        alert('something went wrong');
    }
  }).then(function(todoWithId){
    //todoWithId is the todo object with generated ID from the server
    console.log(todoWithId);
    showTodoInUI(todoWithId);
    userInputNode.value = ''; //jo input h usko empty kr de rhe add pe click hone k baad
  }).catch((error)=>{
    console.error('Error:',error);
  });
});


//on refresh data yha aaega client pe
//page refresh hoga to server se response ayega wo yha handle hoga server response bhej rha yha pr ar wha server /todo-data wla hi response bhej rha to wo response yhi ayega ar wo response m database ka pura data h to ye usko frontend m show kr dega

fetch('/todo-data').then(function(response){
  if(response.status === 200){
     return response.json();
  }else{
    console.log("jsijsfsggds");
    alert("something weird happened")
  }
}).then(function(todos){
  todos.forEach(function(todo){
    showTodoInUI(todo);
    userInputNode.value = ''
  });

}).catch((error)=>{
  console.error('Error:', error);
});

todoListNode.addEventListener('click',(event)=>{
  if(event.target.id  === 'delete-btn'){
    const todoItem = event.target.parentNode;
    const todoText =todoItem.querySelector('#todo-content').innerText;
    
    const todoId = todoItem.id.split('-')[2];
    const todo ={
      id: parseInt(todoId),
      todoText: todoText,
      completed: todoItem.classList.contains('completed')
    };

    fetch('/delete',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
      },
      body:JSON.stringify(todo),
    }).then(function(response){
      if(response.status === 200){
        todoItem.remove();
      }else{
        console.log("delete nhi hua");
        alert('Something went wrong');
      }
    });
  }
});


function handleEditButtonClick(event){
    const todoItem = event.target.parentNode;
    const todoContentNode = todoItem.querySelector('#todo-content');
    const checkbox=todoItem.querySelector('#check-box');

    const newTodoText = prompt("Enter the updated todo text:", todoContentNode.innerText);

    if(newTodoText !== null){
      const todoText = newTodoText.trim();
      if(todoText !== ''){
        const todoId= todoItem.id.split('-')[2];//Get the todo ID from the element's ID
        const todo={
          id:parseInt(todoId),
          todoText:todoText,
          // completed: todoItem.classList.contains('completed'),
//upar wali line uncomment kr do ar neeche wala line comment kr do phir save krke run kroge to ye cheej notice kro ki jb koi todo checked h ar uska naam edit kr do to yha fronted m to abhi checked hi dikhaega pr backend m completed true se false ho chuka hoga ar jaise hi refresh kroge to checked unchecked ho jaega 
//jo ki achi baat nhi h kyuki user ko lga ki ye to checked hi h phir check krne ki kya jaroorat ar baad m page refresh hua to wo uncheck ho jaega to bad expreience hoga
//to isko fix krne k liye ye kiy ki frontend m hi check kr lo phle se checked h ki unchecked jo ho wo pss kr do backend ko 
          completed:checkbox.checked,
        };


        fetch('/update',{
          method: 'POST',
          headers:{
            'Content-Type': 'application/json',
          },
          body:JSON.stringify(todo),
        })
        .then(function(response){
          if(response.status === 200){
            todoContentNode.innerText = todoText;
          }else{
            alert('Something went wrong');
          }
        })
        .catch((error)=>{
          console.error('Error:', error);
        });
      }
    }
}

todoListNode.addEventListener('click',(event)=>{
  if(event.target.id === 'edit-btn'){
    handleEditButtonClick(event);
  }
});


//checkbox

todoListNode.addEventListener('click', (event)=>{
      if(event.target.id === 'check-box'){
        const todoItem =event.target.parentNode;
        const todoText =todoItem.querySelector('#todo-content').innerText;
        const todoContentNode= todoItem.querySelector('#todo-content');

        //jaise hi checkbox cli ho to ui pe turant line-through effect dikhane k liye ar jaise hi checkbox uncheck ho usko normal text krne k liye 
        if(event.target.checked){
          todoContentNode.style.textDecoration= 'line-through';
        }else{
          todoContentNode.style.textDecoration ='none';
        }


        const todoId = todoItem.id.split('-')[2];

        const todo ={
            id: parseInt(todoId),
            todoText: todoText,
            completed: true,
        };


        fetch('/checkbox',{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
          },
          body: JSON.stringify(todo),
        })
        .then(function(response){
          if(response.status === 200){
            console.log("check handled successfully")
          }else{
            alert('Something went wrong');
          }
        })
        .catch((error)=>{
          console.error('Error:',error);
        });
      }
});

});