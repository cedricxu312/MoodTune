import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

export default function Contact() {
  const [state, handleSubmit] = useForm("mdkzlolg");

  if (state.succeeded) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '4rem auto',
        padding: '2rem',
        borderRadius: '12px',
        backgroundColor: '#e6ffed',
        color: '#2e7d32',
        textAlign: 'center',
        fontSize: '1.2rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        ✅ Thanks! Your message has been sent.
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6bbcff, #a979ff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        color: '#333'
      }}>
        <h1 style={{
          fontSize: '2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#000000'
        }}>
          Contact Me
        </h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name" style={{ fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
            Your Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '6px'
            }}
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} />

          <label htmlFor="email" style={{ fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
            Your Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '6px'
            }}
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />

          <label htmlFor="message" style={{ fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
            Your Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows="6"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '6px',
              resize: 'vertical'
            }}
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} />

          <button
            type="submit"
            disabled={state.submitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#3399ff',
              color: '#fff',
              fontWeight: '600',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
          >
            {state.submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
