import httpx
import json
import os
from typing import List, Optional
from schemas import Plan, PlanCreate
import logging

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = "llama3.2:latest"

class OllamaService:
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL
        self.model = MODEL_NAME
    
    async def generate_plans(self, plan_z_content: str, existing_plans: List[Plan] = None) -> List[PlanCreate]:
        """Generate B-Y plans based on Plan Z content using Ollama"""
        
        # Build context from existing plans
        existing_context = ""
        if existing_plans:
            existing_context = "\nExisting Plans:\n"
            for plan in existing_plans:
                existing_context += f"Plan {plan.plan_letter}: {plan.title}\n"
                if plan.description:
                    existing_context += f"Description: {plan.description}\n"
                existing_context += f"Start: {plan.start_date}, End: {plan.end_date}\n\n"
        
        # Create prompt for LLM
        prompt = f"""
You are an AI assistant helping to generate a comprehensive A-Z planning sequence. 

Plan Z (the final goal) content:
{plan_z_content}

{existing_context}

Based on Plan Z, generate intermediate plans B through Y that lead logically to achieving Plan Z. 

Requirements:
1. Generate plans B through Y (24 plans total)
2. Each plan should be a logical step toward Plan Z
3. Plans should build upon each other sequentially
4. Include realistic timeframes and descriptions
5. Consider costs, resources, and dependencies

Return ONLY a JSON array of plans with this exact structure:
[
  {{
    "plan_letter": "B",
    "title": "Plan Title",
    "description": "Detailed description",
    "start_date": "2024-01-01T00:00:00",
    "end_date": "2024-01-31T23:59:59"
  }},
  ...
]

Generate all 24 plans (B through Y) in a single response.
"""

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "format": "json",
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "max_tokens": 4000
                        }
                    },
                    timeout=120.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Ollama API error: {response.status_code} - {response.text}")
                    return self._generate_fallback_plans()
                
                result = response.json()
                generated_text = result.get("response", "")
                
                # Parse the JSON response
                try:
                    plans_data = json.loads(generated_text)
                    plans = []
                    
                    for plan_data in plans_data:
                        if isinstance(plan_data, dict):
                            plans.append(PlanCreate(**plan_data))
                    
                    if len(plans) == 24:  # B through Y
                        return plans
                    else:
                        logger.warning(f"Generated {len(plans)} plans instead of 24, using fallback")
                        return self._generate_fallback_plans()
                        
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON response: {e}")
                    return self._generate_fallback_plans()
                    
        except Exception as e:
            logger.error(f"Error calling Ollama API: {e}")
            return self._generate_fallback_plans()
    
    def _generate_fallback_plans(self) -> List[PlanCreate]:
        """Generate basic fallback plans when LLM is not available"""
        plans = []
        letters = "BCDEFGHIJKLMNOPQRSTUVWXY"
        
        for i, letter in enumerate(letters):
            plan = PlanCreate(
                plan_letter=letter,
                title=f"Step {i+1}: Foundation Planning",
                description=f"This is step {i+1} in the sequence leading to your final goal. This is a placeholder plan generated when the LLM service is unavailable.",
                start_date=None,
                end_date=None
            )
            plans.append(plan)
        
        return plans
    
    async def health_check(self) -> bool:
        """Check if Ollama service is healthy"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/version", timeout=5.0)
                return response.status_code == 200
        except:
            return False

ollama_service = OllamaService()