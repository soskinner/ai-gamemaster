export const MODULE_ID = 'ai-gamemaster';

export function registerSettings() {
    game.settings.register(MODULE_ID, 'enabled', {
        name: 'Enable AI GameMaster',
        hint: 'Toggle the module on or off.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    // This should be placed where your module settings are initialized
    game.settings.register(MODULE_ID, 'campaignTag', {
        name: "Campaign Tag",
        hint: "Enter a unique tag for the current campaign",
        scope: 'world',
        config: true,
        type: String,
        default: ""
    });

    game.settings.register(MODULE_ID, 'campaignDetails', {
        name: "Campaign Details",
        hint: "Enter details about the campaign to maintain context",
        scope: 'world',
        config: true,
        type: String,
        default: ""
    });


    game.settings.register(MODULE_ID, 'powerAutomateURL', {
        name: 'Power Automate URL',
        hint: 'The endpoint URL for your Power Automate flow.',
        scope: 'world',
        config: true,
        type: String,
        default: ''
    });

    game.settings.register(MODULE_ID, 'openAIKey', {
        name: 'OpenAI API Key',
        hint: 'Your OpenAI API Key.',
        scope: 'world',
        config: true,
        type: String,
        default: ''
    });

    game.settings.register(MODULE_ID, 'speechServiceKey', {
        name: 'Speech Service API Key',
        hint: 'Your Text-to-Speech service API key.',
        scope: 'world',
        config: true,
        type: String,
        default: ''
    });

    game.settings.register(MODULE_ID, 'enableChatResponse', {
        name: 'Enable Chat Responses',
        hint: 'Show AI-generated text responses in the chat.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, 'enableSpeech', {
        name: 'Enable Speech',
        hint: 'Play the AI-generated Text-to-Speech audio response in Foundry.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });
}
