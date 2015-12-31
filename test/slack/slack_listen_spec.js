var sinon = require('sinon');
var assert = require('assert');
var rewire = require('rewire');

var helper = require('../helper.js');

var SlackListen = require('../../slack/82_slack_listen');
var SlackCredentials = rewire('../../slack/80_slack_credentials');

var Slack = require('slack-client');

describe('SlackBot Listen Node', function () {
    var connectReset, mockClient, mockClientWrapper;
    var mockCredentials = {n1: {token: 'token1'}};

    beforeEach(function(done) {
        mockClient = sinon.createStubInstance(Slack);

        mockClientWrapper = {
            connect: sinon.stub().returns(mockClient)
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
        var flow = [{id: 'n1', type: 'slack-send', slack: 'slack-credentials'}, {id: 'slack-credentials', type: 'slack-credentials', node_name: 'Slack Credentials Node', reconnect: true, mark: true},];
        helper.load(SlackListen, flow, mockCredentials, function () {
            // Do nothing.
            done();
        });
    });

    it('should show an error when there are no credentials.', function (done) {
        var flow = [{id: 'n1', type: 'slack-listen', name: 'Slack Listen Node'}];

        helper.load(SlackListen, flow, function () {
            var logEvents = helper.log().args.filter(function (evt) {
                return evt[0].type == 'slack-listen';
            });

            logEvents[0][0].should.have.a.property('msg');
            logEvents[0][0].msg.toString().should.startWith('errors.missing-config');

            done();

        });
    });

    it('should connect and login when credentials are available', function () {
        // Create a mock Slack credentials node.
        var flow = [
            {id: 'n1', type: 'slack-credentials', node_name: 'Slack Credentials Node', reconnect: true, mark: true},
            {id: 'n2', type: 'slack-listen', name: 'Slack Send Node', slack: 'n1'}
        ];

        helper.load([SlackListen, SlackCredentials], flow, mockCredentials, function () {
            assert(mockClientWrapper.connect.calledOnce);
            assert(mockClientWrapper.connect.calledWith('token1', true, true));
            assert(mockClient.login.calledOnce);
        });
    });

    it.skip('should receive any messages sent to the channel', function (done) {
        var flow = [
            {id: 'n1', type: 'slack-credentials', node_name: 'Slack Credentials Node', reconnect: true, mark: true},
            {id: 'n2', type: 'slack-listen', name: 'Slack Send Node', slack: 'n1', wires: [['n3']]},
            {id: 'n3', type: 'helper'}
        ];

        helper.load([SlackListen, SlackCredentials], flow, mockCredentials, function () {
            var n3 = helper.getNode('n3');

            n3.on("input", function (msg) {
                msg.should.have.property('slack');

                done();
            });

            mockClient.emit('message', {
                'type': 'message'

            });
        });
    });
});