/* eslint-disable strict */
const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const bookmarkRouter = express.Router();
const BookmarkService = require('./bookmarkService');
const xss = require('xss');
const jsonParser = express.json();


const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: xss(bookmark.url),
  description: xss(bookmark.description),
  rating: bookmark.rating,
});

bookmarkRouter.get('/', (req, res, next) =>{
  const knexInstance = req.app.get('db');
  BookmarkService.getAllBookmarks(knexInstance)
    .then(bookmarks => {
      res.json(bookmarks.map(serializeBookmark));
    })
    .catch(next);
});

bookmarkRouter.get('/:id', (req, res, next) =>{
  const { id }= req.params;
  const knexInstance = req.app.get('db');

  BookmarkService
    .getById(knexInstance, id)
    .then(bookmark =>{
      if(!bookmark){
        return res.status(400).json({ error: {message: 'Bookmark does not exist.'}});
      }
      return res.json({
        id: bookmark.id,
        title: xss(bookmark.title),
        url: xss(bookmark.url),
        description: xss(bookmark.description),
        rating: bookmark.rating,
      });
    })
    .catch(next);
});

bookmarkRouter.post('/', jsonParser, (req,res, next)=>{
  const{ title, url, description, rating } = req.body;
  const knexInstance = req.app.get('db');
  const newBookmark = {title, url, description, rating};

  for( const[key,value] of Object.entries(newBookmark)){
    if(value == null){
      return res.status(400).json({
        error: {message: `${key} not found`}
      });
    }
  }

  BookmarkService.insertBookmark(knexInstance, newBookmark)
    .then(bookmark =>{
      res.status(201).location(`/bookmarks/${bookmark.id}`).json({
        id: bookmark.id,
        title: xss(bookmark.title),
        url: xss(bookmark.url),
        description: xss(bookmark.description),
        rating: bookmark.rating,
      });
    })
    .catch(next);
});

bookmarkRouter.delete('/:id', (req, res, next) =>{
  const id= req.params.id;
  const knexInstance = req.app.get('db');
  console.log(id);

  BookmarkService
    .deleteBookmark(knexInstance, id)
    .then(()=>{
      res.status(204).end();
    })
    .catch(next);
});

module.exports = bookmarkRouter;