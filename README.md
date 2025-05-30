# Healthcare Translator

![Healthcare Translator Demo](./assets/demo-screenshot.png)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).  
It provides a secure, dual-panel chat interface for real-time translation and correction between patients and healthcare providers, leveraging Azure OpenAI.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

---

## Code Structure

```
src/
  app/
    api/
      translate/
        route.ts         # API endpoint for translation/correction (calls Azure OpenAI)
    layout.tsx           # App layout
    page.tsx             # Main entry point, renders chat and privacy notice
  components/
    ChatMessage.tsx      # Renders a single chat message with error handling
    DualPanelChat.tsx    # Main dual-panel chat logic and state
    Panel.tsx            # Patient/Provider input panel with language selection
    PrivacyNotice.tsx    # Privacy and consent modal (must accept to use app)
    SpeechToText.tsx     # Speech recognition UI and error handling
    TranslationOutput.tsx# Displays translation/correction results
    Translator.tsx       # Standalone translator interface
  constants/
    languages.ts         # Supported languages (with error code guidance)
  hooks/
    useSpeechRecognition.ts      # Custom React hook for speech recognition (Web Speech API)
    speechRecognitionErrors.ts   # Maps Web Speech API error codes to messages
  types/
    index.ts             # TypeScript types and interfaces for all components
  utils/
    chatUtils.ts         # Utility functions for language/role labels with error codes
    parseOpenAIResponse.ts # Parses and validates OpenAI responses with error codes
middleware.ts            # Enforces HTTPS and HSTS headers in production
global.d.ts              # Global TS types for browser APIs (with error handling notes)
.env.local               # Azure OpenAI credentials (never commit to source control)
```

---

## AI Tools Used

- **Azure OpenAI (GPT-4.1):**  
  Used for translation, correction, and suggestion generation.  
  - API integration in `src/app/api/translate/route.ts`
  - Prompt engineering ensures structured, safe responses.

- **Web Speech API:**  
  Used for speech-to-text input in the browser.  
  - Integrated via `src/hooks/useSpeechRecognition.ts` and `src/components/SpeechToText.tsx`
  - Error codes and user feedback for all speech recognition errors.

---

## Security & Privacy Considerations

- **No Data Persistence:**  
  No chat or transcript data is stored on disk or in a database. All data is in-memory and cleared on reload.

- **Environment Variables for Secrets:**  
  Azure OpenAI credentials are stored in `.env.local` and never hardcoded.

- **Input Validation & Sanitization:**  
  - All API input is validated for type, length, and allowed values.
  - Malicious input (e.g., XSS, prompt injection) is detected and rejected.
  - See `src/app/api/translate/route.ts`.

- **HTTPS Enforcement:**  
  - All HTTP requests are redirected to HTTPS in production.
  - HSTS headers are set for strict transport security.
  - See `src/middleware.ts`.

- **Privacy & Consent Notice:**  
  - Users must accept a privacy and consent modal before using the app.
  - See `src/components/PrivacyNotice.tsx` and `src/app/page.tsx`.

- **No Logging of Sensitive Data:**  
  - Only error codes and non-sensitive metadata are logged.
  - No patient or message content is logged to console or server.

- **No Analytics or Tracking:**  
  - No third-party analytics, cookies, or tracking scripts are present.

- **Error Handling:**  
  - All errors are logged with descriptive error codes (e.g., `[API-001]`, `[SR-004]`).
  - HTTP status codes are used for API responses.
  - Web Speech API and Azure OpenAI error codes are surfaced in the UI and logs.

- **Supported Languages:**  
  - All language codes are validated against a whitelist (`src/constants/languages.ts`).

> **Note:**  
> This project demonstrates basic security and privacy best practices.  
> For real-world healthcare use (HIPAA/BAA compliance), you must add authentication, audit logging, and organizational controls.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Azure OpenAI Documentation](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Web Speech API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
