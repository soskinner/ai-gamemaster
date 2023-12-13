import { MODULE_ID, registerSettings } from './settings.js';


class SplashScreen extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "ai-gamemaster-splash",
            title: "AI GameMaster",
            template: "modules/ai-gamemaster/templates/splash.html",
            width: 400,
            height: 300,
            resizable: false
        });
    }

    getData() {
        return {
            message: "Welcome to the AI GameMaster module! Make sure to set up your API keys and settings before starting."
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('.close-splash').click(() => {
            this.close();
        });
    }
}

// Add the function to create a journal entry in the compendium
async function createJournalEntryInCompendium(content) {
    let journalEntryData = {
        name: "AI Response",
        content: content
    };
    let journalEntry = new JournalEntry(journalEntryData);

    let pack = game.packs.get('ai-gamemaster.ai-gamemaster-responses');
    await pack.importDocument(journalEntry);
}

Hooks.once('init', () => {
    registerSettings();
});

Hooks.once('ready', () => {
    if (game.user.isGM) {
        new SplashScreen().render(true);
    }
});

Hooks.on('createChatMessage', async (chatMessage, options, userId) => {
    if (!game.settings.get(MODULE_ID, 'enabled') || !chatMessage.isContentVisible || chatMessage.type !== CONST.CHAT_MESSAGE_TYPES.IC) {
        return;
    }

    // Only proceed for players (not the GM) and check message type
    if (game.user.isGM || chatMessage.type !== CONST.CHAT_MESSAGE_TYPES.IC) {
        return;
    }

    // Emit a socket message to the GM
    game.socket.emit('module.ai-gamemaster', {
        action: 'processMessage',
        content: chatMessage.content,
        userId: chatMessage.user.id
    });

    game.socket.on('module.ai-gamemaster', async (data) => {
        // Only process the message if the current user is the GM
        if (!game.user.isGM || data.action !== 'processMessage') {
            return;
        }
    
        // Now process the message content
        const messageContent = data.content;
        const userId = data.userId;
    
        // Add your logic here to process the message
        // For example, sending it to OpenAI, then to Speechify, etc.
    

    // Process only messages from the player who sent them
    // if (chatMessage.user.id == game.user.id) {
    //     return;
    // }

    // Process only in-character messages
    // if (chatMessage.type == CONST.CHAT_MESSAGE_TYPES.IC) {
    //     return;
    // }

    const messageText = chatMessage.content;
    const campaignTag = game.settings.get(MODULE_ID, 'campaignTag');
    const campaignDetails = game.settings.get(MODULE_ID, 'campaignDetails');

    //ui.notifications.info(messageText, {permanent: true});

    console.log("*** Chat message detected for campaign:", messageText);

    // Define the data to be sent to OpenAI
    const odata = {
        model: "gpt-3.5-turbo",
        messages: [{
            role: "system",
            content: `You are a Dungeon Master with a deep understanding of Disney and table top RPGs. You are also a creative storyteller who can weave a compelling and imaginative tale. ALL responses should be from the perspective of the GM talking to the party about ${campaignDetails} in a mysterious and entertaining tone and as part of the story being told.  Keep the immersion high.  Keep the responses to under 100 words.`
        }, {
            role: "user",
            content: messageText.replace(campaignTag, "").trim()
        }]
    };

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${game.settings.get(MODULE_ID, 'openAIKey')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(odata)
    });

    const openAIData = await openAIResponse.json();
    const aiResponseMessage = openAIData.choices && openAIData.choices.length > 0 ? openAIData.choices[0].message : null;
    const aiResponseText = aiResponseMessage && aiResponseMessage.role === 'assistant' ? aiResponseMessage.content.trim() : null;

    console.log("OpenAI Response:", openAIData);

    if (!aiResponseText) {
        console.error("Couldn't get a response from OpenAI");
        return;
    }

    // Display the AI response as a notification for all users
    ui.notifications.info(aiResponseText, {permanent: true});

    // Save the AI response in a compendium
    createJournalEntryInCompendium(aiResponseText);

    const form = new FormData();
    form.append('text', aiResponseText);
    form.append('voice_id', 'F5WzfKjBrBhGR7eTWVgUq');
    form.append('language', 'english');
    form.append('stability', '0.75');
    form.append('clarity', '0.75');

    const proxyUrl = 'https://corsproxy.io/?';
    const targetUrl = 'https://myvoice.speechify.com/api/tts/clone';

    const speechifyResponse = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
        method: 'POST',
        headers: {
            'accept': '/',
            'x-api-key': game.settings.get(MODULE_ID, 'speechServiceKey')
        },
        body: form
    });

    const speechifyData = await speechifyResponse.json();

    if (game.settings.get(MODULE_ID, 'enableSpeech')) {
        let sound = new Howl({
            src: [speechifyData.url],
            autoplay: true
        });
    }
});
});
