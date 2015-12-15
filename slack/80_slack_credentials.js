'use strict';

var SlackClient = require('../lib/SlackClient');

module.exports = function(RED) {
    function SlackCredentialsNode(n) {
        RED.nodes.createNode(this,n);

        this.token = this.credentials.token;
        this.reconnect = n.reconnect;
        this.mark = n.mark;
        this.node_name = n.node_name;

        this.slackClient = null;

        var node = this;

        this.slackConnect = function (credentials) {
            var slackClient;

            if(this.slackClient == null || !this.slackClient.connected) {
                slackClient = SlackClient.connect(credentials.token, this.reconnect, this.mark);

                slackClient.on('open', function () {
                    node.log('Connected to Slack team ' + slackClient.team.name + ' as user ' + slackClient.self.name);
                });

                slackClient.on('error', function (err) {
                    node.error('Bogus! Slack returned an error: ' + err);
                });

                slackClient.login();

                this.slackClient = slackClient;
            }

            return this.slackClient;
        };

        this.send = function (message) {
            if(!node.slackClient) {
                node.log('Easy tiger! Slack isn\'t connected yet!');
            }


        };
    }

    RED.nodes.registerType("slack-credentials",SlackCredentialsNode, { credentials: {token: {type: "text"}}});
};