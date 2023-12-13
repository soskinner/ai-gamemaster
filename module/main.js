import { MODULE_ID, registerSettings } from './settings.js';

Hooks.once('init', () => {
    registerSettings();
});

Hooks.once('ready', () => {
    if (game.user.isGM) {
        new SplashScreen().render(true);
    }
});

// Hooks.on('createChatMessage', async (chatMessage, options, userId) => {
//     if (!game.settings.get(MODULE_ID, 'enabled') || !chatMessage.isContentVisible || chatMessage.type !== CONST.CHAT_MESSAGE_TYPES.IC) {
//         return;
//     }

//     const messageText = chatMessage.content;

//     console.log("Chat message detected:", messageText);


//     // 1. Call OpenAI to generate a response
//     // const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
//     //     method: 'POST',
//     //     headers: {
//     //         'Authorization': `Bearer ${game.settings.get(MODULE_ID, 'openAIKey')}`,
//     //         'Content-Type': 'application/json'
//     //     },
//     //     body: JSON.stringify({
//     //         prompt: messageText,
//     //         max_tokens: 150
//     //     })
//     // });

//     // if (!openAIResponse.ok) {
//     //     console.error("OpenAI API call failed:", openAIResponse.statusText);
//     //     return;
//     // }

//     // 2. Define the data to be sent to OpenAI
//     const odata = {
//         model: "gpt-3.5-turbo",
//         messages: [
//         {
//             role: "system",
//             content: "You are a Dungeon Master with a deep understanding of 5e and Pathfinder 1 and 2.  You are also a creative storyteller who can weave a compelling and imanginative tale."
//         },
//         {
//             role: "user",
//             content: messageText
//         }
//         ]
//     };

// //     // 3. Call OpenAI to generate a response
//     const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${game.settings.get(MODULE_ID, 'openAIKey')}`,
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(odata) 
//     });

// // if (!openAIResponse.ok) {
// //     console.error("OpenAI API call failed:", openAIResponse.statusText);
// //     return;
// // }

// // // 5. Handle the response from OpenAI
// // const responseJson = await openAIResponse.json();
// // // Do something with responseJson.messages


//     const openAIData = await openAIResponse.json();
//     const aiResponseMessage = openAIData.data && openAIData.data.length > 0 ? openAIData.data[openAIData.data.length - 1] : null;
//     //const aiResponseText = aiResponseMessage && aiResponseMessage.role === 'assistant' ? aiResponseMessage.content.trim() : null;
//     const aiResponseText = openAIData.choices && openAIData.choices[0] && openAIData.choices[0].message && openAIData.choices[0].message.content.trim();



//     console.log("OpenAI Response:", openAIData);

//     if (!aiResponseText) {
//         console.error("Couldn't get a response from OpenAI");
//         return;
//     }

//     // Send AI response to chat
//     ChatMessage.create({
//         user: game.userId,
//         content: aiResponseText,
//         type: CONST.CHAT_MESSAGE_TYPES.IC
//     });

//     // 2. Send AI response to Speechify to get audio
//     const form = new FormData();
//     form.append('text', aiResponseText);
//     form.append('voice_id', 'F5WzfKjBrBhGR7eTWVgUq');
//     form.append('language', 'english');
//     form.append('stability', '0.75');
//     form.append('clarity', '0.75');

//     const speechifyResponse = await fetch('https://myvoice.speechify.com/api/tts/clone', {
//         method: 'POST',
//         headers: {
//             'accept': 'application/json',
//             'x-api-key': game.settings.get(MODULE_ID, 'speechServiceKey')
//         },
//         body: form
//     });

//     const speechifyData = await speechifyResponse.json();

//     // 3. Play the audio in Foundry VTT
//     if (game.settings.get(MODULE_ID, 'enableSpeech')) {
//         let sound = new Howl({
//             src: [speechifyData.url],
//             autoplay: true
//         });
//     }

//     const data = await response.json();

//     if (game.settings.get(MODULE_ID, 'enableChatResponse')) {
//         ChatMessage.create({
//             user: game.user._id,
//             content: data.textResponse
//         });
//     }

//     if (game.settings.get(MODULE_ID, 'enableSpeech')) {
//         let sound = new Howl({
//             src: [data.mp3Url],
//             autoplay: true
//         });
//     }
// });

