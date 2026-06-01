const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios'); // Requis pour les Tâches 10-13 avec Axios
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

// Task 10: Get the book list available in the shop using Async-Await and Promises
public_users.get('/', async function (req, res) {
  try {
    const getBooksPromise = new Promise((resolve, reject) => {
      let bookList = Object.values(books);
      if (bookList.length > 0) {
        resolve(bookList);
      } else {
        reject(new Error("No books found"));
      }
    });

    const bookList = await getBooksPromise;
    
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(bookList, null, 4));

  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 11: Get book details based on ISBN using Async-Await and Promises
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const getBookByIsbnPromise = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found with this ISBN"));
      }
    });

    const book = await getBookByIsbnPromise;

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(book, null, 4));

  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 12: Get book details based on author using Async-Await and Promises
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const getBooksByAuthorPromise = new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      let filteredBooks = [];

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const book = books[key];
        if (book.author === author) {
          filteredBooks.push(book);
        }
      }

      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error("No book found for this author"));
      }
    });

    const matchingBooks = await getBooksByAuthorPromise;

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));

  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Task 13: Get all books based on title using Async-Await and Promises
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const getBooksByTitlePromise = new Promise((resolve, reject) => {
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
        resolve(filteredBook);
      } else {
        reject(new Error("No book found for this title"));
      }
    });

    const matchingTitleBooks = await getBooksByTitlePromise;

    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(matchingTitleBooks, null, 4));

  } catch (error) {
    return res.status(404).json({ message: error.message });
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
