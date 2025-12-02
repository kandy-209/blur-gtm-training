export interface ScenarioInput {
  turn_number: number;
  scenario_id: string;
  objection_category: string;
  objection_statement: string;
}

export interface AgentResponse {
  agent_response_text: string;
  scoring_feedback: string;
  response_evaluation: "PASS" | "FAIL" | "REJECT";
  next_step_action: "FOLLOW_UP" | "REJECT_AND_RESTATE" | "MEETING_BOOKED" | "ENTERPRISE_SALE" | "END_SCENARIO";
  confidence_score: number; // 50-100
  sale_indicators?: {
    meeting_agreed?: boolean;
    enterprise_interest?: boolean;
    next_steps_discussed?: boolean;
  };
}

export interface Persona {
  name: string;
  currentSolution: string;
  primaryGoal: string;
  skepticism: string;
  tone: string;
}

export interface Scenario {
  id: string;
  persona: Persona;
  objection_category: string;
  objection_statement: string;
  keyPoints: string[]; // What the rep should mention
}

export interface RoleplayState {
  scenario: Scenario;
  turnNumber: number;
  conversationHistory: Array<{
    role: "rep" | "agent";
    message: string;
    timestamp: Date;
  }>;
  currentEvaluation?: AgentResponse;
  isComplete: boolean;
  finalScore?: number;
}

