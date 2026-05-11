import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Clock, 
  CalendarClock, 
  FileText, 
  LifeBuoy, 
  LogOut, 
  Bell, 
  HelpCircle,
  Clock4,
  Plane,
  ClipboardList,
  ShieldCheck,
  LogOut as ClockOutIcon,
  LogIn as ClockInIcon,
  CheckCircle2,
  CalendarRange,
  Upload,
  Info,
  Download,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  StopCircle,
  Briefcase,
  User,
  MoreVertical,
  Plus,
  LayoutGrid,
  BarChart2,
  Shield,
  File,
  Menu,
  X,
  TrendingDown,
  Calendar as CalendarIcon,
  ArrowRightLeft,
  ArrowUpRight,
  Clock8,
  Timer,
  Play,
  History,
  FileCheck,
  FolderOpen,
  Sparkles,
  Tag,
  Gift,
  Lock
} from 'lucide-react';

// --- Reusable Components ---

const Badge = ({ children, type }) => {
  const badgeClasses = {
    present: 'badge-green',
    late: 'badge-yellow',
    absent: 'badge-red',
    leave: 'badge-blue',
    approved: 'badge-green',
    pending: 'badge-yellow',
    denied: 'badge-red',
    signed: 'badge-blue',
    review: 'badge-yellow',
    template: 'badge-blue'
  };
  return (
    <span className={`badge ${badgeClasses[type] || ''}`}>
      {children}
    </span>
  );
};

// --- Attendance Predictor Component ---

