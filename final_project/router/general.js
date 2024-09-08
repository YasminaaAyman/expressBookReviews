const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find((user) => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Endpoint to get the list of books using async/await
public_users.get('/books', async (req, res) => {
    try {
      const response = await axios.get('http://localhost:5000/');
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving books', error: error.message });
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.json(books[isbn]);
  } else {
        return res.status(404).json({ message: "Book not found" });
    }
 });

 // Endpoint to get book details based on ISBN using Promise callbacks
 public_users.get('/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;
    axios.get(`http://localhost:5000/isbn${isbn}`)
      .then(response => {
        if (response.data) {
          res.json(response.data);
        } else {
          res.status(404).json({ message: "Book not found" });
        }
      })
      .catch(error => {
        res.status(500).json({ message: 'Error retrieving book details', error: error.message });
      });
  });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;  
  const authorBooks = [];  

  for (const book in books) {  
    if (books[book].author === author) {  
      authorBooks.push(books[book]);
    }
  }
  
  if (authorBooks.length > 0) {  
    res.send(authorBooks);  
  } else {
    res.status(404).send('No books found for author');  
  }
});

// Endpoint to get book details based on Author using Promise callbacks
public_users.get('/author/:author', (req, res) => {
    const { author } = req.params;
    axios.get(`http://localhost:5000/author?author=${encodeURIComponent(author)}`) 
      .then(response => {
        const authorBooks = response.data;
        if (authorBooks.length > 0) {
          res.json(authorBooks);
        } else {
          res.status(404).json({ message: "No books found for author" });
        }
      })
      .catch(error => {
        res.status(500).json({ message: 'Error retrieving books by author', error: error.message });
      });
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
    if(filteredBooks.length > 0){
        return res.status(200).json(filteredBooks);
    }
    else{
        return res.status(404).json({message: "Book not found"});
    }
});

// Endpoint to get book details based on Title using async/await
public_users.get('/title/:title', async (req, res) => {
    const { title } = req.params;
    try {
      const response = await axios.get(`http://localhost:5000/title?title=${encodeURIComponent(title)}`);
      const titleBooks = response.data;
      if (titleBooks.length > 0) {
        res.json(titleBooks);
      } else {
        res.status(404).json({ message: "No books found with the given title" });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving books by title', error: error.message });
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    const reviews = books[isbn].reviews;
    return res.status(200).json({ reviews: reviews });
});

module.exports.general = public_users;
