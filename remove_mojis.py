import os
import re
import shutil
from datetime import datetime

# Define the directory to scan
dir_path = r'C:\Users\david\OneDrive\Documentos\02_Python Scripts\Deal-Fi\escrow-dapp'

# Define common programming file extensions
extensions = (
    '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.htm', '.css', '.scss', '.less',
    '.json', '.yaml', '.yml', '.xml', '.md', '.rst', '.txt', '.sol', '.java', '.kt',
    '.cpp', '.c', '.h', '.cs', '.go', '.rs', '.php', '.rb', '.sh', '.bat'
)

# Same emoji pattern from find_mojis.py
emoji_pattern = r'[\U0001F600-\U0001F64F]|[\U0001F300-\U0001F5FF]|[\U0001F680-\U0001F6FF]|[\U0001F1E0-\U0001F1FF]|[\U00002600-\U000026FF]|[\U00002700-\U000027BF]'

# Create backup directory
backup_dir = os.path.join(os.path.dirname(dir_path), f'backup_before_emoji_removal_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
os.makedirs(backup_dir, exist_ok=True)

print(f"Backup directory created: {backup_dir}")
print("Starting emoji removal process...\n")

files_processed = 0
emojis_removed = 0

# Walk through the directory recursively
for root, dirs, files in os.walk(dir_path):
    for file in files:
        if file.lower().endswith(extensions):
            full_path = os.path.join(root, file)
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    original_content = f.read()
                
                # Find emojis in the file
                emojis_found = re.findall(emoji_pattern, original_content)
                
                if emojis_found:
                    # Create backup
                    relative_path = os.path.relpath(full_path, dir_path)
                    backup_path = os.path.join(backup_dir, relative_path)
                    backup_dir_path = os.path.dirname(backup_path)
                    os.makedirs(backup_dir_path, exist_ok=True)
                    shutil.copy2(full_path, backup_path)
                    
                    # Remove emojis
                    cleaned_content = re.sub(emoji_pattern, '', original_content)
                    
                    # Write cleaned content back to file
                    with open(full_path, 'w', encoding='utf-8') as f:
                        f.write(cleaned_content)
                    
                    files_processed += 1
                    emojis_removed += len(emojis_found)
                    print(f"✅ Processed: {relative_path}")
                    print(f"   Removed {len(emojis_found)} emojis: {', '.join(set(emojis_found))}")
                    print()
                    
            except (UnicodeDecodeError, IOError) as e:
                print(f"❌ Error processing {full_path}: {e}")

print(f"\n🎯 Summary:")
print(f"   Files processed: {files_processed}")
print(f"   Total emojis removed: {emojis_removed}")
print(f"   Backup location: {backup_dir}")
print("\n✅ Emoji removal completed!")
print("💡 You can restore files from backup if needed.")