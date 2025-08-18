import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from scipy import stats
from scipy.signal import savgol_filter
import warnings
warnings.filterwarnings('ignore')

class AdvancedFeatureEngineer:
    def __init__(self):
        self.feature_config = {
            "temporal_features": True,
            "statistical_features": True,
            "trend_features": True,
            "behavioral_features": True,
            "contextual_features": True,
            "interaction_features": True
        }
        
    def extract_features(self, workout_data: List[Dict], user_profile: Dict) -> pd.DataFrame:
        """Extrait toutes les features avancées"""
        if not workout_data:
            return pd.DataFrame()
            
        df = pd.DataFrame(workout_data)
        
        # Features de base
        features = self._extract_basic_features(df)
        
        # Features temporelles
        if self.feature_config["temporal_features"]:
            temporal_features = self._extract_temporal_features(df)
            features = pd.concat([features, temporal_features], axis=1)
        
        # Features statistiques
        if self.feature_config["statistical_features"]:
            statistical_features = self._extract_statistical_features(df)
            features = pd.concat([features, statistical_features], axis=1)
        
        # Features de tendance
        if self.feature_config["trend_features"]:
            trend_features = self._extract_trend_features(df)
            features = pd.concat([features, trend_features], axis=1)
        
        # Features comportementales
        if self.feature_config["behavioral_features"]:
            behavioral_features = self._extract_behavioral_features(df, user_profile)
            features = pd.concat([features, behavioral_features], axis=1)
        
        # Features contextuelles
        if self.feature_config["contextual_features"]:
            contextual_features = self._extract_contextual_features(df, user_profile)
            features = pd.concat([features, contextual_features], axis=1)
        
        # Features d'interaction
        if self.feature_config["interaction_features"]:
            interaction_features = self._extract_interaction_features(features)
            features = pd.concat([features, interaction_features], axis=1)
        
        return features.fillna(0)  # Remplacer les NaN par 0
    
    def _extract_basic_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Features de base"""
        features = pd.DataFrame(index=[0])  # Une seule ligne pour l'agrégation
        
        # Poids actuel (si disponible)
        if 'weight' in df.columns and len(df) > 0:
            features['current_weight'] = df['weight'].iloc[-1]
        else:
            features['current_weight'] = 0
        
        # Volume total
        if all(col in df.columns for col in ['weight', 'reps', 'sets']):
            features['total_volume'] = (df['weight'] * df['reps'] * df['sets']).sum()
        else:
            features['total_volume'] = 0
        
        # Intensité moyenne
        if 'weight' in df.columns and len(df) > 0:
            features['avg_intensity'] = df['weight'].mean()
        else:
            features['avg_intensity'] = 0
        
        # Nombre de séances
        features['total_sessions'] = len(df)
        
        # Fréquence d'entraînement
        if len(df) > 1 and 'date' in df.columns:
            try:
                dates = pd.to_datetime(df['date'])
                date_range = (dates.iloc[-1] - dates.iloc[0]).days
                features['training_frequency'] = len(df) / max(1, date_range / 7)
            except:
                features['training_frequency'] = 0
        else:
            features['training_frequency'] = 0
        
        return features
    
    def _extract_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Features temporelles avancées"""
        features = pd.DataFrame(index=[0])
        
        if 'weight' not in df.columns or len(df) < 2:
            # Valeurs par défaut si pas assez de données
            for period in [7, 14, 30, 90]:
                features[f'progression_{period}d'] = 0
            features['momentum_score'] = 0
            features['consistency_score'] = 0
            return features
        
        weights = df['weight'].values
        
        # Progression sur différentes périodes
        for period in [7, 14, 30, 90]:
            recent_data = df.tail(min(len(df), period))
            if len(recent_data) >= 2:
                progression = (recent_data['weight'].iloc[-1] - recent_data['weight'].iloc[0]) / max(1, len(recent_data))
                features[f'progression_{period}d'] = progression
            else:
                features[f'progression_{period}d'] = 0
        
        # Momentum (vitesse de progression)
        if len(weights) >= 3:
            momentum = np.gradient(weights)
            features['momentum_score'] = np.mean(momentum[-5:]) if len(momentum) >= 5 else np.mean(momentum)
        else:
            features['momentum_score'] = 0
        
        # Consistance temporelle
        if len(df) >= 3 and 'date' in df.columns:
            try:
                dates = pd.to_datetime(df['date'])
                intervals = dates.diff().dt.days.dropna()
                if len(intervals) > 0:
                    features['consistency_score'] = 1 / (1 + intervals.std())
                else:
                    features['consistency_score'] = 0
            except:
                features['consistency_score'] = 0
        else:
            features['consistency_score'] = 0
        
        return features
    
    def _extract_statistical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Features statistiques avancées"""
        features = pd.DataFrame(index=[0])
        
        if 'weight' not in df.columns or len(df) < 3:
            # Valeurs par défaut
            stat_cols = ['weight_mean', 'weight_std', 'weight_skew', 'weight_kurtosis', 
                        'weight_p25', 'weight_p75', 'weight_iqr', 'weight_cv', 'smoothing_residual']
            for col in stat_cols:
                features[col] = 0
            return features
        
        weights = df['weight'].values
        
        # Statistiques descriptives
        features['weight_mean'] = np.mean(weights)
        features['weight_std'] = np.std(weights)
        features['weight_skew'] = stats.skew(weights)
        features['weight_kurtosis'] = stats.kurtosis(weights)
        
        # Percentiles
        features['weight_p25'] = np.percentile(weights, 25)
        features['weight_p75'] = np.percentile(weights, 75)
        features['weight_iqr'] = features['weight_p75'] - features['weight_p25']
        
        # Coefficient de variation
        features['weight_cv'] = features['weight_std'] / max(1, features['weight_mean'])
        
        # Lissage avec Savitzky-Golay
        if len(weights) >= 5:
            try:
                smoothed = savgol_filter(weights, min(5, len(weights)), 2)
                features['smoothing_residual'] = np.mean(np.abs(weights - smoothed))
            except:
                features['smoothing_residual'] = 0
        else:
            features['smoothing_residual'] = 0
        
        return features
    
    def _extract_trend_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Features de tendance"""
        features = pd.DataFrame(index=[0])
        
        if 'weight' not in df.columns or len(df) < 3:
            trend_cols = ['trend_slope', 'trend_r_squared', 'trend_p_value', 'trend_changes', 'trend_stability']
            for col in trend_cols:
                features[col] = 0
            return features
        
        weights = df['weight'].values
        
        # Régression linéaire pour tendance
        x = np.arange(len(weights))
        try:
            slope, intercept, r_value, p_value, std_err = stats.linregress(x, weights)
            features['trend_slope'] = slope
            features['trend_r_squared'] = r_value ** 2
            features['trend_p_value'] = p_value
        except:
            features['trend_slope'] = 0
            features['trend_r_squared'] = 0
            features['trend_p_value'] = 1
        
        # Détection de changements de tendance
        if len(weights) >= 5:
            # Différences de premier ordre
            diff1 = np.diff(weights)
            # Changements de signe
            sign_changes = np.sum(np.diff(np.sign(diff1)) != 0)
            features['trend_changes'] = sign_changes
            
            # Stabilité de la tendance
            features['trend_stability'] = 1 / (1 + np.std(diff1))
        else:
            features['trend_changes'] = 0
            features['trend_stability'] = 0
        
        return features
    
    def _extract_behavioral_features(self, df: pd.DataFrame, user_profile: Dict) -> pd.DataFrame:
        """Features comportementales"""
        features = pd.DataFrame(index=[0])
        
        # Patterns d'entraînement
        if len(df) >= 3 and 'date' in df.columns:
            try:
                # Préférence horaire
                df_copy = df.copy()
                df_copy['hour'] = pd.to_datetime(df_copy['date']).dt.hour
                features['preferred_hour'] = df_copy['hour'].mode().iloc[0] if len(df_copy['hour'].mode()) > 0 else 12
                
                # Régularité des jours
                df_copy['day_of_week'] = pd.to_datetime(df_copy['date']).dt.dayofweek
                day_counts = df_copy['day_of_week'].value_counts()
                features['day_regularity'] = day_counts.max() / max(1, day_counts.sum())
            except:
                features['preferred_hour'] = 12
                features['day_regularity'] = 0
            
            # Durée moyenne des sessions
            if 'duration' in df.columns:
                features['avg_session_duration'] = df['duration'].mean()
            else:
                features['avg_session_duration'] = 60  # Valeur par défaut
        else:
            features['preferred_hour'] = 12
            features['day_regularity'] = 0
            features['avg_session_duration'] = 60
        
        # Niveau d'expérience
        experience_levels = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
        features['experience_level'] = experience_levels.get(user_profile.get('level', 'beginner'), 1)
        
        # Objectifs
        goals = user_profile.get('goals', [])
        features['goal_strength'] = 1 if 'strength' in goals else 0
        features['goal_hypertrophy'] = 1 if 'hypertrophy' in goals else 0
        features['goal_endurance'] = 1 if 'endurance' in goals else 0
        
        return features
    
    def _extract_contextual_features(self, df: pd.DataFrame, user_profile: Dict) -> pd.DataFrame:
        """Features contextuelles"""
        features = pd.DataFrame(index=[0])
        
        # Type d'exercice
        exercise_types = ['compound', 'isolation', 'cardio', 'strength']
        for ex_type in exercise_types:
            features[f'exercise_{ex_type}'] = 1 if ex_type in str(df.get('exercise_type', '')).lower() else 0
        
        # Groupe musculaire
        muscle_groups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core']
        for muscle in muscle_groups:
            features[f'muscle_{muscle}'] = 1 if muscle in str(df.get('muscle_group', '')).lower() else 0
        
        # Équipement
        equipment = ['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable']
        for equip in equipment:
            features[f'equipment_{equip}'] = 1 if equip in str(df.get('equipment', '')).lower() else 0
        
        # Saisonnalité
        if len(df) > 0 and 'date' in df.columns:
            try:
                df_copy = df.copy()
                df_copy['month'] = pd.to_datetime(df_copy['date']).dt.month
                features['seasonal_factor'] = np.sin(2 * np.pi * df_copy['month'].iloc[-1] / 12)
            except:
                features['seasonal_factor'] = 0
        else:
            features['seasonal_factor'] = 0
        
        return features
    
    def _extract_interaction_features(self, features: pd.DataFrame) -> pd.DataFrame:
        """Features d'interaction entre variables"""
        interaction_features = pd.DataFrame(index=[0])
        
        # Interactions importantes
        if 'current_weight' in features.columns and 'training_frequency' in features.columns:
            interaction_features['weight_frequency_interaction'] = (
                features['current_weight'] * features['training_frequency']
            )
        else:
            interaction_features['weight_frequency_interaction'] = 0
        
        if 'momentum_score' in features.columns and 'consistency_score' in features.columns:
            interaction_features['momentum_consistency_interaction'] = (
                features['momentum_score'] * features['consistency_score']
            )
        else:
            interaction_features['momentum_consistency_interaction'] = 0
        
        if 'trend_slope' in features.columns and 'experience_level' in features.columns:
            interaction_features['trend_experience_interaction'] = (
                features['trend_slope'] * features['experience_level']
            )
        else:
            interaction_features['trend_experience_interaction'] = 0
        
        return interaction_features