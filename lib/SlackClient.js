'use strict';

var Slack = require('slack-client');

var SlackClient = {
    connect: function (token, reconnect, mark) {
        return new Slack(token, reconnect, mark);
    }
};

module.exports = SlackClient;