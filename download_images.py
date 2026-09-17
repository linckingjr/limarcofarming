import os
import urllib.request

root = r"C:\Users\Admin\Desktop\limarco-website"
pics_dir = os.path.join(root, "pictures")
os.makedirs(pics_dir, exist_ok=True)

urls = {
    "farm-water-trough.jpg": "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    "farm-livestock.jpg": "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=1200&q=80",
    "farm-feed.jpg": "https://images.unsplash.com/photo-1464226184884-fa52ac9a06a7?auto=format&fit=crop&w=1200&q=80",
    "farm-seeds.jpg": "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=1200&q=80",
    "farm-field.jpg": "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
    "farm-community.jpg": "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80",
}

for name, url in urls.items():
    path = os.path.join(pics_dir, name)
    urllib.request.urlretrieve(url, path)
    print(f"DOWNLOADED {name}")

print(f"TOTAL {len(urls)} images saved to {pics_dir}")
