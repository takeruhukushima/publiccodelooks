import React from 'react';
import { ExternalLink, Calendar, Users, Tag, Globe, Code, Star, GitFork, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReadmeSummary } from '@/hooks/useReadmeSummary';

interface Repository {
  full_name?: string;
  html_url?: string;
  stargazers_count?: number;
  forks_count?: number;
  [key: string]: any; // その他のプロパティも許容
}

interface Project {
  id: string;
  nameEn: string;
  nameJa: string;
  descriptionEn: string;
  descriptionJa: string;
  country: string;
  organization: string;
  categories: string[];
  developmentStatus: string;
  lastModified: string;
  url: string;
  repositoryUrl: string;
  repository?: Repository; // オプショナルに変更
  path: string;
  html_url: string;
  updated_at: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  if (!project) {
    console.error('ProjectCard: project is undefined or null');
    return <div className="text-red-500">プロジェクトデータがありません</div>;
  }
  
  console.log('ProjectCard - project:', JSON.stringify(project, null, 2));
  
  // デバッグ用にデフォルト値を設定
  const { 
    nameJa = project.nameEn || 'プロジェクト名なし',
    descriptionJa = project.descriptionEn || '説明はありません',
    categories = [],
    repository = { full_name: '', stargazers_count: 0, forks_count: 0, html_url: '' },
    path = '',
    html_url = '',
    updated_at = new Date().toISOString(),
    organization = '組織名なし',
    developmentStatus = 'unknown',
    country = '不明',
    url = '#'
  } = project;
  
  // 必須プロパティの検証
  if (!repository || typeof repository !== 'object') {
    console.error('ProjectCard: invalid repository object', { repository });
    return <div className="text-red-500">リポジトリ情報が無効です</div>;
  }
  const stargazers_count = Number(repository?.stargazers_count) || 0;
  const forks_count = Number(repository?.forks_count) || 0;
  const { summary, isLoading } = useReadmeSummary(repository?.full_name || '');
  
  // デバッグ用に必須プロパティの存在を確認
  const requiredProps = ['nameJa', 'descriptionJa', 'categories', 'repository'];
  const missingProps = requiredProps.filter(prop => !(prop in project));
  if (missingProps.length > 0) {
    console.warn('Missing required props in project:', missingProps);
  }
  const lastUpdated = new Date(updated_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'イタリア': '🇮🇹',
      'フランス': '🇫🇷',
      'ドイツ': '🇩🇪',
      'スペイン': '🇪🇸',
      'オランダ': '🇳🇱',
      'エストニア': '🇪🇪'
    };
    return flags[country] || '🌍';
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1 line-clamp-2">
              <a 
                href={repository.html_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                {nameJa}
              </a>
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              <a 
                href={html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                publiccode.yml
              </a>
            </CardDescription>
            
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
                <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400" />
                <span className="font-medium">{stargazers_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
                <GitFork className="h-3.5 w-3.5 text-slate-500" />
                <span className="font-medium">{forks_count.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge className={getStatusColor(developmentStatus)}>
            {developmentStatus}
          </Badge>
          <span className="text-xs text-slate-500 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {organization}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <p className="text-slate-600 text-sm mb-4 line-clamp-5 flex-1">
          {isLoading ? (
            <div className="flex items-center text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              要約を取得中...
            </div>
          ) : summary || descriptionJa}
        </p>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 3).map(category => (
              <Badge key={category} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {category}
              </Badge>
            ))}
            {categories.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{categories.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
