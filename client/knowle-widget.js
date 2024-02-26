const chatBotTemplate = `
<div id="knowle-widget">
  <div id="chat-container" style="display: none;">
      <div id="knowle-header">
        <div id="logo">
          <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <path
              d="m633.28 347.29-91.17 18.4-31.46 94.91 116.35-56.51q3.16-28.41 6.28-56.8z"
              fill="#fff"
            />
            <path d="m281.21 347.29 91.18 18.4 31.46 94.91-116.37-56.51z" fill="#fff" />
            <path
              d="m691.82 510.4a227.35 227.35 0 0 0 -52.11 92.9 501.94 501.94 0 0 0 85 187c26.63-31.07 73.26-99.64 61-188-7.88-56.65-36.57-97.9-58.79-122.21a221.13 221.13 0 0 0 -35.1 30.31z"
              fill="#8282ff"
            />
            <path
              d="m345.68 204.54a272.64 272.64 0 0 1 41.2 24.2 289.92 289.92 0 0 1 67.2 67.07 272.75 272.75 0 0 1 60.27-60.87c10-7.32 25.83-17.79 54.29-30.49a244 244 0 0 0 -223 .09z"
              fill="#8282ff"
            />
            <path
              d="m828.67 596.33c-11.12-79.92-56.53-133.8-83.07-159.14v-14.7a287.15 287.15 0 0 0 -74-192.59 80.08 80.08 0 0 0 8.25-3.68c6.15-3.22 27.15-14.56 36.84-39.28a70.72 70.72 0 0 0 4.76-25.7 598.89 598.89 0 0 0 -101.37 23.44 287.66 287.66 0 0 0 -324.82-.61 488.92 488.92 0 0 0 -102.26-23.77 73.44 73.44 0 0 0 6.46 28.7c8.27 18.24 22.09 28.07 30 33.7a104.58 104.58 0 0 0 12.87 7.83 287.17 287.17 0 0 0 -73.44 192v76.25c0 202.43 164.69 367.12 367.13 367.12h169.38a40.21 40.21 0 0 0 39.6-33.54c25.5-26.36 100.48-115.24 83.67-236.03zm-371.42-418.79a243.29 243.29 0 0 1 111.39 26.91c-28.46 12.7-44.27 23.17-54.29 30.49a272.75 272.75 0 0 0 -60.27 60.87 289.92 289.92 0 0 0 -67.2-67.07 272.64 272.64 0 0 0 -41.2-24.2 243.41 243.41 0 0 1 111.57-27zm78.75 644.92c-178.51 0-323.73-145.22-323.73-323.72v-76.25a244.26 244.26 0 0 1 77.73-178.74 248.49 248.49 0 0 1 57.92 26.65 253.65 253.65 0 0 1 105.8 136.11 266.11 266.11 0 0 1 36.51-70.28c13.25-18.22 33.7-46.33 69.68-66.17 15.12-8.34 39-18.9 63.86-27a244.31 244.31 0 0 1 78.42 179.42v22a264.45 264.45 0 0 0 -42.05 36.28c-30.14 32.24-52.24 72.49-63.77 116.46a21.75 21.75 0 0 0 -.23 10 541.14 541.14 0 0 0 98.64 215.19zm209.6-59.89a286.71 286.71 0 0 1 -20.89 27.69 504.55 504.55 0 0 1 -32.91-51.12q-5-8.94-9.66-18a503.47 503.47 0 0 1 -42.43-117.84 227.35 227.35 0 0 1 52.11-92.9c3.33-3.55 6.81-6.94 10.37-10.27a223 223 0 0 1 24.7-20 247.89 247.89 0 0 1 18.71 23.17q3.21 4.5 6.37 9.41l.14.21q3.14 4.86 6.15 10.11c.12.21.23.42.35.62 1.8 3.15 3.55 6.42 5.26 9.78.26.53.54 1 .8 1.57 1.79 3.59 3.53 7.28 5.18 11.1l.48 1.17q2.16 5.06 4.1 10.39c.33.89.66 1.78 1 2.68 1.4 4 2.73 8 3.94 12.21.1.37.19.76.3 1.13 1.07 3.81 2 7.72 2.91 11.7.26 1.13.5 2.26.73 3.4.91 4.43 1.74 8.93 2.39 13.56.7 5 1.15 9.93 1.48 14.81.1 1.48.15 2.93.22 4.4.16 3.49.25 7 .24 10.36v4.48q-.14 5.83-.59 11.52c-.06.78-.08 1.57-.15 2.35-.4 4.52-1 8.95-1.63 13.31-.2 1.25-.43 2.47-.65 3.71-.54 3.15-1.13 6.26-1.79 9.33-.32 1.45-.64 2.9-1 4.33-.71 3-1.47 5.91-2.29 8.81-.33 1.2-.64 2.43-1 3.62q-1.71 5.74-3.65 11.25c-.47 1.33-1 2.6-1.47 3.91-.9 2.41-1.81 4.8-2.77 7.14-.67 1.63-1.35 3.23-2 4.83-.84 1.93-1.69 3.82-2.56 5.69-.76 1.64-1.51 3.29-2.29 4.89s-1.71 3.38-2.58 5.05q-2.52 4.92-5.14 9.52c-.55 1-1.09 2-1.64 2.9-1.17 2-2.35 3.94-3.53 5.86l-1.38 2.21c-1.28 2-2.56 4-3.85 6z"
              fill="#fff"
            />
          </svg>
        </div>
        Knowλe
      </div>
      <div id="chat-window">
      </div>
      <div id="chat-bottom-window">
        <div id="loading-animation-container" style="display: none;">
          <div id="loading-animation"></div>
          <div id="loading-animation"></div>
          <div id="loading-animation"></div>
        </div>
        <div id="input-container">
          <input type="text" id="user-input" placeholder="Send a message.">
          <button id="send-message-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.00016 10.0002H1.23607L18.7643 1.23607L10.0002 18.7642V12.0002C10.0002 10.8956 9.10473 10.0002 8.00016 10.0002Z" stroke="#fff" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
  </div>
  <div id="chat-bot">
      <button id="open-chat">
        <div id="logo">
          <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <path
              d="m633.28 347.29-91.17 18.4-31.46 94.91 116.35-56.51q3.16-28.41 6.28-56.8z"
              fill="#fff"
            />
            <path d="m281.21 347.29 91.18 18.4 31.46 94.91-116.37-56.51z" fill="#fff" />
            <path
              d="m691.82 510.4a227.35 227.35 0 0 0 -52.11 92.9 501.94 501.94 0 0 0 85 187c26.63-31.07 73.26-99.64 61-188-7.88-56.65-36.57-97.9-58.79-122.21a221.13 221.13 0 0 0 -35.1 30.31z"
              fill="#8282ff"
            />
            <path
              d="m345.68 204.54a272.64 272.64 0 0 1 41.2 24.2 289.92 289.92 0 0 1 67.2 67.07 272.75 272.75 0 0 1 60.27-60.87c10-7.32 25.83-17.79 54.29-30.49a244 244 0 0 0 -223 .09z"
              fill="#8282ff"
            />
            <path
              d="m828.67 596.33c-11.12-79.92-56.53-133.8-83.07-159.14v-14.7a287.15 287.15 0 0 0 -74-192.59 80.08 80.08 0 0 0 8.25-3.68c6.15-3.22 27.15-14.56 36.84-39.28a70.72 70.72 0 0 0 4.76-25.7 598.89 598.89 0 0 0 -101.37 23.44 287.66 287.66 0 0 0 -324.82-.61 488.92 488.92 0 0 0 -102.26-23.77 73.44 73.44 0 0 0 6.46 28.7c8.27 18.24 22.09 28.07 30 33.7a104.58 104.58 0 0 0 12.87 7.83 287.17 287.17 0 0 0 -73.44 192v76.25c0 202.43 164.69 367.12 367.13 367.12h169.38a40.21 40.21 0 0 0 39.6-33.54c25.5-26.36 100.48-115.24 83.67-236.03zm-371.42-418.79a243.29 243.29 0 0 1 111.39 26.91c-28.46 12.7-44.27 23.17-54.29 30.49a272.75 272.75 0 0 0 -60.27 60.87 289.92 289.92 0 0 0 -67.2-67.07 272.64 272.64 0 0 0 -41.2-24.2 243.41 243.41 0 0 1 111.57-27zm78.75 644.92c-178.51 0-323.73-145.22-323.73-323.72v-76.25a244.26 244.26 0 0 1 77.73-178.74 248.49 248.49 0 0 1 57.92 26.65 253.65 253.65 0 0 1 105.8 136.11 266.11 266.11 0 0 1 36.51-70.28c13.25-18.22 33.7-46.33 69.68-66.17 15.12-8.34 39-18.9 63.86-27a244.31 244.31 0 0 1 78.42 179.42v22a264.45 264.45 0 0 0 -42.05 36.28c-30.14 32.24-52.24 72.49-63.77 116.46a21.75 21.75 0 0 0 -.23 10 541.14 541.14 0 0 0 98.64 215.19zm209.6-59.89a286.71 286.71 0 0 1 -20.89 27.69 504.55 504.55 0 0 1 -32.91-51.12q-5-8.94-9.66-18a503.47 503.47 0 0 1 -42.43-117.84 227.35 227.35 0 0 1 52.11-92.9c3.33-3.55 6.81-6.94 10.37-10.27a223 223 0 0 1 24.7-20 247.89 247.89 0 0 1 18.71 23.17q3.21 4.5 6.37 9.41l.14.21q3.14 4.86 6.15 10.11c.12.21.23.42.35.62 1.8 3.15 3.55 6.42 5.26 9.78.26.53.54 1 .8 1.57 1.79 3.59 3.53 7.28 5.18 11.1l.48 1.17q2.16 5.06 4.1 10.39c.33.89.66 1.78 1 2.68 1.4 4 2.73 8 3.94 12.21.1.37.19.76.3 1.13 1.07 3.81 2 7.72 2.91 11.7.26 1.13.5 2.26.73 3.4.91 4.43 1.74 8.93 2.39 13.56.7 5 1.15 9.93 1.48 14.81.1 1.48.15 2.93.22 4.4.16 3.49.25 7 .24 10.36v4.48q-.14 5.83-.59 11.52c-.06.78-.08 1.57-.15 2.35-.4 4.52-1 8.95-1.63 13.31-.2 1.25-.43 2.47-.65 3.71-.54 3.15-1.13 6.26-1.79 9.33-.32 1.45-.64 2.9-1 4.33-.71 3-1.47 5.91-2.29 8.81-.33 1.2-.64 2.43-1 3.62q-1.71 5.74-3.65 11.25c-.47 1.33-1 2.6-1.47 3.91-.9 2.41-1.81 4.8-2.77 7.14-.67 1.63-1.35 3.23-2 4.83-.84 1.93-1.69 3.82-2.56 5.69-.76 1.64-1.51 3.29-2.29 4.89s-1.71 3.38-2.58 5.05q-2.52 4.92-5.14 9.52c-.55 1-1.09 2-1.64 2.9-1.17 2-2.35 3.94-3.53 5.86l-1.38 2.21c-1.28 2-2.56 4-3.85 6z"
              fill="#fff"
            />
          </svg>
        </div>
      </button>
  </div>
</div>
`;

