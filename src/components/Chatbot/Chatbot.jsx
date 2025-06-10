import { useState, useEffect, useRef } from "react";

const Chatbot = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatHistoryRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const simulateTyping = (message, callback) => {
    let index = 0;
    typingIntervalRef.current = setInterval(() => {
      index++;
      setChatHistory((prevHistory) => {
        const newHistory = [...prevHistory];
        const lastIndex = newHistory.length - 1;
        if (newHistory[lastIndex]?.sender === "bot") {
          newHistory[lastIndex].text = message.slice(0, index);
        }
        return newHistory;
      });
      if (index >= message.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        if (callback) callback();
      }
    }, 50);
  };

  useEffect(() => {
    if (showChat && chatHistory.length === 0) {
      const welcomeText = `Hello! I’m <strong>ARIA</strong>—your <strong>Advanced Response & Interaction Assistant</strong>, How Can I help you today?`;
      setLoading(true);
      setChatHistory([{ sender: "bot", text: "" }]);
      simulateTyping(welcomeText, () => {
        setTimeout(() => {
          setLoading(false);
        }, 100000000);
      });
    }
  }, [showChat, chatHistory.length]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleChatIconClick = () => {
    setShowChat(true);
    setIsMinimized(false);
  };

  const handleInputChange = (e) => {
    setUserMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: "user", text: userMessage },
    ]);
    setUserMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://1612-14-195-33-10.ngrok-free.app/api/ask/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: userMessage }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.response;

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "bot", text: "" },
      ]);

      simulateTyping(botReply, () => {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      });
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        {
          sender: "bot",
          text: "Sorry, there was an error processing your request.",
        },
      ]);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handleStopButtonClick = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setLoading(false);
    setShowForm(true);
  };

  const handleMinimizeClick = () => {
    setIsMinimized(true);
  };

  return (
    <>
      {!showChat && (
        <div className="chat-icon" onClick={handleChatIconClick}>
          <i className="fa-solid fa-comment text-white helping-chat px-2"></i>
          <div className="help-chart">
            <div className="d-flex">
              <span role="img" aria-label="chat">
                <i className="fa-solid fa-comment text-white px-2"></i>
              </span>
              <p className="m-0 text-white ">Help</p>
            </div>
          </div>
        </div>
      )}

      {showChat && !isMinimized && (
        <div className="chatbot-container fade-in">
          <div className="chat-header-container">
            <h2 className="chat-header">
              Chat with ARIA
              <span
                role="img"
                aria-label="chat"
                style={{ fontSize: "3rem", marginLeft: "8px" }}
              >
                🤵🏻‍♀️
              </span>
            </h2>
            <button className="minimize-button" onClick={handleMinimizeClick}>
              x
            </button>
          </div>
          <div className="chat-history" ref={chatHistoryRef}>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender} slide-up`}
              >
                <strong>
                  {msg.sender === "user" ? "[You]" : "[ARIA]"} :-{" "}
                </strong>
                <span dangerouslySetInnerHTML={{ __html: msg.text }} />
              </div>
            ))}
          </div>
          {loading ? (
            <div
              className="stop-button ripple"
              onClick={handleStopButtonClick}
            ></div>
          ) : (
            showForm && (
              <form onSubmit={handleSubmit} className="chat-form">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={userMessage}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
                <button type="submit" disabled={loading}>
                  Send
                </button>
              </form>
            )
          )}
        </div>
      )}

      {showChat && isMinimized && (
        <div className="chat-icon" onClick={handleChatIconClick}>
          <i className="fa-solid fa-comment text-white helping-chat px-2"></i>
          <div className="help-chart">
            <div className="d-flex">
              <span role="img" aria-label="chat">
                <i className="fa-solid fa-comment text-white px-2"></i>
              </span>
              <p className="m-0 text-white ">Help</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
