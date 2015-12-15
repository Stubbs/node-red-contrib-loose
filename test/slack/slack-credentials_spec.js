var SlackCredentialsNode = require('../../slack/80_slack_credentials');
var helper = require('../helper.js');

describe('Slack Credentials Node', function () {
    beforeEach(function(done) {
        helper.startServer(done);
    });

    afterEach(function(done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should load', function (done) {
        var flow = [{id: 'n1', type: 'slack-credentials'}];
        helper.load(SlackCredentialsNode, flow, function () {
            // Do nothing, the test will fail if done() is not called.
            done();
        });
    });

    it('should have the right values', function (done) {
        var flow = [{id: 'n1', type: 'slack-credentials', name: 'Slack Credentials Node', token: 'token1'}];

        helper.load(SlackCredentialsNode, flow, function () {
            var confNode = helper.getNode('n1');

            // @TODO Need to work out how to inject credentials.
            //confNode.should.have.property('token', 'token1');
            confNode.should.have.property('name', 'Slack Credentials Node');

            done();
        });
    });
});