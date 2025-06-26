import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

// IMPORTANT: The environment variable for the API key should NOT be prefixed with VITE_
// It should be a server-side environment variable, e.g., GEMINI_API_KEY
const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (geminiApiKey) {
  genAI = new GoogleGenerativeAI(geminiApiKey);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
} else {
  console.warn("GEMINI_API_KEY is not set. Translation feature will be disabled.");
}

async function translateText(text: string): Promise<string> {
  // If the model isn't configured, or there's no text, return the original text.
  if (!model || !text) {
    return text;
  }

  try {
    const prompt = `Translate the following English text to Japanese. Return only the translated text, without any preamble or explanation.\n\nEnglish: "${text}"\n\nJapanese:`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Translation API error:', error);
    // On error, return the original English text
    return text;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q, per_page, page, sort, order } = req.query;
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    console.error("GITHUB_TOKEN is not set.");
    return res.status(500).json({ message: 'Server configuration error: GITHUB_TOKEN is missing.' });
  }

  const searchApiUrl = new URL('https://api.github.com/search/code');
  searchApiUrl.search = new URLSearchParams({
    q: q as string,
    per_page: (per_page as string) || '27',
    page: (page as string) || '1',
    sort: sort as string,
    order: order as string,
  }).toString();

  try {
    // Step 1: Search for code
    const searchResponse = await fetch(searchApiUrl.toString(), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${githubToken}`,
        'User-Agent': 'publicode-search-app',
      },
    });

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('GitHub Search API Error:', errorData);
      return res.status(searchResponse.status).json({ message: errorData.message || 'Error fetching from GitHub search API' });
    }

    const searchData = await searchResponse.json();

    // Step 2: Fetch full details for each repository
    const itemsWithDetails = await Promise.all(
      searchData.items.map(async (item: any) => {
        if (!item.repository || !item.repository.url) {
          return item; // Skip if repository data is malformed
        }

        const repoDetailsResponse = await fetch(item.repository.url, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${githubToken}`,
            'User-Agent': 'publicode-search-app',
          },
        });

        if (!repoDetailsResponse.ok) {
          const errorText = await repoDetailsResponse.text();
          console.error(`Failed to fetch details for ${item.repository?.full_name || ''}:`, errorText);
          // ダミー情報を返す（全プロパティを必ず含める）
          const dummyRepository = {
            full_name: item.repository?.full_name || '',
            descriptionJa: '',
            topics: [],
            stargazers_count: 0,
            forks_count: 0,
            owner: { login: '' },
            html_url: item.repository?.html_url || '',
            updated_at: '',
            description: '',
          };
          console.log('dummyRepository:', dummyRepository);
          return {
            ...item,
            repository: dummyRepository,
          };
        }

        const repoDetails = await repoDetailsResponse.json();
        // Step 3: Translate the description
        const translatedDescription = await translateText(repoDetails.description);
        repoDetails.descriptionJa = translatedDescription || '';
        repoDetails.stargazers_count = typeof repoDetails.stargazers_count === 'number' ? repoDetails.stargazers_count : 0;
        repoDetails.forks_count = typeof repoDetails.forks_count === 'number' ? repoDetails.forks_count : 0;
        repoDetails.topics = Array.isArray(repoDetails.topics) ? repoDetails.topics : [];
        // 必須プロパティがなければ空値で補完
        repoDetails.full_name = repoDetails.full_name || '';
        repoDetails.owner = repoDetails.owner || { login: '' };
        repoDetails.html_url = repoDetails.html_url || '';
        repoDetails.updated_at = repoDetails.updated_at || '';
        repoDetails.description = repoDetails.description || '';
        console.log('repoDetails (final):', repoDetails);
        // Return the search item, but with the repository object completely replaced by the full details
        return {
          ...item,
          repository: repoDetails,
        };
      })
    );

    // Step 4: Send the enhanced data to the client
    res.status(200).json({ ...searchData, items: itemsWithDetails });

  } catch (error: any) {
    console.error('Error in API route handler:', error);
    res.status(500).json({ message: 'An internal server error occurred.', error: error.message });
  }
}