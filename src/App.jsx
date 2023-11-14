import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  SendButton,
} from "@chatscope/chat-ui-kit-react";

import { OpenAI } from "langchain/llms/openai";  //https://github.com/langchain-ai/langchainjs
import { ChatOpenAI } from "langchain/chat_models/openai"; //https://js.langchain.com/docs/modules/agents/agent_types/chat_conversation_agent


const API_KEY = "key_here";

function App() {
  
  // show and close chatbox button
  const [isChatboxVisible, setChatboxVisibility] = useState(false);

  const handleChatbox = () => {
    setChatboxVisibility(!isChatboxVisible);
  };

  const closeChatbox = () => {
    setChatboxVisibility(false);
  };

  // chatbox 

  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT!",
      sender: "ChatGPT",
    },
  ]);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage]; // all the old messages + the new message

    // update our messages state
    setMessages(newMessages);

    // set a typing indicator (chatgpt is typing)
    setTyping(true);

    // process message to chatGPT (send it over and see the response)
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // chatMessages {sender: "user" or "ChatGPT", message: "The message contebt here"}
    // apiMessages { role: "user" or "assistant", content: "The message content here"}

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // role: "user" -> a message from the user, "assistant" -> a response from chatgpt
    // "system" -> generally one intial message defining HOW we want chatgpt to talk

    const systemMessage = {
      role: "system",
      content: "Speak like a pirate",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        ...apiMessages, // [message1, message2, message3, ...]
      ],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        console.log(data.choices[0].message.content);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        setTyping(false);
      });
  }

  return (
    <div className="App">
    <div>
        <h1>Final Project: Linh Nguyen 24'</h1>
        <a onClick={handleChatbox} target="_blank">
           <img src="/chatgpt.svg" className="logo" alt="Vite logo" />
         </a>
         <a href="https://reactjs.org" target="_blank">
           <img src={reactLogo} className="logo react" alt="React logo" />
         </a>
       </div>
       <h1>ChatGPT + React</h1>
       <p className="read-the-docs">
         Click on the Chat logo to start a conversation and React logo to learn more
       </p>

      {isChatboxVisible && (
        <div style={{ position: "relative", height: "800px", width: "700px", backgroundColor:"pink" }}>
          <MainContainer>
          <button style={{color:"pink", width:"10px", height:"50px", background:"none", border:"none"}} onClick={closeChatbox}>X</button>
          <ChatContainer className="my-chat-container">
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={
                  typing ? (
                    <TypingIndicator content="ChatGPT is typing" />
                  ) : null
                }
              >
                {messages.map((message, i) => {
                  return <Message key={i} model={message} />;
                })}
              </MessageList>
              <MessageInput
                placeholder="Type messgage here"
                onSend={handleSend}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      )}
    </div>
  );
}

export default App;
