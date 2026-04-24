'use client';

import RepoBar from './components/RepoBar';
import Markdown from './components/Markdown';
import TOC from './components/TOC';

export default function ReadmeWelcomePage() {
  return (
    <>
      <RepoBar />
      <main className="rm-main">
        <div className="rm-layout">
          <Markdown />
          <TOC />
        </div>
      </main>
    </>
  );
}
