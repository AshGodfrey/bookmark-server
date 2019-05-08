const express = require('express')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const jsonParse = express.json()

bookmarksRouter
	.route('/')
	.get((req, res, next) => {
		BookmarksService.getAllBookmarks(
			req.app.get('db')
			)
		.then(articles => {
			res.json(articles)
		})
		.catch(next)
	})
	.post(jsonParse, (req, res, next) => {
		const { title, url, description, rating } = req.body
	  const newBookmark = { title, url, description, rating }
	  BookmarksService.insertBookmark(
	    req.app.get('db'),
	    newBookmark
	    )
	    .then(bookmark => {
	      res.status(201).json(bookmark)
	    })
	    .catch(next)
	})
bookmarksRouter
	.route('/:bookmark_id')
	.get((req, res, next) => {
		const knexInstance = req.app.get('db')
		  BookmarksService.getById(knexInstance, req.params.bookmark_id)
		    .then(bookmark => {
		      if(!bookmark) {
		        return res.status(404).json({
		          error: {message: 'Bookmark doesnt exist'}
		        })
		      }
		      res.json(bookmark)
		    })
		    .catch(next)
})

module.exports = bookmarksRouter

	