module.exports = function(RED) {
    function SlackSend(n) {
        RED.nodes.createNode(this, n);

        this.slack = RED.nodes.getNode(n.slack);

        if(this.slack) {
            this.slack.slackConnect();
        } else {
            this.error(RED._("errors.missing-config"));
        }

        var node = this;
    }

    RED.nodes.registerType('slack-send', SlackSend)
}