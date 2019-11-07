/* eslint-disable strict */
const express = require('express');
const uuid = require('uuid/v4');
const logger = require('./logger');
const bookmarkRouter = express.Router();
// const bookmarks = require('./bookmarkData');
const BookmarkService = require('./bookmarkService');


bookmarkRouter.get('/', (req, res, next) =>{
  const knexInstance = req.app.get('db');
  BookmarkService.getAllBookmarks(knexInstance)
    .then(bookmarks => {
      res.json(bookmarks);
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
      return res.json(bookmark);
    })
    .catch(next);
});

bookmarkRouter.post('/', (req,res)=>{
  const{ title,url,description = '', rating } = req.body;
  const id = uuid();

  if (!title){
    logger.error('Must have title.');
    return res.status(400).send('Title not found');
  }
  if (!url){
    logger.error('Must have url.');
    return res.status(400).send('Url not found');
  }
  if (!rating){
    logger.error('Must have rating.');
    return res.status(400).send('Rating not found');
  }
  const bookmark = {
    id,
    title,
    url,
    description,
    rating
  };

bookmarks.push(bookmark);
logger.info(`Bookmark with id ${id} created`);
res.status(201).location(`http://localhost:8000/bookmarks/${id}`).json(bookmark);

});




module.exports = bookmarkRouter;