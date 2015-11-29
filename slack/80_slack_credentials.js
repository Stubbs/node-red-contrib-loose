module.exports = function(RED) {
    function SlackCredentialsNode(n) {
        RED.nodes.createNode(this,n);

        this.token = n.token;
        this.node_name = n.node_name;
    }

    function connect() {

    }

    RED.nodes.registerType("slack-credentials",SlackCredentialsNode);
}