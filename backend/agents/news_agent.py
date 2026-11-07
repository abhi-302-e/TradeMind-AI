import numpy as np
from typing import Dict, Any
from backend.agents.base_agent import BaseAgent
from backend.schemas.schemas import BaseAgentOutput
from backend.services.market_service import MarketService

class NewsSentimentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="News and Sentiment Analysis Agent",
            code_name="news_agent",
            description="Extracts market sentiment polarity, detects institutional catalysts, and monitors macroeconomic announcements."
        )

    def process(self, asset: str, context: Dict[str, Any]) -> BaseAgentOutput:
        articles = MarketService.get_news_and_sentiment(asset)

        if not articles:
            return BaseAgentOutput(
                agent_name=self.name,
                status="success",
                asset=asset,
                timestamp="",
                score=50.0,
                signal="NEUTRAL",
                confidence=0.5,
                metrics={"articles_analyzed": 0, "average_sentiment": 0.0},
                evidence=["No recent high-impact headlines detected."],
                warnings=[]
            )

        scores = [a["sentiment_score"] for a in articles]
        avg_score = float(np.mean(scores))
        # Normalize -1..+1 to 0..100
        normalized_score = round(((avg_score + 1.0) / 2.0) * 100.0, 1)

        evidence = [
            f"Analyzed {len(articles)} authoritative market articles across leading financial wires.",
            f"Sentiment index registered at {avg_score:+.2f} on a scale of -1.0 to +1.0.",
            f"Lead development: \"{articles[0]['title']}\" (Reported by {articles[0]['source']})"
        ]

        warnings = []
        if avg_score < -0.3:
            warnings.append("Caution: Strong negative sentiment detected in latest news cycle.")

        signal = "POSITIVE" if avg_score > 0.15 else ("NEGATIVE" if avg_score < -0.15 else "NEUTRAL")

        return BaseAgentOutput(
            agent_name=self.name,
            status="success",
            asset=asset,
            timestamp="",
            score=normalized_score,
            signal=signal,
            confidence=0.78,
            metrics={
                "average_sentiment": round(avg_score, 2),
                "articles_count": len(articles),
                "top_source": articles[0]["source"],
                "sentiment_distribution": {
                    "positive": len([s for s in scores if s > 0.1]),
                    "neutral": len([s for s in scores if -0.1 <= s <= 0.1]),
                    "negative": len([s for s in scores if s < -0.1])
                }
            },
            evidence=evidence,
            warnings=warnings
        )

