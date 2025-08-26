# Story Rewriter

A TypeScript web application with an interface for story rewriting using a fine-tuned OpenAI model.

## Features

- **Clean, Professional Interface**: Design with responsive layout
- **Intelligent Text Processing**: Automatic paragraph splitting and processing
- **Side-by-Side Comparison**: View original and rewritten text in parallel
- **Progress Tracking**: Real-time progress indicators and status updates
- **Error Handling**: Comprehensive retry logic with exponential backoff
- **Copy & Download**: Easy copying and downloading of rewritten content
- **Rate Limiting**: Manages API requests to avoid rate limits

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**

   **Option A - Use the setup script:**
   ```bash
   npm run setup
   ```

   **Option B - Create manually:**
   Create a `.env` file in the root directory with your OpenAI configuration:
   ```bash
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_OPENAI_MODEL=your_fine_tuned_model_id
   VITE_SYSTEM_MESSAGE=your_system_message_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173/`

### Building for Production

```bash
npm run build
npm run preview
```

## How to Use

1. **Paste your story** into the text input area
2. **Click "Rewrite Story"** or press Ctrl+Enter
3. **Watch the progress** as each paragraph is processed
4. **Review the side-by-side comparison** of original vs rewritten text
5. **Copy or download** the complete rewritten story

## API Configuration

The application requires OpenAI API configuration through environment variables. Create a `.env` file in the root directory with:

```bash
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_OPENAI_MODEL=your_fine_tuned_model_id
VITE_SYSTEM_MESSAGE=your_system_instructions
```

**Note**: The `.env` file is automatically ignored by git to keep your API keys secure.

## Technical Details

### Architecture
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS with responsive design
- **Icons**: Lucide React
- **API**: OpenAI GPT-4 fine-tuned model

### Key Components
- `StoryInput`: Text input interface with validation
- `ComparisonView`: Side-by-side paragraph comparison
- `ProgressTracker`: Real-time progress monitoring
- `CopyButton`: Copy and download functionality
- `OpenAIService`: API integration with error handling

### Error Handling
- Automatic retry logic (up to 5 attempts)
- Exponential backoff with jitter
- Rate limiting (max 3 concurrent requests)
- User-friendly error messages

## Security Notes

⚠️ **Important Security Information**:

1. **Environment Variables**: API keys are stored in `.env` file which is excluded from git
2. **Browser Security**: The API key is still exposed in the browser for development. For production, implement a backend proxy
3. **Clean Repository**: This repository has a clean git history with no sensitive data

## Development

### Project Structure
```
src/
├── components/          # React components
├── services/           # API services
├── utils/              # Utility functions
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
└── App.css             # Styling
```

### Available Scripts
- `npm run setup` - Interactive setup for environment variables
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Common Issues

1. **Blank page**: Check browser console for JavaScript errors
2. **Environment variable errors**: Ensure `.env` file exists with all required variables
3. **API errors**: Verify API key and model name are correct in `.env` file
4. **Build errors**: Run `npm run build` to check for TypeScript errors
5. **Text not visible**: Clear browser cache and refresh the page

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify your API key is valid
3. Ensure all dependencies are installed (`npm install`)
4. Try rebuilding the application (`npm run build`)
