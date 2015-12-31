module.exports = function(RED) {
    function SlackSend(n) {
        RED.nodes.createNode(this, n);

        this.slack = RED.nodes.getNode(n.slack);
        this.channel = n.channel;

        var node = this;
        var slack = this.slack;

        if(this.slack) {
            var credentials = RED.nodes.getCredentials(slack.id);

            this.slack.slackConnect(credentials);

            this.on('input', function (message) {
                // Get the channel to send the message to.
                var chan = message.channel ? message.channel : node.channel;

                node.log('Sending message "' + message.payload + '" to slack channel ' + chan);

                if(chan) {
                    var slackChannel = slack.slackClient.getChannelGroupOrDMByName(chan);

                    if(slackChannel) {
                        if(!slackChannel.send(message.payload)) {
                            node.error("errors.slack-unable-to-send");

                            // @TODO Resend the message somehow.

                            slack.slackClient.login();
                        }
                    } else {
                        node.error(RED._("errors.slack-channel-doesnt-exist"));
                    }
                } else {
                    node.error(RED._("errors.no-slack-channel"));
                }
            });
        } else {
            this.error(RED._("errors.missing-config"));
        }
    }

    RED.nodes.registerType('slack-send', SlackSend)
}