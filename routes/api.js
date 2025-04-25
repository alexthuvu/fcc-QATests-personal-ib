'use strict';
require('dotenv').config();
const e = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bookSchema = new Schema({
  title: { type: String, required: true },
  comments: [{ type: String }],
  commentcount: { type: Number, default: 0 }
});
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  app.route('/api/books')
    .get(async (req, res) => {
      try {
        const books = await Book.find({}, { __v: 0 });
        return res.json(books);
      } catch (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ error: 'server error' });
      }
    })
    
    .post(async (req, res) => {
      let title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }
      try {
        const newBook = new Book({ title });
        await newBook.save();
        return res.json({ title: newBook.title, _id: newBook._id });
      } catch (error) {
        console.error('Error creating book:', error);
        return res.status(500).json({ error: 'server error' });
      }
    })
    
    .delete(async (req, res) => {
      try {
        await Book.deleteMany({});
        return res.send('complete delete successful');
      } catch (error) {
        console.error('Error deleting books:', error);
        return res.status(500).json({ error: 'server error' });
      }
    });

  app.route('/api/books/:id')
    .get(async (req, res) => {
      const bookId = req.params.id;
      if (!mongoose.isValidObjectId(bookId)) {
        return res.send('no book exists');
      }
      try {
        const book = await Book.findById(bookId, { title: 1, _id: 1, comments: 1 });
        if (!book) {
          return res.send('no book exists');
        }
        return res.json(book);
      } catch (error) {
        console.error('Error fetching book:', error);
        return res.status(500).json({ error: 'server error' });
      }
    })
    
    .post(async (req, res) => {
      const bookId = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        return res.send('missing required field comment');
      }
      if (!mongoose.isValidObjectId(bookId)) {
        return res.send('no book exists');
      }
      try {
        const book = await Book.findById(bookId);
        if (!book) {
          return res.send('no book exists');
        }
        book.comments.push(comment);
        book.commentcount = book.comments.length;
        await book.save();
        return res.json(book);
      } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ error: 'server error' });
      }
    })
    
    .delete(async (req, res) => {
      const bookId = req.params.id;
      if (!mongoose.isValidObjectId(bookId)) {
        return res.send('no book exists');
      }
      try {
        const result = await Book.findByIdAndDelete(bookId);
        if (!result) {
          return res.send('no book exists');
        }
        return res.send('delete successful');
      } catch (error) {
        console.error('Error deleting book:', error);
        return res.status(500).json({ error: 'server error' });
      }
    });
};