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
  // describe('GET /movie/kinopoisk/:id', () => {
  //   it('should return 404', done => {
  //     request
  //       .get('/movie/kinopoisk/5')
  //       .expect(404, done);
  //   });
  // });

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

  // User profile
  describe('GET /user/:username', () => {
    it('should return 200', done => {
      request
        .get('/user/caaatpro')
        .expect(200, done);
    });
  });

  // User movie
  describe('GET /user/:username/movies', () => {
    it('should return 200', done => {
      request
        .get('/user/caaatpro/movies')
        .expect(200, done);
    });
  });

  // User add movie
  describe('put /user/movie/9', () => {
    it('should return 200', done => {
      request
        .put('/user/movie/9')
        .expect(200, done);
    });
  });

  // User delete movie
  describe('delete /user/movie/12', () => {
    it('should return 200', done => {
      request
        .delete('/user/movie/12')
        .expect(200, done);
    });
  });

  // User actors
  describe('GET /user/:username/actors', () => {
    it('should return 200', done => {
      request
        .get('/user/caaatpro/actors')
        .expect(200, done);
    });
  });

  // User directors
  describe('GET /user/:username/directors', () => {
    it('should return 200', done => {
      request
        .get('/user/caaatpro/directors')
        .expect(200, done);
    });
  });

  // User not found
  describe('GET /user/:username', () => {
    it('should return 404', done => {
      request
        .get('/user/qwerty')
        .expect(404, done);
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
