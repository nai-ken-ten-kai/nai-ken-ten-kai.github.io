#!/usr/bin/env python3
from PIL import Image
from transformers import Blip2Processor, Blip2ForConditionalGeneration
import torch
import json
import os

# Load BLIP-2 model
processor = Blip2Processor.from_pretrained("Salesforce/blip2-flan-t5-xl")
model = Blip2ForConditionalGeneration.from_pretrained(
    "Salesforce/blip2-flan-t5-xl",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Keyword sets for categorization
def get_location(caption):
    indoor = ["room", "kitchen", "bedroom", "hallway", "bathroom", "indoor", "inside", "corridor", "living", "sofa", "table", "lamp", "ceiling", "wall"]
    outdoor = ["garden", "outdoor", "outside", "yard", "balcony", "street", "park", "sky", "tree", "grass", "field", "mountain"]
    c = caption.lower()
    if any(word in c for word in indoor):
        return "inside"
    if any(word in c for word in outdoor):
        return "outside"
    return "unknown"

def get_elements(caption):
    elements = []
    c = caption.lower()
    if any(word in c for word in ["wall", "painting", "poster", "frame"]):
        elements.append("wall")
    if any(word in c for word in ["ceiling", "lamp", "light fixture"]):
        elements.append("ceiling")
    if any(word in c for word in ["floor", "ground", "rug", "carpet"]):
        elements.append("ground")
    if any(word in c for word in ["air", "window", "open", "sky"]):
        elements.append("air")
    return elements or ["unknown"]

def get_styles(caption):
    styles = []
    c = caption.lower()
    if any(word in c for word in ["quiet", "peaceful", "calm", "minimal", "empty"]):
        styles.append("quiet")
    if any(word in c for word in ["bright", "light", "sunny"]):
        styles.append("bright")
    if any(word in c for word in ["art", "painting", "gallery", "creative"]):
        styles.append("artistic")
    if any(word in c for word in ["social", "gathering", "group"]):
        styles.append("social")
    if any(word in c for word in ["messy", "cluttered"]):
        styles.append("messy")
    return styles or ["neutral"]

def has_hook(caption):
    c = caption.lower()
    return any(word in c for word in ["hook", "hanger", "coat rack", "peg"])  # returns True/False

src = "spaces_new.json" if os.path.exists("spaces_new.json") else "spaces.json"
with open(src, "r") as f:
    spaces = json.load(f)

for space in spaces:
    img_path = space["images"][0]
    if not os.path.exists(img_path):
        print(f"Image not found: {img_path}")
        continue
    image = Image.open(img_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt").to(device)
    generated_ids = model.generate(**inputs, max_new_tokens=30)
    caption = processor.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
    space["description"] = caption
    space["location"] = get_location(caption)
    space["element"] = get_elements(caption)
    space["style"] = get_styles(caption)
    if has_hook(caption):
        space["has_hook"] = True
    else:
        space["has_hook"] = False

with open("spaces_new.json", "w", encoding="utf-8") as f:
    json.dump(spaces, f, ensure_ascii=False, indent=2)
with open("spaces.json", "w", encoding="utf-8") as f:
    json.dump(spaces, f, ensure_ascii=False, indent=2)

print("Descriptions and categories updated in spaces_new.json and spaces.json")
