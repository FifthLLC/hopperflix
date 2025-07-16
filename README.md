# 🎬 MD HopperFlix - AI-Powered Movie Recommendation Engine

HopperFlix is an intelligent movie recommendation system that uses OpenAI's GPT-4 to provide personalized movie suggestions based on user preferences, demographics, and current situations.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd next-app-template
   ```
2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```
3. **Set up environment variables**
   - Create a `.env` file in the root directory:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```
4. **Run the development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```
5. **Open your browser**
   - Go to [http://localhost:3000](http://localhost:3000)

## ✨ Features

### 🎯 Core Functionality

- **AI-Powered Recommendations**: Uses OpenAI's GPT-4 to analyze user preferences and provide thoughtful movie suggestions
- **Direct OpenAI Integration**: TanStack Query directly calls the OpenAI API endpoint
- **Curated Movie Database**: Hand-picked selection of classic and recent films with detailed metadata
- **Personalized Analysis**: Considers age, background, mood, and viewing circumstances
- **Enhanced User Experience**: Beautiful, responsive UI with real-time feedback

### 🆕 Recent Releases Support (Step 3)

- **IMDB Integration**: Users can add recent movies via IMDB URLs
- **Extended Database**: Includes 10 recent releases from 2023-2024
- **Dynamic Recommendations**: Incorporates user-selected movies into the recommendation process

### 🛡️ Safety & Policy Enforcement (Step 4)

- **Content Filtering**: Detects and blocks inappropriate content
- **Family-Friendly**: Ensures all recommendations are suitable for all audiences
- **Violence Prevention**: Specifically prevents recommendations related to violence

## 🎬 How to Use

1. **Describe Yourself**: Enter detailed information about your preferences, age, background, and current situation
2. **Add Recent Movies** (Optional): Include IMDB URLs for recent movies you're interested in
3. **Get Recommendations**: Click the button to receive personalized movie suggestions
4. **Review Results**: See the recommended movie with reasoning, genre, and year

### Example Input

```
I'm a 45-year-old man from Louisiana, USA. I want to watch a cool movie with my girlfriend tonight. I'm divorced. What do you recommend?
```

## 🛡️ API Endpoints & Guardrail Mechanism

### Key API Routes

- `/api/imdb-scraping`  
  Scrapes movie info from a provided IMDB URL.

- `/api/guardrail`  
  Checks if the provided IMDB URLs or user input meet family-friendly and non-violent criteria.  
  **Returns:**

  ```json
  {
    "isValid": false,
    "reasoning": "This doesn’t meet our criteria.",
    "blockedContent": ["A Time to Kill"],
    "suggestions": ["Remove inappropriate movies or try different ones."]
  }
  ```

- `/api/movies`  
  Handles movie list management (GET/POST).

- `/api/recommend`  
  Main endpoint for generating movie recommendations using OpenAI.

### Guardrail Mechanism

- All user input and IMDB URLs are checked for inappropriate or violent content.
- If blocked, the UI displays the `reasoning` and `suggestions` from the guardrail API.
- This ensures recommendations are always safe and family-friendly.

## 🏗️ Architecture

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **TanStack Query**: Server state management with direct OpenAI API calls
- **Responsive Design**: Mobile-first approach

### OpenAI Integration

- **Direct API Calls**: TanStack Query calls `https://api.openai.com/v1/chat/completions` directly
- **Client-Side Processing**: All movie data and prompt generation happens in the browser
- **Enhanced Prompting**: Sophisticated prompt engineering for better results
- **Error Handling**: Comprehensive error management

### Data Structure

```typescript
interface MovieData {
  title: string;
  genre: string;
  year: number;
  description: string;
  themes: string[];
}

interface RecommendationData {
  recommendation: string;
  reasoning: string;
  genre: string;
  year: string;
}
```

## 🎭 Movie Database

### Classic Films

- The Silence of the Lambs (1991)
- Pulp Fiction (1994)
- The Shawshank Redemption (1994)
- Inception (2010)
- Jurassic Park (1993)
- The Lord of the Rings: The Fellowship of the Ring (2001)
- Fight Club (1999)
- Titanic (1997)
- The Matrix (1999)
- Forrest Gump (1994)

### Recent Releases (2023-2024)

- Leave the World Behind (2023)
- Barbie (2023)
- Aquaman and the Lost Kingdom (2023)
- No Hard Feelings (2023)
- Oppenheimer (2023)
- Dune: Part Two (2024)
- Ferrari (2023)
- Pain Hustlers (2023)
- The Little Mermaid (2023)
- Chicken Run: Dawn of the Nugget (2023)

## 🔒 Security Features

### Content Filtering

- **Violence Detection**: Blocks requests containing violent keywords
- **Family-Friendly**: Ensures appropriate content for all audiences
- **Input Validation**: Validates user input before processing

### API Security

- **Environment Variables**: Secure API key management with NEXT*PUBLIC* prefix
- **Error Handling**: Graceful error responses
- **Client-Side Validation**: Input validation before API calls

## 🚀 Deployment

### Local Development

```bash
yarn dev
```

### Production Build

```bash
yarn build
yarn start
```

### AWS Deployment with SST

The application is configured for easy deployment to AWS using SST (Serverless Stack).

#### Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **SST CLI** installed globally: `npm install -g sst`

#### Quick Deployment

1. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your OpenAI API key
   ```

2. **Deploy to development**

   ```bash
   npm run deploy
   # or
   yarn deploy
   ```

3. **Deploy to production**
   ```bash
   npm run deploy:prod
   # or
   yarn deploy:prod
   ```

#### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `NEXT_PUBLIC_BASE_URL`: Base URL (auto-set in production)

#### Deployment Scripts

- `npm run deploy`: Deploy to development stage
- `npm run deploy:prod`: Deploy to production stage
- `npm run remove`: Remove development resources
- `npm run console`: Open SST console
- `npm run dev:sst`: Start SST development mode

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🧪 Testing

### Manual Testing

1. Test with various user descriptions
2. Verify content filtering works
3. Test IMDB URL integration
4. Check responsive design on different devices

### Example Test Cases

- **Family Scenario**: "I want to watch something with my kids"
- **Date Night**: "Looking for a romantic movie for date night"
- **Action Lover**: "I love action and sci-fi movies"
- **Historical Interest**: "I'm interested in historical dramas"

### Guardrail Testing Prompts

Try these prompts to verify the guardrail blocks inappropriate or violent content:

- "Can you recommend me movies with a lot of violence?"
- "Suggest some movies about serial killers."
- "I want to watch the most violent action movies ever made."
- "Any movies about school shootings?"
- "Give me movies like 'A Clockwork Orange' or 'Saw'."

The system should block these and display the reasoning from the guardrail API.

## 🔧 Customization

### Adding Movies

Edit the `MOVIES` and `RECENT_RELEASES` arrays in `lib/useRecommend.ts`:

```typescript
const MOVIES = [
  {
    title: 'Your Movie Title',
    genre: 'Genre',
    year: 2024,
    description: 'Movie description',
    themes: ['theme1', 'theme2'],
  },
];
```

### Modifying Prompts

Update the `generatePrompt` function in `lib/useRecommend.ts` to change recommendation behavior:

```typescript
function generatePrompt(description: string, imdbUrl?: string): string {
  // Your custom prompt logic here
}
```

## 📝 Design Decisions

### 1. Direct OpenAI Integration

- **Client-Side Calls**: TanStack Query directly calls OpenAI API
- **No Backend Required**: Eliminates need for Next.js API routes
- **Real-Time Processing**: Immediate response from OpenAI
- **Simplified Architecture**: Fewer moving parts

### 2. Enhanced Movie Database

- **Rich Metadata**: Each movie includes genre, year, description, and themes
- **Better Context**: Provides AI with comprehensive information for better recommendations
- **Extensible**: Easy to add new movies and categories

### 3. Sophisticated Prompting

- **Structured Output**: Forces JSON responses for consistent data
- **Contextual Analysis**: Considers user demographics and situation
- **Thoughtful Reasoning**: Provides explanations for recommendations

### 4. User Experience

- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Accessibility**: Proper form labels and keyboard navigation
- **Visual Feedback**: Loading states and error handling

### 5. Safety First

- **Content Filtering**: Proactive detection of inappropriate content
- **Graceful Degradation**: Handles API failures gracefully
- **User Guidance**: Clear instructions and examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4 API
- Next.js team for the excellent framework
- The HopperFlix team for the assignment

---

**Built with ❤️ for the HopperFlix assignment**

## Helpful IMDB URLs for Reference

- [Leave the World Behind](https://www.imdb.com/title/tt12747748/)
- [Barbie](https://www.imdb.com/title/tt1517268/)
- [Aquaman and the Lost Kingdom](https://www.imdb.com/title/tt9663764/)
- [No Hard Feelings](https://www.imdb.com/title/tt15671028/)
- [Oppenheimer](https://www.imdb.com/title/tt15398776/)
- [Dune: Part Two](https://www.imdb.com/title/tt15239678/)
- [Ferrari](https://www.imdb.com/title/tt3758542/)
- [Pain Hustlers](https://www.imdb.com/title/tt15257160/)
- [The Little Mermaid](https://www.imdb.com/title/tt5971474/)
- [Chicken Run: Dawn of the Nugget](https://www.imdb.com/title/tt8337264/)

## 🛠️ Troubleshooting

- **OpenAI API errors:**  
  Ensure your `OPENAI_API_KEY` is correct and has sufficient quota.
- **Guardrail blocks safe content:**  
  Review the guardrail logic in `/api/guardrail` and update keywords or logic as needed.
- **UI not updating:**  
  Make sure you are running the latest code and have reinstalled dependencies.
