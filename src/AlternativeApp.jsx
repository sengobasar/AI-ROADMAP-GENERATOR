import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AuthModal from "./components/AuthModal";
import Login from "./components/Login";
import Register from "./components/Register";
import RoadmapDashboard from "./App.jsx";

export default function AlternativeApp() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  
  // Settings states
  const [activeModal, setActiveModal] = useState(null);
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    avatar: '👤',
    learningPrefs: {
      difficulty: 'intermediate',
      studyTime: '1-2 hours',
      subjects: []
    }
  });
  const [analytics, setAnalytics] = useState({
    totalLearningTime: '45h 32m',
    completedRoadmaps: 3,
    currentStreak: 12,
    averageScore: 87
  });

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) console.error(error);
      else setSession(session);
      setIsLoading(false);
    }
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Modal handlers
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Profile Settings Component - Fixed input handling
  const ProfileSettings = () => {
    const [localProfile, setLocalProfile] = useState({
      displayName: userProfile.displayName,
      bio: ''
    });

    const handleSave = () => {
      setUserProfile({...userProfile, displayName: localProfile.displayName});
      closeModal();
    };

    return (
      <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">👤 Profile Settings</h5>
              <button className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">Display Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={localProfile.displayName}
                    onChange={(e) => setLocalProfile({...localProfile, displayName: e.target.value})}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={session?.user?.email || ''}
                    disabled
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Bio</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={localProfile.bio}
                    onChange={(e) => setLocalProfile({...localProfile, bio: e.target.value})}
                    placeholder="Tell us about your learning journey..."
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Avatar & Display Component
  const AvatarDisplay = () => {
    const avatars = ['👤', '🧠', '🎓', '📚', '🚀', '⭐', '🎯', '💡', '🔥', '✨'];
    
    return (
      <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">🎨 Avatar & Display</h5>
              <button className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body text-center">
              <div className="mb-4">
                <div style={{fontSize: '4rem'}}>{userProfile.avatar}</div>
                <p className="text-muted">Current Avatar</p>
              </div>
              <h6>Choose New Avatar:</h6>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {avatars.map((emoji, idx) => (
                  <button
                    key={idx}
                    className={`btn btn-outline-primary ${userProfile.avatar === emoji ? 'active' : ''}`}
                    style={{fontSize: '2rem', width: '60px', height: '60px'}}
                    onClick={() => setUserProfile({...userProfile, avatar: emoji})}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={closeModal}>Save Avatar</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Learning Preferences Component
  const LearningPreferences = () => (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">📚 Learning Preferences</h5>
            <button className="btn-close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Preferred Difficulty</label>
                <select 
                  className="form-select"
                  value={userProfile.learningPrefs.difficulty}
                  onChange={(e) => setUserProfile({
                    ...userProfile, 
                    learningPrefs: {...userProfile.learningPrefs, difficulty: e.target.value}
                  })}
                >
                  <option value="beginner">🟢 Beginner</option>
                  <option value="intermediate">🟡 Intermediate</option>
                  <option value="advanced">🔴 Advanced</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Daily Study Time</label>
                <select 
                  className="form-select"
                  value={userProfile.learningPrefs.studyTime}
                  onChange={(e) => setUserProfile({
                    ...userProfile, 
                    learningPrefs: {...userProfile.learningPrefs, studyTime: e.target.value}
                  })}
                >
                  <option value="15-30 min">⚡ 15-30 min</option>
                  <option value="30-60 min">🕐 30-60 min</option>
                  <option value="1-2 hours">🕑 1-2 hours</option>
                  <option value="2+ hours">🚀 2+ hours</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Favorite Learning Topics</label>
                <div className="d-flex flex-wrap gap-2">
                  {['Programming', 'Design', 'Business', 'Languages', 'Science', 'Arts', 'Music', 'Health'].map(topic => (
                    <button
                      key={topic}
                      className={`btn btn-sm ${userProfile.learningPrefs.subjects.includes(topic) ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => {
                        const subjects = userProfile.learningPrefs.subjects.includes(topic)
                          ? userProfile.learningPrefs.subjects.filter(s => s !== topic)
                          : [...userProfile.learningPrefs.subjects, topic];
                        setUserProfile({
                          ...userProfile,
                          learningPrefs: {...userProfile.learningPrefs, subjects}
                        });
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={closeModal}>Save Preferences</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Progress Analytics Component
  const ProgressAnalytics = () => (
    <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">📊 Progress Analytics</h5>
            <button className="btn-close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            <div className="row g-4">
              <div className="col-md-3">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h3>{analytics.totalLearningTime}</h3>
                    <p className="mb-0">Total Learning Time</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h3>{analytics.completedRoadmaps}</h3>
                    <p className="mb-0">Completed Roadmaps</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-white">
                  <div className="card-body text-center">
                    <h3>{analytics.currentStreak}</h3>
                    <p className="mb-0">Day Streak</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info text-white">
                  <div className="card-body text-center">
                    <h3>{analytics.averageScore}%</h3>
                    <p className="mb-0">Average Score</p>
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">Weekly Learning Activity</h6>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-end" style={{height: '200px'}}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div key={day} className="text-center">
                          <div 
                            className="bg-primary rounded mb-2" 
                            style={{
                              width: '40px', 
                              height: `${Math.random() * 150 + 50}px`,
                              marginBottom: '10px'
                            }}
                          ></div>
                          <small>{day}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={closeModal}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100" style={{background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%)'}}>
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading Brainmap...</p>
        </div>
      </div>
    );
  }

  // AUTHENTICATED VIEW
  if (session) {
    return (
      <>
        <div className="vh-100 d-flex flex-column">
          <nav
            className="navbar navbar-expand-lg shadow-lg"
            style={{
              background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
              borderBottom: "3px solid rgba(255,255,255,0.1)"
            }}
          >
            <div className="container-fluid">
              <span className="navbar-brand text-white fw-bold d-flex align-items-center">
                <span className="me-2">🧠</span>
                Brainmap Dashboard
              </span>
              <div className="d-flex align-items-center ms-auto">
                <div className="dropdown me-3">
                  <button 
                    className="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                    type="button" 
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{borderRadius: '25px', padding: '8px 16px'}}
                  >
                    <span className="me-2" style={{fontSize: '1.2rem'}}>{userProfile.avatar}</span>
                    <span className="d-none d-md-inline">{userProfile.displayName || session.user.email}</span>
                    <span className="d-md-none">Profile</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-lg" style={{minWidth: '250px'}}>
                    <li>
                      <h6 className="dropdown-header text-muted">
                        <span className="me-2">🧠</span>
                        Account Settings
                      </h6>
                    </li>
                    <li><button className="dropdown-item py-2" onClick={() => openModal('profile')}>
                      <span className="me-2">👤</span>
                      Profile Settings
                    </button></li>
                    <li><button className="dropdown-item py-2" onClick={() => openModal('avatar')}>
                      <span className="me-2">🎨</span>
                      Avatar & Display
                    </button></li>
                    <li><button className="dropdown-item py-2" onClick={() => openModal('learning')}>
                      <span className="me-2">📚</span>
                      Learning Preferences
                    </button></li>
                    <li><button className="dropdown-item py-2" onClick={() => openModal('analytics')}>
                      <span className="me-2">📊</span>
                      Progress Analytics
                    </button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger py-2 d-flex align-items-center" 
                        onClick={() => supabase.auth.signOut()}
                      >
                        <span className="me-2">🚪</span>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex-fill">
            <RoadmapDashboard />
          </div>
        </div>

        {/* Render Active Modal */}
        {activeModal === 'profile' && <ProfileSettings />}
        {activeModal === 'avatar' && <AvatarDisplay />}
        {activeModal === 'learning' && <LearningPreferences />}
        {activeModal === 'analytics' && <ProgressAnalytics />}
      </>
    );
  }

  // LANDING PAGE (same as before)
  return (
    <>
      {/* Your existing landing page code with all the styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        :root {
          --primary-gradient: linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a855f7 100%);
          --accent-color: #60a5fa;
          --glass-bg: rgba(255,255,255,0.15);
          --glass-border: rgba(255,255,255,0.2);
          --text-primary: #ffffff;
          --text-secondary: rgba(255,255,255,0.85);
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          scroll-behavior: smooth;
        }
        
        .gradient-bg {
          background: var(--primary-gradient);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        
        .gradient-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          animation: patternMove 20s linear infinite;
        }
        
        @keyframes patternMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        
        .hero-title {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          font-weight: 900;
          background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 40px rgba(255,255,255,0.2);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        
        .hero-subtitle {
          font-size: clamp(1.1rem, 3vw, 1.4rem);
          color: var(--text-secondary);
          font-weight: 400;
          line-height: 1.7;
          letter-spacing: 0.01em;
        }
        
        .btn-primary-custom {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #a855f7, #ec4899);
          background-size: 300% 300%;
          animation: gradientShift 4s ease infinite;
          border: none;
          padding: 16px 36px;
          font-weight: 600;
          font-size: 1.1rem;
          border-radius: 50px;
          box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary-custom::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        .btn-primary-custom:hover::before {
          left: 100%;
        }
        
        .btn-primary-custom:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 25px 50px rgba(139, 92, 246, 0.6);
          color: white;
        }
        
        .btn-primary-custom:active {
          transform: translateY(-2px) scale(1.01);
        }
        
        .btn-outline-custom {
          border: 2px solid rgba(255,255,255,0.3);
          color: white;
          padding: 16px 36px;
          font-weight: 600;
          font-size: 1.1rem;
          border-radius: 50px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .btn-outline-custom:hover {
          background: rgba(255,255,255,0.25);
          border-color: rgba(255,255,255,0.6);
          transform: translateY(-3px) scale(1.02);
          color: white;
          box-shadow: 0 20px 40px rgba(255,255,255,0.2);
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          25% { transform: translateY(-15px) rotate(3deg); opacity: 0.9; }
          50% { transform: translateY(-8px) rotate(0deg); opacity: 1; }
          75% { transform: translateY(-20px) rotate(-3deg); opacity: 0.8; }
        }
        
        .feature-card {
          background: var(--glass-bg);
          backdrop-filter: blur(25px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 2.5rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #a855f7, #ec4899);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        .feature-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        
        .feature-card:hover {
          transform: translateY(-12px) scale(1.02);
          background: rgba(255,255,255,0.25);
          box-shadow: 0 25px 50px rgba(139, 92, 246, 0.4);
          border-color: rgba(255,255,255,0.3);
        }
        
        .feature-card:hover::before {
          opacity: 1;
        }
        
        .feature-card:hover::after {
          opacity: 1;
        }
        
        .feature-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          margin-bottom: 1.5rem;
          border: 2px solid rgba(255,255,255,0.25);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        
        .feature-card:hover .feature-icon {
          transform: scale(1.15) rotate(5deg);
          background: linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2));
          box-shadow: 0 15px 30px rgba(255,255,255,0.2);
        }
        
        .navbar-custom {
          background: rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(25px);
          border-bottom: 1px solid rgba(255,255,255,0.15);
          transition: all 0.4s ease;
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        
        .navbar-scrolled {
          background: rgba(255,255,255,0.2) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .navbar-brand-custom {
          font-size: 1.6rem;
          font-weight: 800;
          color: white !important;
          transition: all 0.3s ease;
        }
        
        .navbar-brand-custom:hover {
          transform: scale(1.05);
        }
        
        .brain-icon {
          display: inline-block;
          margin-right: 12px;
          font-size: 1.8rem;
          animation: pulse 3s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        .stats-number {
          font-size: clamp(2.5rem, 6vw, 3rem);
          font-weight: 900;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
          animation: countUp 2s ease-out;
        }
        
        @keyframes countUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }
        
        .floating-shapes > div {
          position: absolute;
          background: rgba(139, 92, 246, 0.15);
          border-radius: 50%;
          animation: float 12s ease-in-out infinite;
          filter: blur(1px);
        }
        
        .shape-1 {
          width: 120px;
          height: 120px;
          top: 15%;
          left: 8%;
          animation-delay: 0s;
        }
        
        .shape-2 {
          width: 180px;
          height: 180px;
          top: 55%;
          right: 12%;
          animation-delay: 3s;
        }
        
        .shape-3 {
          width: 100px;
          height: 100px;
          bottom: 25%;
          left: 15%;
          animation-delay: 6s;
        }
        
        .shape-4 {
          width: 140px;
          height: 140px;
          top: 70%;
          right: 40%;
          animation-delay: 9s;
        }
        
        .scroll-indicator {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.2);
          z-index: 9999;
        }
        
        .scroll-progress {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #a855f7);
          transition: width 0.3s ease;
        }
        
        .badge-custom {
          background: rgba(255,255,255,0.2) !important;
          color: white !important;
          font-size: 0.9rem !important;
          font-weight: 500 !important;
          padding: 12px 24px !important;
          border-radius: 50px !important;
          border: 1px solid rgba(255,255,255,0.3) !important;
          backdrop-filter: blur(10px);
          animation: slideInDown 0.8s ease-out;
        }
        
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .hero-content {
          animation: fadeInUp 1s ease-out;
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Enhanced Accessibility */
        .btn:focus {
          outline: 3px solid rgba(255,255,255,0.5);
          outline-offset: 2px;
        }
        
        /* Smooth transitions for reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Enhanced Mobile Responsiveness */
        @media (max-width: 768px) {
          .feature-card {
            padding: 2rem;
            margin-bottom: 1rem;
          }
          
          .btn-primary-custom,
          .btn-outline-custom {
            padding: 14px 28px;
            font-size: 1rem;
          }
          
          .container-fluid {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .d-flex.flex-column.flex-md-row {
            flex-direction: column !important;
          }
          
          .btn-primary-custom,
          .btn-outline-custom {
            width: 100%;
            margin-bottom: 1rem;
          }
        }
      `}</style>

      {/* Scroll Progress Indicator */}
      <div className="scroll-indicator">
        <div 
          className="scroll-progress" 
          style={{width: `${(scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%`}}
        ></div>
      </div>

      <div className="gradient-bg">
        <div className="floating-shapes">
          <div className="shape-1"></div>
          <div className="shape-2"></div>
          <div className="shape-3"></div>
          <div className="shape-4"></div>
        </div>

        <nav className={`navbar navbar-expand-lg navbar-custom ${scrollY > 50 ? 'navbar-scrolled' : ''}`}>
          <div className="container">
            <a className="navbar-brand navbar-brand-custom" href="#home">
              <span className="brain-icon">🧠</span>
              Brainmap
            </a>
            <button 
              className="navbar-toggler border-0" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
            >
              <span style={{color: 'white', fontSize: '1.5rem'}}>☰</span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="ms-auto d-flex align-items-center">
                <button 
                  className="btn me-3" 
                  style={{color: 'rgba(255,255,255,0.9)', fontWeight: '500'}}
                  data-bs-toggle="modal" 
                  data-bs-target="#loginModal"
                >
                  Login
                </button>
                <button 
                  className="btn btn-primary-custom"
                  data-bs-toggle="modal" 
                  data-bs-target="#registerModal"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container-fluid d-flex align-items-center justify-content-center position-relative" style={{minHeight: '100vh', paddingTop: '80px', zIndex: 1}}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-10 col-xl-8">
              <div className="hero-content">
                <div className="mb-4">
                  <span className="badge badge-custom">
                    ✨ Your Personal Guide to Learning Mastery
                  </span>
                </div>
                
                <h1 className="hero-title mb-4">
                  Transform Learning Into
                  <br />
                  <span style={{color: 'var(--accent-color)'}}>Mastery</span> with Brainmap
                </h1>
                
                <p className="hero-subtitle mb-5 px-lg-3">
                  <strong>Brainmap</strong> is the definitive app for turning learning ambitions into reality. 
                  Create personalized roadmaps, track your progress with precision, and validate your knowledge 
                  through AI-powered assessments.
                </p>
                
                <div className="d-flex flex-column flex-md-row gap-4 justify-content-center mb-5">
                  <button 
                    className="btn btn-primary-custom"
                    data-bs-toggle="modal" 
                    data-bs-target="#registerModal"
                  >
                    🚀 Start Your Learning Journey
                  </button>
                  <button className="btn btn-outline-custom">
                    👀 Watch Demo
                  </button>
                </div>
                
                <div className="row justify-content-center text-center mt-5">
                  <div className="col-4">
                    <div className="stats-number">50K+</div>
                    <div style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', fontWeight: '500'}}>Active Learners</div>
                  </div>
                  <div className="col-4">
                    <div className="stats-number">98%</div>
                    <div style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', fontWeight: '500'}}>Success Rate</div>
                  </div>
                  <div className="col-4">
                    <div className="stats-number">24/7</div>
                    <div style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', fontWeight: '500'}}>AI Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-5" style={{position: 'relative', zIndex: 1}}>
          <div className="row justify-content-center text-center mb-5">
            <div className="col-lg-8">
              <h2 className="display-4 mb-4" style={{color: 'white', fontWeight: '800'}}>
                Powerful Features
              </h2>
              <p className="lead" style={{color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem'}}>
                More than a checklist—it's your complete learning ecosystem designed for mastery.
              </p>
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="feature-card h-100 text-center text-white">
                <div className="feature-icon mx-auto">🗺️</div>
                <h4 className="mb-3" style={{fontWeight: '700', fontSize: '1.3rem'}}>Smart Roadmap Generation</h4>
                <p style={{color: 'rgba(255,255,255,0.9)', lineHeight: '1.7'}}>
                  Tell us your learning goal and our AI creates a comprehensive, step-by-step roadmap 
                  personalized to your skill level and learning style.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="feature-card h-100 text-center text-white">
                <div className="feature-icon mx-auto">📈</div>
                <h4 className="mb-3" style={{fontWeight: '700', fontSize: '1.3rem'}}>Interactive Progress Tracking</h4>
                <p style={{color: 'rgba(255,255,255,0.9)', lineHeight: '1.7'}}>
                  Visualize your learning journey with beautiful timelines and progress charts. 
                  Stay motivated with milestone celebrations and achievement badges.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="feature-card h-100 text-center text-white">
                <div className="feature-icon mx-auto">🧠</div>
                <h4 className="mb-3" style={{fontWeight: '700', fontSize: '1.3rem'}}>Knowledge Validation</h4>
                <p style={{color: 'rgba(255,255,255,0.9)', lineHeight: '1.7'}}>
                  Prove your mastery with personalized quizzes and assessments. Build confidence 
                  through validated learning before advancing to the next level.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-5 mb-5" style={{position: 'relative', zIndex: 1}}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="p-5 rounded-4" style={{
                background: 'rgba(255,255,255,0.15)', 
                backdropFilter: 'blur(25px)', 
                border: '2px solid rgba(255,255,255,0.25)',
                boxShadow: '0 25px 50px rgba(139, 92, 246, 0.3)'
              }}>
                <h2 className="display-5 mb-4" style={{color: 'white', fontWeight: '800'}}>
                  Ready to Master Anything?
                </h2>
                <p className="lead mb-4" style={{color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem'}}>
                  Join 50,000+ learners who've transformed their ambitions into achievements with Brainmap
                </p>
                <button 
                  className="btn btn-primary-custom btn-lg"
                  data-bs-toggle="modal" 
                  data-bs-target="#registerModal"
                  style={{fontSize: '1.2rem', padding: '18px 40px'}}
                >
                  🎯 Begin Your Mastery Journey
                </button>
                <div className="mt-4">
                  <small style={{color: 'rgba(255,255,255,0.7)'}}>
                    ✓ Free to start • ✓ No credit card required • ✓ Cancel anytime
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal id="loginModal" title="Welcome Back to Brainmap">
        <Login
          onSuccess={() => {
            const modalEl = document.getElementById("loginModal");
            window.bootstrap.Modal.getInstance(modalEl)?.hide();
          }}
        />
      </AuthModal>

      <AuthModal id="registerModal" title="Start Your Learning Journey">
        <Register
          onSuccess={() => {
            const regEl = document.getElementById("registerModal");
            window.bootstrap.Modal.getInstance(regEl)?.hide();
            new window.bootstrap.Modal(
              document.getElementById("loginModal")
            ).show();
          }}
        />
      </AuthModal>
    </>
  );
}
