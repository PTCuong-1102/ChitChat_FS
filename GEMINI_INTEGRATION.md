# Gemini AI Integration

This document explains how to use the new Gemini AI integration in your ChitChat application.

## Features

- **AI Bot Configuration**: Set up and configure AI bots using Google's Gemini API
- **Real-time AI Responses**: Chat with AI bots that respond automatically to your messages
- **Secure API Key Management**: API keys are handled securely in the backend
- **Multiple AI Models**: Support for different Gemini models (currently Gemini 1.5 Flash)

## Backend Setup

The backend has been updated with the following new endpoints:

### Gemini API Endpoints

1. **Test Connection**: `GET /api/gemini/test`
   - Tests if the Gemini API is working correctly

2. **Generate Response**: `POST /api/gemini/generate`
   - Generates an AI response for a given prompt
   - Request body: `{ "prompt": "Your message" }`

3. **Configure Bot**: `POST /api/gemini/configure`
   - Configures a new AI bot with API credentials
   - Request body: `{ "botName": "Bot Name", "model": "gemini-1.5-flash", "provider": "gemini", "apiKey": "your-api-key" }`

## Frontend Integration

### Using the AI Bot

1. **Configure the Bot**:
   - Click on the "+" button in the server list
   - Select "Google Gemini" as the provider
   - Enter your Gemini API key
   - Choose a name for your bot
   - Click "Configure Bot"

2. **Chat with the Bot**:
   - Select your configured AI bot from the server list
   - Start typing messages
   - The bot will automatically respond to your messages

### Key Components

- **`ConfigureAIBotModal`**: Modal for setting up new AI bots
- **`apiService`**: Updated with Gemini API methods
- **`ChatContext`**: Handles AI responses automatically
- **`ChatInterface`**: Manages bot configuration and chat interactions

## Configuration Files

### Backend Configuration

The backend uses the following configuration in `application.yml`:

```yaml
gemini:
  api-key: "your-api-key-here"
  api-url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
  model: "gemini-1.5-flash"
```

### Frontend Configuration

The frontend automatically detects the environment and uses the appropriate API base URL:

- **Development**: `http://localhost:8080`
- **Production**: Uses relative URLs

## Security Considerations

1. **API Key Storage**: API keys are securely stored and managed in the backend
2. **Authentication**: All API calls require valid JWT authentication
3. **CORS**: Properly configured CORS settings for secure cross-origin requests

## Usage Tips

1. **API Key**: Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Model Selection**: Currently supports Gemini 1.5 Flash model
3. **Response Time**: AI responses have a 1-second delay to feel more natural
4. **Error Handling**: Proper error handling for API failures

## Troubleshooting

### Common Issues

1. **"AI response generation failed"**: Check your API key and internet connection
2. **"Configuring bot failed"**: Ensure your API key is valid and the backend is running
3. **No AI responses**: Make sure the bot is properly configured and the backend endpoints are accessible

### Backend Logs

Check the backend logs for detailed error messages:
```bash
# In your backend directory
mvn spring-boot:run
```

### Frontend Debugging

Check the browser console for any JavaScript errors or network issues.

## Future Enhancements

- Support for more AI providers (OpenAI, Claude, etc.)
- Conversation history context
- Custom system prompts
- File upload support for AI analysis
- Voice message integration
