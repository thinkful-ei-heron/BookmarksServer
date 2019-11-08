require('dotenv').config();
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');


describe('Bookmark Endpoints', () => {
    let db;
    before('make knex instance', () =>{
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db',db);
    });

    after('disconnect from db', () => db.destroy());
    before('clean the table', () => db('bookmarks').truncate());
    afterEach('cleanup', () => db('bookmarks').truncate());

    describe('GET /api/bookmarks', () => {
        context('Given no bookmarks', () => {
            it('responds with 200 and an empty list', () => {
              return supertest(app)
                .get('/api/bookmarks')
                .set('authorization',`bearer ${process.env.API_TOKEN}`)
                .expect(200, []);
            });
        });
        context('Given the table has data', ()=>{
            const testData = makeBookmarksArray();
            beforeEach('insert bookmarks',()=>{
                return db.into('bookmarks').insert(testData);
            });

            it('GET /api/bookmarks responds with 200 and all the bookmarks',()=>{
                return supertest(app).get('/api/bookmarks').set('authorization',`bearer ${process.env.API_TOKEN}`).expect(200, testData);
            });
        });
        describe('GET /api/bookmarks/:id', () => {
            context('Given no bookmarks', () => {
                it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/bookmarks/')
                    .set('authorization',`bearer ${process.env.API_TOKEN}`)
                    .expect(200, []);
                });
            });

            context('Given the table has data', ()=>{
                const testData = makeBookmarksArray();
                beforeEach('insert bookmarks',()=>{
                    return db.into('bookmarks').insert(testData);
            });
                it('GET /api/bookmarks/:id responds 200 with bookmark at the id', () =>{
                const bookmarkId = 2;
                const expectedBookmark = testData[bookmarkId -1];
                return supertest(app)
                        .get(`/api/bookmarks/${bookmarkId}`)
                        .set('authorization',`bearer ${process.env.API_TOKEN}`)
                        .expect(200,expectedBookmark);
                });
            });
        });
    });
    describe('POST /api/bookmarks', () => {
        it('creates a bookmark, responding with 201 and the new bookmark', ()=>{
            const newBookmark = {
                title:'Test new Bookmark',
                url:'www.nandortherelentless.com',
                description:'he was called relentless, because he did not relent',
                rating: 5,
            };

            return supertest(app)
                .post('/api/bookmarks')
                .set('authorization',`bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201)
                .expect(res =>{
                    expect(res.body.title).to.eql(newBookmark.title);
                    expect(res.body.url).to.eql(newBookmark.url);
                    expect(res.body.description).to.eql(newBookmark.description);
                    expect(res.body.rating).to.eql(newBookmark.rating);
                    expect(res.body).to.have.property('id');
                    expect(res.headers.location).to.eql(`/api/bookmarks/${res.body.id}`);
                })
                .then(res => 
                    supertest(app)
                        .get(`/api/bookmarks/${res.body.id}`)
                        .set('authorization',`bearer ${process.env.API_TOKEN}`)
                        .expect(res.body)
                );
        });

        const requiredFields = ['title', 'url', 'rating'];
        requiredFields.forEach(field =>{
            const newBookmark = {
                title: 'Test new title',
                url: 'www.abc.com',
                description: 'Test description',
                rating: 5,
            };
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBookmark[field];
                return supertest(app)
                    .post('/api/bookmarks')
                    .set('authorization',`bearer ${process.env.API_TOKEN}`)
                    .send(newBookmark)
                    .expect(400, {
                        error: {message: `${field} not found`}
                    });
            });
        });
    });
    describe('DELETE /api/bookmarks/:id', () => {
        context('Given there are bookmarks in the DB', ()=>{
            const testData = makeBookmarksArray();
            beforeEach('insert bookmarks', ()=>{
                return db.into('bookmarks').insert(testData);
            });
            it('responds with 204 and removes the article', () =>{
                const idToRemove = 2;
                const expectedBookmarks = testData.filter(bookmark => bookmark.id !== idToRemove);
                return supertest(app)
                    .delete(`/api/bookmarks/${idToRemove}`)
                    .set('authorization',`bearer ${process.env.API_TOKEN}`)
                    .expect(204)
                    .then(() =>{
                        return supertest(app)
                            .get('/api/bookmarks')
                            .set('authorization',`bearer ${process.env.API_TOKEN}`)
                            .expect(expectedBookmarks);
                    });
            });
        });
    });
    describe('PATCH /api/bookmarks/:id', () =>{
        // context(' Given no bookmarks', ()=>{
        //     it('Resolves a 404 error', ()=>{
        //         const bookmarkId = 420;

        //         return supertest(app)
        //         .patch(`/api/bookmarks/${bookmarkId}`)
        //         .set('authorization',`bearer ${process.env.API_TOKEN}`)
        //         .expect(404, { error: { message: `Bookmark doesn't exist`}});
        //     });
        // });
        context('Given there are bookmarks', ()=> {
          const testData = makeBookmarksArray();
          beforeEach('insert bookmarks', ()=>{
            return db.into('bookmarks').insert(testData);
          });

          it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2;
                return supertest(app)
                  .patch(`/api/bookmarks/${idToUpdate}`)
                  .set('authorization',`bearer ${process.env.API_TOKEN}`)
                  .send({ irrelevantField: 'foo' })
                  .expect(400, {
                    error: {
                      message: `Request body must contain title, and url, and rating.`
                    }
                  });
               });

          it('responds with 204 and updates the bookmark', ()=>{
              const idToUpdate = 2;
              const updateBookmark = {
                title: 'Updated bookmark title',
                url: 'www.google.com',
                description: 'this is an engine',
                rating: 5,
              };
              const expectedBookmark = {
                ...testData[idToUpdate -1],
                ...updateBookmark
              };
              return supertest(app)
                .patch(`/api/bookmarks/${idToUpdate}`)
                .set('authorization',`bearer ${process.env.API_TOKEN}`)
                .send({
                    ...updateBookmark,
                    fieldToIgnore: 'Should not be in GET response'
                })
                .expect(204)
                .then(res =>{
                    supertest(app)
                        .get(`/api/bookmarks/${idToUpdate}`)
                        .expect(expectedBookmark);
                });
          });
        });
    });
});
    