const AttendancePredictor = ({ currentScore }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const currentAttendance = parseFloat(currentScore);
  const totalWorkingDays = 30; 

  const mayWorkingDays = [4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30];
  const juneWorkingDays = [1, 2, 3, 4, 5, 6];

  const toggleDate = (dateKey) => {
    if (selectedDates.includes(dateKey)) {
      setSelectedDates(selectedDates.filter(d => d !== dateKey));
    } else {
      setSelectedDates([...selectedDates, dateKey]);
    }
  };

  const drop = ((selectedDates.length / 30) * 100).toFixed(2);
  const projected = (currentAttendance - parseFloat(drop)).toFixed(2);

  return (
    <div className="predictor-tool">
      <div className="predictor-header" style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
        <TrendingDown size={20} />
        <span style={{fontWeight: 800}}>Attendance Drop Predictor</span>
      </div>
      
      <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6}}>
        Select days to simulate absences during your impact period (May 4 – June 6). 
      </p>

      <div className="calendars-container">
        <div className="month-section">
          <h4 style={{fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem'}}>May 2026</h4>
          <div className="calendar-mini">
            {['M','T','W','Th','F','S','Su'].map(d => <div key={d} className="cal-day-label" style={{fontSize: '0.6rem', textAlign: 'center', fontWeight: 700}}>{d}</div>)}
            {[...Array(4)].map((_, i) => <div key={`may-pad-${i}`} className="cal-day disabled"></div>)}
            {[...Array(31)].map((_, i) => {
              const day = i + 1;
              const dateKey = `may-${day}`;
              const isWorking = mayWorkingDays.includes(day);
              return (
                <div 
                  key={dateKey} 
                  className={`cal-day ${!isWorking ? 'disabled' : ''} ${selectedDates.includes(dateKey) ? 'selected' : ''}`}
                  onClick={() => isWorking && toggleDate(dateKey)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="month-section">
          <h4 style={{fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem'}}>June 2026</h4>
          <div className="calendar-mini">
            {['M','T','W','Th','F','S','Su'].map(d => <div key={d} className="cal-day-label" style={{fontSize: '0.6rem', textAlign: 'center', fontWeight: 700}}>{d}</div>)}
            {[Array(0)].map((_, i) => <div key={`june-pad-${i}`} className="cal-day disabled"></div>)}
            {[...Array(30)].map((_, i) => {
              const day = i + 1;
              const dateKey = `june-${day}`;
              const isWorking = juneWorkingDays.includes(day);
              return (
                <div 
                  key={dateKey} 
                  className={`cal-day ${!isWorking ? 'disabled' : ''} ${selectedDates.includes(dateKey) ? 'selected' : ''}`}
                  onClick={() => isWorking && toggleDate(dateKey)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="predictor-result">
        <div>
          <div style={{fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8'}}>DROP</div>
          <div style={{fontSize: '1.25rem', fontWeight: 800, color: '#fca5a5'}}>-{drop}%</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8'}}>PROJECTED SCORE</div>
          <div style={{fontSize: '1.25rem', fontWeight: 800, color: '#4ade80'}}>{projected}%</div>
        </div>
      </div>
    </div>
  );
};

// --- Auth System Component ---
const AuthSystem = ({ onAuthComplete, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    impactType: 'Normal Impact'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isSupabaseConfigured) {
      // Local fallback for testing/demo
      const localUser = { 
        id: 'local-user', 
        email: formData.email, 
        password: formData.password, 
        full_name: formData.name || 'User',
        impact_type: formData.impactType 
      };
      
      if (mode === 'signup') {
        localStorage.setItem('impact_user_data', JSON.stringify(localUser));
        onAuthComplete(localUser); // Auto-login after local signup
      } else {
        const saved = localStorage.getItem('impact_user_data');
        const parsed = saved ? JSON.parse(saved) : null;
        if (parsed && parsed.email === formData.email && parsed.password === formData.password) {
          onAuthComplete(parsed);
        } else {
          throw new Error('Invalid local credentials.');
        }
      }
      setLoading(false);
      return;
    }

    try {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
                impact_type: formData.impactType
              }
            }
          });
          if (error) throw error;
          window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Verification email sent! Check your inbox.', type: 'success' } }));
          setMode('login');
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });
          if (error) throw error;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const normalizedUser = { 
            ...data.user, 
            ...profile,
            name: profile?.full_name || data.user.user_metadata?.full_name || 'User'
          };

          onAuthComplete(normalizedUser);
          window.dispatchEvent(new CustomEvent('toast', { detail: { message: `Welcome back, ${normalizedUser.name}!`, type: 'success' } }));
        }
      } catch (err) {
        window.dispatchEvent(new CustomEvent('toast', { detail: { message: err.message, type: 'error' } }));
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="modal-overlay" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
      <div className="setup-modal" style={{maxWidth: '450px', padding: '3rem'}}>
        <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
          <div style={{fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary-color)', letterSpacing: '0.3em', marginBottom: '1rem', textTransform: 'uppercase'}}>PU-IMPACT PORTAL</div>
          <div style={{width: 70, height: 70, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'}}>
            <Shield size={36} color="white" />
          </div>
          <h2 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.025em'}}>
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '1rem'}}>
            {mode === 'signup' ? 'Join the PU-IMPACT portal today.' : 'Please enter your details to sign in.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column'}}>
          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                placeholder="Amit Srivastava"
                className="setup-input"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com"
              className="setup-input"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="setup-input"
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">Impact Type</label>
              <select 
                className="setup-input"
                value={formData.impactType}
                onChange={e => setFormData({...formData, impactType: e.target.value})}
              >
                <option value="Normal Impact">Normal Impact (Active)</option>
                <option value="Marquee Impact" disabled>Marquee Impact (Locked 🔒)</option>
                <option value="Company-Based" disabled>Company-Based (Locked 🔒)</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{width: '100%', padding: '1.25rem', marginTop: '1rem', fontSize: '1rem'}}>
            {loading ? 'Processing...' : (mode === 'signup' ? 'Get Started' : 'Sign In')}
          </button>

          <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
            <button 
              type="button" 
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              style={{background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'}}
            >
              {mode === 'signup' ? 'Already have an account? Sign In' : 'Need an account? Create one'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OverviewView = ({ userName, currentScore }) => (
  <div className="view-content">
    <div style={{marginBottom: '2.5rem'}}>
      <h1 className="page-title">Welcome {userName || 'Amit'}</h1>
      <p className="page-subtitle">Your performance snapshot for the current impact period.</p>
    </div>

    <div className="stats-grid">
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <span style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)'}}>IMPACT PROGRESS</span>
          <TrendingDown size={14} />
        </div>
        <div style={{fontSize: '2rem', fontWeight: 800}}>{currentScore}%</div>
        <div style={{fontSize: '0.8rem', color: '#10b981', fontWeight: 600}}>Live calculation</div>
      </div>
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <span style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)'}}>PENDING TASKS</span>
          <ClipboardList size={14} />
        </div>
        <div style={{fontSize: '2rem', fontWeight: 800}}>00</div>
        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600}}>No pending tasks</div>
      </div>
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <span style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)'}}>ACTIVE DAYS</span>
          <CalendarIcon size={14} />
        </div>
        <div style={{fontSize: '2rem', fontWeight: 800}}>0/30</div>
        <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600}}>Impact period active</div>
      </div>
      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <span style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)'}}>SYSTEM STATUS</span>
          <ShieldCheck size={14} />
        </div>
        <div style={{fontSize: '2rem', fontWeight: 800}}>ACTIVE</div>
        <div style={{fontSize: '0.8rem', color: '#10b981', fontWeight: 600}}>Secure & Ready</div>
      </div>
    </div>

    <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem'}}>
      <div className="panel">
        <AttendancePredictor currentScore={currentScore} />
      </div>
      <div className="panel">
        <h3 style={{fontWeight: 800, marginBottom: '1.5rem'}}>Quick Actions</h3>
        <div className="quick-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
          {[
            { icon: CalendarRange, label: 'Request Leave', tab: 'leave-requests' },
            { icon: Upload, label: 'Upload Doc', tab: 'documents' },
            { icon: FileText, label: 'View Reports', tab: 'attendance' },
            { icon: HelpCircle, label: 'Get Support', tab: null }
          ].map((action, i) => (
            <div 
              key={i} 
              className="q-action-card" 
              onClick={() => {
                if (action.tab) setActiveTab(action.tab);
                else showToast('Support ticket system opening...', 'info');
              }}
              style={{padding: '1.5rem', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease'}}
            >
              <div style={{width: 40, height: 40, background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)'}}>
                <action.icon size={20} />
              </div>
              <div style={{fontSize: '0.85rem', fontWeight: 700}}>{action.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AttendanceView = ({ userName, impactDates, attendanceData, toggleStatus, toggleFullDay, currentScore }) => {
  return (
    <div className="view-content">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem'}}>
        <div>
          <h1 className="page-title">Attendance Record</h1>
          <p className="page-subtitle">Historical log of your impact period participation.</p>
        </div>
        <button className="clock-in-btn" style={{padding: '0.75rem 1.5rem'}}>
          <Download size={18} />
          <span>Export Log</span>
        </button>
      </div>

      <div className="attendance-grid">
        <div className="card">
          <div style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>PERIOD START</div>
          <div style={{fontSize: '1.25rem', fontWeight: 800}}>{impactDates.start}</div>
        </div>
        <div className="card">
          <div style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>PERIOD END</div>
          <div style={{fontSize: '1.25rem', fontWeight: 800}}>{impactDates.end}</div>
        </div>
        <div className="card">
          <div style={{fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>TOTAL WORKING DAYS</div>
          <div style={{fontSize: '1.25rem', fontWeight: 800}}>30 Days</div>
        </div>
        <div className="card" style={{background: 'var(--primary-color)', color: 'white'}}>
          <div style={{fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '0.5rem'}}>CURRENT SCORE</div>
          <div style={{fontSize: '1.75rem', fontWeight: 800, color: '#10b981'}}>{currentScore}%</div>
        </div>
      </div>

      <div className="table-panel">
        <div className="table-header">
          <h3 style={{fontWeight: 800}}>Daily Attendance Logs</h3>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>7:30-9:30</th>
              <th>9:30-11:30</th>
              <th style={{textAlign: 'center'}}>Lunch</th>
              <th>12:30-2:30</th>
              <th>Full Day</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((row) => (
              <tr key={row.id}>
                <td style={{fontWeight: 700}}>{row.date}</td>
                <td>
                  <AttendanceToggle current={row.s1} onToggle={(status) => toggleStatus(row.id, 's1', status)} />
                </td>
                <td>
                  <AttendanceToggle current={row.s2} onToggle={(status) => toggleStatus(row.id, 's2', status)} />
                </td>
                <td style={{textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600}}>
                  11:30-12:30
                </td>
                <td>
                  <AttendanceToggle current={row.s3} onToggle={(status) => toggleStatus(row.id, 's3', status)} />
                </td>
                <td>
                  <div style={{display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', width: 'fit-content'}}>
                    <button 
                      onClick={() => toggleFullDay(row.id, 'present')}
                      className={`toggle-btn-full ${row.s1 === 'present' && row.s2 === 'present' && row.s3 === 'present' ? 'active-p' : ''}`}
                    >FULL P</button>
                    <button 
                      onClick={() => toggleFullDay(row.id, 'absent')}
                      className={`toggle-btn-full ${row.s1 === 'absent' && row.s2 === 'absent' && row.s3 === 'absent' ? 'active-a' : ''}`}
                    >FULL A</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AttendanceToggle = ({ current, onToggle }) => (
  <div className="attendance-toggle-group">
    <button 
      onClick={() => onToggle('present')}
      className={`att-toggle present ${current === 'present' ? 'active' : ''}`}
    >P</button>
    <button 
      onClick={() => onToggle('absent')}
      className={`att-toggle absent ${current === 'absent' ? 'active' : ''}`}
    >A</button>
  </div>
);

const TimeTrackingView = ({ userName, shiftLogs, isClockedIn, onClockAction }) => (
  <div className="view-content">
    <div style={{marginBottom: '2.5rem'}}>
      <h1 className="page-title">Time Tracking</h1>
      <p className="page-subtitle">Real-time shift management and log monitoring.</p>
    </div>

    <div className="time-tracking-layout">
      <div className="panel timer-panel" style={{borderRadius: '24px', background: isClockedIn ? 'var(--secondary)' : 'var(--primary)'}}>
        <div style={{fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, letterSpacing: '0.1em'}}>
          {isClockedIn ? 'SHIFT IN PROGRESS' : 'READY TO START'}
        </div>
        <div className="timer-display">{isClockedIn ? '00:15:24' : '00:00:00'}</div>
        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
          <button 
            className={`timer-btn ${isClockedIn ? 'stop' : 'start'}`}
            onClick={onClockAction}
          >
            {isClockedIn ? <StopCircle size={20} /> : <Play size={20} />}
            {isClockedIn ? 'Stop Shift' : 'Start Shift'}
          </button>
        </div>
        <div style={{marginTop: '2rem', width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
            <span style={{opacity: 0.7}}>Today's Total</span>
            <span style={{fontWeight: 700}}>{isClockedIn ? '0h 15m' : '0h 00m'}</span>
          </div>
          <div style={{height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px'}}>
            <div style={{width: isClockedIn ? '5%' : '0%', height: '100%', background: '#10b981', borderRadius: '3px', transition: 'width 0.5s ease'}}></div>
          </div>
        </div>
      </div>

      <div className="table-panel">
        <div className="table-header">
          <h3 style={{fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <History size={20} /> Recent Shifts
          </h3>
          <button style={{background: 'none', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'}}>
            View History
          </button>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>In</th>
              <th>Out</th>
              <th>Break</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {shiftLogs.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>No recent shifts found.</td></tr>
            ) : (
              shiftLogs.map((row, i) => (
                <tr key={i}>
                  <td style={{fontWeight: 700}}>{row.date}</td>
                  <td>{row.in}</td>
                  <td>{row.out}</td>
                  <td style={{color: 'var(--text-secondary)'}}>{row.brk}</td>
                  <td style={{fontWeight: 700}}>{row.tot}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const LeaveRequestsView = ({ userName, leaveBalances, leaveRequests }) => (
  <div className="view-content">
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem'}}>
      <div>
        <h1 className="page-title">Leave Management</h1>
        <p className="page-subtitle">Track your leave balances and pending requests.</p>
      </div>
      <button className="clock-in-btn" style={{padding: '0.75rem 1.5rem'}}>
        <Plus size={18} />
        <span>New Request</span>
      </button>
    </div>

    <div className="leave-grid">
      {[
        { label: 'ANNUAL LEAVE', val: leaveBalances.annual, color: '#3b82f6' },
        { label: 'SICK LEAVE', val: leaveBalances.sick, color: '#ef4444' },
        { label: 'CASUAL LEAVE', val: leaveBalances.casual, color: '#f59e0b' },
        { label: 'IMPACT ADJUST', val: leaveBalances.impact, color: '#10b981' }
      ].map((leave, i) => (
        <div key={i} className="card leave-balance-card">
          <div>
            <div className="leave-type">{leave.label}</div>
            <div className="leave-number" style={{color: leave.color}}>{leave.val < 10 ? `0${leave.val}` : leave.val}</div>
            <div style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)'}}>Days Remaining</div>
          </div>
          <div style={{width: 40, height: 40, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <BarChart2 size={18} color={leave.color} />
          </div>
        </div>
      ))}
    </div>

    <div className="table-panel">
      <div className="table-header">
        <h3 style={{fontWeight: 800}}>Request Status</h3>
      </div>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Duration</th>
            <th>Applied On</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.length === 0 ? (
            <tr><td colSpan="5" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>No leave requests found.</td></tr>
          ) : (
            leaveRequests.map((row, i) => (
              <tr key={i}>
                <td style={{fontWeight: 700}}>{row.type}</td>
                <td>{row.dur}</td>
                <td style={{color: 'var(--text-secondary)'}}>{row.date}</td>
                <td style={{fontSize: '0.85rem'}}>{row.reason}</td>
                <td><Badge type={row.status}>{row.status.toUpperCase()}</Badge></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const DocumentsView = ({ userName, documents }) => (
  <div className="view-content">
    <div style={{marginBottom: '2.5rem'}}>
      <h1 className="page-title">Document Center</h1>
      <p className="page-subtitle">Access your policies, impact agreements, and payroll files.</p>
    </div>

    <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem'}}>
      {[
        { label: 'Impact Agreements', count: documents.filter(d => d.cat === 'impact').length, icon: ShieldCheck, color: '#10b981' },
        { label: 'Company Policies', count: documents.filter(d => d.cat === 'policy').length, icon: FileText, color: '#3b82f6' },
        { label: 'Payroll & Tax', count: documents.filter(d => d.cat === 'payroll').length, icon: ClipboardList, color: '#f59e0b' }
      ].map((cat, i) => (
        <div key={i} className="card" style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
          <div style={{width: 50, height: 50, background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color}}>
            <cat.icon size={24} />
          </div>
          <div>
            <h4 style={{fontWeight: 800}}>{cat.label}</h4>
            <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{cat.count} Documents available</p>
          </div>
        </div>
      ))}
    </div>

    <div className="table-panel">
      <div className="table-header">
        <h3 style={{fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
          <FolderOpen size={20} /> All Documents
        </h3>
        <div style={{background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Filter documents..." style={{border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem'}} />
        </div>
      </div>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Type</th>
            <th>Modified</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {documents.length === 0 ? (
            <tr><td colSpan="5" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)'}}>No documents available yet.</td></tr>
          ) : (
            documents.map((row, i) => (
              <tr key={i}>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <File size={18} color="var(--text-secondary)" />
                    <span style={{fontWeight: 700}}>{row.name}</span>
                  </div>
                </td>
                <td style={{fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)'}}>{row.type}</td>
                <td style={{color: 'var(--text-secondary)'}}>{row.date}</td>
                <td><Badge type={row.status}>{row.status.toUpperCase()}</Badge></td>
                <td>
                  <button style={{background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer'}} title="Download">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const PromotionsView = () => (
  <div className="view-content">
    <div style={{marginBottom: '2.5rem'}}>
      <h1 className="page-title">Promotions & Updates</h1>
      <p className="page-subtitle">Exclusive offers and important company announcements.</p>
    </div>

    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem'}}>
      <div className="card" style={{background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', padding: '2.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem'}}>
          <div style={{background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'}}>FEATURED OFFER</div>
          <Tag size={24} />
        </div>
        <h2 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1}}>Early Performance Bonus</h2>
        <p style={{opacity: 0.9, marginBottom: '2rem', maxWidth: '300px'}}>Complete 100% of your impact sessions to qualify for a mid-period incentive.</p>
        <button style={{background: 'white', color: '#6366f1', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer'}}>Learn More</button>
      </div>

      <div className="card" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '2px dashed var(--border-color)', background: 'transparent'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: 60, height: 60, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'}}>
            <Gift size={24} color="var(--text-secondary)" />
          </div>
          <h3 style={{fontWeight: 800, marginBottom: '0.5rem'}}>More Coming Soon</h3>
          <p style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>Stay tuned for upcoming promotions.</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Toast & Overlay Components ---

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      {type === 'success' && <CheckCircle2 size={20} color="var(--success)" />}
      {type === 'error' && <X size={20} color="var(--error)" />}
      {type === 'info' && <Info size={20} color="var(--info)" />}
      <span>{message}</span>
    </div>
  );
};

// --- Main App Component ---

function App() {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isClockedIn, setIsClockedIn] = useState(false);

  const handleClockAction = async () => {
    const newState = !isClockedIn;
    setIsClockedIn(newState);
    
    if (newState) {
      // Automark full attendance for today (May 11)
      const todayId = 'may-11';
      setAttendanceData(prev => prev.map(row => 
        row.id === todayId ? { ...row, s1: 'present', s2: 'present', s3: 'present' } : row
      ));

      // Persist to DB if logged in
      if (userData && userData.id) {
        try {
          await supabase.from('attendance_logs')
            .update({ s1: 'present', s2: 'present', s3: 'present' })
            .eq('id', todayId);
        } catch (err) {
          console.error('Failed to sync auto-attendance:', err);
        }
      }
      showToast('Shift started & Attendance marked!', 'success');
    } else {
      showToast('Shift ended!', 'info');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  useEffect(() => {
    const handleToast = (e) => showToast(e.detail.message, e.detail.type);
    window.addEventListener('toast', handleToast);
    return () => window.removeEventListener('toast', handleToast);
  }, []);
  const [attendanceData, setAttendanceData] = useState(() => {
    const savedLog = localStorage.getItem('impact_attendance_log');
    if (savedLog) return JSON.parse(savedLog);
    
    const rows = [];
    const excludedMayDays = [10, 17, 24, 31]; // Sundays, no classes
    for (let d = 4; d <= 31; d++) {
      if (excludedMayDays.includes(d)) continue;
      rows.push({ id: `may-${d}`, date: `May ${d < 10 ? '0'+d : d}, 2026`, s1: 'absent', s2: 'absent', s3: 'absent' });
    }
    for (let d = 1; d <= 6; d++) {
      rows.push({ id: `june-${d}`, date: `June 0${d}, 2026`, s1: 'absent', s2: 'absent', s3: 'absent' });
    }
    return rows;
  });

  const [shiftLogs, setShiftLogs] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState({ annual: 0, sick: 0, casual: 0, impact: 0 });
  const [documents, setDocuments] = useState([]);

  const impactDates = { start: 'May 04, 2026', end: 'June 06, 2026' };

  useEffect(() => {
    const savedData = localStorage.getItem('impact_user_data');
    if (!savedData) {
      setShowSetup(true);
    } else {
      const parsedData = JSON.parse(savedData);
      setUserData(parsedData);
      setIsLoggedIn(true);
      if (parsedData.id) {
        loadAttendance(parsedData.id);
      }
    }
  }, []);

  useEffect(() => {
    // Keep local backup optionally, or rely purely on cloud
    if (attendanceData.length > 0) {
      localStorage.setItem('impact_attendance_log', JSON.stringify(attendanceData));
    }
  }, [attendanceData]);

  const loadAttendance = async (userId) => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('impact_attendance_log');
      if (saved) setAttendanceData(JSON.parse(saved));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        setAttendanceData(data);
      } else if (!error && data && data.length === 0) {
        // First login, generate initial records
        const rows = [];
        const excludedMayDays = [10, 17, 24, 31];
        for (let d = 4; d <= 31; d++) {
          if (excludedMayDays.includes(d)) continue;
          rows.push({ user_id: userId, date: `May ${d < 10 ? '0'+d : d}, 2026`, s1: 'absent', s2: 'absent', s3: 'absent' });
        }
        for (let d = 1; d <= 6; d++) {
          rows.push({ user_id: userId, date: `June 0${d}, 2026`, s1: 'absent', s2: 'absent', s3: 'absent' });
        }
        const { data: insertedData, error: insertError } = await supabase
          .from('attendance_logs')
          .insert(rows)
          .select();
        
        if (!insertError && insertedData) {
          setAttendanceData(insertedData);
        }
      }
    } catch (err) {
      console.warn("Cloud load failed, using local backup:", err);
      const saved = localStorage.getItem('impact_attendance_log');
      if (saved) setAttendanceData(JSON.parse(saved));
    }
  };

  const handleAuthComplete = (data) => {
    const normalizedData = {
      ...data,
      name: data.full_name || data.name || 'User',
      isAdmin: data.email === 'amit4072004@gmail.com'
    };
    setUserData(normalizedData);
    setIsAdmin(normalizedData.isAdmin);
    localStorage.setItem('impact_user_data', JSON.stringify(normalizedData));
    setShowSetup(false);
    setIsLoggedIn(true);
    if (normalizedData.id) {
      loadAttendance(normalizedData.id);
    }
  };

  const handleLogout = () => {
    try {
      if (isSupabaseConfigured) {
        supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Logout error:', err);
    }
    localStorage.removeItem('impact_user_data');
    localStorage.removeItem('impact_attendance_log');
    setIsLoggedIn(false);
    setUserData(null);
    setShowSetup(true);
    showToast('Logged out successfully', 'info');
  };

  const toggleStatus = async (id, slot, status) => {
    setAttendanceData(prev => prev.map(row => 
      row.id === id ? { ...row, [slot]: status } : row
    ));

    // Update DB
    if (userData && userData.id) {
      await supabase
        .from('attendance_logs')
        .update({ [slot]: status })
        .eq('id', id);
    }
  };

  const toggleFullDay = async (id, status) => {
    setAttendanceData(prev => prev.map(row => 
      row.id === id ? { ...row, s1: status, s2: status, s3: status } : row
    ));

    // Update DB
    if (userData && userData.id) {
      await supabase
        .from('attendance_logs')
        .update({ s1: status, s2: status, s3: status })
        .eq('id', id);
    }
  };

  // Admin helper: Mark a whole day as leave (sets all three slots to 'leave')
  const markLeave = async (dayId) => {
    // Update local state
    setAttendanceData(prev => prev.map(row =>
      row.id === dayId ? { ...row, s1: 'leave', s2: 'leave', s3: 'leave' } : row
    ));
    // Persist to DB if logged in
    if (userData && userData.id) {
      await supabase.from('attendance_logs')
        .update({ s1: 'leave', s2: 'leave', s3: 'leave' })
        .eq('id', dayId);
    }
    showToast('Day marked as Leave', 'success');
  };

  const adjustShift = async (dayId, slot, status) => {
    setAttendanceData(prev => prev.map(row => 
      row.id === dayId ? { ...row, [slot]: status } : row
    ));
    if (userData && userData.id) {
      await supabase.from('attendance_logs')
        .update({ [slot]: status })
        .eq('id', dayId);
    }
    showToast('Shift updated successfully', 'success');
  };

  const calculateScore = () => {
    let totalPresent = 0;
    attendanceData.forEach(row => {
      ['s1', 's2', 's3'].forEach(s => {
        if (row[s] === 'present') totalPresent++;
      });
    });
    // Total shifts = 30 days * 3 shifts = 90
    return ((totalPresent / 90) * 100).toFixed(2);
  };

  // Admin Panel Component
  const AdminPanel = () => (
    <div className="modal-overlay">
      <div className="setup-modal" style={{maxWidth: '650px'}}>
        <div className="admin-header">
          <h2 style={{fontWeight: 900, letterSpacing: '-0.04em'}}>Admin Control Center</h2>
          <Shield size={24} color="var(--primary)" />
        </div>

        <div className="admin-section">
          <h3>Mark Day as Leave</h3>
          <div className="admin-grid">
            <div className="input-group" style={{marginBottom: 0, flex: 1}}>
              <label className="input-label">Select Date</label>
              <select id='admin-leave-select' className="admin-select">
                {attendanceData.map(row => (
                  <option key={row.id} value={row.id}>{row.date}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => {
              const sel = document.getElementById('admin-leave-select');
              if (sel) markLeave(sel.value);
            }}>Apply Leave</button>
          </div>
        </div>

        <div className="admin-section">
          <h3>Shift Adjustment</h3>
          <div className="admin-grid" style={{gridTemplateColumns: 'repeat(3, 1fr) auto'}}>
            <div className="input-group" style={{marginBottom: 0}}>
              <label className="input-label">Day</label>
              <select id='admin-day-select' className="admin-select">
                {attendanceData.map(row => (
                  <option key={row.id} value={row.id}>{row.date}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{marginBottom: 0}}>
              <label className="input-label">Shift</label>
              <select id='admin-slot-select' className="admin-select">
                <option value='s1'>Shift 1 (7:30)</option>
                <option value='s2'>Shift 2 (9:30)</option>
                <option value='s3'>Shift 3 (12:30)</option>
              </select>
            </div>
            <div className="input-group" style={{marginBottom: 0}}>
              <label className="input-label">Status</label>
              <select id='admin-status-select' className="admin-select">
                <option value='present'>Present</option>
                <option value='absent'>Absent</option>
                <option value='leave'>Leave</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => {
              const day = document.getElementById('admin-day-select').value;
              const slot = document.getElementById('admin-slot-select').value;
              const status = document.getElementById('admin-status-select').value;
              adjustShift(day, slot, status);
            }}>Apply</button>
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
          <button className="btn btn-outline" onClick={() => setIsAdmin(false)}>
            Close Admin Panel
          </button>
        </div>
      </div>
    </div>
  );

  const currentScore = calculateScore();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);



  if (!isLoggedIn || showSetup) {
    return <AuthSystem onAuthComplete={handleAuthComplete} initialMode="login" />;
  }

  return (
    <div className="app-container">
      <div className="dynamic-bg"></div>
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} 
          />
        ))}
      </div>
      {isAdmin && <AdminPanel />}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo"><LayoutGrid size={20} color="white" /></div>
          <div>
            <h1>PU-IMPACT</h1>
            <p style={{fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Precision Analytics</p>
          </div>
          <button className="mobile-close-btn" onClick={closeSidebar}><X size={20} /></button>
        </div>

        <button 
          className={`clock-in-btn ${isClockedIn ? 'clocked-in' : ''}`}
          onClick={handleClockAction}
          style={{
            background: isClockedIn ? 'var(--error)' : 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            boxShadow: isClockedIn ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}
        >
          {isClockedIn ? <StopCircle size={20} /> : <Clock size={20} />}
          <span>{isClockedIn ? 'Mark Leave' : 'Mark Full Day'}</span>
        </button>
        
        <nav className="nav-menu">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard, locked: false },
            { id: 'attendance', label: 'Attendance', icon: CalendarDays, locked: false },
            { id: 'time-tracking', label: 'Time Tracking', icon: Clock, locked: true },
            { id: 'leave-requests', label: 'Leave Requests', icon: CalendarClock, locked: true },
            { id: 'documents', label: 'Documents', icon: FileText, locked: true },
            { id: 'promotions', label: 'Promotions', icon: Sparkles, locked: true }
          ].map(item => (
            <a 
              key={item.id}
              href="#" 
              className={`nav-item ${activeTab === item.id ? 'active' : ''} ${item.locked ? 'locked-feature' : ''}`} 
              onClick={(e) => { 
                e.preventDefault(); 
                if (!item.locked) {
                  setActiveTab(item.id); 
                  closeSidebar();
                }
              }}
              style={{opacity: item.locked ? 0.6 : 1, cursor: item.locked ? 'not-allowed' : 'pointer'}}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.locked && <Lock size={14} style={{marginLeft: 'auto', opacity: 0.5}} />}
            </a>
          ))}
        </nav>
        
        <div className="nav-bottom" style={{marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', padding: '1rem'}}>
          <button 
            onClick={handleLogout}
            className="nav-item logout-btn" 
            style={{
              width: '100%', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: 'none', 
              color: '#ef4444', 
              justifyContent: 'center', 
              cursor: 'pointer',
              padding: '0.75rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 700
            }}
          >
            <LogOut size={18} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="mobile-header">
          <button className="menu-toggle" onClick={toggleSidebar}><Menu size={24} /></button>
          <div className="mobile-logo-text">PU-IMPACT</div>
          <div className="mobile-header-actions"><Bell size={22} /></div>
        </header>

        <div className="view-container">
          {activeTab === 'overview' && <OverviewView userName={userData?.name} currentScore={currentScore} />}
          {activeTab === 'attendance' && (
            <AttendanceView 
              userName={userData?.name} 
              impactDates={impactDates} 
              attendanceData={attendanceData} 
              toggleStatus={toggleStatus}
              toggleFullDay={toggleFullDay}
              currentScore={currentScore}
            />
          )}
          {activeTab === 'time-tracking' && <TimeTrackingView userName={userData?.name} shiftLogs={shiftLogs} isClockedIn={isClockedIn} onClockAction={handleClockAction} />}
          {activeTab === 'leave-requests' && <LeaveRequestsView userName={userData?.name} leaveBalances={leaveBalances} leaveRequests={leaveRequests} />}
          {activeTab === 'documents' && <DocumentsView userName={userData?.name} documents={documents} />}
          {activeTab === 'promotions' && <PromotionsView />}
        </div>
      </main>
    </div>
  );
}

export default App;
