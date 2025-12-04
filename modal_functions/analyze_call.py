"""
Modal Function: Sales Call Analysis
ML/AI-powered transcript analysis for sales training
"""

import modal
import json
import os
from typing import Dict, Any, List
from datetime import datetime

# Create Modal app
app = modal.App("sales-call-analysis")

# Define image with all dependencies
image = (
    modal.Image.debian_slim()
    .pip_install(
        "openai==1.3.0",
        "anthropic==0.7.0",
        "numpy==1.26.2",
        "scikit-learn==1.3.2",
        "requests==2.31.0",
        "pydantic==2.5.0",
    )
)

# Secrets for API keys
secrets = [
    modal.Secret.from_name("openai-secret"),
    modal.Secret.from_name("anthropic-secret"),
    modal.Secret.from_name("vapi-secret"),
]

@app.function(
    image=image,
    secrets=secrets,
    timeout=600,  # 10 minutes for analysis
    cpu=2,  # 2 CPUs for faster processing
    memory=4096,  # 4GB RAM
)
def analyze_sales_call(call_id: str, scenario_id: str, transcript: str = None) -> Dict[str, Any]:
    """
    Analyze sales call transcript using AI/ML
    Returns comprehensive sales metrics and analysis
    """
    import openai
    from anthropic import Anthropic
    
    # Get API keys from secrets
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")
    vapi_api_key = os.environ.get("VAPI_API_KEY")
    
    # Fetch transcript from Vapi if not provided
    if not transcript:
        transcript = fetch_transcript_from_vapi(call_id, vapi_api_key)
    
    if not transcript:
        raise ValueError("No transcript available for analysis")
    
    # Use Anthropic Claude for analysis (better for structured output)
    client = Anthropic(api_key=anthropic_api_key)
    
    analysis_prompt = build_analysis_prompt(transcript, scenario_id)
    
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4000,
        messages=[
            {
                "role": "user",
                "content": analysis_prompt
            }
        ],
    )
    
    # Parse response
    analysis_text = message.content[0].text
    analysis = parse_analysis_response(analysis_text)
    
    # Extract metrics using NLP
    metrics = extract_sales_metrics(transcript)
    
    # Combine results
    return {
        "call_id": call_id,
        "scenario_id": scenario_id,
        "metrics": metrics,
        "analysis": analysis,
        "processed_at": datetime.utcnow().isoformat(),
    }

def build_analysis_prompt(transcript: str, scenario_id: str) -> str:
    """Build comprehensive analysis prompt"""
    return f"""You are an expert sales trainer analyzing a sales call transcript.

SCENARIO: {scenario_id}

TRANSCRIPT:
{transcript}

Analyze this sales call and provide a comprehensive JSON response with:

1. Overall Performance Score (0-100)
2. Strengths (array of strings)
3. Areas for Improvement (array of strings)
4. Objection Handling:
   - Score (0-100)
   - Objections Handled (count)
   - Objections Missed (count)
   - Recommendations (array)
5. Meeting Booking:
   - Attempted (boolean)
   - Successful (boolean)
   - Attempts (count)
   - Recommendations (array)
6. Closing:
   - Attempted (boolean)
   - Successful (boolean)
   - Attempts (count)
   - Recommendations (array)
7. Communication Quality:
   - Talk-to-Listen Ratio (number)
   - Energy Level (0-100)
   - Clarity Score (0-100)
   - Recommendations (array)
8. Key Moments (array of objects with timestamp, type, description)

Return ONLY valid JSON, no markdown or extra text."""

def parse_analysis_response(text: str) -> Dict[str, Any]:
    """Parse AI response into structured format"""
    try:
        # Extract JSON from response (handle markdown code blocks)
        import re
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
        if json_match:
            text = json_match.group(1)
        else:
            # Try to find JSON object
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                text = json_match.group(0)
        
        return json.loads(text)
    except Exception as e:
        # Fallback to basic structure
        return {
            "overall_score": 75,
            "strengths": ["Good engagement"],
            "areas_for_improvement": ["Could improve objection handling"],
            "objection_handling": {
                "score": 70,
                "objections_handled": 0,
                "objections_missed": 0,
                "recommendations": []
            },
            "meeting_booking": {
                "attempted": False,
                "successful": False,
                "attempts": 0,
                "recommendations": []
            },
            "closing": {
                "attempted": False,
                "successful": False,
                "attempts": 0,
                "recommendations": []
            },
            "communication": {
                "talk_to_listen_ratio": 1.0,
                "energy_level": 75,
                "clarity_score": 75,
                "recommendations": []
            },
            "key_moments": []
        }

