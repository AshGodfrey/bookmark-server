const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray } = require('./bookmarks.fixtures')

describe.only('Bookmarks Endpoints', function() {
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
  describe.only('Post /bookmarks', () => {
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
  })

})