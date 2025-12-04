"""
Tests for Modal analyze_call function
"""

import pytest
from modal_functions.analyze_call import (
    extract_sales_metrics,
    parse_analysis_response,
    build_analysis_prompt,
)


def test_extract_sales_metrics():
    """Test sales metrics extraction"""
    transcript = """
    Sales Rep: Hello, thanks for taking the call.
    Prospect: Hi, I'm concerned about the cost. It's expensive.
    Sales Rep: I understand your concern. Let me show you the ROI.
    Prospect: That sounds interesting. When can we schedule a meeting?
    Sales Rep: How about next Tuesday at 2pm?
    Prospect: Yes, let's schedule for next Tuesday at 2pm. Sounds good!
    """
    
    metrics = extract_sales_metrics(transcript)
    
    assert metrics['objections_raised'] > 0
    assert metrics['meeting_booked'] == True
    assert metrics['energy_level'] > 0
    assert metrics['word_count'] > 0


def test_parse_analysis_response_valid_json():
    """Test parsing valid JSON response"""
    response_text = '{"overall_score": 85, "strengths": ["Good engagement"]}'
    
    result = parse_analysis_response(response_text)
    
    assert result['overall_score'] == 85
    assert 'strengths' in result


def test_parse_analysis_response_markdown():
    """Test parsing JSON in markdown code block"""
    response_text = '''
    Here's the analysis:
    ```json
    {"overall_score": 90, "strengths": ["Excellent"]}
    ```
    '''
    
    result = parse_analysis_response(response_text)
    
    assert result['overall_score'] == 90
    assert len(result['strengths']) > 0


def test_parse_analysis_response_invalid():
    """Test parsing invalid response falls back gracefully"""
    response_text = 'Invalid response text'
    
    result = parse_analysis_response(response_text)
    
    # Should return fallback structure
    assert 'overall_score' in result
    assert 'strengths' in result
    assert 'areas_for_improvement' in result


def test_build_analysis_prompt():
    """Test prompt building"""
    transcript = "Test transcript"
    scenario_id = "TEST_SCENARIO"
    
    prompt = build_analysis_prompt(transcript, scenario_id)
    
    assert scenario_id in prompt
    assert transcript in prompt
    assert "Overall Performance Score" in prompt
    assert "Objection Handling" in prompt
    assert "Meeting Booking" in prompt


def test_extract_meeting_booking():
    """Test meeting booking detection"""
    transcript = "When can we schedule a meeting? Yes, let's schedule for Tuesday at 2pm."
    
    metrics = extract_sales_metrics(transcript)
    
    assert metrics['meeting_booked'] == True
    assert metrics['meeting_attempts'] > 0


def test_extract_closing():
    """Test closing detection"""
    transcript = "Are you ready to move forward? Yes, let's do it. I'm ready to purchase."
    
    metrics = extract_sales_metrics(transcript)
    
    assert metrics['sale_closed'] == True
    assert metrics['closing_attempts'] > 0


def test_extract_objections():
    """Test objection detection"""
    transcript = "I'm concerned about the cost. It's expensive. But we have budget constraints."
    
    metrics = extract_sales_metrics(transcript)
    
    assert metrics['objections_raised'] > 0


def test_energy_level_calculation():
    """Test energy level calculation"""
    low_energy = "This is a test."
    high_energy = "This is great! Excellent! Perfect! Amazing!"
    
    low_metrics = extract_sales_metrics(low_energy)
    high_metrics = extract_sales_metrics(high_energy)
    
    assert high_metrics['energy_level'] > low_metrics['energy_level']

