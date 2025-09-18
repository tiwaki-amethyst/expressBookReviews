const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Task 1: Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
        res.send(JSON.stringify(book, null, 4));
    } else {
        res.status(404).json({message: "Book not found"});
    }
});
  
// Task 3: Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    let booksByAuthor = [];
    
    // Get all keys for the 'books' object
    const bookKeys = Object.keys(books);
    
    // Iterate through books and find matching authors
    bookKeys.forEach(key => {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
            booksByAuthor.push({
                isbn: key,
                title: books[key].title,
                author: books[key].author,
                reviews: books[key].reviews
            });
        }
    });
    
    if (booksByAuthor.length > 0) {
        res.send(JSON.stringify(booksByAuthor, null, 4));
    } else {
        res.status(404).json({message: "No books found by this author"});
    }
});

// Task 4: Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    let booksByTitle = [];
    
    // Get all keys for the 'books' object
    const bookKeys = Object.keys(books);
    
    // Iterate through books and find matching titles
    bookKeys.forEach(key => {
        if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
            booksByTitle.push({
                isbn: key,
                title: books[key].title,
                author: books[key].author,
                reviews: books[key].reviews
            });
        }
    });
    
    if (booksByTitle.length > 0) {
        res.send(JSON.stringify(booksByTitle, null, 4));
    } else {
        res.status(404).json({message: "No books found with this title"});
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
        res.send(JSON.stringify(book.reviews, null, 4));
    } else {
        res.status(404).json({message: "Book not found"});
    }
});

// ========== ASYNC/AWAIT AND PROMISES IMPLEMENTATION ==========

// Task 10: Get all books using Promise callbacks
function getAllBooks() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

public_users.get('/async', function (req, res) {
    getAllBooks().then((bookList) => {
        res.send(JSON.stringify(bookList, null, 4));
    }).catch((error) => {
        res.status(500).json({message: "Error retrieving books"});
    });
});

// Task 11: Get book details based on ISBN using Promise callbacks
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    });
}

public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn).then((book) => {
        res.send(JSON.stringify(book, null, 4));
    }).catch((error) => {
        res.status(404).json({message: error});
    });
});

// Task 12: Get book details based on Author using Promise callbacks
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        let booksByAuthor = [];
        const bookKeys = Object.keys(books);
        
        bookKeys.forEach(key => {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                booksByAuthor.push({
                    isbn: key,
                    title: books[key].title,
                    author: books[key].author,
                    reviews: books[key].reviews
                });
            }
        });
        
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("No books found by this author");
        }
    });
}

public_users.get('/async/author/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author).then((books) => {
        res.send(JSON.stringify(books, null, 4));
    }).catch((error) => {
        res.status(404).json({message: error});
    });
});

// Task 13: Get book details based on Title using async/await
async function getBooksByTitle(title) {
    let booksByTitle = [];
    const bookKeys = Object.keys(books);
    
    bookKeys.forEach(key => {
        if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
            booksByTitle.push({
                isbn: key,
                title: books[key].title,
                author: books[key].author,
                reviews: books[key].reviews
            });
        }
    });
    
    if (booksByTitle.length > 0) {
        return booksByTitle;
    } else {
        throw new Error("No books found with this title");
    }
}

public_users.get('/async/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const books = await getBooksByTitle(title);
        res.send(JSON.stringify(books, null, 4));
    } catch (error) {
        res.status(404).json({message: error.message});
    }
});

module.exports.general = public_users;