function appendUserMessage(message) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  const userImage = document.createElement("img");
  userImage.src =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='white'%3E%3Cpath d='M230.92 212c-15.23-26.33-38.7-45.21-66.09-54.16a72 72 0 1 0-73.66 0c-27.39 8.94-50.86 27.82-66.09 54.16a8 8 0 1 0 13.85 8c18.84-32.56 52.14-52 89.07-52s70.23 19.44 89.07 52a8 8 0 1 0 13.85-8ZM72 96a56 56 0 1 1 56 56 56.06 56.06 0 0 1-56-56Z' /%3E%3C/svg%3E";
  userImage.classList.add("user-image");

  const messageText = document.createElement("div");
  messageText.innerText = message;
  messageText.classList.add("message-text");

  messageContainer.appendChild(userImage);
  messageContainer.appendChild(messageText);

  chatWindow.appendChild(messageContainer);
}

function appendBotMessage(message) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  const botImage = document.createElement("img");
  botImage.src =
    "data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='135 170 650 650'%3E%3Cdefs%3E%3Cstyle%3E.cls-1{fill:%238282ff;}%3C/style%3E%3C/defs%3E%3Cpath d='M627.27,352.23,539,370,508.6,461.87l112.6-54.68Q624.23,379.71,627.27,352.23Z'/%3E%3Cpath d='M286.58,352.23,374.81,370l30.44,91.84L292.64,407.19Z'/%3E%3Cpath class='cls-1' d='M693.9,519.11a210.85,210.85,0,0,0-47.71,84A477,477,0,0,0,719.66,769c25.06-31.94,59.94-91.38,49.58-165.87-6.71-48.14-29.64-84.32-49.31-107.41A204.31,204.31,0,0,0,693.9,519.11Z'/%3E%3Cpath d='M828.67,594.87C817.45,514.21,771.4,460.09,745,435V425a286.73,286.73,0,0,0-69.21-187l0,0c6-3.11,26.28-14.09,35.62-38A68.39,68.39,0,0,0,716,175.09a753.22,753.22,0,0,0-90.61,16.45,286.57,286.57,0,0,0-174-54.52A282.24,282.24,0,0,0,291.1,190.59a631.23,631.23,0,0,0-86.42-16.4,71,71,0,0,0,6.21,27.74c8,17.65,21.38,27.16,29,32.61.58.41,1.12.73,1.7,1.11A295.18,295.18,0,0,0,168.9,429.83v68.95C168.9,700,332,863,533.15,863H745v-32C770.25,805,845.53,716.06,828.67,594.87ZM456.92,197a226.53,226.53,0,0,1,93.26,20c-11.72,5.51-21.17,11.11-28,16.56-11.42,9.12-22.23,19.67-22.23,19.67a304.63,304.63,0,0,0-42.66,52.09,287.72,287.72,0,0,0-37.49-46.85,329.67,329.67,0,0,0-28.53-25.23c-6.87-5.31-16.07-10.86-27.28-16.39A226.71,226.71,0,0,1,456.92,197ZM533.15,803C365.39,803,228.9,666.54,228.9,498.78V425a227.52,227.52,0,0,1,75.54-169.37,193.42,193.42,0,0,1,50.13,25.1c50.32,35.19,68.7,83.8,74.28,100.87l27.39,72.52,28.57-72.06c5.66-17.23,24.22-66.11,74.87-101.65a196,196,0,0,1,49.38-25.07A227.47,227.47,0,0,1,684.94,425v22.18A264.12,264.12,0,0,0,650.1,478.1c-30.23,32.29-52.31,72.61-63.85,116.59a29.92,29.92,0,0,0-.31,13.89A535.58,535.58,0,0,0,670.27,803ZM770.7,642c-.06,1-.14,2.05-.22,3.07-.24,3.17-.56,6.3-.94,9.4-.09.65-.15,1.31-.23,2-.49,3.55-1.07,7-1.73,10.47-.2,1.06-.42,2.1-.64,3.15q-.83,4-1.78,7.89c-.23.91-.44,1.84-.67,2.74q-1.25,4.72-2.67,9.28c-.36,1.16-.74,2.3-1.12,3.44q-1.05,3.18-2.17,6.28c-.41,1.15-.82,2.3-1.25,3.43q-1.54,4.07-3.21,8c-.55,1.3-1.12,2.56-1.69,3.83q-1.05,2.35-2.13,4.65c-.63,1.33-1.25,2.66-1.89,4-1.12,2.26-2.26,4.49-3.41,6.66h0A266.14,266.14,0,0,1,719.66,769a475.33,475.33,0,0,1-57.28-110.87c-.1-.26-.18-.53-.28-.79-1.5-4.21-3-8.44-4.36-12.69-.28-.86-.53-1.72-.8-2.57-1.18-3.68-2.35-7.37-3.44-11.09-.56-1.9-1.06-3.81-1.6-5.72-.76-2.7-1.54-5.4-2.25-8.11q-1.83-7-3.46-14c1.1-3.69,2.31-7.34,3.59-11,.46-1.3,1-2.56,1.46-3.84.86-2.28,1.73-4.55,2.66-6.79.65-1.57,1.35-3.12,2-4.67.84-1.88,1.69-3.75,2.57-5.6s1.66-3.4,2.52-5.08,1.67-3.19,2.53-4.77c1-1.81,2-3.63,3-5.41.75-1.3,1.55-2.56,2.33-3.84,1.2-2,2.4-3.95,3.67-5.88.37-.57.78-1.11,1.16-1.68a202.11,202.11,0,0,1,20.17-25.51,204.31,204.31,0,0,1,26-23.38,220.28,220.28,0,0,1,36.41,59.55c.15.36.28.73.43,1.09q1.38,3.45,2.67,7l.81,2.35q1.05,3,2,6.16c.3,1,.59,2,.88,2.94.58,2,1.12,4,1.64,6,.28,1.06.56,2.12.82,3.19.51,2.12,1,4.29,1.42,6.46.2,1,.42,2,.61,3,.6,3.17,1.15,6.39,1.61,9.67.57,4.15,1,8.23,1.27,12.29.08,1.06.15,2.11.21,3.16.21,3.66.35,7.28.36,10.85,0,.38,0,.76,0,1.13C771.09,634.45,770.94,638.26,770.7,642Z'/%3E%3Cpath class='cls-1' d='M364,216.85c11.21,5.53,20.41,11.08,27.28,16.39a329.67,329.67,0,0,1,28.53,25.23,287.72,287.72,0,0,1,37.49,46.85,304.63,304.63,0,0,1,42.66-52.09s10.81-10.55,22.23-19.67c6.84-5.45,16.29-11.05,28-16.56a227.16,227.16,0,0,0-186.2-.15Z'/%3E%3C/svg%3E";
  botImage.classList.add("bot-image");

  const messageText = document.createElement("div");
  messageText.innerText = message;
  messageText.classList.add("message-text");

  messageContainer.appendChild(botImage);
  messageContainer.appendChild(messageText);

  chatWindow.appendChild(messageContainer);
}

