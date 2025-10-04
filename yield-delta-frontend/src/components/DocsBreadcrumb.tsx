'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast?: boolean;
}

interface DocsBreadcrumbProps {
  className?: string;
}

export default function DocsBreadcrumb({ className = '' }: DocsBreadcrumbProps) {
  const pathname = usePathname();

  // Generate breadcrumb segments from pathname
  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbSegment[] = [];

    // Always start with home
    breadcrumbs.push({
      label: 'Home',
      href: '/',
    });

    // Build breadcrumb path
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      // Convert segment to readable label
      let label = segment;
      switch (segment) {
        case 'docs':
          label = 'Documentation';
          break;
        case 'getting-started':
          label = 'Getting Started';
          break;
        case 'features':
          label = 'Features';
          break;
        case 'ai-rebalancing':
          label = 'AI Rebalancing';
          break;
        case 'ai-chat':
          label = 'Liqui Chat AI';
          break;
        case 'market-data':
          label = 'Market Analytics';
          break;
        case 'demo-mode':
          label = 'Demo Mode';
          break;
        case 'ai-engine':
          label = 'AI Engine';
          break;
        case 'smart-contracts':
          label = 'Smart Contracts';
          break;
        case 'api':
          label = 'API Reference';
          break;
        case 'deployment':
          label = 'Deployment';
          break;
        case 'troubleshooting':
          label = 'Troubleshooting';
          break;
        default:
          // Convert kebab-case to title case
          label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (pathname === '/') {
    return null;
  }

  return (
    <div className={`docs-breadcrumb-wrapper ${className}`}>
      <Breadcrumb className="docs-breadcrumb">
        <BreadcrumbList className="docs-breadcrumb-list">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              <BreadcrumbItem className="docs-breadcrumb-item">
                {breadcrumb.isLast ? (
                  <BreadcrumbPage className="docs-breadcrumb-current">
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    asChild 
                    className="docs-breadcrumb-link hover:text-primary transition-colors duration-200"
                  >
                    <Link 
                      href={breadcrumb.href}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted/30 transition-all duration-200"
                    >
                      {index === 0 && <Home className="w-3.5 h-3.5" />}
                      <span>{breadcrumb.label}</span>
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              
              {!breadcrumb.isLast && (
                <BreadcrumbSeparator className="docs-breadcrumb-separator">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

// Export a simple breadcrumb for custom usage
export function SimpleBreadcrumb({ 
  items, 
  className = '' 
}: { 
  items: Array<{ label: string; href?: string }>; 
  className?: string;
}) {
  return (
    <div className={`docs-breadcrumb-wrapper ${className}`}>
      <Breadcrumb className="docs-breadcrumb">
        <BreadcrumbList className="docs-breadcrumb-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            
            return (
              <React.Fragment key={`${item.label}-${index}`}>
                <BreadcrumbItem className="docs-breadcrumb-item">
                  {isLast || !item.href ? (
                    <BreadcrumbPage className="docs-breadcrumb-current">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      asChild 
                      className="docs-breadcrumb-link hover:text-primary transition-colors duration-200"
                    >
                      <Link 
                        href={item.href}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted/30 transition-all duration-200"
                      >
                        {index === 0 && <Home className="w-3.5 h-3.5" />}
                        <span>{item.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                
                {!isLast && (
                  <BreadcrumbSeparator className="docs-breadcrumb-separator">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}