const express = require('express')
const uuid = require('uuid/v4')
const store = require('../store')
const logger = require('../logger')
const bookmarkRouter = express.Router()
const bodyParser = express.json();


bookmarkRouter
	.route('/bookmark')
	.get((req, res) => {
		res.json(store.bookmarks)
	})
	.post(bodyParser, (req, res) => {
		   const { title, url, description, rating } = req.body

		   if (!title) {
		   	logger.error('Title is required');
		   	return res
		   		.status(400)
		   		.send('Title Required')
		   }
		   
		   if (!url) {
		   	logger.error('URL is required');
		   	return res
		   		.status(400)
		   		.send('URL Required')
		   }

		   if (!description) {
		   	logger.error('Description is required');
		   	return res
		   		.status(400)
		   		.send('Description Required')
		   }

		   if (!rating) {
		   	logger.error('Rating is required');
		   	return res
		   		.status(400)
		   		.send('Rating Required')
		   }

		   if(isNaN(rating)){
		   	logger.error('Rating must be a number');
		   	return res
		   		.status(400)
		   		.send("Rating must be a whole number between 0-5")
		   }

		   if(rating < 0 || rating > 5) {
		   	logger.error('Rating must be between 0-5')
		   	return res
		   		.status(400)
		   		.send('rating must be between 0-5')
		   }

		   if(!isWebURi(url)){
		   	logger.error('Invalid URL')
		   	return res
		   		.status(400)
		   		.send("URL must be a valid URL")
		   }

		   
    const bookmark = { id: uuid(), title, url, description, rating }

    store.bookmarks.push(bookmark)

    logger.info(`Bookmark with id ${bookmark.id} created`)
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark)
	})

bookmarkRouter
	.route('/bookmark/:id')
	.get((req, res) => {
		const { id } = req.params
		const bookmark = store.bookmarks.find(c => c.id == id)

		if (!bookmark){
			logger.error(`bookmark with id ${id} not found.`)
			return res
				.status(404)
				.send('bookmark not found')
		}
		res.json(bookmark)
	})
	.delete((req, res) => {
		const { id } = req.params;
		const bookmarkIndex =  store.bookmarks.findIndex(b => b.id === id);

		if (bookmarkIndex === -1) {
			logger.error(`Bookmark with id ${id} not found.`);
			return res
				.status(404)
				.send('Bookmark Not Found');
		}

		store.bookmarks.splice(bookmarkIndex, 1)
		logger.info(`Bookmark with id ${bookmark_id} deleted.`)
	    res
	      .status(204)
	      .end()
	})

module.exports = bookmarkRouter