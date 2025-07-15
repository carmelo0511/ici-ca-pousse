import React from 'react';
import {
  Calendar,
  Plus,
  Dumbbell,
  Heart,
  Target,
  Clock,
  X
} from 'lucide-react';
import { exerciseDatabase } from '../utils/exerciseDatabase';

const WorkoutList = ({
  selectedDate,
  setSelectedDate,
  exercises,
  addSet,
  updateSet,
  removeSet,
  saveWorkout,
  workoutDuration,
  setWorkoutDuration,
  showAddExercise,
  setShowAddExercise,
  selectedMuscleGroup,
  setSelectedMuscleGroup,
  addExerciseToWorkout
}) => (
  <div className="p-6 space-y-8">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🏋️ Nouvelle séance
        </h2>
        <p className="text-gray-600 mt-1">
          Créez votre programme d'entraînement
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
                  exercise.type === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {exercise.type === 'cardio' ? <Heart className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{exercise.name}</h3>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    exercise.type === 'cardio' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
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
            <span>Terminer la séance</span>
          </button>
        </div>

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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.entries(exerciseDatabase).map(([muscle, exerciseList]) => (
                  <button
                    key={muscle}
                    onClick={() => setSelectedMuscleGroup(muscle)}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className={`p-4 rounded-2xl ${muscle === 'cardio' ? 'bg-red-500' : 'bg-indigo-500'} shadow-lg`}>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {exerciseDatabase[selectedMuscleGroup].map((exercise) => (
                  <button
                    key={exercise}
                    onClick={() => addExerciseToWorkout(exercise)}
                    className="text-left p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-xl font-medium text-gray-700 transition-all duration-200 border border-gray-200 hover:border-indigo-300 hover:shadow-md transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${selectedMuscleGroup === 'cardio' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
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

export default WorkoutList;
