
import React, { useState, useEffect } from 'react';
import { Search, Filter, Globe, Code, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProjectCard from '@/components/ProjectCard';
import Header from '@/components/Header';
import { mockProjects } from '@/data/mockData';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchPubliccode = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Searching for publiccode.yml files on GitHub...');
        
        // GitHub API の検索エンドポイント
        const apiUrl = new URL('/api/search/code', window.location.origin);
        
        // 検索クエリパラメータ
        const params = new URLSearchParams({
          q: 'filename:publiccode.yml in:path',
          per_page: '10',
          sort: 'indexed',
          order: 'desc'
        });
        
        apiUrl.search = params.toString();
        
        console.log('GitHub API URL:', apiUrl.toString());
        
        // デバッグ用に環境変数が読み込まれているか確認
        console.log('Environment variables in client:', {
          hasToken: !!import.meta.env.VITE_GITHUB_ACCESS_TOKEN,
          tokenPrefix: import.meta.env.VITE_GITHUB_ACCESS_TOKEN ? 
            `${import.meta.env.VITE_GITHUB_ACCESS_TOKEN.substring(0, 4)}...${import.meta.env.VITE_GITHUB_ACCESS_TOKEN.slice(-4)}` : 
            'No token',
          env: import.meta.env.MODE
        });
        
        // プロキシ経由でGitHub APIを呼び出す
        const response = await fetch(apiUrl.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'User-Agent': 'publicode-search-app'
          },
          // credentials: 'omit',  // クロスオリジンリクエストでは不要
          cache: 'no-store' as RequestCache
        });
        
        // レスポンスヘッダーを確認
        console.log('Response status:', response.status);
        console.log('Response headers:');
        response.headers.forEach((value, key) => {
          console.log(`  ${key}: ${value}`);
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // レートリミット情報をログに出力
        const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
        const rateLimitLimit = response.headers.get('x-ratelimit-limit');
        const rateLimitReset = response.headers.get('x-ratelimit-reset');
        
        console.log(`GitHub API Rate Limit: ${rateLimitRemaining}/${rateLimitLimit} (resets at ${rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : 'unknown'})`);
        
        // レスポンスをJSONとしてパース
        const data = await response.json();
        console.log('GitHub API response:', data);
        
        if (!response.ok) {
          console.error('GitHub API Error:', data);
          const errorMessage = data?.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        }
        
        // 結果が空の場合の処理
        if (!data.items || data.items.length === 0) {
          console.log('No publiccode.yml files found');
          setProjects([]);
          setError('publiccode.yml ファイルが見つかりませんでした');
          return;
        }
        
        // 結果を整形
        const results = data.items.map((item: any) => ({
          name: item.name,
          path: item.path,
          html_url: item.html_url,
          repository: {
            full_name: item.repository?.full_name || 'unknown',
            html_url: item.repository?.html_url || '#',
          },
          score: item.score,
          content: null
        }));
        
        console.log(`Found ${results.length} results`);
        setProjects(results);
        
      } catch (err: any) {
        console.error('検索エラー:', err);
        
        // エラーメッセージを整形
        let errorMessage = 'データの取得中にエラーが発生しました';
        
        if (err.message) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        
        // 認証エラーの場合
        if (errorMessage.includes('Bad credentials') || errorMessage.includes('401')) {
          errorMessage = 'GitHub認証エラーが発生しました。アクセストークンが正しく設定されているか確認してください。';
        }
        // レートリミットエラーの場合
        else if (errorMessage.includes('API rate limit exceeded') || errorMessage.includes('403')) {
          errorMessage = 'GitHub APIのレート制限に達しました。しばらく待ってから再度お試しください。';
        }
        // ネットワークエラーの場合
        else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        }
        
        setError(errorMessage);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }  
    };

    fetchPubliccode();
  }, []);

  const filteredProjects = projects.filter(project => 
    project.repository.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const countries = Array.from(new Set(projects.map((p: any) => {
    // リポジトリ名から国を推測
    const countryMap: Record<string, string> = {
      'italia': 'イタリア',
      'france': 'フランス',
      'germany': 'ドイツ',
      'spain': 'スペイン',
      'netherlands': 'オランダ',
      'estonia': 'エストニア'
    };
    
    const repoName = p.repository.full_name.toLowerCase();
    const countryKey = Object.keys(countryMap).find(key => repoName.includes(key));
    return countryKey ? countryMap[countryKey] : 'その他';
  })));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            世界の公共ソフトウェア
            <span className="text-blue-600">データベース</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            GitHub上のpubliccode.ymlファイルから自動収集しています。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-blue-200 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">GitHub検索</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">GitHub上のpubliccode.ymlを検索</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Code className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle className="text-lg">オープンソース</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">透明性とコラボレーションを重視</p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <CardTitle className="text-lg">リアルタイム</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">最新のリポジトリをリアルタイムに表示</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="リポジトリ名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-slate-600">検索中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <Card key={index} className="h-full flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg truncate">
                  <a 
                    href={project.repository.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 flex items-center"
                  >
                    {project.repository.full_name}
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </CardTitle>
                <CardDescription className="truncate">
                  <a 
                    href={project.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-blue-500 flex items-center"
                  >
                    {project.path}
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  <a 
                    href={project.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View publiccode.yml
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isLoading && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">一致するプロジェクトが見つかりませんでした</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
