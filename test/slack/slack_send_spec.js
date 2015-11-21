var SlackSend = require('../../slack/slack_send');
var helper = require('../helper.js');

describe('SlackBot Out Node', function () {
    beforeEach(function(done) {
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should load', function (done) {
        
        done();
    });
});