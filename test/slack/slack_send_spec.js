var sinon = require('sinon');
var assert = require('assert');
var rewire = require('rewire');

var helper = require('../helper.js');

var SlackSend = require('../../slack/81_slack_send');
var SlackCredentials = rewire('../../slack/80_slack_credentials');

var Slack = require('slack-client');

describe('SlackBot Out Node', function () {
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
        helper.load(SlackSend, flow, mockCredentials, function () {
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

    it('should connect and login when credentials are available', function () {
        // Create a mock Slack credentials node.
        var flow = [
            {id: 'n1', type: 'slack-credentials', node_name: 'Slack Credentials Node', reconnect: true, mark: true},
            {id: 'n2', type: 'slack-send', name: 'Slack Send Node', slack: 'n1'}
        ];

        helper.load([SlackSend, SlackCredentials], flow, mockCredentials, function () {});

        setTimeout(function () {
            assert(mockClientWrapper.connect.calledOnce);
            assert(mockClientWrapper.connect.calledWith('token1', true, true));
            assert(mockClient.login.calledOnce);
            assert(mockClient.on.calledTwice);
        });
    });

    it('should display an error message when no slack channel is provided.', function () {
        var flow = [
            {id: 'n1', type: 'slack-credentials', node_name: 'Slack Credentials Node', reconnect: true, mark: true},
            {id: 'n2', type: 'slack-send', name: 'Slack Send Node', slack: 'n1'},
            {id: 'n3', type: 'helper', wires:[["n2"]]}
        ];

        helper.load([SlackSend, SlackCredentials], flow, mockCredentials, function () {
            helper.getNode('n3').send({payload: 'Hello world'});
        });

        setTimeout(function () {
            var logEvents = helper.log().args.filter(function (evt) {
                return evt[0].type == 'slack-send';
            });

            logEvents[1][0].should.have.a.property('msg');
            logEvents[1][0].msg.toString().should.startWith('errors.no-slack-channel');
        });
    });

    it('should display an error if the channel cannot be found.', function () {
        var flow = [
            {id: 'n1', type: 'slack-credentials', node_name: 'Slack Credentials Node', reconnect: true, mark: true},
            {id: 'n2', type: 'slack-send', name: 'Slack Send Node', slack: 'n1', channel: 'test'},
            {id: 'n3', type: 'helper', wires:[["n2"]]}
        ];

        mockClient.getChannelGroupOrDMByID.returns(undefined);

        helper.load([SlackSend, SlackCredentials], flow, mockCredentials, function (done) {
            helper.getNode('n3').send({payload: 'Hello world'});
        });

        setTimeout(function () {
            var logEvents = helper.log().args.filter(function (evt) {
                return evt[0].type == 'slack-send';
            });

            logEvents[1][0].should.have.a.property('msg');
            logEvents[1][0].msg.toString().should.startWith('errors.slack-channel-doesnt-exist');

            mockClient.getChannelGroupOrDMByID.reset();
        });
    });

    it('should send a message to the channel in the node config if not overriden in the message.', function () {
        var flow = [
            {id: 'n1', type: 'slack-credentials', node_name: 'Slack Credentials Node', reconnect: true, mark: true},
            {id: 'n2', type: 'slack-send', name: 'Slack Send Node', slack: 'n1', channel: 'test'},
            {id: 'n3', type: 'helper', wires:[["n2"]]}
        ];

        helper.load([SlackSend, SlackCredentials], flow, mockCredentials, function () {
            var mockChannel = {send: sinon.spy()};

            mockClient.getChannelGroupOrDMByName.returns(mockChannel);

            helper.getNode('n3').send({payload: 'Hello world'});

            assert(mockClient.getChannelGroupOrDMByName.calledOnce);
            assert(mockClient.getChannelGroupOrDMByName.calledWith('test'));

            assert(mockChannel.send.calledOnce);

            mockClient.getChannelGroupOrDMByID.reset();
        });
    });

    it('should attempt to log in again if sending fails.', function () {
        var flow = [
            {id: 'n1', type: 'slack-credentials', node_name: 'Slack Credentials Node', reconnect: true, mark: true},
            {id: 'n2', type: 'slack-send', name: 'Slack Send Node', slack: 'n1', channel: 'test'},
            {id: 'n3', type: 'helper', wires:[["n2"]]}
        ];

        helper.load([SlackSend, SlackCredentials], flow, mockCredentials, function () {
            var mockChannel = {send: sinon.stub().returns(false)};

            mockClient.getChannelGroupOrDMByName.returns(mockChannel);

            helper.getNode('n3').send({payload: 'Hello world'});

            var logEvents = helper.log().args.filter(function (evt) {
                return evt[0].type == 'slack-send';
            });

            logEvents[1][0].should.have.a.property('msg');
            logEvents[1][0].msg.toString().should.startWith('errors.slack-unable-to-send');

            assert(mockChannel.send.calledOnce);
            assert(mockClient.login.calledTwice);

            mockClient.getChannelGroupOrDMByName.reset();
            mockClient.login.reset();
        });
    });
});