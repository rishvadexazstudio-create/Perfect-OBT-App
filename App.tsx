
import React, { useState, useEffect } from 'react';
import { ViewState, User } from './types';
import { getCurrentUser, setCurrentUser } from './services/storageService';
import { Layout } from './components/Layout';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { DistrictView } from './views/DistrictView';
import { HomeMenuView } from './views/HomeMenuView';
import { StateObtView } from './views/StateObtView';
import { MasterObtView } from './views/MasterObtView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>({ type: 'AUTH' });

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setView({ type: 'HOME_MENU' });
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setCurrentUser(newUser);
    setView({ type: 'HOME_MENU' });
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setView({ type: 'AUTH' });
  };

  // Navigation Logic
  const goHome = () => setView({ type: 'HOME_MENU' });
  const goToAdmin = () => setView({ type: 'ADMIN_UPDATES' });
  
  const goBack = () => {
    if (view.type === 'DISTRICT_DETAIL') {
      setView({ type: 'DASHBOARD' });
    } else {
      setView({ type: 'HOME_MENU' });
    }
  };

  const renderView = () => {
    switch (view.type) {
      case 'AUTH':
        return <AuthView onLogin={handleLogin} />;
      
      case 'HOME_MENU':
        return (
          <HomeMenuView 
            onNavigate={(target) => {
              if (target === 'DASHBOARD') setView({ type: 'DASHBOARD' });
              if (target === 'STATE_OBT') setView({ type: 'STATE_OBT' });
              if (target === 'MASTER_OBT') setView({ type: 'MASTER_OBT' });
              if (target === 'PROFILE') setView({ type: 'PROFILE' });
              if (target === 'ADMIN_UPDATES') setView({ type: 'ADMIN_UPDATES' });
            }}
          />
        );

      case 'DASHBOARD':
        return user ? (
          <DashboardView 
            user={user} 
            onSelectDistrict={(district) => setView({ type: 'DISTRICT_DETAIL', districtName: district })}
          />
        ) : null;
      
      case 'DISTRICT_DETAIL':
        return user ? (
          <DistrictView 
            districtName={view.districtName} 
            currentUser={user}
            onBack={goBack}
          />
        ) : null;
      
      case 'STATE_OBT':
        return user ? <StateObtView currentUser={user} /> : null;

      case 'MASTER_OBT':
        return user ? <MasterObtView currentUser={user} /> : null;

      case 'PROFILE':
        return user ? (
          <ProfileView 
            user={user} 
            onLogout={handleLogout} 
            onUpdateUser={handleUserUpdate}
          />
        ) : null;

      case 'ADMIN_UPDATES':
        return user ? <AdminView currentUser={user} /> : null;
      
      default:
        return <div>Unknown State</div>;
    }
  };

  if (!user && view.type !== 'AUTH') {
    setView({ type: 'AUTH' });
    return null;
  }

  if (view.type === 'AUTH') {
    return renderView();
  }

  // Determine header title
  let title = "OBT Connect";
  let showBack = false;

  if (view.type === 'DASHBOARD') {
    title = "TN Districts";
    showBack = true;
  } else if (view.type === 'DISTRICT_DETAIL') {
    title = view.districtName;
    showBack = true;
  } else if (view.type === 'STATE_OBT') {
    title = "State OBT Team";
    showBack = true;
  } else if (view.type === 'MASTER_OBT') {
    title = "Master OBT Team";
    showBack = true;
  } else if (view.type === 'PROFILE') {
    title = "My Profile";
    showBack = true;
  } else if (view.type === 'ADMIN_UPDATES') {
    title = "Admin & Updates";
    showBack = true;
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      onHome={goHome} 
      onAdmin={goToAdmin}
      onBack={goBack}
      showBack={showBack}
      title={title}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
