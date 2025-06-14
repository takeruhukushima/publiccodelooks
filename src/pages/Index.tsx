
import React, { useState, useMemo } from 'react';
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
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProjects = useMemo(() => {
    return mockProjects.filter(project => {
      const matchesSearch = project.nameJa.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.descriptionJa.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = selectedCountry === 'all' || project.country === selectedCountry;
      const matchesCategory = selectedCategory === 'all' || project.categories.includes(selectedCategory);
      
      return matchesSearch && matchesCountry && matchesCategory;
    });
  }, [searchQuery, selectedCountry, selectedCategory, mockProjects]);

  const countries = Array.from(new Set(mockProjects.map(p => p.country)));
  const categories = Array.from(new Set(mockProjects.flatMap(p => p.categories)));

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
            各国政府や公共機関が開発したオープンソースソフトウェアを日本語で検索・閲覧できるプラットフォームです。
            イタリアのPublicCode規格に準拠したプロジェクトを自動収集・翻訳して表示しています。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-blue-200 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-lg">グローバル</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">世界中の公共機関のソフトウェアを一箇所で</p>
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
                <CardTitle className="text-lg">自動更新</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">最新情報を定期的に自動収集</p>
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
                placeholder="プロジェクト名や説明で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="国を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての国</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-slate-600">
              {filteredProjects.length}件のプロジェクトが見つかりました
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCountry('all');
                setSelectedCategory('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              フィルターをクリア
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              該当するプロジェクトが見つかりませんでした
            </h3>
            <p className="text-slate-600">
              検索条件を変更して再度お試しください
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
