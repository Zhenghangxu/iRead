// // execute after DOM tree ready and before resource load 
// document.addEventListener("DOMContentLoaded",function () {

// })

// elements
const addBook = document.querySelector("#add-to-list");
const addBook_form = document.querySelector("#add-book");

// Book Class
class Book{
  constructor(title,author,isbn){
      this.title=title;
      this.author=author;
      this.isbn=isbn;
      this.id = Math.floor(Math.random()*100000);   
    }

}

// ui class
class UI{

  static insert_to_list(book){
    const list = document.querySelector("#book-list");
    const html = document.createElement("tr");
    html.dataset.id = book.id.toString(); 
    html.innerHTML = `
    <td class="book-name">${book.title}</td>
    <td>${book.author}</td>
    <td>${book.isbn}</td>
    <td><a class="btn-action delete"><i class="fas fa-times"></i></a></td>    
    `
    list.appendChild(html);
  }
  static clear_fields(){
    const fields = addBook_form.querySelectorAll("input[type=text]");
    fields.forEach(function (field) {
      field.value = "";
    })
  }
  static delete_from_list(book){
    if(book.classList.contains("delete")){
      book.parentElement.parentElement.remove();
    }   
  }
  static showAlert(msg,type){
    const html = document.createElement("div");
    const success_icon = `<i class="far fa-check-circle"></i>`
    const error_icon = `<i class="fas fa-exclamation-triangle"></i>`
    html.className = type + " container"+" alert";
    if (type==="success"){
      html.innerHTML = success_icon+msg;
    } else {
      html.innerHTML = error_icon+msg;
    }
    const navBar = document.querySelector("#top-nav");
    navBar.insertAdjacentElement("afterend",html);
    setTimeout(function (params) {
      document.querySelector(".alert").remove();
    },3000);
  }

}
// storage class
class Storage{
  static getBooks(){
    let books;
    if(localStorage.getItem("books")===null){
      books = [];
    } else {
      books = JSON.parse(localStorage.getItem("books"));
    }
    return books;
  }
  static displayBooks(){
    const books = Storage.getBooks();
    books.forEach(function(book) {
      UI.insert_to_list(book);
    })
  }

  static addBook(book){
    const books = Storage.getBooks();
    books.push(book);
    localStorage.setItem("books",JSON.stringify(books));
  }
  static removeBook(book){
    const id = book.parentElement.parentElement.dataset.id;
    const books = Storage.getBooks();
    books.forEach(function(book) {
      if(book.id.toString()===id){
        books.splice(books.indexOf(book),1);
      }
    })
    localStorage.setItem("books",JSON.stringify(books));

  }

}

Storage.displayBooks();

// Event Listeners
addBook.addEventListener("click",function() {
  addBook_form.style.display = "block";
  addBook.style.display = "none";
  addBook_form.scrollIntoView(true);
})
addBook_form.addEventListener("submit",function(e) {
  // get form values
  const title = document.querySelector("#title-book").value,
        author = document.querySelector("#author-book").value,
        isbn = document.querySelector("#isbn-book").value
  const book = new Book(title,author,isbn);
  if(title === "" || author===""||isbn===""){
    UI.showAlert("Value can not be empty, please try again","error");
  }else{
    UI.insert_to_list(book);
    Storage.addBook(book);
    UI.showAlert("Book Added","success");
  }
  UI.clear_fields();
  e.preventDefault();
})
// remove from booklist
document.querySelector("#book-list").addEventListener("click",function (e) {
  UI.delete_from_list(e.target);
  Storage.removeBook(e.target);
  e.preventDefault();
})
// hide form - reusable
document.querySelector("form").addEventListener("click",function(e) {
  if (e.target.classList.contains("delete-section")) {
    e.target.parentElement.parentElement.style.display = "none";
    addBook.style.display = "block";
  }
})