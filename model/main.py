"""
FastAPI server for ML Credit Risk Prediction API.

Main entry point for the prediction service.
"""

import logging
from datetime import datetime
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from schemas import (
    CustomerData, PredictionResponse, HealthResponse,
    StatsResponse, PredictionRecord
)
from ml_model import MLModel
from data_store import DataStore
from monitoring import DriftDetector, PerformanceTracker, SystemHealthMonitor
from governance import TrustEngine
from llm.openrouter_service import OpenRouterLLMService

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
ml_model = None
data_store = None
drift_detector = None
performance_tracker = None
health_monitor = None
trust_engine = None
llm_service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    global ml_model, data_store, drift_detector, performance_tracker, health_monitor, trust_engine, llm_service
    
    # Startup
    logger.info("Starting ML Credit Risk API...")
    
    try:
        # Initialize ML model
        ml_model = MLModel()
        ml_model.load_model(settings.MODEL_PATH)
        logger.info(f"Model loaded: {ml_model.get_model_version()}")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        ml_model = MLModel()  # Create empty instance
    
    try:
        # Initialize data store
        data_store = DataStore(settings.MONGODB_URI, settings.MONGODB_DATABASE)
        logger.info("Database connected")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        data_store = None
    
    try:
        # Initialize monitoring modules
        drift_detector = DriftDetector(settings.MONGODB_URI, settings.MONGODB_DATABASE)
        performance_tracker = PerformanceTracker(settings.MONGODB_URI, settings.MONGODB_DATABASE)
        health_monitor = SystemHealthMonitor(settings.MONGODB_URI, settings.MONGODB_DATABASE)
        logger.info("Monitoring modules initialized")
    except Exception as e:
        logger.error(f"Failed to initialize monitoring: {e}")
    
    try:
        # Initialize governance module
        trust_engine = TrustEngine(settings.MONGODB_URI, settings.MONGODB_DATABASE)
        logger.info("Trust engine initialized")
    except Exception as e:
        logger.error(f"Failed to initialize trust engine: {e}")
    
    try:
        # Initialize LLM service
        llm_service = OpenRouterLLMService(
            settings.MONGODB_URI, 
            settings.MONGODB_DATABASE,
            api_key=settings.OPENROUTER_API_KEY
        )
        logger.info("LLM service initialized")
    except Exception as e:
        logger.error(f"Failed to initialize LLM service: {e}")
    
    logger.info("API startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down API...")
    if data_store:
        data_store.close()
    if drift_detector:
        drift_detector.close()
    if performance_tracker:
        performance_tracker.close()
    if health_monitor:
        health_monitor.close()
    if trust_engine:
        trust_engine.close()
    if llm_service:
        llm_service.close()
    logger.info("API shutdown complete")


