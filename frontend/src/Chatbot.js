import { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMsg = { sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedInput }),
      });

      const data = await res.json();

      const aiMsg = { sender: "ai", text: data.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Unable to connect to the backend right now." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <section className="chatbot-view">
      <div className="tool-heading">
        <div>
          <span>AI consultation</span>
          <h2>Ask about symptoms, care, and next steps</h2>
        </div>
      </div>

      <div className="chat-window">
        {messages.length === 0 && (
          <div className="empty-chat">
            <strong>Start a livestock care question</strong>
            <p>
              Try asking about visible symptoms, feed concerns, breed care, or
              when to contact a veterinarian.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            className={msg.sender === "user" ? "message-row user" : "message-row ai"}
            key={`${msg.sender}-${index}`}
          >
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}

        {loading && (
          <div className="message-row ai">
            <div className="typing-bubble">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      <div className="chat-composer">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about a cow, buffalo, goat, or general livestock care..."
          rows="1"
        />

        <button onClick={send} disabled={loading || !input.trim()} type="button">
          Send
        </button>
      </div>
    </section>
  );
}

export default Chatbot;
