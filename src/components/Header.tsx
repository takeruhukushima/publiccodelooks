
import React from 'react';
import { Github, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">PublicCode</h1>
              <p className="text-xs text-slate-500">Global Database</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
              プロジェクト一覧
            </a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
              統計情報
            </a>
            <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">
              APIについて
            </a>
            <Button variant="outline" size="sm">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </nav>
          
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
