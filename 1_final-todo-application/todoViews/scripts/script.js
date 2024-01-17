const submitTodoNode=document.getElementById("add-btn");
const userInputNode=document.getElementById("userInput");
const todoListNode= document.getElementById("todo-content");
//listen to click of submit button 
submitTodoNode.addEventListener('click', function(){
  //1)get text from the input
  //send text to server using api(fetch or xmlhttprequest )
  //get response from server
  //if request is successfull then display text in the  list
  // else display error message
  
  //  1)
  const todoText=userInputNode.value;
  // console.log(todoText);

  // 2)
  if(!todoText){
    alert("Please Enter todo");
    return;
  }

  const todo={
    todoText: todoText
  }

  //fetch is promise based server pe request jaega server se response ayega to .then chalega
  fetch("/",{
    method:"Post",
    headers:{
      "Content-Type": "application/json",
    },//header help krta h middleware ko easily phechane m ki ye jo request ayi h wo req kaisi h , json file h ya kuch ar h 
    body:JSON.stringify(todo)

  }).then(function(response){
        if(response.status === 200){
          //display todo in UI

          showTodoInUI(todo);

        }
        else{
          alert('something weird happened');
        }
  });

});

function showTodoInUI(todo){
  const todoTextNode=document.createElement("nikhil");
  todoTextNode.innerText=todo.todoText;
  
  todoListNode.appendChild(todoTextNode);

}


fetch('/todo-data').then(function(response){
  if(response.status===200){
      return  response.json();
  }
  else{
    console.log("jsifja");
    alert("something weird happened")
  }
}).then(function(todos){
  todos.forEach(function(todo){
    showTodoInUI(todo);
  });
  
});
















const todoItems = document.querySelectorAll('.todo-item');

function toggleTodoCompleted(event) {
  const todoItem = event.target.parentNode;
  todoItem.classList.toggle('completed');
}

for (const todoItem of todoItems) {
  const checkbox = todoItem.querySelector('.checkbox');
  checkbox.addEventListener('click', toggleTodoCompleted);
}


// Your existing JavaScript code here

function editTodo(event) {
  const todoItem = event.target.parentNode;
  const todoContent = todoItem.querySelector('.todo-content');
  const editTemplate = document.querySelector('.edit-todo-template');
  const editInput = editTemplate.querySelector('.edit-todo-input');

  editInput.value = todoContent.textContent;
  editTemplate.style.display = 'flex';

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveTodoChanges(todoItem, editInput.value);
    }
  });

  const saveButton = editTemplate.querySelector('.save-btn');
  saveButton.addEventListener('click', () => {
    saveTodoChanges(todoItem, editInput.value);
  });
}

function saveTodoChanges(todoItem, newTodoContent) {
  const todoContent = todoItem.querySelector('.todo-content');
  todoContent.textContent = newTodoContent;
  const editTemplate = document.querySelector('.edit-todo-template');
  editTemplate.style.display = 'none';
}

const editButtons = document.querySelectorAll('.edit-btn');
for (const editButton of editButtons) {
  editButton.addEventListener('click', editTodo);
}




