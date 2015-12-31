module.exports = function(RED) {
    function SlackListen(n) {
        RED.nodes.createNode(this, n);

        this.slack = RED.nodes.getNode(n.slack);
        this.channel = n.channel;

        var node = this;;

        if(this.slack) {
            var credentials = RED.nodes.getCredentials(this.slack.id);

            this.slack.slackConnect(credentials);

            var slack = this.slack;

            this.slack.slackClient.on('message', function(message) {
                var msg = {
                    payload: message.txt
                };

                var slackChannel = slack.slackClient.getChannelGroupOrDMByID(message.channel);
                var fromUser = slack.slackClient.getUserByID(message.user);

                /*
                 { type: 'message',
                 channel: 'G0E2DCG66',
                 user: 'U0B3W53LK',
                 text: '<@U0E28CRU5>: Listen',
                 ts: '1450657138.000003',
                 team: 'T0B432JH0' }
                 */

                var mentionsRE = /<@(.*?)>/g;
                var mentions = mentionsRE.exec(message.text);

                var toUser = null;

                if(mentions && mentions.length > 0) {
                    toUser  = slack.slackClient.getUserByID(mentions[1]);
                }

                msg.slack = {
                    "id": message.id,
                    "type": message.type,
                    "channel": slackChannel,
                    "from": fromUser,
                    "to": toUser,
                    "mentions": mentions
                };

                node.send(msg);
            });

        } else {
            this.error(RED._("errors.missing-config"));
        }
    }

    RED.nodes.registerType('slack-listen', SlackListen)
}
