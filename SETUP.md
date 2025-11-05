# GPT-4 Integration Setup Guide

## Step 1: Install OpenAI Package

Run one of these commands in your project directory:

```bash
pnpm add openai
```

or

```bash
npm install openai
```

## Step 2: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy your API key (you'll only see it once!)

## Step 3: Configure Environment Variables

Create a file named `.env.local` in the root of your project:

```
OPENAI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you copied in Step 2.

**Important:** Never commit `.env.local` to Git! It's already in `.gitignore`.

## Step 4: Restart Your Development Server

After creating `.env.local`, restart your development server:

```bash
pnpm dev
```

or

```bash
npm run dev
```

## Step 5: Test It Out!

1. Open your chat application
2. Type a message
3. Press Enter or click the Send button
4. You should receive a real GPT-4 response!

## Troubleshooting

### "OpenAI API key is not configured" error
- Make sure `.env.local` exists in the project root
- Verify the API key is correct (no extra spaces)
- Restart your dev server after creating/updating `.env.local`

### "Failed to get response from OpenAI" error
- Check that you have credits in your OpenAI account
- Verify your API key is valid and active
- Check the browser console for detailed error messages

### Package not found errors
- Make sure you've run `pnpm add openai` or `npm install openai`
- Try deleting `node_modules` and running install again

## Current Features

✅ GPT-4 integration
✅ Model selection dropdown (GPT-4 currently active)
✅ Conversation history maintained
✅ Error handling
✅ Loading indicators

## Notes

- The Gemini and Claude options in the dropdown are placeholders and will use GPT-4 until those integrations are added
- Each API call uses tokens from your OpenAI account
- Check [OpenAI Pricing](https://openai.com/pricing) for current rates
