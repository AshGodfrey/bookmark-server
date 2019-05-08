const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe('Bookmarks Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('bookmarks').truncate())

  afterEach('cleanup', () => db('bookmarks').truncate())
  
  describe('GET /bookmarks', () => {
    context('Given no bookmarks', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/bookmarks')
          .expect(200, {})
      })
    })
    context('Given there are bookmarks in the database', () => {
    	const testBookmarks = makeBookmarksArray()

  	beforeEach('insert bookmarks', () => {
  		return db
  			.into('bookmarks')
  			.insert(testBookmarks)
  	})
  	it('GET /bookmarks responds with 200 and all of the bookmarks', () => {
  		return supertest(app)
  			.get('/bookmarks')
  			.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  			.expect(200, testBookmarks)
  	})
  })

	describe(`GET /bookmarks/:bookmarks_id`, () => {
    context('given no articles', () => {
      it('responds with 404', () => {
        const bookmarkId=123456
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .expect(404, {error: { message: `Bookmark does not exist`}})
      })
    })
    context('Given an XSS attack bookmark', () => {
      const maliciousBookmark = {
        id: 911,
        title: "bad bookmark",
        url: "awful",
        description: "seriously",
        rating: 0,
      }
      beforeEach('insert malicious bookmark', () => {
        return db
          .into('bookmarks')
          .insert([ maliciousBookmark ])
      })
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/bookmarks/${maliciousBookmark.id}`
            .expect(200)
            .expect(res => {
              expect(res.body.title).to.eql(`bad bookmark`)
              expect(res.body.description).to.eql('seriously')
              expect(res.body.url).to.eql('awful')
            }))
      })
    })
    it('Get /bookmarks/:bookmark_id responds with 200 and the specified bookmark', () => {
  		const bookmarkId = 2
  		const expectedBookmark = testBookmarks[bookmarkId -1]
  		return supertest(app)
  			.get('/bookmarks/${bookmarkId}')
  			.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  			.expect(200, expectedBookmark)
  	   })
     })
  })
  describe('Post /bookmarks', () => {
    it('creates a bookmark, responding with 201 and the new bookmark', function() {
      this.retries(3)
      const newBookmark = {
        title: 'test bookmark',
          url: 'testbookmark.com',
          description: 'test',
          rating: '5'
      }
      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.equal(newBookmark.title)
          expect(res.body.url).to.equal(newBookmark.url)
          expect(res.body.description).to.equal(newBookmark.description)
          expect(res.body.rating).to.equal(newBookmark.rating)
          expect(res.body).to.have.property('id')
        })
        .then(postRes => 
          supertest(app)
            .get(`/bookmarks/${postRes.body.id}`)
            .expect(postRes.body)
            )
    })
    const requiredFields = ['title', 'url', 'rating']

    requiredFields.forEach(field => {
      const newBookmark = {
          title: 'test bookmark',
          url: 'testbookmark.com',
          description: 'test',
          rating: '5'
      }
      it(`responds with 400 and an error message when the ${field} is missing`)
      delete newBookmark[field]

      return supertest(app)
        .post('/bookmarks')
        .send(newBookmark)
        .expect(400,  {
          error: { message: `missing ${field}`}
        })
     })
    })
  describe(`DELETE /bookmarks/:id`, () => {
    context('given no bookmarks', () => {
      it('responds with 404', () => {
        const bookmarkId = 123456
        return supertest(app)
          .delete(`/bookmarks/${bookmarkId}`)
          .expect(404, { error: { message: 'article doesn't exist'}})
      })
    })
    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarksArray()

      beforeEach('insert Bookmarks', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })
      it('responds with 204 and removes bookmark', () => {
        const idToRemove = 2
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/bookmarks/${idToRemove}`)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/articles`)
              .expect(expectedArticles)
              )
      })
    })
  })
  })
