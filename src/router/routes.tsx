import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import NewsPage from '../pages/NewsPage';
import NewsNatureSpotlightPage from '../pages/NewsNatureSpotlightPage';
import NewsJapanTimesAILovePage from '../pages/NewsJapanTimesAILovePage';
import PeoplePage from '../pages/PeoplePage';
import ProjectPage from '../pages/ProjectPage';
import PublicationPage from '../pages/PublicationPage';
import LeaderPage from '../pages/LeaderPage';

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/index.html', element: <HomePage /> },
  { path: '/people', element: <PeoplePage /> },
  { path: '/people.html', element: <PeoplePage /> },
  { path: '/publication', element: <PublicationPage /> },
  { path: '/publication.html', element: <PublicationPage /> },
  { path: '/project', element: <ProjectPage /> },
  { path: '/project.html', element: <ProjectPage /> },
  { path: '/news', element: <NewsPage /> },
  { path: '/news.html', element: <NewsPage /> },
  { path: '/news/japantimes-ai-love', element: <NewsJapanTimesAILovePage /> },
  { path: '/news/japantimes-ai-love.html', element: <NewsJapanTimesAILovePage /> },
  { path: '/news/nature-spotlight', element: <NewsNatureSpotlightPage /> },
  { path: '/news/nature-spotlight.html', element: <NewsNatureSpotlightPage /> },
  { path: '/leader', element: <LeaderPage locale="en" /> },
  { path: '/leader.html', element: <LeaderPage locale="en" /> },

  { path: '/zh', element: <HomePage locale="zh-CN" /> },
  { path: '/zh/index.html', element: <HomePage locale="zh-CN" /> },
  { path: '/zh/people', element: <PeoplePage locale="zh-CN" /> },
  { path: '/zh/people.html', element: <PeoplePage locale="zh-CN" /> },
  { path: '/zh/publication', element: <PublicationPage locale="zh-CN" /> },
  { path: '/zh/publication.html', element: <PublicationPage locale="zh-CN" /> },
  { path: '/zh/project', element: <ProjectPage locale="zh-CN" /> },
  { path: '/zh/project.html', element: <ProjectPage locale="zh-CN" /> },
  { path: '/zh/news', element: <NewsPage locale="zh-CN" /> },
  { path: '/zh/news.html', element: <NewsPage locale="zh-CN" /> },
  { path: '/zh/news/japantimes-ai-love', element: <NewsJapanTimesAILovePage locale="zh-CN" /> },
  { path: '/zh/news/japantimes-ai-love.html', element: <NewsJapanTimesAILovePage locale="zh-CN" /> },
  { path: '/zh/news/nature-spotlight', element: <NewsNatureSpotlightPage locale="zh-CN" /> },
  { path: '/zh/news/nature-spotlight.html', element: <NewsNatureSpotlightPage locale="zh-CN" /> },
  { path: '/zh/leader', element: <LeaderPage locale="zh-CN" /> },
  { path: '/zh/leader.html', element: <LeaderPage locale="zh-CN" /> },

  { path: '*', element: <Navigate to="/" replace /> }
];
