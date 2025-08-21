import numpy as np
import pandas as pd
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class SimpleFeatureEngineer:
    def __init__(self):
        self.feature_names = [
            'current_weight', 'previous_weight', 'weight_progression',
            'avg_reps', 'max_weight', 'min_weight', 'total_volume', 
            'progression_rate', 'user_weight_ratio', 'session_number'
        ]
    
    def extract_features(self, workout_data: List[Dict], user_profile: Dict) -> pd.DataFrame:
        """Extrait des features simples et efficaces"""
        try:
            features_list = []
            
            # Extraire tous les poids des exercices
            all_weights = []
            all_reps = []
            
            for workout in workout_data:
                for exercise in workout.get('exercises', []):
                    for set_data in exercise.get('sets', []):
                        weight = set_data.get('weight')
                        reps = set_data.get('reps')
                        if weight is not None and reps is not None:
                            all_weights.append(float(weight))
                            all_reps.append(int(reps))
            
            if len(all_weights) < 2:
                logger.warning("Pas assez de données de poids pour extraire des features")
                return pd.DataFrame()
            
            # Créer une ligne de features par poids (sauf le dernier qui est la target)
            for i in range(len(all_weights) - 1):
                current_weight = all_weights[i]
                current_reps = all_reps[i]
                
                # Features de base - calculées uniquement avec les données jusqu'à i
                avg_reps = np.mean(all_reps[:i+1])
                max_weight = max(all_weights[:i+1])
                min_weight = min(all_weights[:i+1])
                total_volume = current_weight * current_reps
                
                # Progression par rapport au poids précédent
                if i > 0:
                    previous_weight = all_weights[i-1]
                    weight_progression = current_weight - previous_weight
                    progression_rate = weight_progression / previous_weight if previous_weight > 0 else 0
                else:
                    previous_weight = current_weight
                    weight_progression = 0
                    progression_rate = 0
                
                # Features utilisateur
                user_weight = user_profile.get('weight', 70)
                relative_weight = current_weight / user_weight if user_weight > 0 else 0
                
                features = {
                    'current_weight': current_weight,
                    'previous_weight': previous_weight,
                    'weight_progression': weight_progression,
                    'avg_reps': avg_reps,
                    'max_weight': max_weight,
                    'min_weight': min_weight,
                    'total_volume': total_volume,
                    'progression_rate': progression_rate,
                    'user_weight_ratio': relative_weight,
                    'session_number': i + 1
                }
                
                features_list.append(features)
            
            if not features_list:
                logger.warning("Aucune feature extraite")
                return pd.DataFrame()
            
            df = pd.DataFrame(features_list)
            logger.info(f"Features extraites: {len(df)} échantillons avec {len(df.columns)} features")
            return df
            
        except Exception as e:
            logger.error(f"Erreur lors de l'extraction des features: {e}")
            return pd.DataFrame()
    
    def get_feature_names(self) -> List[str]:
        """Retourne les noms des features"""
        return self.feature_names