import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  BarChart3,
  Dumbbell,
  Target,
  TrendingUp,
  Clock,
  Zap,
  User,
  LogOut,
  Edit,
  Trash2,
  X,
  Heart,
} from 'lucide-react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import WorkoutList from './components/WorkoutList';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import { load, save } from './utils/storage';
import { exerciseDatabase } from './utils/exerciseDatabase';


const App = () => {
  const [activeTab, setActiveTab] = useState('workout');
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showWorkoutDetail, setShowWorkoutDetail] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState('');
  
  // États pour le système de login
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState([]);
  const [token, setToken] = useState(null);
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  // Base de données d'exercices par groupe musculaire

  useEffect(() => {
    const lastUsername = load('iciCaPousse_lastUsername', '');
    if (lastUsername) {
      setLoginForm((lf) => ({ ...lf, username: lastUsername }));
    }

    const storedToken = load('iciCaPousse_token', null);
    if (storedToken) {
      fetch('/api/validate', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.user) {
            setCurrentUser(data.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('iciCaPousse_token');
          }
        })
        .catch(() => {});
    }

    fetch('/api/users')
      .then((res) => (res.ok ? res.json() : []))
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (currentUser) {
      setWorkouts(load(`iciCaPousse_workouts_${currentUser.id}`, []));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      save(`iciCaPousse_workouts_${currentUser.id}`, workouts);
    }
  }, [currentUser, workouts]);

  useEffect(() => {
    if (token) {
      save('iciCaPousse_token', token);
    }
  }, [token]);

  // Fonctions utilitaires
  const addExerciseToWorkout = (exercise) => {
    const newExercise = {
      id: Date.now(),
      name: exercise,
      sets: [{ reps: 0, weight: 0, duration: 0 }],
      type: Object.keys(exerciseDatabase).find(key => exerciseDatabase[key].includes(exercise))
    };
    setExercises([...exercises, newExercise]);
    setShowAddExercise(false);
    setSelectedMuscleGroup(null); // Reset muscle group selection
  };

  const addSet = (exerciseId) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0, duration: 0 }] }
        : ex
    ));
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { 
            ...ex, 
            sets: ex.sets.map((set, idx) => 
              idx === setIndex ? { ...set, [field]: parseInt(value) || 0 } : set
            )
          }
        : ex
    ));
  };

  const removeSet = (exerciseId, setIndex) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, sets: ex.sets.filter((_, idx) => idx !== setIndex) }
        : ex
    ));
  };

  const saveWorkout = () => {
    if (exercises.length === 0) return;
    
    const workout = {
      id: isEditingWorkout ? editingWorkoutId : Date.now(),
      date: selectedDate,
      exercises: exercises,
      duration: parseInt(workoutDuration) || 30,
      totalSets: exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
      totalReps: exercises.reduce((acc, ex) => acc + ex.sets.reduce((setAcc, set) => setAcc + set.reps, 0), 0),
      totalWeight: exercises.reduce((acc, ex) => acc + ex.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0), 0)
    };
    
    if (isEditingWorkout) {
      setWorkouts(workouts.map(w => w.id === editingWorkoutId ? workout : w));
      setIsEditingWorkout(false);
      setEditingWorkoutId(null);
      alert('Séance modifiée avec succès ! 💪');
    } else {
      setWorkouts([...workouts, workout]);
      alert('Séance sauvegardée ! Bien joué ! 🎉');
    }
    
    setExercises([]);
    setCurrentWorkout(null);
    setWorkoutDuration('');
  };

  const getWorkoutForDate = (date) => {
    return workouts.find(w => w.date === date);
  };

  const getStats = () => {
    const totalWorkouts = workouts.length;
    const totalSets = workouts.reduce((acc, w) => acc + w.totalSets, 0);
    const totalReps = workouts.reduce((acc, w) => acc + w.totalReps, 0);
    const totalWeight = workouts.reduce((acc, w) => acc + w.totalWeight, 0);
    const avgDuration = workouts.length > 0 ? Math.round(workouts.reduce((acc, w) => acc + w.duration, 0) / workouts.length) : 0;
    
    return { totalWorkouts, totalSets, totalReps, totalWeight, avgDuration };
  };

  const openWorkoutDetail = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutDetail(true);
  };

  const editWorkout = (workout) => {
    setIsEditingWorkout(true);
    setEditingWorkoutId(workout.id);
    setSelectedDate(workout.date);
    setExercises(workout.exercises);
    setWorkoutDuration(workout.duration.toString());
    setActiveTab('workout');
    setShowWorkoutDetail(false);
  };

  const deleteWorkout = (workoutId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette séance ? 🗑️')) {
      setWorkouts(workouts.filter(w => w.id !== workoutId));
      setShowWorkoutDetail(false);
    }
  };

  // Fonctions d'authentification
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setToken(data.token);
        setShowLogin(false);
        setLoginForm({ username: '', password: '' });
        save('iciCaPousse_lastUsername', data.user.username);
      } else {
        alert("Nom d'utilisateur ou mot de passe incorrect 😕");
      }
    } catch (err) {
      alert('Erreur de connexion');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas 🔒');
      return;
    }
    if (registerForm.username.length < 3) {
      alert("Le nom d'utilisateur doit contenir au moins 3 caractères ✏️");
      return;
    }
    if (registerForm.password.length < 4) {
      alert('Le mot de passe doit contenir au moins 4 caractères 🔐');
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: registerForm.username, password: registerForm.password }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setToken(data.token);
        setShowLogin(false);
        setRegisterForm({ username: '', password: '', confirmPassword: '' });
        setIsRegistering(false);
        save('iciCaPousse_lastUsername', data.user.username);
        fetch('/api/users')
          .then((r) => (r.ok ? r.json() : []))
          .then(setUsers)
          .catch(() => {});
      } else {
        const err = await res.json();
        alert(err.error || 'Erreur de création de compte');
      }
    } catch (err) {
      alert('Erreur de création de compte');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setWorkouts([]);
    setExercises([]);
    setSelectedMuscleGroup(null);
    localStorage.removeItem('iciCaPousse_token');
    setToken(null);
    const lastUsername = load('iciCaPousse_lastUsername', '');
    setLoginForm({ username: lastUsername, password: '' });
    setActiveTab('workout');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Affichage conditionnel : écran de connexion ou application */}
      {!currentUser ? (
        <LoginScreen
          isRegistering={isRegistering}
          loginForm={loginForm}
          setLoginForm={setLoginForm}
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          handleLogin={handleLogin}
          handleRegister={handleRegister}
          toggleRegistering={() => setIsRegistering(!isRegistering)}
          users={users}
        />
      ) : (
        <>
          {/* Header modernisé */}
          <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                    <Dumbbell className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Ici Ca Pousse
                    </h1>
                    <p className="text-sm text-gray-600 font-medium">{workouts.length} séances effectuées</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 py-2 rounded-xl border border-indigo-200">
                    <User className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-800">{currentUser?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all duration-200"
                    title="Se déconnecter"
                  >
                    <LogOut className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Navigation modernisée */}
          <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
            <div className="px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('workout')}
                  className={`py-4 px-4 border-b-3 font-bold text-sm transition-all duration-200 ${
                    activeTab === 'workout'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  } rounded-t-lg`}
                >
                  <div className="flex items-center space-x-2">
                    <Dumbbell className="h-5 w-5" />
                    <span>Séance</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`py-4 px-4 border-b-3 font-bold text-sm transition-all duration-200 ${
                    activeTab === 'calendar'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  } rounded-t-lg`}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Calendrier</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-4 px-4 border-b-3 font-bold text-sm transition-all duration-200 ${
                    activeTab === 'stats'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  } rounded-t-lg`}
                >
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Statistiques</span>
                  </div>
                </button>
              </div>
            </div>
          </nav>

          {/* Content */}
            <main className="max-w-6xl mx-auto">
              {activeTab === 'workout' && (
                <WorkoutList
                  isEditingWorkout={isEditingWorkout}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  exercises={exercises}
                  addSet={addSet}
                  updateSet={updateSet}
                  removeSet={removeSet}
                  saveWorkout={saveWorkout}
                  workoutDuration={workoutDuration}
                  setWorkoutDuration={setWorkoutDuration}
                  showAddExercise={showAddExercise}
                  setShowAddExercise={setShowAddExercise}
                  selectedMuscleGroup={selectedMuscleGroup}
                  setSelectedMuscleGroup={setSelectedMuscleGroup}
                  addExerciseToWorkout={addExerciseToWorkout}
                />
              )}
              {activeTab === 'calendar' && (
                <CalendarView
                  workouts={workouts}
                  getWorkoutForDate={getWorkoutForDate}
                  openWorkoutDetail={openWorkoutDetail}
                  showWorkoutDetail={showWorkoutDetail}
                  selectedWorkout={selectedWorkout}
                  editWorkout={editWorkout}
                  deleteWorkout={deleteWorkout}
                  setShowWorkoutDetail={setShowWorkoutDetail}
                />
              )}
              {activeTab === 'stats' && (
                <StatsView stats={getStats()} workouts={workouts} />
              )}
            </main>
        </>
      )}
    </div>
  );
};

export default App;
