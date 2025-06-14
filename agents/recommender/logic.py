# agents/recommender/logic.py

def suggest_topics(progress_logs: list) -> dict:
    """
    Recommend review or enrichment topics based on past performance.
    """
    review = []
    enrich = []

    for entry in progress_logs:
        topic = entry["topic"]
        score = entry["score"]
        
        if score < 0.7:
            review.append(topic)
        elif score > 0.9:
            enrich.append(topic)

    return {
        "review_topics": list(set(review)),
        "enrichment_topics": list(set(enrich))
    }