# Initialize FastAPI app
app = FastAPI(
    title="AegisAI Credit Risk API",
    version="1.0.0",
    description="ML-based credit risk prediction system",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(",") if isinstance(settings.CORS_ORIGINS, str) else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Info"])
def root():
    """
    Get API information.
    
    Validates Requirements: 3.1
    """
    return {
        "message": "AegisAI Credit Risk Model API",
        "version": "1.0.0",
        "status": "running",
        "model_version": ml_model.get_model_version() if ml_model and ml_model.is_loaded() else "not loaded"
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(customer_data: CustomerData):
    """
    Generate credit risk prediction.
    
    Validates Requirements: 3.2, 2.1, 2.2, 2.3, 3.5, 4.1, 6.7
    """
    start_time = datetime.now()
    
    # Check if model is loaded
    if not ml_model or not ml_model.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not available"
        )
    
    try:
        # Make prediction
        approval_probability, risk_category, confidence_score = ml_model.predict(customer_data)
        
        # Calculate processing time
        processing_time_ms = (datetime.now() - start_time).total_seconds() * 1000
        
        # Create response
        response = PredictionResponse(
            approval_probability=approval_probability,
            risk_category=risk_category,
            confidence_score=confidence_score,
            model_version=ml_model.get_model_version(),
            processing_time_ms=processing_time_ms
        )
        
        # Log prediction to database
        if data_store and data_store.check_connection():
            try:
                prediction_record = PredictionRecord(
                    timestamp=datetime.now(),
                    input_data=customer_data,
                    approval_probability=approval_probability,
                    risk_category=risk_category,
                    confidence_score=confidence_score,
                    model_version=ml_model.get_model_version(),
                    processing_time_ms=processing_time_ms,
                    user_id=customer_data.user_id  # Store user_id if provided
                )
                data_store.save_prediction(prediction_record)
            except Exception as e:
                logger.warning(f"Failed to log prediction to database: {e}")
        
        return response
        
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Check service health.
    
    Validates Requirements: 8.1, 8.2, 8.3, 8.4
    """
    model_loaded = ml_model is not None and ml_model.is_loaded()
    database_connected = data_store is not None and data_store.check_connection()
    
    is_healthy = model_loaded and database_connected
    
    response = HealthResponse(
        status="healthy" if is_healthy else "unhealthy",
        model_loaded=model_loaded,
        database_connected=database_connected,
        model_version=ml_model.get_model_version() if model_loaded else None
    )
    
    status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    
    if not is_healthy:
        raise HTTPException(status_code=status_code, detail=response.model_dump())
    
    return response


@app.get("/stats", response_model=StatsResponse, tags=["Statistics"])
def get_stats():
    """
    Get prediction statistics.
    
    Validates Requirements: 9.1, 9.2, 9.3, 9.4
    """
    if not data_store or not data_store.check_connection():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable"
        )
    
    try:
        stats = data_store.get_prediction_stats()
        return StatsResponse(**stats)
    except Exception as e:
        logger.error(f"Failed to get statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
        log_level=settings.LOG_LEVEL.lower()
    )


# ============================================================================
# PHASE 2: Monitoring & Observability Endpoints
# ============================================================================

@app.get("/monitoring/drift", tags=["Monitoring"])
def check_drift(hours: int = 1):
    """
    Check for data drift in recent predictions.
    
    Args:
        hours: Number of hours to analyze (default: 1)
    
    Returns:
        Drift detection results for all features
    """
    if not drift_detector:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Drift detector not available"
        )
    
    try:
        # Get recent predictions
        recent_df = drift_detector.get_recent_predictions_df(hours=hours)
        
        if recent_df.empty:
            return {
                "message": f"Not enough data in last {hours} hour(s)",
                "drift_results": [],
                "hours_analyzed": hours
            }
        
        # Load training data for comparison
        import pandas as pd
        from pathlib import Path
        
        # Try to load training data
        training_data_path = Path("data/loan_data.csv")
        if not training_data_path.exists():
            # Generate synthetic training data for comparison
            from training import generate_synthetic_data
            training_df = generate_synthetic_data(n_samples=1000)
        else:
            training_df = pd.read_csv(training_data_path)
        
        # Check drift for numeric features
        drift_results = []
        numeric_features = ['income', 'age', 'loan_amount', 'existing_debts']
        
        for feature in numeric_features:
            if feature in recent_df.columns and feature in training_df.columns:
                result = drift_detector.check_drift(
                    feature_name=feature,
                    training_data=training_df[feature].dropna().values,
                    current_data=recent_df[feature].dropna().values
                )
                # Convert timestamp for JSON serialization
                result['timestamp'] = result['timestamp'].isoformat()
                drift_results.append(result)
        
        # Summary
        drift_detected_count = sum(1 for r in drift_results if r['drift_detected'])
        
        return {
            "drift_results": drift_results,
            "summary": {
                "features_checked": len(drift_results),
                "drift_detected_count": drift_detected_count,
                "hours_analyzed": hours,
                "samples_analyzed": len(recent_df)
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Drift check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Drift check failed: {str(e)}"
        )


@app.get("/monitoring/performance", tags=["Monitoring"])
def get_performance(hours: int = 24):
    """
    Get model performance metrics and trends.
    
    Args:
        hours: Number of hours to analyze (default: 24)
    
    Returns:
        Performance metrics and degradation status
    """
    if not performance_tracker:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Performance tracker not available"
        )
    
    try:
        # Get performance trend
        trend = performance_tracker.get_performance_trend(hours=hours)
        
        # Check for degradation
        degradation = performance_tracker.check_degradation(
            baseline_accuracy=0.95,
            threshold=0.05
        )
        
        # Get additional metrics
        avg_confidence = performance_tracker.get_average_confidence(hours=1)
        risk_distribution = performance_tracker.get_risk_distribution(hours=hours)
        
        return {
            "performance_trend": trend,
            "degradation_check": degradation,
            "current_metrics": {
                "average_confidence": round(avg_confidence, 3),
                "risk_distribution": risk_distribution
            },
            "hours_analyzed": hours,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Performance check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Performance check failed: {str(e)}"
        )


@app.get("/monitoring/health", tags=["Monitoring"])
def get_system_health():
    """
    Get comprehensive system health metrics.
    
    Returns:
        System health including CPU, memory, and API metrics
    """
    if not health_monitor:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Health monitor not available"
        )
    
    try:
        health = health_monitor.get_health_metrics()
        alerts = health_monitor.check_system_alerts()
        
        # Convert timestamp for JSON serialization
        health['timestamp'] = health['timestamp'].isoformat()
        
        return {
            "health_metrics": health,
            "alerts": alerts,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health check failed: {str(e)}"
        )


@app.get("/monitoring/dashboard", tags=["Monitoring"])
def get_monitoring_dashboard():
    """
    Get comprehensive monitoring dashboard data.
    
    Returns:
        Complete monitoring overview including drift, performance, and health
    """
    try:
        # System health
        health = health_monitor.get_health_metrics() if health_monitor else {}
        if health and 'timestamp' in health:
            health['timestamp'] = health['timestamp'].isoformat()
        
        # Recent predictions
        if data_store and data_store.predictions_collection:
            recent_predictions = list(
                data_store.predictions_collection.find()
                .sort("timestamp", -1)
                .limit(10)
            )
            for pred in recent_predictions:
                pred['_id'] = str(pred['_id'])
                pred['timestamp'] = pred['timestamp'].isoformat()
            
            total_predictions = data_store.predictions_collection.count_documents({})
        else:
            recent_predictions = []
            total_predictions = 0
        
        # Drift summary
        drift_history = drift_detector.get_drift_history(hours=24) if drift_detector else []
        
        # Performance summary
        performance_trend = performance_tracker.get_performance_trend(hours=24) if performance_tracker else []
        
        # Alerts
        alerts = health_monitor.check_system_alerts() if health_monitor else {"has_alerts": False, "alerts": []}
        
        return {
            "system_health": health,
            "recent_predictions": recent_predictions,
            "total_predictions": total_predictions,
            "drift_summary": {
                "recent_checks": len(drift_history),
                "drift_detected": sum(1 for d in drift_history if d.get('drift_detected', False))
            },
            "performance_summary": {
                "logs_count": len(performance_trend),
                "latest_accuracy": performance_trend[-1]['metrics'].get('accuracy') if performance_trend else None
            },
            "alerts": alerts,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Dashboard data retrieval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dashboard data retrieval failed: {str(e)}"
        )


# ============================================================================
# PHASE 3: Trust Engine & Governance Endpoints
# ============================================================================

@app.get("/governance/trust", tags=["Governance"])
def get_trust_score():
    """
    Get current trust score and governance status.
    
    Returns:
        Trust score, autonomy level, risk factors, and governance actions
    """
    if not trust_engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trust engine not available"
        )
    
    try:
        trust_result = trust_engine.calculate_trust_score()
        
        # Convert timestamp for JSON serialization
        trust_result['timestamp'] = trust_result['timestamp'].isoformat()
        
        return trust_result
        
    except Exception as e:
        logger.error(f"Trust score calculation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Trust score calculation failed: {str(e)}"
        )


@app.get("/governance/history", tags=["Governance"])
def get_trust_history(hours: int = 24):
    """
    Get trust score history.
    
    Args:
        hours: Number of hours to look back (default: 24)
    
    Returns:
        Historical trust scores
    """
    if not trust_engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trust engine not available"
        )
    
    try:
        history = trust_engine.get_trust_history(hours=hours)
        
        return {
            "history": history,
            "count": len(history),
            "hours_analyzed": hours,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to retrieve trust history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve trust history: {str(e)}"
        )


@app.get("/governance/incidents", tags=["Governance"])
def get_incidents(status_filter: str = "all", limit: int = 50):
    """
    Get governance incidents.
    
    Args:
        status_filter: Filter by status ("all", "open", "resolved")
        limit: Maximum number of incidents to return
    
    Returns:
        List of incidents
    """
    if not trust_engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trust engine not available"
        )
    
    try:
        incidents = trust_engine.get_incidents(status=status_filter, limit=limit)
        
        return {
            "incidents": incidents,
            "count": len(incidents),
            "status_filter": status_filter,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to retrieve incidents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve incidents: {str(e)}"
        )


@app.post("/governance/simulate-incident", tags=["Governance"])
def simulate_incident():
    """
    Simulate a drift incident for demo purposes.
    
    Creates a fake high drift event and calculates resulting trust score.
    Useful for testing governance responses.
    
    Returns:
        Incident details and updated trust score
    """
    if not trust_engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trust engine not available"
        )
    
    try:
        result = trust_engine.simulate_drift_incident()
        
        if result.get('error'):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result['error']
            )
        
        # Serialize datetime objects
        if result.get('incident'):
            result['incident']['_id'] = str(result['incident']['_id'])
            result['incident']['detected_at'] = result['incident']['detected_at'].isoformat()
        
        if result.get('trust_result'):
            result['trust_result']['timestamp'] = result['trust_result']['timestamp'].isoformat()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to simulate incident: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to simulate incident: {str(e)}"
        )


@app.get("/governance/export-report", tags=["Governance"])
def export_report():
    """
    Export comprehensive governance report including trust scores, incidents, and system health.
    
    Returns:
        JSON report with all governance data
    """
    try:
        from datetime import datetime, timedelta
        
        # Gather all governance data
        report = {
            "generated_at": datetime.utcnow().isoformat(),
            "report_period_hours": 24,
            "trust_score": None,
            "trust_history": [],
            "incidents": [],
            "system_health": None,
            "drift_analysis": [],
            "llm_metrics": None,
            "statistics": None
        }
        
        # Get current trust score
        if trust_engine:
            try:
                trust_result = trust_engine.calculate_trust_score()
                report["trust_score"] = {
                    "score": trust_result.get("trust_score"),
                    "autonomy_level": trust_result.get("autonomy_level"),
                    "risk_factors": trust_result.get("risk_factors"),
                    "governance_action": trust_result.get("governance_action")
                }
            except Exception as e:
                logger.error(f"Failed to get trust score for report: {e}")
        
        # Get trust history
        try:
            history_data = data_store.get_trust_history(hours=24)
            report["trust_history"] = [
                {
                    "timestamp": h["timestamp"].isoformat() if isinstance(h["timestamp"], datetime) else h["timestamp"],
                    "trust_score": h.get("trust_score"),
                    "autonomy_level": h.get("autonomy_level")
                }
                for h in history_data
            ]
        except Exception as e:
            logger.error(f"Failed to get trust history for report: {e}")
        
        # Get incidents
        try:
            incidents_data = data_store.get_incidents(status="all")
            report["incidents"] = [
                {
                    "type": inc.get("type"),
                    "severity": inc.get("severity"),
                    "status": inc.get("status"),
                    "detected_at": inc["detected_at"].isoformat() if isinstance(inc["detected_at"], datetime) else inc["detected_at"],
                    "description": inc.get("description")
                }
                for inc in incidents_data
            ]
        except Exception as e:
            logger.error(f"Failed to get incidents for report: {e}")
        
        # Get system health
        if system_health:
            try:
                health_data = system_health.get_health_metrics()
                report["system_health"] = health_data
            except Exception as e:
                logger.error(f"Failed to get system health for report: {e}")
        
        # Get drift analysis
        if drift_detector:
            try:
                drift_results = drift_detector.check_all_features()
                report["drift_analysis"] = [
                    {
                        "feature": d.get("feature"),
                        "drift_detected": d.get("drift_detected"),
                        "severity": d.get("severity"),
                        "psi_score": d.get("psi_score")
                    }
                    for d in drift_results
                ]
            except Exception as e:
                logger.error(f"Failed to get drift analysis for report: {e}")
        
        # Get LLM metrics
        if llm_service:
            try:
                llm_metrics = llm_service.get_metrics(hours=24)
                report["llm_metrics"] = llm_metrics
            except Exception as e:
                logger.error(f"Failed to get LLM metrics for report: {e}")
        
        # Get general statistics
        try:
            stats = data_store.get_stats()
            report["statistics"] = stats
        except Exception as e:
            logger.error(f"Failed to get statistics for report: {e}")
        
        return report
        
    except Exception as e:
        logger.error(f"Failed to generate report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )


@app.post("/governance/resolve-incident/{incident_id}", tags=["Governance"])
def resolve_incident(incident_id: str, resolution_notes: str):
    """
    Resolve an incident.
    
    Args:
        incident_id: Incident ID to resolve
        resolution_notes: Notes about the resolution
    
    Returns:
        Updated incident record
    """
    if not trust_engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trust engine not available"
        )
    
    try:
        result = trust_engine.resolve_incident(incident_id, resolution_notes)
        
        if result.get('error'):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result['error']
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resolve incident: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resolve incident: {str(e)}"
        )


@app.get("/governance/autonomy-levels", tags=["Governance"])
def get_autonomy_levels():
    """
    Get information about autonomy levels and their thresholds.
    
    Returns:
        Autonomy level definitions and thresholds
    """
    return {
        "autonomy_levels": {
            "fully_autonomous": {
                "trust_min": 80,
                "trust_max": 100,
                "description": "Model operates independently without human intervention",
                "human_intervention": "none",
                "approval_required": False
            },
            "human_on_loop": {
                "trust_min": 60,
                "trust_max": 79,
                "description": "Human monitors but doesn't approve each decision",
                "human_intervention": "monitoring",
                "approval_required": False
            },
            "approval_required": {
                "trust_min": 40,
                "trust_max": 59,
                "description": "Human must approve high-risk decisions",
                "human_intervention": "approval",
                "approval_required": True
            },
            "kill_switch": {
                "trust_min": 0,
                "trust_max": 39,
                "description": "Model stopped, all decisions require manual review",
                "human_intervention": "full_control",
                "approval_required": True
            }
        },
        "thresholds": {
            "drift": {
                "low": 0.1,
                "moderate": 0.2,
                "high": 0.3
            },
            "accuracy_drop": {
                "acceptable": 0.02,
                "concerning": 0.05,
                "critical": 0.10
            }
        },
        "trust_formula": "Trust = 100 - (Drift × 30) - (Accuracy Drop × 25) - (Bias × 20) - (Overrides × 10)"
    }


# ============================================================================
# PHASE 5: LLM Observability Endpoints
# ============================================================================

class LLMQuery(BaseModel):
    """LLM query request model."""
    prompt: str
    use_case: str = "customer_query"
    user_id: Optional[str] = None


@app.post("/llm/query", tags=["LLM"])
def llm_query(query: LLMQuery):
    """
    Send query to LLM and get response with metrics.
    
    Args:
        query: LLM query with prompt, use_case, and optional user_id
    
    Returns:
        LLM response with metrics (latency, tokens, cost, quality, safety)
    """
    if not llm_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service not available"
        )
    
    try:
        result = llm_service.query(
            prompt=query.prompt,
            use_case=query.use_case,
            user_id=query.user_id
        )
        return result
    except Exception as e:
        logger.error(f"LLM query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM query failed: {str(e)}"
        )


@app.get("/llm/metrics", tags=["LLM"])
def get_llm_metrics(hours: int = 24):
    """
    Get aggregated LLM metrics for specified time window.
    
    Args:
        hours: Number of hours to look back (default: 24)
    
    Returns:
        Aggregated metrics including requests, tokens, cost, latency, quality
    """
    if not llm_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service not available"
        )
    
    try:
        metrics = llm_service.get_metrics_summary(hours=hours)
        return metrics
    except Exception as e:
        logger.error(f"Failed to get LLM metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get LLM metrics: {str(e)}"
        )


@app.get("/llm/interactions", tags=["LLM"])
def get_llm_interactions(limit: int = 50):
    """
    Get recent LLM interactions.
    
    Args:
        limit: Maximum number of interactions to return (default: 50)
    
    Returns:
        List of recent LLM interactions with prompts, responses, and metrics
    """
    if not llm_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service not available"
        )
    
    try:
        interactions = llm_service.get_interactions(limit=limit)
        return {
            "interactions": interactions,
            "count": len(interactions)
        }
    except Exception as e:
        logger.error(f"Failed to get LLM interactions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get LLM interactions: {str(e)}"
        )


@app.get("/llm/alerts", tags=["LLM"])
def get_llm_alerts(status_filter: str = "open", limit: int = 20):
    """
    Get LLM alerts.
    
    Args:
        status_filter: Filter by status ("open", "all")
        limit: Maximum number of alerts to return (default: 20)
    
    Returns:
        List of LLM alerts (high latency, hallucinations, high cost)
    """
    if not llm_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service not available"
        )
    
    try:
        alerts = llm_service.get_alerts(status=status_filter, limit=limit)
        return {
            "alerts": alerts,
            "count": len(alerts),
            "status_filter": status_filter
        }
    except Exception as e:
        logger.error(f"Failed to get LLM alerts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get LLM alerts: {str(e)}"
        )


# ============================================================================
# SIMULATION ENDPOINTS (For Demo/Hackathon)
# ============================================================================

@app.post("/simulation/drift", tags=["Simulation"])
def simulate_drift_scenario():
    """
    🔴 SIMULATION MODE: Inject artificial drift for demo purposes.
    
    Creates a high-severity drift event that:
    - Lowers trust score
    - Changes autonomy level
    - Triggers governance alerts
    
    Perfect for hackathon demos!
    """
    if not trust_engine:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trust engine not available"
        )
    
    try:
        # Use existing simulate_drift_incident method
        result = trust_engine.simulate_drift_incident()
        
        if result.get('error'):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result['error']
            )
        
        # Serialize datetime objects
        if result.get('incident'):
            result['incident']['_id'] = str(result['incident']['_id'])
            result['incident']['detected_at'] = result['incident']['detected_at'].isoformat()
        
        if result.get('trust_result'):
            result['trust_result']['timestamp'] = result['trust_result']['timestamp'].isoformat()
        
        return {
            "simulation": "drift",
            "status": "injected",
            "message": "Drift scenario activated. Trust score will decrease.",
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to simulate drift: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to simulate drift: {str(e)}"
        )


@app.post("/simulation/bias", tags=["Simulation"])
def simulate_bias_scenario():
    """
    ⚠️ SIMULATION MODE: Inject artificial bias detection for demo.
    
    Creates a bias incident that affects trust score.
    """
    if not data_store:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Data store not available"
        )
    
    try:
        from datetime import datetime
        
        # Create bias incident
        incident = {
            "type": "bias_detected",
            "severity": "high",
            "description": "Simulated bias in credit_history feature detected",
            "detected_at": datetime.utcnow(),
            "status": "active",
            "details": {
                "feature": "credit_history",
                "bias_score": 0.78,
                "affected_group": "Fair credit history",
                "recommendation": "Review model fairness metrics"
            }
        }
        
        # Store incident
        incident_id = data_store.store_incident(incident)
        incident['_id'] = str(incident_id)
        incident['detected_at'] = incident['detected_at'].isoformat()
        
        # Recalculate trust score
        trust_result = None
        if trust_engine:
            trust_result = trust_engine.calculate_trust_score()
            trust_result['timestamp'] = trust_result['timestamp'].isoformat()
        
        return {
            "simulation": "bias",
            "status": "injected",
            "message": "Bias scenario activated. Trust score affected.",
            "incident": incident,
            "trust_result": trust_result
        }
        
    except Exception as e:
        logger.error(f"Failed to simulate bias: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to simulate bias: {str(e)}"
        )


@app.post("/simulation/accuracy-drop", tags=["Simulation"])
def simulate_accuracy_drop():
    """
    📉 SIMULATION MODE: Inject artificial accuracy drop for demo.
    
    Creates an accuracy drop incident.
    """
    if not data_store:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Data store not available"
        )
    
    try:
        from datetime import datetime
        
        # Create accuracy drop incident
        incident = {
            "type": "accuracy_drop",
            "severity": "medium",
            "description": "Simulated model accuracy drop detected",
            "detected_at": datetime.utcnow(),
            "status": "active",
            "details": {
                "previous_accuracy": 0.95,
                "current_accuracy": 0.87,
                "drop_percentage": 8.4,
                "recommendation": "Consider model retraining"
            }
        }
        
        # Store incident
        incident_id = data_store.store_incident(incident)
        incident['_id'] = str(incident_id)
        incident['detected_at'] = incident['detected_at'].isoformat()
        
        # Recalculate trust score
        trust_result = None
        if trust_engine:
            trust_result = trust_engine.calculate_trust_score()
            trust_result['timestamp'] = trust_result['timestamp'].isoformat()
        
        return {
            "simulation": "accuracy_drop",
            "status": "injected",
            "message": "Accuracy drop scenario activated. Trust score affected.",
            "incident": incident,
            "trust_result": trust_result
        }
        
    except Exception as e:
        logger.error(f"Failed to simulate accuracy drop: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to simulate accuracy drop: {str(e)}"
        )


@app.post("/simulation/reset", tags=["Simulation"])
def reset_simulation():
    """
    🔄 SIMULATION MODE: Reset all simulated incidents.
    
    Clears all active incidents and restores normal operation.
    """
    if not data_store:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Data store not available"
        )
    
    try:
        from datetime import datetime
        
        # Resolve all active incidents
        incidents = data_store.get_incidents(status="active")
        resolved_count = 0
        
        for incident in incidents:
            if incident.get('type') in ['drift_detected', 'bias_detected', 'accuracy_drop']:
                data_store.update_incident_status(
                    str(incident['_id']),
                    "resolved",
                    "Simulation reset"
                )
                resolved_count += 1
        
        # Recalculate trust score
        trust_result = None
        if trust_engine:
            trust_result = trust_engine.calculate_trust_score()
            trust_result['timestamp'] = trust_result['timestamp'].isoformat()
        
        return {
            "simulation": "reset",
            "status": "completed",
            "message": f"Simulation reset. {resolved_count} incidents resolved.",
            "resolved_incidents": resolved_count,
            "trust_result": trust_result
        }
        
    except Exception as e:
        logger.error(f"Failed to reset simulation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset simulation: {str(e)}"
        )


@app.get("/simulation/status", tags=["Simulation"])
def get_simulation_status():
    """
    Get current simulation status.
    
    Returns information about active simulated incidents.
    """
    if not data_store:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Data store not available"
        )
    
    try:
        # Get active simulated incidents
        all_incidents = data_store.get_incidents(status="active")
        simulated_incidents = [
            inc for inc in all_incidents
            if inc.get('type') in ['drift_detected', 'bias_detected', 'accuracy_drop']
        ]
        
        # Serialize
        for inc in simulated_incidents:
            inc['_id'] = str(inc['_id'])
            if 'detected_at' in inc:
                inc['detected_at'] = inc['detected_at'].isoformat()
        
        return {
            "simulation_active": len(simulated_incidents) > 0,
            "active_scenarios": len(simulated_incidents),
            "incidents": simulated_incidents
        }
        
    except Exception as e:
        logger.error(f"Failed to get simulation status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get simulation status: {str(e)}"
        )
