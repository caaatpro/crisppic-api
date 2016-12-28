const P = require('bluebird'),
  request = require('request-promise'),
  cheerio = require('cheerio'),
  Iconv = require('iconv-lite');

const FILM_URL = 'https://www.kinopoisk.ru/film/';
const SEARCH_URL = 'https://www.kinopoisk.ru/s/type/film/list/1/find/';
const LOGIN_URL_GET_CSRF_TOKENS = 'https://plus.kinopoisk.ru/embed/login/?retPath=https%3A%2F%2Fwww.kinopoisk.ru%2F%23login';
const LOGIN_URL_GET_SESSION_ID = 'https://plus.kinopoisk.ru/user/resolve-by-password';

const DEFAULT_GET_OPTIONS = {
  title: true,
  rating: true,
  votes: true,
  alternativeTitle: true,
  description: true,
  type: true,
  actors: true,
  year: true,
  country: true,
  director: true,
  scenario: true,
  producer: true,
  operator: true,
  composer: true,
  cutting: true,
  genre: true,
  budget: true,
  boxoffice: true,
  runtime: true
};

const DEFAULT_SEARCH_OPTIONS = {
  limit: 5,
  parse: false,
  parsingOptions: DEFAULT_GET_OPTIONS
};

function _findCookie(cookies, cookieName) {
  'use strict';

  cookieName += '=';
  for (var i in cookies) {
    if (cookies[i].substr(0, cookieName.length) === cookieName) {
      return cookies[i];
    }
  }
}

function _getCsrfTokens() {
  'use strict';

  return request.getAsync(LOGIN_URL_GET_CSRF_TOKENS)
    .then(function(response) {
      if (response.statusCode !== 200) {
        throw new Error('Error status code from "' + LOGIN_URL_GET_CSRF_TOKENS + '" - ' + response.statusCode);
      }
      var $ = cheerio.load(response.body);
      var docBody = $('body')[0];
      var dataBem = docBody.attribs['data-bem'];
      var xCsrfToken = JSON.parse(dataBem).page.csrf;
      if (!xCsrfToken) {
        throw new Error('xCsrfToken is empty');
      }
      var cookieCsrfToken = _findCookie(response.headers['set-cookie'], 'csrftoken');
      if (!cookieCsrfToken) {
        throw new Error('Csrf is empty');
      }
      return [xCsrfToken, cookieCsrfToken];
    });
}

function doGetRequest(url, options) {
  'use strict';

  var requestOptions = {
    url: url,
    headers: {
      'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4,pl;q=0.2',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
    },
    encoding: 'binary'
  };
  if (options.loginData && options.loginData.cookies && options.loginData.cookies.length > 0) {
    var jar = request.jar();
    options.loginData.cookies.forEach(function(cookie) {
      jar.setCookie(request.cookie(cookie), 'http://www.kinopoisk.ru/');
    });
    requestOptions.jar = jar;
  }

  return request.get(requestOptions)
    .then(function(body) {
      return Iconv.decode(new Buffer(body, 'binary'), 'win1251');
    })
    .catch(function(err) {
      return new Error('Error while "' + url + '" processing. ' + err.message);
    });
}

function _getMultiInfo($, fieldName) {
  'use strict';

  return $('#infoTable td:contains("' + fieldName + '") ~ td').text().split(', ').map(function(item) {
    return item.replace(/\r\n|\n|\r|слова$|сборы$/gm, '').trim();
  }).filter(function(item) {
    return item != '...' && item != '-' && item != '';
  });
}

function _getInfo($, fieldName) {
  'use strict';

  return $('#infoTable td:contains("' + fieldName + '") ~ td a').first().text();
}

function _getActors($) {
  'use strict';

  return $('#actorList ul').first().find('li[itemprop="actors"] a').toArray().map(function(item) {
    if (item.children.length > 0) {
      return item.children[0].data;
    }
    return '';
  }).filter(function(item) {
    return item != '...';
  });
}

function _getType($) {
  'use strict';

  return $('#headerFilm .moviename-big span').text().indexOf('сериал') > -1 ? 'series' : 'movie';
}

