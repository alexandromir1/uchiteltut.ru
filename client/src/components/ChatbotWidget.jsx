import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatbotWidget = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get chatbot URL from environment variable or default
    const chatbotUrl = process.env.REACT_APP_CHATBOT_URL || 'http://localhost:4001';
    const baseUrl = process.env.REACT_APP_BASE_URL || window.location.origin;

    // Make navigate available globally for widget links (SPA routing)
    window.ReactRouter = { navigate };

    // Inject widget script if not already loaded
    if (!window.UchitelTutWidget && !document.getElementById('chatbot-widget-script')) {
      // Load CSS first
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${baseUrl}/widget.css`;
      document.head.appendChild(link);

      // Configure widget
      window.UchitelTutWidget = {
        endpoint: `${chatbotUrl}/chat`,
        title: 'Учитель Тут',
        greeting: 'Привет! Я помогу найти подходящую вакансию в сфере образования. Напишите, что ищете.',
        position: 'right',
        stylesheet: `${baseUrl}/widget.css`
      };

      // Load widget script
      const script = document.createElement('script');
      script.id = 'chatbot-widget-script';
      script.src = `${baseUrl}/widget.js`;
      script.async = true;
      script.onerror = () => {
        console.warn('Failed to load chatbot widget script');
      };
      document.body.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Don't remove script, just clean up reference
      if (window.ReactRouter && window.ReactRouter.navigate === navigate) {
        delete window.ReactRouter;
      }
    };
  }, [navigate]);

  return null; // Widget renders itself
};

export default ChatbotWidget;