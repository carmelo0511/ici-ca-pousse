import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
try:
    from scipy import stats
    from scipy.signal import savgol_filter
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
import warnings
warnings.filterwarnings('ignore')

class AdvancedPlateauDetector:
    def __init__(self, config: Dict = None):
        self.config = config or {
            "weight_plateau_threshold": 0.02,  # 2% de variation max pour considérer un plateau
            "min_sessions_for_plateau": 6,     # Minimum de séances pour détecter un plateau
            "trend_analysis_window": 10,       # Fenêtre d'analyse des tendances
            "statistical_confidence": 0.95,    # Niveau de confiance statistique
            "progression_tolerance": 0.5       # Tolérance de progression en kg
        }
    
    def detect_plateaus(self, workout_history: List[Dict]) -> Dict:
        """Détection avancée des plateaux dans la progression"""
        try:
            if not workout_history or len(workout_history) < self.config["min_sessions_for_plateau"]:
                return self._empty_plateau_analysis()
            
            # Extraire les données de poids par exercice
            exercise_data = self._extract_exercise_data(workout_history)
            
            plateau_analysis = {}
            
            for exercise_name, weights_data in exercise_data.items():
                if len(weights_data) >= self.config["min_sessions_for_plateau"]:
                    plateau_analysis[exercise_name] = self._analyze_exercise_plateau(
                        exercise_name, weights_data
                    )
            
            # Analyse globale
            global_analysis = self._analyze_global_plateau(exercise_data)
            
            return {
                "exercise_plateaus": plateau_analysis,
                "global_analysis": global_analysis,
                "recommendations": self._generate_plateau_recommendations(plateau_analysis, global_analysis),
                "severity_score": self._calculate_overall_severity(plateau_analysis)
            }
            
        except Exception as e:
            return {
                "error": f"Erreur lors de la détection de plateau: {str(e)}",
                "exercise_plateaus": {},
                "global_analysis": {},
                "recommendations": [],
                "severity_score": 0.0
            }
    
    def _extract_exercise_data(self, workout_history: List[Dict]) -> Dict[str, List[Tuple]]:
        """Extrait les données de poids par exercice avec timestamps"""
        exercise_data = {}
        
        for workout in workout_history:
            workout_date = pd.to_datetime(workout.get('date', pd.Timestamp.now()))
            
            for exercise in workout.get('exercises', []):
                exercise_name = exercise.get('name')
                if not exercise_name:
                    continue
                
                if exercise_name not in exercise_data:
                    exercise_data[exercise_name] = []
                
                # Extraire le poids maximum de la séance
                max_weight = 0
                total_volume = 0
                
                for set_data in exercise.get('sets', []):
                    weight = float(set_data.get('weight', 0))
                    reps = int(set_data.get('reps', 0))
                    
                    max_weight = max(max_weight, weight)
                    total_volume += weight * reps
                
                if max_weight > 0:
                    exercise_data[exercise_name].append((
                        workout_date,
                        max_weight,
                        total_volume,
                        len(exercise.get('sets', []))
                    ))
        
        # Trier par date pour chaque exercice
        for exercise_name in exercise_data:
            exercise_data[exercise_name].sort(key=lambda x: x[0])
        
        return exercise_data
    
    def _analyze_exercise_plateau(self, exercise_name: str, weights_data: List[Tuple]) -> Dict:
        """Analyse détaillée du plateau pour un exercice spécifique"""
        dates, weights, volumes, sets_counts = zip(*weights_data)
        weights = np.array(weights)
        volumes = np.array(volumes)
        
        # Analyse des poids
        weight_analysis = self._analyze_weight_progression(weights)
        
        # Analyse des volumes
        volume_analysis = self._analyze_volume_progression(volumes)
        
        # Analyse temporelle
        temporal_analysis = self._analyze_temporal_patterns(dates, weights)
        
        # Détection de plateau statistique
        statistical_plateau = self._statistical_plateau_detection(weights)
        
        # Score de sévérité du plateau
        severity_score = self._calculate_plateau_severity(
            weight_analysis, volume_analysis, statistical_plateau
        )
        
        return {
            "exercise_name": exercise_name,
            "weight_plateau": {
                "detected": weight_analysis["plateau_detected"],
                "severity": severity_score,
                "duration": weight_analysis["plateau_duration"],
                "last_progression": weight_analysis["last_progression"]
            },
            "volume_analysis": volume_analysis,
            "temporal_patterns": temporal_analysis,
            "statistical_analysis": statistical_plateau,
            "recommendations": self._generate_exercise_recommendations(
                exercise_name, weight_analysis, volume_analysis, severity_score
            )
        }
    
    def _analyze_weight_progression(self, weights: np.ndarray) -> Dict:
        """Analyse la progression des poids"""
        if len(weights) < 3:
            return {"plateau_detected": False, "plateau_duration": 0, "last_progression": 0}
        
        # Calculer les progressions
        progressions = np.diff(weights)
        
        # Détecter les périodes sans progression significative
        plateau_threshold = self.config["progression_tolerance"]
        no_progress_sessions = np.abs(progressions) < plateau_threshold
        
        # Compter la durée du plateau actuel
        plateau_duration = 0
        for i in range(len(no_progress_sessions) - 1, -1, -1):
            if no_progress_sessions[i]:
                plateau_duration += 1
            else:
                break
        
        # Détecter si on est en plateau
        plateau_detected = plateau_duration >= (self.config["min_sessions_for_plateau"] - 1)
        
        # Dernière progression significative
        last_progression = 0
        for i in range(len(progressions) - 1, -1, -1):
            if abs(progressions[i]) >= plateau_threshold:
                last_progression = progressions[i]
                break
        
        return {
            "plateau_detected": plateau_detected,
            "plateau_duration": plateau_duration,
            "last_progression": last_progression,
            "total_progression": weights[-1] - weights[0],
            "avg_progression": np.mean(progressions),
            "progression_std": np.std(progressions)
        }
    
    def _analyze_volume_progression(self, volumes: np.ndarray) -> Dict:
        """Analyse la progression du volume d'entraînement"""
        if len(volumes) < 3:
            return {"trend": "insufficient_data", "progression": 0}
        
        # Calculer la tendance du volume
        x = np.arange(len(volumes))
        slope, intercept, r_value, p_value, std_err = stats.linregress(x, volumes)
        
        # Déterminer la tendance
        if p_value < 0.05:  # Tendance significative
            if slope > 0:
                trend = "increasing"
            else:
                trend = "decreasing"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "slope": slope,
            "r_squared": r_value ** 2,
            "progression": volumes[-1] - volumes[0],
            "relative_change": (volumes[-1] - volumes[0]) / max(1, volumes[0]) * 100
        }
    
    def _analyze_temporal_patterns(self, dates: List, weights: np.ndarray) -> Dict:
        """Analyse les patterns temporels"""
        if len(dates) < 3:
            return {"frequency": 0, "consistency": 0}
        
        # Calculer la fréquence d'entraînement
        date_diffs = [(dates[i] - dates[i-1]).days for i in range(1, len(dates))]
        avg_interval = np.mean(date_diffs)
        frequency = 7 / avg_interval  # Sessions par semaine
        
        # Calculer la consistance
        consistency = 1 / (1 + np.std(date_diffs))
        
        return {
            "frequency": frequency,
            "consistency": consistency,
            "avg_interval_days": avg_interval,
            "total_period_days": (dates[-1] - dates[0]).days
        }
    
    def _statistical_plateau_detection(self, weights: np.ndarray) -> Dict:
        """Détection statistique de plateau"""
        if len(weights) < self.config["min_sessions_for_plateau"]:
            return {"plateau_detected": False, "confidence": 0}
        
        # Test de tendance avec Mann-Kendall
        try:
            from scipy.stats import kendalltau
            
            x = np.arange(len(weights))
            tau, p_value = kendalltau(x, weights)
            
            # Plateau détecté si pas de tendance significative
            plateau_detected = p_value > (1 - self.config["statistical_confidence"])
            
            return {
                "plateau_detected": plateau_detected,
                "confidence": 1 - p_value,
                "kendall_tau": tau,
                "p_value": p_value
            }
        except:
            # Fallback simple
            recent_weights = weights[-5:]
            if len(recent_weights) >= 3:
                variation = np.std(recent_weights) / np.mean(recent_weights)
                plateau_detected = variation < self.config["weight_plateau_threshold"]
                return {
                    "plateau_detected": plateau_detected,
                    "confidence": 1 - variation,
                    "variation_coefficient": variation
                }
            else:
                return {"plateau_detected": False, "confidence": 0}
    
    def _calculate_plateau_severity(self, weight_analysis: Dict, volume_analysis: Dict, statistical_analysis: Dict) -> float:
        """Calcule la sévérité du plateau (0-1)"""
        severity_factors = []
        
        # Facteur durée du plateau
        if weight_analysis["plateau_detected"]:
            duration_factor = min(1.0, weight_analysis["plateau_duration"] / 10)
            severity_factors.append(duration_factor)
        
        # Facteur progression récente
        if abs(weight_analysis["last_progression"]) < 0.5:
            severity_factors.append(0.8)
        
        # Facteur volume
        if volume_analysis["trend"] == "decreasing":
            severity_factors.append(0.7)
        elif volume_analysis["trend"] == "stable":
            severity_factors.append(0.5)
        
        # Facteur statistique
        if statistical_analysis.get("plateau_detected", False):
            confidence = statistical_analysis.get("confidence", 0)
            severity_factors.append(confidence)
        
        return np.mean(severity_factors) if severity_factors else 0.0
    
    def _analyze_global_plateau(self, exercise_data: Dict) -> Dict:
        """Analyse globale des plateaux sur tous les exercices"""
        if not exercise_data:
            return {"global_plateau": False, "affected_exercises": 0}
        
        plateau_exercises = 0
        total_exercises = len(exercise_data)
        severity_scores = []
        
        for exercise_name, weights_data in exercise_data.items():
            if len(weights_data) >= self.config["min_sessions_for_plateau"]:
                weights = np.array([w[1] for w in weights_data])
                weight_analysis = self._analyze_weight_progression(weights)
                
                if weight_analysis["plateau_detected"]:
                    plateau_exercises += 1
                    
                # Calculer un score de sévérité simplifié
                if len(weights) >= 3:
                    recent_progression = weights[-1] - weights[-3]
                    severity = 1.0 if abs(recent_progression) < 1.0 else 0.5
                    severity_scores.append(severity)
        
        plateau_percentage = plateau_exercises / max(1, total_exercises)
        global_plateau = plateau_percentage > 0.5  # Plus de 50% des exercices en plateau
        
        return {
            "global_plateau": global_plateau,
            "affected_exercises": plateau_exercises,
            "total_exercises": total_exercises,
            "plateau_percentage": plateau_percentage * 100,
            "avg_severity": np.mean(severity_scores) if severity_scores else 0.0
        }
    
    def _generate_exercise_recommendations(self, exercise_name: str, weight_analysis: Dict, volume_analysis: Dict, severity: float) -> List[str]:
        """Génère des recommandations spécifiques à l'exercice"""
        recommendations = []
        
        if severity > 0.7:
            recommendations.append(f"🚨 Plateau sévère détecté sur {exercise_name}")
            recommendations.append("Changer de programme d'entraînement")
            recommendations.append("Augmenter le volume ou la fréquence")
            recommendations.append("Considérer une période de deload")
        elif severity > 0.4:
            recommendations.append(f"⚠️ Plateau modéré sur {exercise_name}")
            recommendations.append("Varier les techniques d'intensification")
            recommendations.append("Ajuster le nombre de répétitions")
        else:
            recommendations.append(f"✅ Progression normale sur {exercise_name}")
        
        # Recommandations basées sur le volume
        if volume_analysis["trend"] == "decreasing":
            recommendations.append("📉 Volume en baisse - Augmenter progressivement")
        elif volume_analysis["trend"] == "stable" and severity > 0.5:
            recommendations.append("📊 Volume stable - Considérer une augmentation")
        
        return recommendations
    
    def _generate_plateau_recommendations(self, plateau_analysis: Dict, global_analysis: Dict) -> List[str]:
        """Génère des recommandations globales"""
        recommendations = []
        
        if global_analysis.get("global_plateau", False):
            recommendations.append("🔄 Plateau global détecté - Repenser le programme complet")
            recommendations.append("📅 Planifier une semaine de deload")
            recommendations.append("🎯 Revoir les objectifs et la périodisation")
        
        high_severity_exercises = [
            name for name, analysis in plateau_analysis.items() 
            if analysis.get("weight_plateau", {}).get("severity", 0) > 0.6
        ]
        
        if high_severity_exercises:
            recommendations.append(f"⚡ Focus sur: {', '.join(high_severity_exercises[:3])}")
        
        recommendations.append("📈 Suivre les progressions de près")
        recommendations.append("💪 Maintenir la régularité d'entraînement")
        
        return recommendations
    
    def _calculate_overall_severity(self, plateau_analysis: Dict) -> float:
        """Calcule la sévérité globale des plateaux"""
        if not plateau_analysis:
            return 0.0
        
        severities = [
            analysis.get("weight_plateau", {}).get("severity", 0)
            for analysis in plateau_analysis.values()
        ]
        
        return np.mean(severities) if severities else 0.0
    
    def _empty_plateau_analysis(self) -> Dict:
        """Retourne une analyse vide quand il n'y a pas assez de données"""
        return {
            "exercise_plateaus": {},
            "global_analysis": {
                "global_plateau": False,
                "affected_exercises": 0,
                "total_exercises": 0,
                "plateau_percentage": 0,
                "message": "Pas assez de données pour l'analyse"
            },
            "recommendations": ["Continuer l'entraînement pour accumuler des données"],
            "severity_score": 0.0
        }