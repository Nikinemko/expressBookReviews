const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Register the new user
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

const getBooks = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });
};

public_users.get("/", async (req, res) => {
  try {
    const bookList = await getBooks();
    return res.status(200).json(bookList);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve books", error: error.message });
  }
});

// Get book details based on ISBN
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  });
};

public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const bookDetails = await getBookByISBN(isbn);
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book details based on author
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const results = Object.values(books).filter(
      (book) => book.author === author
    );
    if (results.length > 0) {
      resolve(results);
    } else {
      reject(new Error("No books found by this author"));
    }
  });
};

// Get book details based on author using async/await
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const booksByAuthor = await getBooksByAuthor(author);
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get all books based on title
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const results = Object.values(books).filter((book) => book.title === title);
    if (results.length > 0) {
      resolve(results);
    } else {
      reject(new Error("No books found with this title"));
    }
  });
};

// Get book details based on title using async/await
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const booksByTitle = await getBooksByTitle(title);
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res
      .status(404)
      .json({ message: "No reviews found for the given ISBN" });
  }
});

module.exports.general = public_users;
