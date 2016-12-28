/*global describe, it*/
'use strict';
const superagent = require('supertest'),
      app = require('../app'),
      request = superagent(app.listen());

describe('Routes', () => {

  // Home page
  describe('GET /', () => {
    it('should return 200', done => {
      request
        .get('/')
        .expect(200, done);
    });
  });
  describe('POST /', () => {
    it('should return 200', done => {
      request
        .post('/')
        .expect(200, done);
    });
  });

  // Get movie by kinopoisk ID
  describe('GET /movie/kinopoisk/:id', () => {
    it('should return 200', done => {
      request
        .get('/movie/kinopoisk/4023')
        .expect(200, done);
    });
  });

  // Get movie by kinopoisk ID not found
  describe('GET /movie/kinopoisk/:id', () => {
    it('should return 404', done => {
      request
        .get('/movie/kinopoisk/4')
        .expect(404, done);
    });
  });

  // Get all people
  describe('GET /people', () => {
    it('should return 200', done => {
      request
        .get('/people')
        .expect(200, done);
    });
  });

  // Get people by id
  describe('GET /people/61', () => {
    it('should return 200', done => {
      request
        .get('/people/61')
        .expect(200, done);
    });
  });

  // Not found
  describe('GET /notfound', () => {
    it('should return 404', done => {
      request
        .get('/notfound')
        .expect(404, done);
    });
  });
});
