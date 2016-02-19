import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'dummy/tests/helpers/start-app';
import Pretender from 'pretender';
import fetch from 'fetch';
var application;
var server;

module('Acceptance: Root', {
  beforeEach: function() {
    server = new Pretender();
    window.FetchTest.responseFns = {};
    application = startApp();
  },

  afterEach: function() {
    server.shutdown();
    Ember.run(application, 'destroy');
  }
});

test('uses browser fetch if available', function(assert) {
  var done = assert.async();
  var originalFetch = window.FetchTest.mockFetch;
  window.FetchTest.mockFetch = function(url) {
    assert.equal('/upload-with-window-fetch', url, 'Global fetch should be used');
    done();
  };

  fetch('/upload-with-window-fetch');

  window.FetchTest.mockFetch = originalFetch;
});

test('visiting /', function(assert) {
  server.get('/omg.json', function() {
    return [
      200,
      { 'Content-Type': 'text/json'},
      JSON.stringify({ name: 'World' })
    ];
  });

  visit('/');

  andThen(function() {
    assert.equal(currentPath(), 'index');
    assert.equal($.trim($('.fetch').text()), 'Hello World! fetch');
    assert.equal($.trim($('.ajax').text()), 'Hello World! ajax');
  });
});
test('posting a string', function(assert) {
  server.post('/upload', function(req) {
    assert.equal(req.requestBody, 'foo');
    return [
      200,
      { 'Content-Type': 'text/json'},
      JSON.stringify({ name: 'World' })
    ];
  });
  return fetch('/upload', {
    method: 'post',
    body: 'foo'
  }).then(function (res) {
    assert.equal(res.status, 200);
    return res.json();
  }).then(function (data) {
    assert.equal(data.name, 'World');
  });
});
test('posting a form', function(assert) {
  server.post('/upload', function(req) {
    assert.ok(req.requestBody instanceof window.FormData);
    return [
      200,
      { 'Content-Type': 'text/json'},
      JSON.stringify({ name: 'World' })
    ];
  });
  var form = new window.FormData();
  form.append('foo', 'bar');
  return fetch('/upload', {
    method: 'post',
    body: form
  }).then(function (res) {
    assert.equal(res.status, 200);
    return res.json();
  }).then(function (data) {
    assert.equal(data.name, 'World');
  });
});
