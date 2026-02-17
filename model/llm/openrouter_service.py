"""
OpenRouter LLM Service Module

Provides LLM observability using OpenRouter API for banking use cases.
Supports multiple models including free options.
"""

import os
import time
import re
import requests
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from pymongo import MongoClient
import logging

logger = logging.getLogger(__name__)


class OpenRouterLLMService:
    """
    LLM service using OpenRouter API for banking queries.
    
    Tracks:
    - Latency & throughput
    - Token usage & cost
    - Hallucination detection
    - Response quality
    - Safety signals
    """
    
    def __init__(self, mongo_uri: str, database_name: str = "credit_risk_db", api_key: str = None):
        """Initialize OpenRouter LLM service with MongoDB connection."""
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client[database_name]
        
        # Collections
        self.llm_interactions = self.db['llm_interactions']
        self.llm_metrics = self.db['llm_metrics_hourly']
        self.llm_alerts = self.db['llm_alerts']
        
        # Model configuration
        self.model_name = "openai/gpt-3.5-turbo"  # Fast and cost-effective
        
        # API configuration
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        
        if self.api_key and self.api_key.strip():
            logger.info(f"OpenRouter LLM service initialized with model: {self.model_name}")
        else:
            logger.error("OPENROUTER_API_KEY not found in environment variables")
        
        # Pricing (approximate, per 1M tokens)
        self.pricing = {
            "openai/gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
            "openai/gpt-4": {"input": 0.03, "output": 0.06},
            "openai/gpt-oss-120b:free": {"input": 0.0, "output": 0.0},  # Free model
            "meta-llama/llama-3.1-8b-instruct:free": {"input": 0.0, "output": 0.0},  # Free model
        }
    
    def count_tokens(self, text: str) -> int:
        """
        Estimate token count for text.
        Rough estimate: ~1.3 tokens per word for English
        """
        words = len(text.split())
        return int(words * 1.3)
    
    def calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost based on token usage."""
        pricing = self.pricing.get(self.model_name, self.pricing["openai/gpt-3.5-turbo"])
        input_cost = input_tokens * pricing["input"]
        output_cost = output_tokens * pricing["output"]
        return input_cost + output_cost
    
    def detect_hallucination(self, prompt: str, response: str) -> Dict:
        """
        Detect potential hallucinations in LLM response.
        
        Checks for:
        - Uncertainty indicators
        - Fictional content markers
        - Risky financial claims without disclaimers
        """
        hallucination_indicators = [
            "I don't have access to",
            "I cannot verify",
            "As an AI",
            "I apologize, but I don't have real-time",
            "I don't have information about",
            "fictional",
            "made up",
            "I cannot provide",
            "I'm not able to"
        ]
        
        response_lower = response.lower()
        detected_indicators = [ind for ind in hallucination_indicators if ind.lower() in response_lower]
        
        # Banking-specific: check for risky claims without disclaimers
        risky_claims = [
            "guaranteed return",
            "risk-free",
            "definitely will",
            "100% safe",
            "no risk",
            "guaranteed profit"
        ]
        risky_detected = [claim for claim in risky_claims if claim in response_lower]
        
        # Check if response has appropriate disclaimers for financial advice
        has_disclaimer = any(word in response_lower for word in [
            "disclaimer", "consult", "financial advisor", "terms apply",
            "subject to", "may vary", "conditions apply"
        ])
        
        hallucination_detected = len(detected_indicators) > 0 or (len(risky_detected) > 0 and not has_disclaimer)
        
        return {
            "hallucination_detected": hallucination_detected,
            "confidence": 0.6 if hallucination_detected else 0.95,
            "indicators_found": detected_indicators + risky_detected,
            "has_disclaimer": has_disclaimer
        }
    
    def check_safety(self, text: str) -> Dict:
        """
        Check for safety violations in text.
        
        Detects:
        - Illegal activities
        - Fraud-related content
        - Harmful financial advice
        """
        unsafe_keywords = [
            "hack", "exploit", "fraud", "scam", "illegal",
            "money laundering", "tax evasion", "insider trading",
            "ponzi", "pyramid scheme", "steal", "cheat"
        ]
        
        text_lower = text.lower()
        violations = [kw for kw in unsafe_keywords if kw in text_lower]
        
        severity = "none"
        if len(violations) > 0:
            severity = "high" if len(violations) > 2 else "medium"
        
        return {
            "safety_passed": len(violations) == 0,
            "violations": violations,
            "severity": severity,
            "violation_count": len(violations)
        }
    
    def calculate_quality_score(self, response: str, prompt: str) -> float:
        """
        Calculate quality score for LLM response.
        
        Factors:
        - Length appropriateness
        - Structure (sentences, paragraphs)
        - Relevance to prompt
        - Professional tone
        """
        score = 1.0
        
        # Length check (banking answers should be informative but concise)
        response_length = len(response)
        if response_length < 50:
            score -= 0.3  # Too short
        elif response_length > 1500:
            score -= 0.15  # Too verbose
        
        # Structure check
        sentences = response.count('.') + response.count('!') + response.count('?')
        if sentences < 2:
            score -= 0.2  # Lacks structure
        
        # Check for proper capitalization and punctuation
        if not response[0].isupper():
            score -= 0.1
        if not response.strip()[-1] in '.!?':
            score -= 0.1
        
        # Relevance check - keyword overlap
        prompt_words = set(re.findall(r'\w+', prompt.lower()))
        response_words = set(re.findall(r'\w+', response.lower()))
        
        # Remove common words
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were'}
        prompt_words -= common_words
        response_words -= common_words
        
        if len(prompt_words) > 0:
            overlap = len(prompt_words & response_words) / len(prompt_words)
            if overlap < 0.2:
                score -= 0.3  # Doesn't address the question
            elif overlap < 0.4:
                score -= 0.1
        
        # Check for professional banking tone
        professional_indicators = ['please', 'thank you', 'contact', 'information', 'service', 'account']
        professional_count = sum(1 for word in professional_indicators if word in response.lower())
        if professional_count == 0:
            score -= 0.1
        
        return max(0.0, min(1.0, score))
    
    def query(
        self,
        prompt: str,
        use_case: str = "customer_query",
        user_id: Optional[str] = None
    ) -> Dict:
        """
        Send query to OpenRouter LLM and log metrics.
        
        Args:
            prompt: User's question/query
            use_case: Type of query (customer_query, document_analysis, risk_assessment)
            user_id: Optional user identifier
            
        Returns:
            Dictionary with response and metrics
        """
        if not self.api_key or not self.api_key.strip():
            raise Exception("OpenRouter API key not configured. Check OPENROUTER_API_KEY in .env")
        
        start_time = time.time()
        
        # Banking context for system message
        system_context = """You are a helpful and professional banking assistant for AegisAI Bank. 
        Provide accurate, concise information about banking products and services. 
        Always include appropriate disclaimers for financial advice. 
        If you're unsure about specific rates or policies, direct users to contact customer service.
        Be professional, clear, and customer-focused."""
        
        try:
            # Prepare request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://aegisai.bank",  # Optional
                "X-Title": "AegisAI Banking Assistant"  # Optional
            }
            
            payload = {
                "model": self.model_name,
                "messages": [
                    {"role": "system", "content": system_context},
                    {"role": "user", "content": prompt}
                ]
            }
            
            # Count input tokens (approximate)
            input_tokens = self.count_tokens(system_context + prompt)
            
            # Call OpenRouter API
            response = requests.post(
                self.api_url,
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")
            
            result = response.json()
            
            # Extract response text
            response_text = result['choices'][0]['message']['content']
            
            # Get token usage from API response
            usage = result.get('usage', {})
            output_tokens = usage.get('completion_tokens', self.count_tokens(response_text))
            total_tokens = usage.get('total_tokens', input_tokens + output_tokens)
            
            # Calculate metrics
            latency_ms = (time.time() - start_time) * 1000
            cost = self.calculate_cost(input_tokens, output_tokens)
            
            # Quality checks
            hallucination_check = self.detect_hallucination(prompt, response_text)
            safety_check = self.check_safety(response_text)
            quality_score = self.calculate_quality_score(response_text, prompt)
            
            # Log interaction
            interaction = {
                "timestamp": datetime.now(),
                "model": self.model_name,
                "use_case": use_case,
                "user_id": user_id,
                "prompt": {
                    "text": prompt,
                    "tokens": input_tokens
                },
                "response": {
                    "text": response_text,
                    "tokens": output_tokens,
                    "finish_reason": result['choices'][0].get('finish_reason', 'stop')
                },
                "metrics": {
                    "latency_ms": round(latency_ms, 2),
                    "total_tokens": total_tokens,
                    "cost_usd": round(cost, 6),
                    "quality_score": round(quality_score, 3),
                    "hallucination_detected": hallucination_check["hallucination_detected"],
                    "safety_passed": safety_check["safety_passed"]
                }
            }
            
            self.llm_interactions.insert_one(interaction.copy())
            logger.info(f"LLM query processed: {latency_ms:.0f}ms, {total_tokens} tokens, ${cost:.6f}")
            
            # Check for alerts
            self._check_alerts(cost, latency_ms, hallucination_check["hallucination_detected"])
            
            return {
                "response": response_text,
                "metrics": interaction["metrics"],
                "model": self.model_name
            }
            
        except Exception as e:
            # Log error
            latency_ms = (time.time() - start_time) * 1000
            error_log = {
                "timestamp": datetime.now(),
                "model": self.model_name,
                "prompt": prompt,
                "error": str(e),
                "latency_ms": latency_ms,
                "use_case": use_case
            }
            self.llm_interactions.insert_one(error_log)
            logger.error(f"LLM query failed: {e}")
            
            raise Exception(f"OpenRouter LLM query failed: {str(e)}")
    
    def _check_alerts(self, cost: float, latency_ms: float, hallucination: bool):
        """Check if alerts should be triggered."""
        # High latency alert
        if latency_ms > 5000:
            self._create_alert(
                "high_latency",
                "warning",
                f"LLM latency {latency_ms:.0f}ms exceeded 5000ms threshold",
                latency_ms
            )
        
        # Hallucination detected
        if hallucination:
            self._create_alert(
                "hallucination",
                "high",
                "Potential hallucination detected in LLM response",
                None
            )
        
        # Cost tracking (hourly)
        one_hour_ago = datetime.now() - timedelta(hours=1)
        hourly_interactions = list(self.llm_interactions.find({
            "timestamp": {"$gte": one_hour_ago},
            "metrics": {"$exists": True}
        }))
        
        hourly_cost = sum(
            doc.get('metrics', {}).get('cost_usd', 0)
            for doc in hourly_interactions
        )
        
        if hourly_cost > 5.0:  # $5/hour threshold
            self._create_alert(
                "high_cost",
                "warning",
                f"Hourly LLM cost ${hourly_cost:.2f} exceeded $5 threshold",
                hourly_cost
            )
    
    def _create_alert(
        self,
        alert_type: str,
        severity: str,
        message: str,
        current_value: Optional[float] = None
    ):
        """Create an alert in database."""
        alert = {
            "timestamp": datetime.now(),
            "alert_type": alert_type,
            "severity": severity,
            "message": message,
            "current_value": current_value,
            "acknowledged": False
        }
        self.llm_alerts.insert_one(alert)
        logger.warning(f"Alert created: {alert_type} - {message}")
    
    def get_metrics_summary(self, hours: int = 24) -> Dict:
        """
        Get aggregated LLM metrics for specified time window.
        
        Args:
            hours: Number of hours to look back
            
        Returns:
            Dictionary with aggregated metrics
        """
        cutoff = datetime.now() - timedelta(hours=hours)
        
        interactions = list(self.llm_interactions.find({
            "timestamp": {"$gte": cutoff},
            "metrics": {"$exists": True}
        }))
        
        if not interactions:
            return {
                "message": "No LLM interactions in the specified timeframe",
                "time_window_hours": hours
            }
        
        total_requests = len(interactions)
        total_tokens = sum(i.get('metrics', {}).get('total_tokens', 0) for i in interactions)
        total_cost = sum(i.get('metrics', {}).get('cost_usd', 0) for i in interactions)
        avg_latency = sum(i.get('metrics', {}).get('latency_ms', 0) for i in interactions) / total_requests
        
        hallucinations = sum(
            1 for i in interactions
            if i.get('metrics', {}).get('hallucination_detected', False)
        )
        
        safety_violations = sum(
            1 for i in interactions
            if not i.get('metrics', {}).get('safety_passed', True)
        )
        
        quality_scores = [
            i.get('metrics', {}).get('quality_score', 0)
            for i in interactions
            if i.get('metrics', {}).get('quality_score') is not None
        ]
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        return {
            "time_window_hours": hours,
            "total_requests": total_requests,
            "total_tokens": total_tokens,
            "total_cost_usd": round(total_cost, 4),
            "avg_latency_ms": round(avg_latency, 2),
            "throughput_rph": round(total_requests / hours, 2),  # Requests per hour
            "hallucination_rate": round(hallucinations / total_requests, 3) if total_requests > 0 else 0,
            "safety_violation_rate": round(safety_violations / total_requests, 3) if total_requests > 0 else 0,
            "avg_quality_score": round(avg_quality, 3),
            "model": self.model_name
        }
    
    def get_interactions(self, limit: int = 50) -> List[Dict]:
        """
        Get recent LLM interactions.
        
        Args:
            limit: Maximum number of interactions to return
            
        Returns:
            List of interaction records
        """
        interactions = list(
            self.llm_interactions.find()
            .sort("timestamp", -1)
            .limit(limit)
        )
        
        # Convert ObjectId and datetime for JSON serialization
        for interaction in interactions:
            interaction['_id'] = str(interaction['_id'])
            interaction['timestamp'] = interaction['timestamp'].isoformat()
        
        return interactions
    
    def get_alerts(self, status: str = "open", limit: int = 20) -> List[Dict]:
        """
        Get LLM alerts.
        
        Args:
            status: Filter by status ("open", "all")
            limit: Maximum number of alerts to return
            
        Returns:
            List of alert records
        """
        query = {} if status == "all" else {"acknowledged": False}
        
        alerts = list(
            self.llm_alerts.find(query)
            .sort("timestamp", -1)
            .limit(limit)
        )
        
        # Convert ObjectId and datetime for JSON serialization
        for alert in alerts:
            alert['_id'] = str(alert['_id'])
            alert['timestamp'] = alert['timestamp'].isoformat()
        
        return alerts
    
    def close(self):
        """Close MongoDB connection."""
        if self.mongo_client:
            self.mongo_client.close()
            logger.info("OpenRouterLLMService connection closed")
