require('dotenv').config();
const { expect } = require('chai');
const knex = require('knex');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe.only('Bookmark Endpoints', () => {
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

    context('Given the table has data', ()=>{
        const testData = makeBookmarksArray();
        beforeEach('insert bookmarks',()=>{
            return db.into('bookmarks').insert(testData);
        });
        it('GET /bookmarks resonds with 200 and all the bookmarks',()=>{
            return supertest(app).get('/bookmarks').set('authorization',`bearer ${process.env.API_TOKEN}`).expect(200, testData);
        });

        it('GET /bookmarks/:id responds 200 with bookmark at the id', () =>{
            const bookmarkId = 2;
            const expectedBookmark = testData[bookmarkId -1];
            return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set('authorization',`bearer ${process.env.API_TOKEN}`)
                    .expect(200,expectedBookmark);
        });
    });

});
