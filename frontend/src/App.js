import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import Chatbot from "./Chatbot";
import Prediction from "./Prediction";
import Login from "./Login";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("chat");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return <Login setUser={setUser} />;
  }

  const currentUser = user;
  const userName = currentUser.email?.split("@")[0] || "User";

  return (
    <main className="app-dashboard">
      <aside className="app-sidebar">
        <div className="app-logo">
          <img src="/logo.png" alt="PashuDrishti Logo" />
        </div>

        <nav className="app-nav" aria-label="Primary">
          <button
            className={tab === "chat" ? "nav-item active" : "nav-item"}
            onClick={() => setTab("chat")}
            type="button"
          >
            <span aria-hidden="true">AI</span>
            Chatbot
          </button>
          <button
            className={tab === "predict" ? "nav-item active" : "nav-item"}
            onClick={() => setTab("predict")}
            type="button"
          >
            <span aria-hidden="true">IMG</span>
            Image AI
          </button>
        </nav>

        <div className="sidebar-card">
          <span className="status-dot" aria-hidden="true"></span>
          <div>
            <strong>System ready</strong>
            <p>Use chat guidance or image analysis for livestock checks.</p>
          </div>
        </div>
      </aside>

      <section className="app-main">
        <header className="app-header">
          <div>
            <p className="page-kicker">Welcome, {userName}</p>
            <h1>{tab === "chat" ? "Care Assistant" : "Livestock Analyzer"}</h1>
          </div>

          <button
            className="logout-button"
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              setUser(null);
            }}
          >
            Logout
          </button>
        </header>

        <section className="hero-strip" aria-label="Dashboard overview">
          <div>
            <span>Breed and disease support</span>
            <strong>Fast insight for better farm decisions</strong>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>2</strong>
              <span>AI tools</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>Backend linked</span>
            </div>
          </div>
        </section>

        <div className="workspace-panel">
          {tab === "chat" && <Chatbot user={currentUser} />}
          {tab === "predict" && <Prediction user={currentUser} />}
        </div>
      </section>
    </main>
  );
}

export default App;
