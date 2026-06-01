const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const {username, password} = req.body;

  if (!username || !password) {
    return res.status(400).json({message: "username and password riquired"})
  }

  const userExist = users.some((user) => user.username === username);
  if (userExist) {
    return res.status(409).json({message: "This user is already exist"})
  }

  users.push({"username" : username, "password" : password});
  return res.status(201).json({message : "user register successfuly. You can now connect"})
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  let bookList = Object.values(books);

  if (bookList.length > 0) {
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(bookList, null, 4));
  } else {
    return res.status(404).json({ message: "No books found" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  } else {
    return res.status(400).json({ message: "Book not found with this ISBN" })
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);
  let filteredBook = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const book = books[key];

    if (book.author === author) {
      filteredBook.push(book);
    }
  }

  if (filteredBook.length > 0) {
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(filteredBook, null, 4));
  } else {
    res.status(400).json({ message: "No book found for this author" })
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
  let filteredBook = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const book = books[key];
    if (book.title === title) {
      filteredBook.push(book);
    }
  }

  if (filteredBook.length > 0) {
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(filteredBook, null, 4));
  } else {
    return res.status(400).json({ message: "No book found for this title" })
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "No reviews found. Book not found with this ISBN" });
  }
});

module.exports.general = public_users;
