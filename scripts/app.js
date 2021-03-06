// // execute after DOM tree ready and before resource load 
// document.addEventListener("DOMContentLoaded",function () {

// })

// elements
const addBook = document.getElementById("add-to-list");
const addBook_form = document.querySelector("#add-book");
const searchBox = document.querySelector("#search-book");

// Book Class
class Book{
  constructor(title,author,isbn,link){
    this.isbn = isbn;
    this.title=title;
    this.author=author;
    this.link = link;
    this.id = Math.floor(Math.random()*100000);   
  }
}

class search{
  handleErrors(res) {
    if (!res.ok) throw new Error(res.status);
    return res;
  }
  async searchBook(title,num=5){
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}`);
    // alert error if any and return results
    const data = await this.handleErrors(response).json();
    if (data["totalItems"]>0) {
      return data["items"].splice(0,num);
    } else {
      throw new Error("No Result Found");
    }
  }
  static resultIterator(results){
    let nextIndex = 0;

    return {
      next:()=>{
        if (nextIndex < results.length) {
          let nextBook = results[nextIndex++]["volumeInfo"];
          let nextIsbn;
          // obtain ISBN if available
          // check if there is any iD available
          if (nextBook["industryIdentifiers"]) {
            nextBook["industryIdentifiers"].forEach((idObj)=>{
              if (idObj["type"]=="ISBN_13") {
                nextIsbn = idObj.identifier
              }
            })
          // if there is no iSBN available
          }
          if (nextIsbn===undefined) {
            nextIsbn = "ISBN Not Available";
          }
          return {
            author:String(nextBook["authors"]),
            title:nextBook["title"],
            isbn:nextIsbn,
            link:nextBook["infoLink"],
            done:false
          }
        } else {
          return {done:true}
        }
        
      }
    }
  }
}

// ui class
class UI{

  static insert_to_list(book){
    const list = document.querySelector("#book-list");
    const html = document.createElement("tr");
    html.dataset.id = book.id.toString(); 
    html.innerHTML = `
    <td class="book-name cut-text">
    <a href="${book.link}" class="normalized">
      ${book.title}
    </a>
    </td>
    <td class="mobile-hide">${book.author}</td>
    <td class="mobile-hide">${book.isbn}</td>
    <td><a class="btn-action delete"><i class="fas fa-times"></i></a></td>    
    `
    list.appendChild(html);
  }

  static displaySuggestions(data){
    searchBox.querySelector(".suggestion").innerHTML = "";
    const resultObj = search.resultIterator(data);
    let finish = false;
    let count = 0
    while(true){
      const book = resultObj.next();
      finish = book["done"];
      if (finish) {
        break;
      }
      let suggestion = document.createElement("li");
      suggestion.classList.add("collection-item");
      suggestion.innerHTML = `
      <a href="#" data-title="${book["title"]}" data-author="${book.author}" data-isbn="${book.isbn}" data-link="${book.link}" class="book-suggestion">
        <ul>
          <li class="book-name">${book["title"]}</li>
          <li class="author">${book.author}</li>
          <li class="author">${book.isbn}</li>
        </ul>
      </a>      
    `
      searchBox.querySelector(".suggestion").appendChild(suggestion);
      
    }
  }
  static delete_from_list(book){
  
      book.parentElement.parentElement.remove();  
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
// storage the book into localStorage
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

document.addEventListener("DOMContentLoaded", function(event) { 
  Storage.displayBooks();
});

const request = new search();

// Event Listeners
addBook.addEventListener("click",function() {
  addBook_form.style.display = "block";
  addBook.style.display = "none";
  addBook_form.scrollIntoView(true);
})

searchBox.querySelector("#title-book").addEventListener("keyup",(e)=>{
  searchBox.querySelector(".suggestion").style.display="block";
  request.searchBook(e.target.value)
    .then(data=>{
      UI.displaySuggestions(data);

    })
    .catch(err=>console.log(err));
})


searchBox.addEventListener("click",function(e) {
  // get title, author, and ISBN values
  const element = e.target;
  if (element.classList.contains("book-suggestion")) {
    const title = element.dataset.title;
    const author = element.dataset.author;
    const isbn = element.dataset.isbn;
    const link = element.dataset.link;
    // instantiate new book class
    const book = new Book(title,author,isbn,link);
    UI.insert_to_list(book);
    Storage.addBook(book);
    UI.showAlert("Book Added","success");
    searchBox.querySelector(".suggestion").style.display="none";
    // TODO delete clear fields function
    e.preventDefault();
  }

})
// remove from booklist
document.querySelector("#book-list").addEventListener("click",function (e) {
  if (e.target.classList.contains("delete")) {
    UI.delete_from_list(e.target);
    Storage.removeBook(e.target);  
  }
})
// hide form - reusable
document.querySelector("form").addEventListener("click",function(e) {
  if (e.target.classList.contains("delete-section")) {
    e.target.parentElement.parentElement.style.display = "none";
    addBook.style.display = "block";
  }
})
