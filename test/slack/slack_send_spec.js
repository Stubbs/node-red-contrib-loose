var sinon = require('sinon');
var assert = require('assert');
var proxyquire = require('proxyquire');

var helper = require('../helper.js');

var currentSlack;
var SlackStub = {
    connect: sinon.spy(),
    disconnect: sinon.spy()
};

var SlackSend = proxyquire('../../slack/81_slack_send',{

});

describe('SlackBot Out Node', function () {
    beforeEach(function(done) {

        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should load', function (done) {
        var flow = [{id: 'n1', type: 'slack-send'}];
        helper.load(SlackSend, flow, function () {
            // Do nothing.
            done();
        });
    });

    it('should show an error when there are no credentials.', function (done) {
        var flow = [{id: 'n1', type: 'slack-send', name: 'Slack Send Node'}];

        helper.load(SlackSend, flow, function () {});

        setTimeout((function () {
            try {
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == 'slack-send';
                });

                logEvents[0][0].should.have.a.property('msg');
                logEvents[0][0].msg.toString().should.startWith('errors.missing-config');

                done();
            } catch (e) { done(e) }
        }));
    });

    it.only('should connect when credentials are available', function (done) {
        // Create a mock Slack credentials node.
        var flow = [{id: 'n1', type: 'slack-credentials', token: 'token1', node_name: 'Slack Credentials Node'},
            {id: 'n2', type: 'slack-send', name: 'Slack Send Node', slack: 'n1'}];

        helper.load(SlackSend, flow, function () {
            try {
                var logEvents = helper.log().args.filter(function (evt) {
                    return evt[0].type == 'slack-send';
                });

                // Check that 'connect()' has been called.

                done();
            } catch (e) { done(e) }
        });
    });

});