import { useEffect, useRef, useState } from "react";
import "./ChatBot.css";

const suggestionQuestions = [
  "Looking for organic products",
  "Why is A2 Ghee the best?",
  "Want to switch to a healthier sweetener",
  "Track Order",
  "Book farm visits",
];

const feedbackOptions = [
  { label: "Bad", icon: "👎" },
  { label: "Okay", icon: "😐" },
  { label: "Good", icon: "🙂" },
  { label: "Great", icon: "👍" },
  { label: "Amazing", icon: "⭐" },
];

export default function ChatBot() {
  const [showTeaser, setShowTeaser] = useState(false);
  const [open, setOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedRating, setSelectedRating] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [input, setInput] = useState("");
  const [used, setUsed] = useState(false);

  const firstTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const intervalRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! How can I help you?",
    },
  ]);

  useEffect(() => {
    const showAutoTeaser = () => {
      if (used || open || showFeedback) return;

      setShowTeaser(true);

      hideTimerRef.current = setTimeout(() => {
        if (!used && !open && !showFeedback) {
          setShowTeaser(false);
        }
      }, 5000);
    };

    firstTimerRef.current = setTimeout(showAutoTeaser, 5000);
    intervalRef.current = setInterval(showAutoTeaser, 30000);

    return () => {
      clearTimeout(firstTimerRef.current);
      clearTimeout(hideTimerRef.current);
      clearInterval(intervalRef.current);
    };
  }, [used, open, showFeedback]);

  const addMessage = (from, text) => {
    setMessages((prev) => [...prev, { from, text }]);
  };

  const getReply = (question) => {
    const q = question.toLowerCase();

    if (q.includes("organic") || q.includes("product")) {
      return "We offer farm-fresh organic essentials like Ghee, Atta, Rice, Oils, Spices, Snacks and Jaggery. You can explore all products from the Shop page.";
    }

    if (q.includes("a2") || q.includes("ghee")) {
      return "A2 Ghee is preferred because it is made from desi cow milk and is known for its rich aroma, traditional taste and better digestion support.";
    }

    if (q.includes("sweetener") || q.includes("jaggery") || q.includes("sugar")) {
      return "For a healthier sweetener option, you can try natural jaggery products. They are commonly used as an alternative to refined sugar.";
    }

    if (q.includes("track") || q.includes("order status")) {
      return "You can track your order from My Account → Orders. Please login with your registered mobile/email to view order details.";
    }

    if (q.includes("farm") || q.includes("visit") || q.includes("book")) {
      return "Farm Visit booking is available from the Farm Life section. Select visit type, quantity and add it to cart. Our representative will confirm the visit schedule.";
    }

    if (q.includes("coupon") || q.includes("discount") || q.includes("offer")) {
      return "Available offers and coupons can be applied on the checkout page. Some coupons may work only for selected products or categories.";
    }

    if (q.includes("delivery") || q.includes("shipping")) {
      return "Delivery availability and shipping charges are shown during checkout based on your delivery address.";
    }

    if (q.includes("return") || q.includes("refund") || q.includes("cancel")) {
      return "Return, refund and cancellation depend on product type, condition and order status. Our support team will help you with the correct process.";
    }

    return "I can help you with organic products, A2 ghee, jaggery, farm visit booking, order tracking, coupons, delivery and support.";
  };

  const openChat = () => {
    setUsed(true);
    setShowTeaser(false);
    setShowFeedback(false);
    setOpen(true);
  };

  const sendMessage = (customQuestion) => {
    const question = customQuestion || input;
    if (!question.trim()) return;

    setUsed(true);
    setShowTeaser(false);
    setShowFeedback(false);
    setOpen(true);

    addMessage("user", question);
    setInput("");

    setTimeout(() => {
      addMessage("bot", getReply(question));
    }, 350);
  };

  const endChat = () => {
    setOpen(false);
    setShowFeedback(true);
  };

  const cancelFeedback = () => {
    setShowFeedback(false);
    setSelectedRating("");
    setFeedbackText("");
  };

  const sendFeedback = () => {
    const feedback = {
      rating: selectedRating,
      message: feedbackText,
      date: new Date().toISOString(),
    };

    localStorage.setItem("chatbot_feedback", JSON.stringify(feedback));

    setShowFeedback(false);
    setSelectedRating("");
    setFeedbackText("");
    setUsed(true);
  };

  return (
    <>
      {!open && !showFeedback && showTeaser && (
        <div className="bot-teaser" onClick={openChat}>
          <button
            className="bot-teaser-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowTeaser(false);
            }}
          >
            ×
          </button>
          <div className="bot-teaser-text">Hi 👋 How can I help you today?</div>
          <div className="bot-avatar">
            👨‍🌾
            <span />
          </div>
        </div>
      )}

      {open && (
        <div className="pro-chatbot">
          <div className="pro-chatbot-header">
            <strong>Help Center</strong>
            <div className="pro-chatbot-header-actions">
              <button className="end-chat-btn" onClick={endChat}>
                End chat
              </button>
              <button className="chat-close-btn" onClick={endChat}>
                ×
              </button>
            </div>
          </div>

          <div className="pro-chatbot-body">
            <div className="bot-name">Eko</div>

            {messages.map((msg, index) => (
              <div key={index} className={`pro-msg ${msg.from}`}>
                {msg.text}
              </div>
            ))}

            <div className="pro-suggestions">
              {suggestionQuestions.map((question, index) => (
                <button key={index} onClick={() => sendMessage(question)}>
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="pro-chatbot-input">
            <span className="attach-icon">📎</span>
            <input
              type="text"
              placeholder="Need Help? Ask us anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={() => sendMessage()}>➤</button>
          </div>

          <div className="powered-text">Powered by BusinessOnBot</div>
        </div>
      )}

      {showFeedback && (
        <div className="feedback-chatbox">
          <button className="feedback-floating-close" onClick={cancelFeedback}>
            ×
          </button>

          <div className="feedback-card">
            <span className="chat-closed-badge">Chat Closed</span>
            <h4>Thanks for the chat. How do you feel?</h4>

            <div className="rating-row">
              {feedbackOptions.map((item) => (
                <button
                  key={item.label}
                  className={selectedRating === item.label ? "active" : ""}
                  onClick={() => setSelectedRating(item.label)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <textarea
              placeholder="What are the main reasons for your rating?"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />

            <div className="feedback-actions">
              <button className="cancel-btn" onClick={cancelFeedback}>
                Cancel
              </button>
              <button className="send-feedback-btn" onClick={sendFeedback}>
                ✓ Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}