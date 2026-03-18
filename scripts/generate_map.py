import os
import json
import sqlite3
import pandas as pd
import numpy as np
from openai import OpenAI
from sklearn.manifold import TSNE
from typing import List, Dict

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Termen die we willen mappen
TERMS = [
    "embodied knowledge", "tacit knowledge", "phenomenology", "Maurice Merleau-Ponty",
    "kinesthetic sense", "proprioception", "haptic feedback", "situated cognition",
    "sensory experience", "muscle memory", "physical intuition", "the lived body",
    "artificial intelligence", "machine learning", "neural networks", "large language models",
    "symbolic AI", "computation", "algorithm", "data processing", "silicon chips",
    "digital abstraction", "mathematical logic", "formal systems", "optimization",
    "robotics", "soft robotics", "bio-inspired AI", "human-computer interaction",
    "affective computing", "intelligence", "consciousness", "agency", "creativity",
    "intuition", "skill acquisition", "craftsmanship", "artistry", "digital twin",
    "simulation", "virtual reality", "augmented reality", "cybernetics", "feedback loops"
]

def get_embeddings(texts: List[str]) -> np.ndarray:
    response = client.embeddings.create(
        input=texts,
        model="text-embedding-3-small"
    )
    return np.array([data.embedding for data in response.data])

def generate_map_data():
    print(f"Generating embeddings for {len(TERMS)} terms...")
    embeddings = get_embeddings(TERMS)
    
    # Gebruik t-SNE voor 2D projectie (UMAP is vaak beter maar t-SNE is standaard in sklearn)
    # Perplexity laag houden voor kleine dataset
    tsne = TSNE(n_components=2, perplexity=10, random_state=42, init='pca', learning_rate='auto')
    coords_2d = tsne.fit_transform(embeddings)
    
    # Normaliseer naar 0-100 range voor makkelijke visualisatie
    x_min, x_max = coords_2d[:, 0].min(), coords_2d[:, 0].max()
    y_min, y_max = coords_2d[:, 1].min(), coords_2d[:, 1].max()
    
    data = []
    for i, term in enumerate(TERMS):
        data.append({
            "id": i,
            "term": term,
            "x": float((coords_2d[i, 0] - x_min) / (x_max - x_min) * 100),
            "y": float((coords_2d[i, 1] - y_min) / (y_max - y_min) * 100),
            "category": "embodied" if i < 12 else ("ai" if i < 25 else "bridge")
        })
    
    output_path = "/home/openclaw/repos/tuhtf/src/data.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Map data saved to {output_path}")

if __name__ == "__main__":
    generate_map_data()
