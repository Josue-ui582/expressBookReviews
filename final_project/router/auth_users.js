const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let usersWithSameName = users.filter((user) => user.username === username);
  return usersWithSameName.length === 0;
}

const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => user.username === username && user.password === password);
  return validUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" })
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username: username }, "access", { expiredIn: "1h" });
    req.session.authorization = {
      accessToken
    }
    return res.status(200).json({message: "login successfuly !", token : accessToken})
  }else {
    return res.status(401).json({message : "username or password incorrect"})
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  
  const username = req.user.username; 

  if (!review) {
    return res.status(400).json({ message: "Le contenu de l'avis est requis" });
  }

  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify({ 
      message: `L'avis de l'utilisateur '${username}' pour l'ISBN ${isbn} a été enregistré avec succès.`,
      reviews: books[isbn].reviews 
    }, null, 4));

  } else {
    return res.status(404).json({ message: "Livre non trouvé avec cet ISBN" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  
  const username = req.user.username; 

  if (books[isbn]) {
    
    if (books[isbn].reviews[username]) {
      
      delete books[isbn].reviews[username];
      
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(JSON.stringify({ 
        message: `L'avis de l'utilisateur '${username}' pour l'ISBN ${isbn} a été supprimé avec succès.`,
        reviews: books[isbn].reviews 
      }, null, 4));

    } else {
      return res.status(404).json({ message: `Aucun avis trouvé pour l'utilisateur '${username}' sur cet ISBN.` });
    }

  } else {
    return res.status(404).json({ message: "Livre non trouvé avec cet ISBN" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
