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
import { load, save } from './utils/storage';
import { hashPassword } from './utils/hash';

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
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  // Base de données d'exercices par groupe musculaire
  const exerciseDatabase = {
    pectoraux: [
      'Développé couché', 'Développé incliné', 'Développé décliné', 'Pompes', 'Écarté couché',
      'Écarté incliné', 'Développé haltères', 'Dips', 'Pull-over', 'Pec deck'
    ],
    dos: [
      'Tractions', 'Rowing barre', 'Rowing haltères', 'Tirage horizontal', 'Tirage vertical',
      'Soulevé de terre', 'Rowing T-bar', 'Shrugs', 'Hyperextensions', 'Tirage poulie haute'
    ],
    épaules: [
      'Développé militaire', 'Élévations latérales', 'Élévations frontales', 'Oiseau',
      'Développé Arnold', 'Upright row', 'Face pull', 'Handstand push-up'
    ],
    biceps: [
      'Curl barre', 'Curl haltères', 'Curl marteau', 'Curl concentré', 'Curl pupitre',
      'Curl 21', 'Traction supination', 'Curl câble'
    ],
    triceps: [
      'Dips', 'Extension couché', 'Extension verticale', 'Pompes diamant', 'Kick back',
      'Extension poulie haute', 'Développé serré'
    ],
    jambes: [
      'Squat', 'Leg press', 'Fentes', 'Leg curl', 'Leg extension', 'Soulevé de terre roumain',
      'Mollets debout', 'Mollets assis', 'Hack squat', 'Goblet squat'
    ],
    abdos: [
      'Crunch', 'Planche', 'Relevé de jambes', 'Russian twist', 'Mountain climbers',
      'Bicycle crunch', 'Dead bug', 'Hanging knee raise'
    ],
    cardio: [
      'Course à pied', 'Vélo', 'Elliptique', 'Rameur', 'Tapis de course', 'Vélo spinning',
      'Stepper', 'Corde à sauter', 'Burpees', 'Jumping jacks', 'High knees', 'Montées de genoux',
      'Sprint', 'Marche rapide', 'Natation', 'Aquabike', 'HIIT', 'Tabata'
    ]
  };

  useEffect(() => {
    setUsers(load('iciCaPousse_users', []));
    const user = load('iciCaPousse_currentUser', null);
    if (user) {
      setCurrentUser(user);
    }
    const lastUsername = load('iciCaPousse_lastUsername', '');
    if (lastUsername) {
      setLoginForm((lf) => ({ ...lf, username: lastUsername }));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      setWorkouts(load(`iciCaPousse_workouts_${currentUser.id}`, []));
    }
  }, [currentUser]);

  useEffect(() => {
    save('iciCaPousse_users', users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      save('iciCaPousse_currentUser', currentUser);
      save(`iciCaPousse_workouts_${currentUser.id}`, workouts);
    }
  }, [currentUser, workouts]);

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
    const hashed = await hashPassword(loginForm.password);
    const user = users.find(u => u.username === loginForm.username && u.password === hashed);
    if (user) {
      setCurrentUser(user);
      setShowLogin(false);
      setLoginForm({ username: '', password: '' });
      save('iciCaPousse_lastUsername', user.username);
    } else {
      alert('Nom d\'utilisateur ou mot de passe incorrect 😕');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas 🔒');
      return;
    }
    if (users.some(u => u.username === registerForm.username)) {
      alert('Ce nom d\'utilisateur existe déjà 👤');
      return;
    }
    if (registerForm.username.length < 3) {
      alert('Le nom d\'utilisateur doit contenir au moins 3 caractères ✏️');
      return;
    }
    if (registerForm.password.length < 4) {
      alert('Le mot de passe doit contenir au moins 4 caractères 🔐');
      return;
    }

    const hashed = await hashPassword(registerForm.password);
    const newUser = {
      id: Date.now(),
      username: registerForm.username,
      password: hashed,
      createdAt: new Date().toISOString()
    };
    
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setShowLogin(false);
    setRegisterForm({ username: '', password: '', confirmPassword: '' });
    setIsRegistering(false);
    save('iciCaPousse_lastUsername', newUser.username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setWorkouts([]);
    setExercises([]);
    setSelectedMuscleGroup(null);
    localStorage.removeItem('iciCaPousse_currentUser');
    const lastUsername = load('iciCaPousse_lastUsername', '');
    setLoginForm({ username: lastUsername, password: '' });
    setActiveTab('workout');
  };

  const renderWorkoutTab = () => (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {isEditingWorkout ? '✏️ Modifier la séance' : '🏋️ Nouvelle séance'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEditingWorkout ? 'Modifiez votre séance existante' : 'Créez votre programme d\'entraînement'}
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-md border border-gray-100">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-0 outline-none font-medium text-gray-700"
          />
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl inline-block mb-6 shadow-lg">
            <Dumbbell className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Prêt à vous entraîner ? 💪</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Commencez votre séance en ajoutant des exercices de musculation ou de cardio
          </p>
          <button
            onClick={() => setShowAddExercise(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl flex items-center space-x-3 mx-auto font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter un exercice</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    exercise.type === 'cardio' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {exercise.type === 'cardio' ? <Heart className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      exercise.type === 'cardio' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {exercise.type === 'cardio' ? 'Cardio' : 'Musculation'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => addSet(exercise.id)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className={`grid gap-3 text-sm font-semibold text-gray-600 pb-2 border-b border-gray-200 ${
                  exercise.type === 'cardio' ? 'grid-cols-4' : 'grid-cols-5'
                }`}>
                  <span>Série</span>
                  {exercise.type === 'cardio' ? (
                    <>
                      <span>Durée (min)</span>
                      <span>Intensité</span>
                      <span>Calories</span>
                    </>
                  ) : (
                    <>
                      <span>Répétitions</span>
                      <span>Poids (kg)</span>
                      <span>Total</span>
                      <span></span>
                    </>
                  )}
                </div>
                
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className={`grid gap-3 items-center ${
                    exercise.type === 'cardio' ? 'grid-cols-4' : 'grid-cols-5'
                  }`}>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-lg px-3 py-2 text-center">
                      {setIndex + 1}
                    </span>
                    {exercise.type === 'cardio' ? (
                      <>
                        <input
                          type="number"
                          value={set.duration}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'duration', e.target.value)}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-red-500 focus:outline-none transition-colors duration-200"
                          min="0"
                          placeholder="20"
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'reps', e.target.value)}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-red-500 focus:outline-none transition-colors duration-200"
                          min="1"
                          max="10"
                          placeholder="7"
                        />
                        <span className="text-sm font-semibold text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">
                          {Math.round((set.duration || 0) * (set.reps || 5) * 8)}
                        </span>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'reps', e.target.value)}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          min="0"
                          placeholder="12"
                        />
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateSet(exercise.id, setIndex, 'weight', e.target.value)}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:border-blue-500 focus:outline-none transition-colors duration-200"
                          min="0"
                          step="0.5"
                          placeholder="50"
                        />
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg px-3 py-2 text-center">
                          {set.reps * set.weight} kg
                        </span>
                        <button
                          onClick={() => removeSet(exercise.id, setIndex)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowAddExercise(true)}
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-4 rounded-xl flex items-center justify-center space-x-3 font-semibold border border-gray-200 transition-all duration-200 hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Ajouter un exercice</span>
            </button>
            
            <button
              onClick={saveWorkout}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl flex items-center justify-center space-x-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            >
              <Target className="h-5 w-5" />
              <span>{isEditingWorkout ? 'Sauvegarder les modifications' : 'Terminer la séance'}</span>
            </button>
          </div>
          
          {/* Durée de la séance */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Durée de la séance</h3>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(e.target.value)}
                placeholder="45"
                className="border-2 border-blue-200 rounded-xl px-4 py-3 w-32 text-center font-semibold focus:border-blue-500 focus:outline-none transition-colors duration-200"
                min="1"
                max="300"
              />
              <span className="text-gray-700 font-medium">minutes</span>
            </div>
            <p className="text-sm text-blue-600 mt-3 font-medium">
              💡 Laissez vide pour une durée par défaut de 30 minutes
            </p>
          </div>
        </div>
      )}

      {showAddExercise && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-4xl h-[85vh] shadow-2xl border border-gray-200 flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <div className="flex items-center space-x-3">
                {selectedMuscleGroup && (
                  <button
                    onClick={() => setSelectedMuscleGroup(null)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                  >
                    ← Retour
                  </button>
                )}
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedMuscleGroup ? `💪 ${selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1)}` : '🏃‍♂️ Choisir un groupe musculaire'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddExercise(false);
                  setSelectedMuscleGroup(null);
                }}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2">
              {!selectedMuscleGroup ? (
                // Affichage des groupes musculaires
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Object.entries(exerciseDatabase).map(([muscle, exerciseList]) => (
                    <button
                      key={muscle}
                      onClick={() => setSelectedMuscleGroup(muscle)}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                    >
                      <div className="flex flex-col items-center space-y-4">
                        <div className={`p-4 rounded-2xl ${
                          muscle === 'cardio' ? 'bg-red-500' : 'bg-indigo-500'
                        } shadow-lg`}>
                          {muscle === 'cardio' ? <Heart className="h-8 w-8 text-white" /> : <Dumbbell className="h-8 w-8 text-white" />}
                        </div>
                        <div className="text-center">
                          <h4 className="font-bold text-gray-800 capitalize text-xl mb-2">{muscle}</h4>
                          <p className="text-sm text-gray-600">{exerciseList.length} exercices</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Affichage des exercices du groupe sélectionné
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {exerciseDatabase[selectedMuscleGroup].map((exercise) => (
                    <button
                      key={exercise}
                      onClick={() => addExerciseToWorkout(exercise)}
                      className="text-left p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-xl font-medium text-gray-700 transition-all duration-200 border border-gray-200 hover:border-indigo-300 hover:shadow-md transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedMuscleGroup === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {selectedMuscleGroup === 'cardio' ? <Heart className="h-4 w-4" /> : <Dumbbell className="h-4 w-4" />}
                        </div>
                        <span className="flex-1">{exercise}</span>
                        <span className="text-gray-400">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCalendarTab = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              📅 Calendrier
            </h2>
            <p className="text-gray-600 mt-1">Suivez votre régularité d'entraînement</p>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center text-2xl font-bold text-gray-800 mb-8">
            {monthNames[currentMonth]} {currentYear}
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
              <div key={day} className="text-center text-sm font-bold text-gray-600 py-3">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) return <div key={index} className="h-12"></div>;
              
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasWorkout = getWorkoutForDate(dateString);
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              
              return (
                <div
                  key={day}
                  className={`
                    h-12 flex items-center justify-center text-sm rounded-xl cursor-pointer font-medium transition-all duration-200 relative
                    ${isToday ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'hover:bg-gray-100'}
                    ${hasWorkout ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 shadow-md' : ''}
                  `}
                  onClick={() => hasWorkout && openWorkoutDetail(hasWorkout)}
                >
                  {day}
                  {hasWorkout && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm font-bold text-green-800">Séances effectuées</span>
            </div>
            <p className="text-3xl font-bold text-green-900">{workouts.length}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-bold text-blue-800">Cette semaine</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {workouts.filter(w => {
                const workoutDate = new Date(w.date);
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                return workoutDate >= weekStart;
              }).length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-bold text-purple-800">Motivation</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {workouts.length > 10 ? '🔥 En feu!' : workouts.length > 5 ? '💪 Fort!' : '🌱 Début'}
            </p>
          </div>
        </div>
        
        {/* Modal détail séance */}
        {showWorkoutDetail && selectedWorkout && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  🏋️ Séance du {new Date(selectedWorkout.date).toLocaleDateString('fr-FR')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => editWorkout(selectedWorkout)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => deleteWorkout(selectedWorkout.id)}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer</span>
                  </button>
                  <button
                    onClick={() => setShowWorkoutDetail(false)}
                    className="text-gray-500 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-all duration-200 border-2 border-gray-300 hover:border-red-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Résumé de la séance */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl text-center border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{selectedWorkout.duration}</div>
                  <div className="text-sm font-medium text-blue-800">Minutes</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl text-center border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{selectedWorkout.totalSets}</div>
                  <div className="text-sm font-medium text-green-800">Séries</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl text-center border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">{selectedWorkout.totalReps}</div>
                  <div className="text-sm font-medium text-purple-800">Répétitions</div>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4 rounded-2xl text-center border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">{selectedWorkout.totalWeight}</div>
                  <div className="text-sm font-medium text-orange-800">kg soulevés</div>
                </div>
              </div>
              
              {/* Détail des exercices */}
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <Dumbbell className="h-5 w-5" />
                  <span>Exercices réalisés</span>
                </h4>
                {selectedWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          exercise.type === 'cardio' ? 'bg-red-500' : 'bg-blue-500'
                        }`}>
                          {exercise.type === 'cardio' ? <Heart className="h-5 w-5 text-white" /> : <Dumbbell className="h-5 w-5 text-white" />}
                        </div>
                        <h5 className="font-bold text-gray-800 text-lg">{exercise.name}</h5>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        exercise.type === 'cardio' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {exercise.type === 'cardio' ? 'Cardio' : 'Musculation'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className={`grid gap-3 text-sm font-bold text-gray-600 pb-2 border-b border-gray-300 ${
                        exercise.type === 'cardio' ? 'grid-cols-3' : 'grid-cols-3'
                      }`}>
                        <span>Série</span>
                        {exercise.type === 'cardio' ? (
                          <>
                            <span>Durée (min)</span>
                            <span>Intensité</span>
                          </>
                        ) : (
                          <>
                            <span>Répétitions</span>
                            <span>Poids (kg)</span>
                          </>
                        )}
                      </div>
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-3 gap-3 text-sm font-medium">
                          <span className="bg-white rounded-lg px-3 py-2 text-center border border-gray-200">{setIndex + 1}</span>
                          {exercise.type === 'cardio' ? (
                            <>
                              <span className="bg-white rounded-lg px-3 py-2 text-center border border-gray-200">{set.duration} min</span>
                              <span className="bg-white rounded-lg px-3 py-2 text-center border border-gray-200">{set.reps}/10</span>
                            </>
                          ) : (
                            <>
                              <span className="bg-white rounded-lg px-3 py-2 text-center border border-gray-200">{set.reps}</span>
                              <span className="bg-white rounded-lg px-3 py-2 text-center border border-gray-200">{set.weight}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-sm font-bold text-gray-600">
                        {exercise.type === 'cardio' ? (
                          <>📊 Total: {exercise.sets.reduce((acc, set) => acc + (set.duration || 0), 0)} min, 
                          ~{exercise.sets.reduce((acc, set) => acc + Math.round((set.duration || 0) * (set.reps || 5) * 8), 0)} calories</>
                        ) : (
                          <>📊 Total: {exercise.sets.reduce((acc, set) => acc + set.reps, 0)} reps, 
                          {exercise.sets.reduce((acc, set) => acc + (set.weight * set.reps), 0)} kg</>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStatsTab = () => {
    const stats = getStats();
    
    return (
      <div className="p-6 space-y-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            📊 Statistiques
          </h2>
          <p className="text-gray-600 mt-1">Analysez vos performances et progression</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Séances totales</p>
                <p className="text-4xl font-bold">{stats.totalWorkouts}</p>
              </div>
              <Target className="h-12 w-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Séries totales</p>
                <p className="text-4xl font-bold">{stats.totalSets}</p>
              </div>
              <Dumbbell className="h-12 w-12 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Répétitions totales</p>
                <p className="text-4xl font-bold">{stats.totalReps}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Poids total soulevé</p>
                <p className="text-4xl font-bold">{stats.totalWeight} kg</p>
              </div>
              <Dumbbell className="h-12 w-12 text-orange-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Durée moyenne</p>
                <p className="text-4xl font-bold">{stats.avgDuration} min</p>
              </div>
              <Clock className="h-12 w-12 text-red-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Régularité</p>
                <p className="text-4xl font-bold">{workouts.length > 0 ? '💪' : '🔥'}</p>
              </div>
              <Zap className="h-12 w-12 text-indigo-200" />
            </div>
          </div>
        </div>
        
        {workouts.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <BarChart3 className="h-6 w-6" />
              <span>Dernières séances</span>
            </h3>
            <div className="space-y-4">
              {workouts.slice(-5).reverse().map((workout) => (
                <div key={workout.id} className="flex justify-between items-center py-4 px-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div>
                    <p className="font-bold text-gray-800">{new Date(workout.date).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-gray-600">{workout.exercises.length} exercices • {workout.totalSets} séries</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{workout.duration} min</p>
                    <p className="text-sm text-gray-600">{workout.totalWeight} kg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
            {activeTab === 'workout' && renderWorkoutTab()}
            {activeTab === 'calendar' && renderCalendarTab()}
            {activeTab === 'stats' && renderStatsTab()}
          </main>
        </>
      )}
    </div>
  );
};

export default App;
