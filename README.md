#Slack Client for Node-RED

[![Build Status](https://travis-ci.org/Stubbs/node-red-loose.svg?branch=master)](https://travis-ci.org/Stubbs/node-red-loose)

#Installation
Just install this plugin to your Node Red installation by using npm: `npm install node-red-contrib-loose` in your Node Red root directory

#Usage

Drag a Slack receive or send node onto the canvas and add your Slackbot credentials to the config node, then you're 
ready to go.

The `slack-send` node also allows choose a channel to send messages to in it's config, and you can override that by setting the `channel` property of the message.

The `slack-listen` node can share the same connection as the `slack-send` node, and listens to all the channels the bot is subscribed to, it always listens for direct messages. When it receives a message it sends it on with some extra info added:

```
{
    "payload": 'message',
    "slack": {
        "id": message.id,
        "type": message.type,
        "channel": slackChannel,
        "from": fromUser,
        "to": 'firstUserMentioned',
        "mentions": ['All', 'Users', 'mentioned']
    }
}
```

The message payload will contain the raw version of the message sent. 
