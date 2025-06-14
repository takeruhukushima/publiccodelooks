import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { owner, repo } = req.query;
  const repoFullName = `${owner}/${repo}`;

  try {
    const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'publicode-search-app',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching repo details:', error);
    res.status(500).json({ message: 'Failed to fetch repository details' });
  }
} 