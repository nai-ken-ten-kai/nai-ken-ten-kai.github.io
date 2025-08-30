import json
import os
from tqdm import tqdm

import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# Load CLIP model and processor
device = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch16").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")

# Space types and activity suitability lists
space_types = [
    "indoor", "outdoor", "warm", "cold", "corridor", "corner", "ceiling", "wall", "floor", "window", "door",
    "entrance", "hallway", "stairway", "alcove", "nook", "balcony", "terrace", "garden", "patio", "attic",
    "basement", "kitchen", "bathroom", "living room", "bedroom", "workspace", "storage", "passage", "threshold"
]
activity_types = [
    "sitting", "hanging", "flying", "lying", "standing", "walking", "resting", "gathering", "working",
    "eating", "sleeping", "reading", "meditating", "playing"
]

def get_best_label(image_path, description, candidates):
    # Try image first, fallback to description if image not found
    inputs = None
    if image_path and os.path.exists(image_path):
        image = Image.open(image_path).convert("RGB")
        inputs = processor(text=candidates, images=image, return_tensors="pt", padding=True)
    else:
        # Text-to-text fallback
        inputs = processor(text=[description] + candidates, return_tensors="pt", padding=True)
        # Use first text as "image" embedding
        inputs["pixel_values"] = torch.zeros((1, 3, 224, 224))  # dummy image

    for k in inputs:
        if isinstance(inputs[k], torch.Tensor):
            inputs[k] = inputs[k].to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image if hasattr(outputs, "logits_per_image") else outputs.logits_per_text
        probs = logits_per_image.softmax(dim=1).cpu().numpy()
    best_idx = probs.argmax()
    return candidates[best_idx]

with open("spaces.json", "r") as f:
    spaces = json.load(f)

for space in tqdm(spaces):
    img_path = space["images"][0] if space["images"] else None
    # Try to find the image file
    if img_path and not os.path.exists(img_path) and os.path.exists(os.path.join("img", os.path.basename(img_path))):
        img_path = os.path.join("img", os.path.basename(img_path))
    desc = space.get("description", "")
    # Assign best space type
    best_type = get_best_label(img_path, desc, space_types)
    # Assign best activity
    best_activity = get_best_label(img_path, desc, activity_types)
    # Add to space
    space["clip_type"] = best_type
    space["clip_activity"] = best_activity

with open("spaces_clip.json", "w") as f:
    json.dump(spaces, f, indent=2, ensure_ascii=False)

print("Done! Output written to spaces_clip.json")