async function handleUserInput() {
  const userInputValue = userInput.value.trim();
  if (userInputValue !== "") {
    appendUserMessage(userInputValue);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    userInput.value = "";

    showLoadingIndicator();
    const botResponse = await generateBotResponse(userInputValue);

    appendBotMessage(botResponse);
    hideLoadingIndicator();
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

async function generateBotResponse(userInput) {
  let answer = "";

  try {
    const aborter = new AbortController();
    const response = await fetch("https://knowle-api.lambdaworks.io/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: userInput,
      }),
      signal: aborter.signal,
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let loopRunner = true;

    while (loopRunner) {
      const { value } = await reader.read();

      const decodedChunkString = decoder.decode(value, { stream: true });

      let dataIndex = decodedChunkString.indexOf("data:");
      let eventIndex = decodedChunkString.indexOf("event:");

      while (dataIndex !== -1 && eventIndex !== -1) {
        const jsonData = decodedChunkString.substring(
          dataIndex + 5,
          eventIndex
        );

        const decodedChunk = JSON.parse(jsonData);

        let eventType = null;
        const eventTypeMatch = decodedChunkString.match(/event:(\w+)/);
        if (eventTypeMatch) {
          eventType = eventTypeMatch[1];
        }

        if (eventType === "in_progress") {
          if (decodedChunk.messageToken) {
            answer += decodedChunk.messageToken;
          }
        } else if (eventType === "finish") {
          if (decodedChunk.relevantDocuments?.length) {
            answer += "\n\nRelevant documents:\n";
            decodedChunk.relevantDocuments.map(
              (document) => (answer += document.source + ", ")
            );
          }
          loopRunner = false;
          break;
        }

        dataIndex = decodedChunkString.indexOf("data:", eventIndex);
        eventIndex = decodedChunkString.indexOf("event:", dataIndex);
      }
    }

    if (!loopRunner) {
      aborter.abort();
    }
  } catch (error) {
    console.error("Error fetching bot response:", error);
    return "Sorry, something went wrong. Please try again later.";
  }

  return answer || "I don't know.";
}

const chatBotContainer = document.createElement("div");
chatBotContainer.innerHTML = chatBotTemplate;

document.body.appendChild(chatBotContainer);

// CONSTANTS
const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const chatWindow = document.getElementById("chat-window");
const openChatButton = document.getElementById("open-chat");
const sendMessageButton = document.getElementById("send-message-button");
let initialMessageAdded = false;

// EVENT FUNCTIONS
userInput.addEventListener("keydown", async function (event) {
  if (event.key === "Enter") {
    await handleUserInput();
  }
});

sendMessageButton.addEventListener("click", async function () {
  await handleUserInput();
});

openChatButton.addEventListener("click", function () {
  const chatContainerStyle = chatContainer.style;
  if (
    chatContainerStyle.display === "none" ||
    chatContainerStyle.display === ""
  ) {
    showLoadingIndicator();
    chatContainer.classList.remove("scale-down-animation");
    chatContainer.classList.add("scale-up-animation");
    chatContainerStyle.display = "block";

    if (!initialMessageAdded) {
      initialMessageAdded = true;
      // Append initial question
      setTimeout(() => {
        const initialQuestion = "Hi, I am Knowλe!\nHow can I assist you today?";
        appendBotMessage(initialQuestion);
        hideLoadingIndicator();
      }, 1000);
    } else {
      hideLoadingIndicator();
    }
  } else {
    chatContainer.classList.remove("scale-up-animation");
    chatContainer.classList.add("scale-down-animation");

    setTimeout(() => {
      chatContainerStyle.display = "none";
      chatContainer.classList.remove("scale-down-animation");
    }, 300); // Wait for animation to complete before hiding the container
  }
});

function showLoadingIndicator() {
  const loadingIndicator = document.getElementById(
    "loading-animation-container"
  );
  loadingIndicator.style.display = "flex";
}

function hideLoadingIndicator() {
  const loadingIndicator = document.getElementById(
    "loading-animation-container"
  );
  loadingIndicator.style.display = "none";
}

// STYLES

function appendStyles() {
  const styleElement = document.createElement("style");

  const css = `
    #knowle-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;

      z-index: 2147483647;
    }

    #chat-container {
      bottom: 20px;
      right: 20px;
      transform-origin: bottom right;
    }

    #chat-window {
      width: 300px;
      height: 300px;
      border: 1px solid #a1a1a1;
      overflow-y: scroll;
      background: black;
      position: relative;
      border-bottom: 0;
      border-top:0;

      padding-left: 10px;
      padding-right: 10px;
      padding-top: 10px;
      padding-bottom: 5px;
    }

    #user-input {
      padding: 15px;
      width: 100%;
      margin-top: 10px;
      padding: 10px;
      border: 1px solid #a1a1a1;
      background: black;
      border-radius: 6px;
      font-size: 15px;
      color: white;
      padding-right: 40px;

      position: relative;
    }

    #user-input::placeholder {
      color: #a1a1a1;
      font-size: 14px;
    }

    #open-chat {
      color: white;
      background: black;
      padding: 10px;
      border-radius: 40px;
      border: 1px solid #a1a1a1;
      transition: transform 0.3s; 
    }

    #open-chat:hover {
      transform: scale(1.2);
    }

    #knowle-header {
      display: flex;
      flex-direction: row;
      align-items: center;
      border: 1px solid #a1a1a1;
      padding: 10px;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
      background: black;
    }

    #logo {
      width: 40px;
      height: 40px;
    }

    #chat-bot {
      margin-top: 20px;
      text-align: end;
    }

    #chat-bottom-window {
      position: relative;
      bottom: 10px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: black;
      border: 1px solid #a1a1a1;
      border-top: 0;
      padding: 10px;

      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px; 
    }

    #made-by {
      font-size: 9px;
      color: #a1a1a1;
      text-align: center;
      padding-top: 10px;
    }

    #loading-animation-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }

    #loading-animation {
      width: 5px;
      height: 5px;
      margin-left: 2px;
      background-color: #fff;
      border-radius: 50%;
      animation: bounce 0.8s infinite ease-in-out;
    }
    
    #loading-animation:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    #loading-animation:nth-child(3) {
      animation-delay: 0.4s;
    }

    #input-container {
      position: relative;
    }

    #send-message-button {
      position: absolute;
      right: 15px;
      top: 23px;
    }
    
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }

    .message-container {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 0.5px solid #a1a1a1;
    }

    .user-image {
      border: 1px solid #a1a1a1;
      padding: 5px;
      width: 25px;
      height: 25px;
      margin-right: 10px;
      border-radius: 6px;
    }

    .bot-image {
      border: 1px solid white;
      padding: 5px;
      width: 25px;
      height: 25px;
      margin-right: 10px;
      border-radius: 6px;
      background: white;
    }

    .message-text {
      font-size: 14px;
      padding-top: 2px;
    }

    #lambdaworks:hover {
      color: white;
      transition: color 0.3s ease-in-out; 
    }

    @keyframes scale-up {
      0% {
        transform: scale(0);
      }
      100% {
        transform: scale(1);
      }
    }
    
    .scale-up-animation {
      animation: scale-up 0.3s ease-in-out forwards;
    }

    @keyframes scale-down {
      0% {
        transform: scale(1);
      }
      100% {
        transform: scale(0);
      }
    }

    .scale-down-animation {
      animation: scale-down 0.3s ease-in-out forwards;
    }
    
  `;

  styleElement.appendChild(document.createTextNode(css));

  document.head.appendChild(styleElement);
}

appendStyles();