Hooks.on('createChatMessage', async (chatMessage, options, userId) => {
    if (!game.settings.get(MODULE_ID, 'enabled') || !chatMessage.isContentVisible || chatMessage.type !== CONST.CHAT_MESSAGE_TYPES.IC) {
        return;
    }

    const messageText = chatMessage.content;
    const campaignTag = game.settings.get(MODULE_ID, 'campaignTag');
    const campaignDetails = game.settings.get(MODULE_ID, 'campaignDetails');

    // // Check if the message is related to the campaign
    // if (!messageText.includes(campaignTag)) {
    //     return; // Ignore messages not tagged with the campaign tag
    // }

    if (chatMessage.user === game.userId || chatMessage.speaker.alias === "GM") {
        return; // Ignore messages from the GM (AI responses)
    }

    // Check if the message is addressed to the GM
    if (!messageText.startsWith("GM:") && !messageText.startsWith("@GM")) {
        return; // Ignore messages not addressed to the GM
    }

    console.log("Chat message detected for campaign:", messageText);

    // Define the data to be sent to OpenAI
    const odata = {
        model: "gpt-3.5-turbo",
        messages: [
        {
            role: "system",
            content: `You are a Dungeon Master with a deep understanding of Disney and table top RPGs. You are also a creative storyteller who can weave a compelling and imaginative tale. ALL responses should be from the perspective of the GM talking to the party about ${campaignDetails} in a mysterious and entertaining tone and as part of the story being told.  Keep the immersion high.  Keep the responses to under 100 words.`
        },
        {
            role: "user",
            content: messageText.replace(campaignTag, "").trim() // Remove the campaign tag from the user message
        }
        ]
    };

    // Call OpenAI to generate a response
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${game.settings.get(MODULE_ID, 'openAIKey')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(odata) 
    });

    // Handle the response from OpenAI
    const openAIData = await openAIResponse.json();
    const aiResponseMessage = openAIData.choices && openAIData.choices.length > 0 ? openAIData.choices[0].message : null;
    const aiResponseText = aiResponseMessage && aiResponseMessage.role === 'assistant' ? aiResponseMessage.content.trim() : null;

    console.log("OpenAI Response:", openAIData);

    if (!aiResponseText) {
        console.error("Couldn't get a response from OpenAI");
        return;
    }

    //Send AI response to chat with the campaign tag
    ChatMessage.create({
        user: game.userId,
        speaker: { alias: "GM" }, // Set the alias to "GM" to mark it as an AI response
        content: `${aiResponseText}`,
        type: CONST.CHAT_MESSAGE_TYPES.IC
    });

   
    const form = new FormData();
        form.append('text', aiResponseText);
        form.append('voice_id', 'F5WzfKjBrBhGR7eTWVgUq');
        form.append('language', 'english');
        form.append('stability', '0.75');
        form.append('clarity', '0.75');

    // const speechifyResponse = await fetch('https://myvoice.speechify.com/api/tts/clone', {
    //     method: 'POST',
    //     headers: {
    //         'accept': '/',
    //         'x-api-key': game.settings.get(MODULE_ID, 'speechServiceKey')
    //     },
    //     body: form
    // });

    const proxyUrl = 'https://corsproxy.io/?';
    const targetUrl = 'https://myvoice.speechify.com/api/tts/clone';

    const speechifyResponse = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'x-api-key': game.settings.get(MODULE_ID, 'speechServiceKey')
        },
        body: form
    });


    const speechifyData = await speechifyResponse.json();

    // 3. Play the audio in Foundry VTT
    if (game.settings.get(MODULE_ID, 'enableSpeech')) {
        let sound = new Howl({
            src: [speechifyData.url],
            autoplay: true
        });
    }

    // const data = await response.json();

    // if (game.settings.get(MODULE_ID, 'enableChatResponse')) {
    //     // ChatMessage.create({
    //     //     user: game.user._id,
    //     //     content: data.textResponse
    //     // });
    // }

    // if (game.settings.get(MODULE_ID, 'enableSpeech')) {
    //     let sound = new Howl({
    //         src: [data.mp3Url],
    //         autoplay: true
    //     });
    // }
});


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
