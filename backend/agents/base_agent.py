import time
import datetime
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from backend.schemas.schemas import BaseAgentOutput

class BaseAgent(ABC):
    def __init__(self, name: str, code_name: str, description: str):
        self.name = name
        self.code_name = code_name
        self.description = description

    def run(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        start_time = time.time()
        now_str = datetime.datetime.utcnow().isoformat() + "Z"
        try:
            result = self.process(asset, context)
            exec_time = round((time.time() - start_time) * 1000, 2)
            result.execution_time_ms = exec_time
            result.timestamp = now_str
            return result
        except Exception as e:
            exec_time = round((time.time() - start_time) * 1000, 2)
            return BaseAgentOutput(
                agent_name=self.name,
                status="error",
                asset=asset,
                timestamp=now_str,
                score=50.0,
                signal="NEUTRAL",
                confidence=0.0,
                metrics={},
                evidence=[],
                warnings=[f"Agent processing exception: {str(e)}"],
                execution_time_ms=exec_time
            )

    @abstractmethod
    def process(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        pass

