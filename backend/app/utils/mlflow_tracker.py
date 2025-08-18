import mlflow
import mlflow.sklearn
import mlflow.tensorflow
from typing import Dict, Any, Optional
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class MLflowTracker:
    def __init__(self, experiment_name: str = "ici-ca-pousse-ml"):
        self.experiment_name = experiment_name
        self.current_run = None
        
        # Configuration MLflow
        try:
            # Utiliser une base de données SQLite locale pour le tracking
            mlflow_db_path = os.path.join(os.getcwd(), "mlflow.db")
            mlflow.set_tracking_uri(f"sqlite:///{mlflow_db_path}")
            
            # Créer ou récupérer l'expérience
            try:
                experiment_id = mlflow.create_experiment(experiment_name)
            except mlflow.exceptions.MlflowException:
                experiment = mlflow.get_experiment_by_name(experiment_name)
                experiment_id = experiment.experiment_id
            
            mlflow.set_experiment(experiment_name)
            logger.info(f"MLflow configuré avec l'expérience: {experiment_name}")
            
        except Exception as e:
            logger.warning(f"Impossible de configurer MLflow: {e}. Fonctionnement en mode dégradé.")
            self.mlflow_available = False
        else:
            self.mlflow_available = True
    
    def start_run(self, run_name: Optional[str] = None):
        """Démarre un nouveau run MLflow"""
        if not self.mlflow_available:
            return self
        
        try:
            if run_name is None:
                run_name = f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            self.current_run = mlflow.start_run(run_name=run_name)
            logger.info(f"Run MLflow démarré: {run_name}")
            return self
        except Exception as e:
            logger.error(f"Erreur lors du démarrage du run MLflow: {e}")
            return self
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_run()
    
    def end_run(self):
        """Termine le run MLflow actuel"""
        if not self.mlflow_available or self.current_run is None:
            return
        
        try:
            mlflow.end_run()
            logger.info("Run MLflow terminé")
            self.current_run = None
        except Exception as e:
            logger.error(f"Erreur lors de la fin du run MLflow: {e}")
    
    def log_param(self, key: str, value: Any):
        """Log un paramètre"""
        if not self.mlflow_available:
            return
        
        try:
            mlflow.log_param(key, value)
        except Exception as e:
            logger.error(f"Erreur lors du log du paramètre {key}: {e}")
    
    def log_params(self, params: Dict[str, Any]):
        """Log plusieurs paramètres"""
        if not self.mlflow_available:
            return
        
        try:
            mlflow.log_params(params)
        except Exception as e:
            logger.error(f"Erreur lors du log des paramètres: {e}")
    
    def log_metric(self, key: str, value: float, step: Optional[int] = None):
        """Log une métrique"""
        if not self.mlflow_available:
            return
        
        try:
            mlflow.log_metric(key, value, step)
        except Exception as e:
            logger.error(f"Erreur lors du log de la métrique {key}: {e}")
    
    def log_metrics(self, metrics: Dict[str, float], step: Optional[int] = None):
        """Log plusieurs métriques"""
        if not self.mlflow_available:
            return
        
        try:
            for key, value in metrics.items():
                mlflow.log_metric(key, value, step)
        except Exception as e:
            logger.error(f"Erreur lors du log des métriques: {e}")
    
    def log_artifact(self, local_path: str, artifact_path: Optional[str] = None):
        """Log un artefact"""
        if not self.mlflow_available:
            return
        
        try:
            mlflow.log_artifact(local_path, artifact_path)
        except Exception as e:
            logger.error(f"Erreur lors du log de l'artefact {local_path}: {e}")
    
    def log_model(self, model, artifact_path: str, **kwargs):
        """Log un modèle scikit-learn"""
        if not self.mlflow_available:
            return
        
        try:
            mlflow.sklearn.log_model(model, artifact_path, **kwargs)
        except Exception as e:
            logger.error(f"Erreur lors du log du modèle: {e}")
    
    def log_prediction(self, prediction_data: Dict[str, Any]):
        """Log des données de prédiction"""
        if not self.mlflow_available:
            return
        
        try:
            # Log comme métriques si possible
            for key, value in prediction_data.items():
                if isinstance(value, (int, float)):
                    self.log_metric(f"prediction_{key}", value)
                else:
                    self.log_param(f"prediction_{key}", str(value))
        except Exception as e:
            logger.error(f"Erreur lors du log de la prédiction: {e}")
    
    def get_experiment_runs(self, max_results: int = 100):
        """Récupère les runs de l'expérience"""
        if not self.mlflow_available:
            return []
        
        try:
            experiment = mlflow.get_experiment_by_name(self.experiment_name)
            if experiment:
                runs = mlflow.search_runs(
                    experiment_ids=[experiment.experiment_id],
                    max_results=max_results
                )
                return runs.to_dict('records') if not runs.empty else []
            return []
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des runs: {e}")
            return []
    
    def get_best_run(self, metric_name: str, ascending: bool = False):
        """Récupère le meilleur run selon une métrique"""
        if not self.mlflow_available:
            return None
        
        try:
            experiment = mlflow.get_experiment_by_name(self.experiment_name)
            if experiment:
                runs = mlflow.search_runs(
                    experiment_ids=[experiment.experiment_id],
                    order_by=[f"metrics.{metric_name} {'ASC' if ascending else 'DESC'}"],
                    max_results=1
                )
                return runs.iloc[0].to_dict() if not runs.empty else None
            return None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du meilleur run: {e}")
            return None
    
    def load_model(self, run_id: str, artifact_path: str = "model"):
        """Charge un modèle depuis MLflow"""
        if not self.mlflow_available:
            return None
        
        try:
            model_uri = f"runs:/{run_id}/{artifact_path}"
            return mlflow.sklearn.load_model(model_uri)
        except Exception as e:
            logger.error(f"Erreur lors du chargement du modèle: {e}")
            return None
    
    def get_run_metrics(self, run_id: str):
        """Récupère les métriques d'un run"""
        if not self.mlflow_available:
            return {}
        
        try:
            run = mlflow.get_run(run_id)
            return run.data.metrics
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des métriques: {e}")
            return {}
    
    def cleanup_old_runs(self, keep_last_n: int = 50):
        """Nettoie les anciens runs pour économiser l'espace"""
        if not self.mlflow_available:
            return
        
        try:
            experiment = mlflow.get_experiment_by_name(self.experiment_name)
            if experiment:
                runs = mlflow.search_runs(
                    experiment_ids=[experiment.experiment_id],
                    order_by=["start_time DESC"]
                )
                
                if len(runs) > keep_last_n:
                    old_runs = runs.iloc[keep_last_n:]
                    for _, run in old_runs.iterrows():
                        mlflow.delete_run(run.run_id)
                    
                    logger.info(f"Supprimé {len(old_runs)} anciens runs")
        except Exception as e:
            logger.error(f"Erreur lors du nettoyage des runs: {e}")
    
    def is_available(self) -> bool:
        """Vérifie si MLflow est disponible"""
        return self.mlflow_available