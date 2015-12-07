'use strict';

var SlackClient = require('../lib/SlackClient');

module.exports = function(RED) {
    function SlackCredentialsNode(n) {
        RED.nodes.createNode(this,n);

        this.token = n.token;
        this.reconnect = n.reconnect;
        this.mark = n.mark;
        this.node_name = n.node_name;

        this.slackConnect = function () {
            this.slackClient = SlackClient.connect(this.token, this.reconnect, this.mark);
            this.slackClient.on('open', function () {
                console.log('Connected to Slack team ' + this.slackClient.team.name + ' as user ' + this.slackClient.self.name);
            });
        };
    }

    RED.nodes.registerType("slack-credentials",SlackCredentialsNode);
};