var proxyquire = require("proxyquire");

var sinon = require('sinon');
var assert = require('assert');
var rewire = require('rewire');

var helper = require('../helper.js');

var SlackSend = require('../../slack/81_slack_send');
var SlackCredentials = rewire('../../slack/80_slack_credentials');

var Slack = require('slack-client');

describe('SlackBot Out Node', function () {
    var connectReset, mockCLient, mockClientWrapper;

    beforeEach(function(done) {
        mockCLient = sinon.createStubInstance(Slack);

        mockClientWrapper = {
            connect: sinon.stub().returns(mockCLient)
        };

        connectReset = SlackCredentials.__set__('SlackClient', mockClientWrapper);

        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload();
        helper.stopServer(done);

        connectReset();
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

    it('should connect when credentials are available', function (done) {
        // Create a mock Slack credentials node.
        var flow = [
            {id: 'n1', type: 'slack-credentials', token: 'token1', node_name: 'Slack Credentials Node', reconnect: true, mark: true},
            {id: 'n2', type: 'slack-send', name: 'Slack Send Node', slack: 'n1'}
        ];

        helper.load([SlackSend, SlackCredentials], flow, function () {});

        setTimeout(function () {
            try {
                assert(mockClientWrapper.connect.calledOnce);
                assert(mockCLient.on.calledOnce);

                // Need to set up the right mock for what 'SlackClient.connect' returns

                done();
            } catch (e) { done(e) }
        });
    });

});