import React, { useState, useEffect } from 'react';
import { Search, Filter, Globe, Code, Calendar, ExternalLink, Star, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProjectCard from '@/components/ProjectCard';
import Header from '@/components/Header';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 27;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'indexed'>('indexed');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // リポジトリの詳細情報を取得する関数
  const fetchRepoDetails = async (repoFullName: string) => {
    try {
      const repoUrl = new URL(`/api/repos/${repoFullName}`, window.location.origin);
      const response = await fetch(repoUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'User-Agent': 'publicode-search-app',
        },
        cache: 'no-store' as RequestCache,
      });

      if (!response.ok) {
        console.error(`Failed to fetch repo details for ${repoFullName}`);
        return null;
      }

      const data = await response.json();
      return {
        stargazers_count: data.stargazers_count || 0,
        forks_count: data.forks_count || 0,
      };
    } catch (error) {
      console.error(`Error fetching repo details for ${repoFullName}:`, error);
      return null;
    }
  };

  // 現在のページのデータを取得
  const fetchCurrentPage = async (page: number) => {
    setIsLoadingMore(true);
    try {
      const apiUrl = new URL('/api/search/code', window.location.origin);
      const params = new URLSearchParams({
        q: 'filename:publiccode.yml in:path',
        per_page: ITEMS_PER_PAGE.toString(),
        page: page.toString(),
        sort: sortBy,
        order: sortOrder,
      });
      apiUrl.search = params.toString();
      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'User-Agent': 'publicode-search-app',
        },
        cache: 'no-store' as RequestCache,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || `HTTP error! status: ${response.status}`);
      }

      // リポジトリ詳細情報を並列で取得
      const itemsWithDetails = await Promise.all(
        data.items.map(async (item: any) => {
          const repoDetails = await fetchRepoDetails(item.repository.full_name);
          return {
            ...item,
            repository: {
              ...item.repository,
              stargazers_count: repoDetails?.stargazers_count || 0,
              forks_count: repoDetails?.forks_count || 0,
            },
          };
        })
      );

      setProjects(itemsWithDetails);
      setTotalCount(data.total_count);
    } catch (err: any) {
      let errorMessage = 'データの取得中にエラーが発生しました';
      if (err.message) errorMessage = err.message;
      setError(errorMessage);
      setProjects([]);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // ページ変更時にデータを取得
  useEffect(() => {
    fetchCurrentPage(currentPage);
  }, [currentPage, sortBy, sortOrder]);

  // 検索フィルタ
  const filteredProjects = projects.filter(project =>
    project.repository.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ページ数の計算
  const pageCount = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="リポジトリ名で検索..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={sortBy === 'stars' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (sortBy === 'stars') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('stars');
                    setSortOrder('desc');
                  }
                }}
              >
                <Star className="h-4 w-4 mr-2" />
                Stars
              </Button>
              <Button
                variant={sortBy === 'forks' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (sortBy === 'forks') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('forks');
                    setSortOrder('desc');
                  }
                }}
              >
                <GitFork className="h-4 w-4 mr-2" />
                Forks
              </Button>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {isLoadingMore && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">データを読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            // プロジェクトデータを整形
            const projectData = {
              ...project,
              nameJa: project.repository.full_name.split('/').pop(),
              nameEn: project.repository.full_name.split('/').pop(),
              descriptionJa: project.description || '説明はありません',
              descriptionEn: project.description || 'No description available',
              categories: [],
              organization: project.repository.owner?.login || 'Unknown',
              developmentStatus: 'active',
              country: 'Unknown',
              url: project.html_url,
              repositoryUrl: project.repository.html_url,
              repository: {
                ...project.repository,
                full_name: project.repository.full_name,
                stargazers_count: project.repository.stargazers_count || 0,
                forks_count: project.repository.forks_count || 0,
                html_url: project.repository.html_url
              },
              path: project.path,
              html_url: project.html_url,
              updated_at: project.updated_at || project.pushed_at || new Date().toISOString()
            };

            return <ProjectCard key={index} project={projectData} />;
          })}
        </div>

        {!isLoadingMore && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">一致するプロジェクトが見つかりませんでした</p>
          </div>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setCurrentPage(p => Math.max(1, p - 1));
                  }}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
                // 現在のページを中心に表示するページ番号を計算
                let pageNum;
                if (pageCount <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pageCount - 2) {
                  pageNum = pageCount - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === pageNum}
                      onClick={e => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setCurrentPage(p => Math.min(pageCount, p + 1));
                  }}
                  aria-disabled={currentPage === pageCount}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
    </div>
  );
};

export default Index;
