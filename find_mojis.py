import os
import re

# Define the directory to scan
dir_path = r'C:\Users\david\OneDrive\Documentos\02_Python Scripts\Deal-Fi\escrow-dapp'

# Define common programming file extensions
extensions = (
    '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.htm', '.css', '.scss', '.less',
    '.json', '.yaml', '.yml', '.xml', '.md', '.rst', '.txt', '.sol', '.java', '.kt',
    '.cpp', '.c', '.h', '.cs', '.go', '.rs', '.php', '.rb', '.sh', '.bat'
)

# Simplified emoji regex pattern - covers most common emojis
emoji_pattern = r'[\U0001F600-\U0001F64F]|[\U0001F300-\U0001F5FF]|[\U0001F680-\U0001F6FF]|[\U0001F1E0-\U0001F1FF]|[\U00002600-\U000026FF]|[\U00002700-\U000027BF]'

# Dictionary to store found emojis per file
found_emojis = {}

# Walk through the directory recursively
for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.lower().endswith(extensions):
            full_path = os.path.join(root, file)
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                emojis = re.findall(emoji_pattern, content)
                if emojis:
                    found_emojis[full_path] = set(emojis)  # Unique emojis per file
            except (UnicodeDecodeError, IOError):
                pass  # Skip files that can't be read as UTF-8 or other IO errors

# Output the results
if found_emojis:
    for path, emjs in found_emojis.items():
        print(f"In {path}: {', '.join(emjs)}")
    
    # All unique emojis across all files
    all_unique = set()
    for emjs in found_emojis.values():
        all_unique.update(emjs)
    print("\nAll unique emojis found:")
    print(', '.join(all_unique))
else:
    print("No emojis found in any programming files.")