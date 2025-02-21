const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const datajson = fs.readFileSync('data.json');
let books = JSON.parse(datajson);

// Create a new book
app.post('/books', (req, res) => {
    console.log('Received POST request to /books');
    console.log('Request body:', req.body);

    const { book_id, title, author, genre, year, copies } = req.body;

    if (!book_id || !title || !author || !genre || !year || !copies) {
        console.log('Missing fields in request body');
        return res.status(400).json({ error: 'All book fields are required.' });
    }

    if (books.some(book => book.book_id === book_id)) {
        console.log('Book with this ID already exists');
        return res.status(400).json({ error: 'Book with this ID already exists.' });
    }

    const newBook = { book_id, title, author, genre, year, copies };
    books.push(newBook);
    fs.writeFileSync('data.json', JSON.stringify(books, null, 2));

    console.log('New book added:', newBook);
    res.status(201).json(newBook);
});

// Retrieve all books
app.get('/books', (req, res) => {
    console.log("GET request to /books");
    res.status(200).json(books);
});

// Retrieve a specific book by ID
app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.book_id === req.params.id);

    if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    res.status(200).json(book);
});

// Update a book
app.put('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.book_id === req.params.id);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    const updatedBook = { ...books[bookIndex], ...req.body };
    books[bookIndex] = updatedBook;
    
    fs.writeFileSync('data.json', JSON.stringify(books, null, 2));
    
    res.status(200).json(updatedBook);
});

// Delete a book
app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.book_id === req.params.id);
    
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found.' });
    }
    
    books.splice(bookIndex, 1);
    fs.writeFileSync('data.json', JSON.stringify(books, null, 2));
    res.status(200).json({ message: `Book ${req.params.id} successfully deleted.` });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});