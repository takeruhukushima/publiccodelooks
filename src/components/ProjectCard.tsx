import React from 'react';
import { ExternalLink, Calendar, Users, Tag, Globe, Code, Star, GitFork } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  repository: {
    full_name: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
  };
  path: string;
  html_url: string;
  updated_at: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { repository, path, html_url, updated_at } = project;
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
              {project.nameJa}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {project.nameEn}
            </CardDescription>
          </div>
          <div className="text-lg ml-2">
            {getCountryFlag(project.country)}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge className={getStatusColor(project.developmentStatus)}>
            {project.developmentStatus}
          </Badge>
          <span className="text-xs text-slate-500 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {project.organization}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
          {project.descriptionJa}
        </p>
        
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {project.categories.slice(0, 3).map(category => (
              <Badge key={category} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {category}
              </Badge>
            ))}
            {project.categories.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.categories.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {lastUpdated}
            </span>
            <span>{project.country}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{repository.stargazers_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4 text-slate-500" />
              <span>{repository.forks_count.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1" asChild>
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                詳細を見る
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                コード
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