function* getById(id, options) {
  'use strict';
  options = options || DEFAULT_GET_OPTIONS;

  return yield doGetRequest(FILM_URL + id, options)
    .then(function(body) {
      var $ = cheerio.load(body);
      var title = '';
      var titleElement = $('#headerFilm .moviename-big');
      if (titleElement.length > 0 && titleElement[0].children.length > 0) {
        title = titleElement[0].children[0].data.trim();
      }
      if (!title) {
        return null;
      } else {
        var result = {
          id: id + ''
        };
        if (options.title) result.title = title;
        if (options.rating) result.rating = parseFloat($('span.rating_ball').text());
        if (options.votes) result.votes = parseFloat($('span.ratingCount').text().replace(/\s/g, ''));
        if (options.alternativeTitle) result.alternativeTitle = $('#headerFilm span[itemprop="alternativeHeadline"]').text();
        if (options.description) result.description = $('.brand_words[itemprop="description"]').text();
        if (options.actors) result.actors = _getActors($);
        if (options.year) result.year = parseInt(_getInfo($, 'год'));
        if (options.country) result.country = _getMultiInfo($, 'страна');
        if (options.director) result.director = _getMultiInfo($, 'режиссер');
        if (options.scenario) result.scenario = _getMultiInfo($, 'сценарий');
        if (options.producer) result.producer = _getMultiInfo($, 'продюсер');
        if (options.operator) result.operator = _getMultiInfo($, 'оператор');
        if (options.composer) result.composer = _getMultiInfo($, 'композитор');
        if (options.cutting) result.cutting = _getMultiInfo($, 'монтаж');
        if (options.genre) result.genre = _getMultiInfo($, 'жанр');
        if (options.budget) result.budget = _getInfo($, 'бюджет');
        if (options.boxoffice) result.boxoffice = _getInfo($, 'сборы в мире');
        if (options.runtime) {
          result.runtime = $('.time').text();
          if (result.runtime === '-') {
            result.runtime = null;
          } else {
            result.runtime = result.runtime.substring(result.runtime.indexOf(' мин.'), -1);
          }
        }
        if (options.type) result.type = _getType($);

        result.peoples = [];

        for (var i in result.director) {
          result.peoples.push({
            'people': result.director[i],
            'role': '',
            'category': 'director'
          });
        }

        for (i in result.scenario) {
          result.peoples.push({
            'people': result.scenario[i],
            'role': '',
            'category': 'scenario'
          });
        }

        for (i in result.producer) {
          result.peoples.push({
            'people': result.producer[i],
            'role': '',
            'category': 'producer'
          });
        }

        for (i in result.composer) {
          result.peoples.push({
            'people': result.composer[i],
            'role': '',
            'category': 'composer'
          });
        }

        for (i in result.cutting) {
          result.peoples.push({
            'people': result.cutting[i],
            'role': '',
            'category': 'cutting'
          });
        }

        for (i in result.actors) {
          result.peoples.push({
            'people': result.actors[i],
            'role': '',
            'category': 'actors'
          });
        }

        return result;
      }
    })
    .catch(function(err) {
      console.log(err);
      return err;
    });
}

var getByIdPromisified = getById;

function search(query, options, callback) {
  'use strict';
  options = options || DEFAULT_SEARCH_OPTIONS;
  doGetRequest(SEARCH_URL + encodeURIComponent(query), options, function(err, body) {
    if (err) {
      callback(err);
    } else {
      var $ = cheerio.load(body);
      var films = $('.search_results .info a[href^="/level/1/film"]')
        .toArray()
        .splice(0, options.limit)
        .map(function(item) {
          var href = item.attribs.href;
          try {
            var id = /\/film\/(.+)\/sr\//.exec(href)[1];
            var title = item.children[0].data;
            return {
              id: id,
              title: title
            };
          } catch (err) {
            console.error('Parse href = ' + href, err);
          }
          return null;
        }).filter(function(item) {
          return item !== null;
        });
      if (options.parse) {
        P.map(films, function(film) {
          return getByIdPromisified(film.id, options.parsingOptions);
        }).then(function(result) {
          callback(null, result);
        }).catch(function(err) {
          callback(new Error('Error while parsing. ' + err.message));
        });
      } else {
        callback(null, films);
      }
    }
  });
}

function login(user, password, callback) {
  'use strict';

  _getCsrfTokens().spread(function(xCsrfToken, cookieCsrfToken) {
    var requestOptions = {
      url: LOGIN_URL_GET_SESSION_ID,
      headers: {
        'X-Csrf-Token': xCsrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': cookieCsrfToken,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
      },
      form: {
        login: user,
        password: password
      }
    };
    return request.postAsync(requestOptions);
  }).then(function(response) {
    var respBody = JSON.parse(response.body);
    if (respBody.status !== 'ok') {
      throw new Error(JSON.stringify(respBody));
    }
    var sessionId = _findCookie(response.headers['set-cookie'], 'Session_id');
    callback(null, {
      cookies: [sessionId]
    });
  }).catch(callback);
}

module.exports.getById = getById;
module.exports.search = search;
module.exports.login = login;
