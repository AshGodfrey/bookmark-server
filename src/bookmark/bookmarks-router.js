const express = require('express')
const xss = require('xss')
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
	.post(jsonParser, (req, res, next) => {
	  const { title, url, description, rating } = req.body
	  const newBookmark = { title, url, description, rating }

	  for (const [key, value] of Object.entries(newBookmark)) {
	  	if (value == null) {
	  		return res.status(400).json({
	  			error: { message: `missing ${key}`}
	  		})
	  	}
	  }
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
	.all((req, res, next) => {
		BookmarksService.getById(
			req.app.get('db'),
			req.params.bookmark_id
			)
		.then(bookmark => {
			if(!bookmark) {
				return res.status(404).json({
					error: {message: 'bookmark doesnt exist'}
				})
			}
			res.bookmark = bookmark
			next()
		})
		.catch(next)
	})
	.get((req, res, next) => {
		res.json(serializeBookmark(res.bookmark))
		})
	.delete((req, res, next) => {
		BookmarksService.deleteBookmark(
			req.app.get('db'),
			req.params.article_id
			)
			.then(() => {
				res.status(204).end()
			})
			.catch(next)
	})


module.exports = bookmarksRouter

	