addBtn.addEventListener("click", addTodoItem, false);

var todoItems = [];

function addTodoItem(e) {
    if (todoitem.value.length < 1) {
        return;
    }
    if (!todoItems.includes(todoitem.value)) {
        var newTodoItem = document.createElement("p");
        newTodoItem.innerText = todoitem.value;

        newTodoItem.addEventListener("click", todoItemDone, false);
        newTodoItem.addEventListener("dblclick", todoItemRemove, false)

        items.appendChild(newTodoItem);
        todoItems.push(todoitem.value);
        todoitem.value = "";

        document.getElementById("total").innerHTML = todoItems.length;
    }
}

function todoItemDone(e) {
    if (e.target.style.textDecoration == "line-through") {
        e.target.style.textDecoration = "";
    } else {
        e.target.style.textDecoration = "line-through";
    }
}

function todoItemRemove(e) {
    if (confirm("Do want to remove the item?")) {
        e.target.remove();
    }
}