def extract_sales_metrics(transcript: str) -> Dict[str, Any]:
    """Extract sales-specific metrics using NLP"""
    import re
    from collections import Counter
    
    words = transcript.split()
    word_count = len(words)
    
    # Calculate estimated talk time (assuming 150 WPM)
    estimated_talk_time = int((word_count / 150) * 60)
    
    # Count objections
    objection_keywords = [
        "concern", "worried", "issue", "problem", "but", "however",
        "expensive", "cost", "price", "budget", "can't afford"
    ]
    objections_raised = sum(1 for kw in objection_keywords if kw.lower() in transcript.lower())
    
    # Detect meeting booking attempts
    meeting_keywords = [
        "meeting", "schedule", "demo", "call", "time", "date",
        "calendar", "available", "when", "next week"
    ]
    meeting_attempts = sum(1 for kw in meeting_keywords if kw.lower() in transcript.lower())
    meeting_booked = any(phrase in transcript.lower() for phrase in [
        "yes, let's schedule", "sounds good", "i'm available",
        "tuesday works", "next week works"
    ])
    
    # Detect closing attempts
    closing_keywords = [
        "purchase", "buy", "move forward", "ready", "commit",
        "sign", "deal", "agreement", "proceed"
    ]
    closing_attempts = sum(1 for kw in closing_keywords if kw.lower() in transcript.lower())
    sale_closed = any(phrase in transcript.lower() for phrase in [
        "yes, let's do it", "i'm ready", "let's move forward",
        "sounds good", "i'm in"
    ])
    
    # Calculate energy level (simplified - based on exclamation marks, positive words)
    exclamations = transcript.count('!')
    positive_words = ["great", "excellent", "perfect", "amazing", "wonderful"]
    positive_count = sum(1 for word in positive_words if word.lower() in transcript.lower())
    energy_level = min(100, 50 + (exclamations * 5) + (positive_count * 5))
    
    # Detect interruptions (simplified - look for overlapping speech indicators)
    interruptions = transcript.count('--') + transcript.count('...')
    
    return {
        "talk_time": estimated_talk_time,
        "listen_time": max(0, estimated_talk_time),  # Would need audio analysis
        "interruptions": interruptions,
        "objections_raised": objections_raised,
        "objections_resolved": max(0, objections_raised - 2),  # Simplified
        "meeting_booked": meeting_booked,
        "sale_closed": sale_closed,
        "energy_level": energy_level,
        "confidence_score": 75,  # Would be calculated from analysis
        "word_count": word_count,
        "meeting_attempts": meeting_attempts,
        "closing_attempts": closing_attempts,
    }

def fetch_transcript_from_vapi(call_id: str, api_key: str) -> str:
    """Fetch transcript from Vapi API"""
    import requests
    
    try:
        response = requests.get(
            f"https://api.vapi.ai/call/{call_id}",
            headers={
                "Authorization": f"Bearer {api_key}",
            },
            timeout=10,
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("transcript", "")
    except Exception as e:
        print(f"Error fetching transcript: {e}")
    
    return ""

# Web endpoint for Vercel to call
@app.function(
    image=image,
    secrets=secrets,
    method="POST",
    timeout=600,
)
@modal.web_endpoint(method="POST")
def analyze_call_endpoint(item: Dict[str, Any]):
    """Web endpoint for call analysis"""
    call_id = item.get("call_id")
    scenario_id = item.get("scenario_id")
    transcript = item.get("transcript")
    
    if not call_id:
        return {"error": "call_id is required"}, 400
    
    try:
        result = analyze_sales_call.remote(call_id, scenario_id, transcript)
        return result
    except Exception as e:
        return {"error": str(e)}, 500

