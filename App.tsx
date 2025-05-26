
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ReadingSection } from './components/ReadingSection';
import { WritingSection } from './components/WritingSection';
import { ListeningSection } from './components/ListeningSection';
import { SpeakingSection } from './components/SpeakingSection';
import { UserInfoForm } from './components/UserInfoForm';
import { TestSection, UserInfo } from './types';
import { APP_TITLE } from './constants';

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<TestSection>(TestSection.READING);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleUserInfoSubmit = (info: UserInfo) => {
    setUserInfo(info);
  };

  if (!userInfo) {
    return <UserInfoForm onUserInfoSubmit={handleUserInfoSubmit} />;
  }

  const renderSection = () => {
    const userEmail = userInfo?.email;
    switch (currentSection) {
      case TestSection.READING:
        return <ReadingSection userEmail={userEmail} />;
      case TestSection.WRITING:
        return <WritingSection userEmail={userEmail} />;
      case TestSection.LISTENING:
        return <ListeningSection userEmail={userEmail} />;
      case TestSection.SPEAKING:
        return <SpeakingSection userEmail={userEmail} />;
      default:
        return <ReadingSection userEmail={userEmail} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight font-lora">{APP_TITLE}</h1>
          {userInfo && <span className="text-lg">Welcome, {userInfo.firstName}!</span>}
        </div>
      </header>
      <Navbar currentSection={currentSection} onSelectSection={setCurrentSection} />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderSection()}
      </main>
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; {new Date().getFullYear()} IELTS Practice. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
