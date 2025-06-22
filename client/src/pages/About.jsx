import React from 'react';

export default function About() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6bbcff, #a979ff)',
      padding: '3rem 1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '2.5rem',
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: 1.7,
        color: '#333',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#222' }}>About MoodTune</h1>

        <p><strong>MoodTune</strong> is more than a playlist generator—it's a <em>vibe translator</em>. Music should meet you where you are: nostalgic, electric, peaceful, or somewhere beautifully undefined.</p>

        <p>Just describe your mood—typed or spoken—and MoodTune’s AI translates it into emotional themes, sonic textures, and genre blends to craft the perfect playlist. It's not just personalization—it <em>feels</em> right.</p>

        <p>Each track tells a story. Each playlist says: <em>"I see you."</em></p>

        <p>Whether you're journaling in a thunderstorm, dancing solo in your kitchen, or wandering city streets lost in thought—MoodTune finds the soundtrack for it.</p>

        <hr style={{ margin: '2.5rem 0', borderColor: '#eee' }} />

        <h2 style={{ fontSize: '2rem', color: '#222', marginBottom: '1rem' }}>About Me</h2>

        <p>Hi, I’m <strong>Cedric Xu</strong>—UC Berkeley student, music lover, and builder.</p>

        <p>MoodTune was born on a solo Bay Trail bike ride—cool wind, golden sunset, and a feeling I couldn't name. I wanted music that matched it. But nothing I searched for quite fit.</p>

        <p>So I asked: <em>what if I could just describe how I feel—and something would understand?</em></p>

        <p>That thought became this project. That feeling became MoodTune.</p>

        <hr style={{ margin: '2.5rem 0', borderColor: '#eee' }} />

        <h2 style={{ fontSize: '2rem', color: '#222', marginBottom: '1rem' }}>Tech Behind the Magic</h2>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
          <li><strong>React</strong> for the frontend</li>
          <li><strong>Node.js</strong> and <strong>Express</strong> for the backend</li>
          <li><strong>PostgreSQL</strong> for data persistence</li>
          <li><strong>OpenAI API</strong> for mood interpretation</li>
          <li><strong>Spotify API</strong> for music recommendations</li>
          <li><strong>Web Speech API</strong> for voice-to-mood input</li>
          <li><strong>Formspree</strong> for contact</li>
          <li>And a sprinkle of creativity & curiosity ✨</li>
        </ul>

        <hr style={{ margin: '2.5rem 0', borderColor: '#eee' }} />

        <h2 style={{ fontSize: '2rem', color: '#222', marginBottom: '1rem' }}>How It Works</h2>
        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>
          🎙️ Speak → 🧠 Analyze → 🎨 Translate → 🎧 Play
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
          <li>Tap the mic and describe your mood</li>
          <li>AI interprets tone, words, and sentiment</li>
          <li>Maps emotion to genres, textures, and themes</li>
          <li>Returns a playlist that *feels* like it gets you</li>
        </ul>

        <hr style={{ margin: '2.5rem 0', borderColor: '#eee' }} />

        <h2 style={{ fontSize: '2rem', color: '#222', marginBottom: '1rem' }}>Let’s Connect</h2>
        <p>Want to collaborate, give feedback, or just say hi?</p>
        <p>
          📬 <strong>Email</strong>: <a 
            href="mailto:cedrichxu@gmail.com" 
            style={{ 
              color: '#000', 
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              textDecorationColor: '#d1d5db',
              transition: 'all 0.2s ease'
            }}
          >
            cedrichxu@gmail.com
          </a><br />
          💻 <strong>GitHub</strong>: <a 
            href="https://github.com/cedricxu312" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#000', 
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              textDecorationColor: '#d1d5db',
              transition: 'all 0.2s ease'
            }}
          >
            github.com/cedricxu312
          </a>
        </p>

        <hr style={{ margin: '2.5rem 0', borderColor: '#eee' }} />

        <p style={{
          fontSize: '1.2rem',
          textAlign: 'center',
          fontStyle: 'italic',
          color: '#444'
        }}>
          Welcome to MoodTune. Let’s soundtrack your feelings—one moment at a time.
        </p>
      </div>
    </div>
  );
}
