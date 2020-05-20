class easyHTTP{
  handleErrors(res) {
    if (!res.ok) throw new Error(res.status);
    return res;
  }
  async getBook(title){
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}`);
    // alert error if any and return results
    return this.handleErrors(response).json();
  }

}
const request = new easyHTTP();
request.getBook("peace")
.then(data=>console.log(data["items"]))
.catch(err=>console.log(err));