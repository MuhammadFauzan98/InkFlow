// Rich text editor functionality
class RichTextEditor {
    constructor(textareaId, toolbarId) {
        this.textarea = document.getElementById(textareaId);
        this.toolbar = document.getElementById(toolbarId);
        this.init();
    }
    
    init() {
        if (!this.toolbar) return;
        
        // Add toolbar button event listeners
        this.toolbar.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                this.executeCommand(command);
            });
        });
        
        // Handle keyboard shortcuts
        this.textarea.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + B for bold
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.executeCommand('bold');
            }
            // Ctrl/Cmd + I for italic
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.executeCommand('italic');
            }
            // Ctrl/Cmd + K for link
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.executeCommand('link');
            }
            // Ctrl/Cmd + H for heading
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.executeCommand('heading');
            }
            // Ctrl/Cmd + Q for quote
            if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
                e.preventDefault();
                this.executeCommand('quote');
            }
        });
        
        // Auto formatting
        this.textarea.addEventListener('input', (e) => {
            this.autoFormat(e);
        });
    }
    
    executeCommand(command) {
        const textarea = this.textarea;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let newText = '';
        let cursorOffset = 0;
        
        switch(command) {
            case 'bold':
                if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
                    newText = selectedText.substring(2, selectedText.length - 2);
                    cursorOffset = -4;
                } else {
                    newText = `**${selectedText}**`;
                    cursorOffset = selectedText ? 0 : 2;
                }
                break;
                
            case 'italic':
                if (selectedText.startsWith('*') && selectedText.endsWith('*')) {
                    newText = selectedText.substring(1, selectedText.length - 1);
                    cursorOffset = -2;
                } else {
                    newText = `*${selectedText}*`;
                    cursorOffset = selectedText ? 0 : 1;
                }
                break;
                
            case 'heading':
                const lines = selectedText.split('\n');
                const formattedLines = lines.map(line => {
                    if (line.startsWith('# ')) {
                        return line.substring(2);
                    } else {
                        return `# ${line}`;
                    }
                });
                newText = formattedLines.join('\n');
                break;
                
            case 'quote':
                const quoteLines = selectedText.split('\n');
                const quoteFormatted = quoteLines.map(line => {
                    if (line.startsWith('> ')) {
                        return line.substring(2);
                    } else {
                        return `> ${line}`;
                    }
                });
                newText = quoteFormatted.join('\n');
                break;
                
            case 'code':
                if (selectedText.includes('\n')) {
                    // Multi-line code block
                    newText = '```\n' + selectedText + '\n```\n';
                    cursorOffset = selectedText ? 0 : 4;
                } else {
                    // Inline code
                    if (selectedText.startsWith('`') && selectedText.endsWith('`')) {
                        newText = selectedText.substring(1, selectedText.length - 1);
                        cursorOffset = -2;
                    } else {
                        newText = `\`${selectedText}\``;
                        cursorOffset = selectedText ? 0 : 1;
                    }
                }
                break;
                
            case 'link':
                const url = prompt('Enter URL:', 'https://');
                if (url) {
                    const linkText = prompt('Enter link text:', selectedText || url);
                    newText = `[${linkText}](${url})`;
                    cursorOffset = selectedText ? 0 : linkText.length + 2;
                } else {
                    return;
                }
                break;
                
            case 'image':
                const imageUrl = prompt('Enter image URL:', 'https://');
                if (imageUrl) {
                    const altText = prompt('Enter alt text:', selectedText || '');
                    newText = `![${altText}](${imageUrl})`;
                    cursorOffset = selectedText ? 0 : altText.length + 2;
                } else {
                    return;
                }
                break;
                
            case 'ul':
                const ulLines = selectedText.split('\n');
                const ulFormatted = ulLines.map(line => {
                    if (line.startsWith('- ')) {
                        return line.substring(2);
                    } else if (line.trim()) {
                        return `- ${line}`;
                    }
                    return line;
                });
                newText = ulFormatted.join('\n');
                break;
                
            case 'ol':
                const olLines = selectedText.split('\n');
                const olFormatted = olLines.map((line, index) => {
                    if (/^\d+\.\s/.test(line)) {
                        return line.replace(/^\d+\.\s/, '');
                    } else if (line.trim()) {
                        return `${index + 1}. ${line}`;
                    }
                    return line;
                });
                newText = olFormatted.join('\n');
                break;
        }
        
        // Replace selected text
        textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        
        // Set cursor position after inserted text
        const newCursorPos = start + newText.length + cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        
        // Trigger input event for auto-save
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    autoFormat(e) {
        const textarea = e.target;
        const value = textarea.value;
        const cursorPos = textarea.selectionStart;
        
        // Auto-complete markdown pairs
        const pairs = {
            '**': '**',
            '*': '*',
            '`': '`',
            '```': '```',
            '(': ')',
            '[': ']',
            '{': '}'
        };
        
        for (const [open, close] of Object.entries(pairs)) {
            if (value.substring(cursorPos - open.length, cursorPos) === open) {
                setTimeout(() => {
                    const currentValue = textarea.value;
                    const newValue = currentValue.substring(0, cursorPos) + close + currentValue.substring(cursorPos);
                    textarea.value = newValue;
                    textarea.setSelectionRange(cursorPos, cursorPos);
                }, 0);
                break;
            }
        }
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize rich text editor
    const textarea = document.getElementById('content');
    const toolbar = document.getElementById('toolbar');
    
    if (textarea && toolbar) {
        window.editor = new RichTextEditor('content', 'toolbar');
    }
    
    // Auto-resize textareas
    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }
    
    document.getElementById('content')?.addEventListener('input', function() {
        autoResize(this);
        updateWordCount();
    });
    
    document.getElementById('title')?.addEventListener('input', function() {
        autoResize(this);
        updateWordCount();
    });
    
    // Initial resize
    setTimeout(() => {
        autoResize(document.getElementById('content') || { style: {} });
        autoResize(document.getElementById('title') || { style: {} });
    }, 100);
    
    // Word count and reading time
    function updateWordCount() {
        const content = document.getElementById('content')?.value || '';
        const title = document.getElementById('title')?.value || '';
        
        const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
        const titleWords = title.trim().split(/\s+/).filter(word => word.length > 0).length;
        const totalWords = words + titleWords;
        
        const minutes = Math.ceil(totalWords / 200);
        
        // Update UI elements
        const wordCountEl = document.getElementById('wordCount');
        const readingTimeEl = document.getElementById('readingTime');
        
        if (wordCountEl) {
            wordCountEl.textContent = `${totalWords} words`;
        }
        
        if (readingTimeEl) {
            readingTimeEl.textContent = `${minutes} min read`;
        }
    }
    
    // Initial count
    updateWordCount();
    
    // Image upload handling
    const imageUpload = document.getElementById('coverImage');
    const uploadBtn = document.getElementById('uploadImage');
    
    if (uploadBtn && imageUpload) {
        uploadBtn.addEventListener('click', async () => {
            const file = imageUpload.files[0];
            if (!file) {
                alert('Please select an image first.');
                return;
            }
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, GIF, WebP).');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB.');
                return;
            }
            
            // Create FormData
            const formData = new FormData();
            formData.append('image', file);
            
            // Show loading state
            const originalText = uploadBtn.innerHTML;
            uploadBtn.innerHTML = '<span class="loading"></span> Uploading...';
            uploadBtn.disabled = true;
            
            try {
                // Upload image
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Update hidden input with filename
                    document.getElementById('coverImagePath').value = data.filename;
                    
                    // Show preview
                    const previewArea = uploadBtn.closest('.image-upload').nextElementSibling;
                    if (previewArea && previewArea.classList.contains('current-image')) {
                        previewArea.innerHTML = `
                            <img src="/static/uploads/${data.filename}" alt="Preview">
                        `;
                    } else {
                        const previewDiv = document.createElement('div');
                        previewDiv.className = 'current-image';
                        previewDiv.innerHTML = `
                            <img src="/static/uploads/${data.filename}" alt="Preview">
                        `;
                        uploadBtn.closest('.sidebar-section').appendChild(previewDiv);
                    }
                    
                    showToast('Image uploaded successfully!', 'success');
                } else {
                    throw new Error(data.error || 'Upload failed');
                }
            } catch (error) {
                console.error('Upload error:', error);
                showToast('Failed to upload image', 'error');
            } finally {
                // Reset button
                uploadBtn.innerHTML = originalText;
                uploadBtn.disabled = false;
            }
        });
    }
    
    // Tags input enhancement
    const tagsInput = document.getElementById('tags');
    if (tagsInput) {
        // Auto-format tags on blur
        tagsInput.addEventListener('blur', function() {
            const tags = this.value.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
                .map(tag => tag.toLowerCase())
                .join(', ');
            this.value = tags;
        });
        
        // Add tag suggestions
        const commonTags = ['technology', 'programming', 'web development', 'python', 
                          'javascript', 'design', 'productivity', 'startup', 'ai',
                          'writing', 'blogging', 'tutorial', 'how-to', 'opinion'];
        
        tagsInput.addEventListener('focus', function() {
            const suggestions = document.getElementById('tag-suggestions');
            if (!suggestions) {
                const suggestionDiv = document.createElement('div');
                suggestionDiv.id = 'tag-suggestions';
                suggestionDiv.className = 'tag-suggestions';
                suggestionDiv.innerHTML = `
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        <strong>Common tags:</strong>
                        <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px;">
                            ${commonTags.map(tag => 
                                `<span class="tag-suggestion" style="cursor: pointer; padding: 2px 6px; background: var(--surface-color); border-radius: 4px;">${tag}</span>`
                            ).join('')}
                        </div>
                    </div>
                `;
                this.parentNode.appendChild(suggestionDiv);
                
                // Add click handlers to suggestions
                suggestionDiv.querySelectorAll('.tag-suggestion').forEach(tag => {
                    tag.addEventListener('click', () => {
                        const currentTags = this.value.split(',').map(t => t.trim()).filter(t => t);
                        if (!currentTags.includes(tag.textContent)) {
                            if (this.value.trim()) {
                                this.value += ', ' + tag.textContent;
                            } else {
                                this.value = tag.textContent;
                            }
                        }
                    });
                });
            }
        });
        
        tagsInput.addEventListener('blur', function() {
            setTimeout(() => {
                const suggestions = document.getElementById('tag-suggestions');
                if (suggestions) {
                    suggestions.remove();
                }
            }, 200);
        });
    }
    
    // Preview functionality
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', generatePreview);
    }
    
    // Save draft button
    const saveDraftBtn = document.getElementById('saveDraft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            document.getElementById('status').value = 'draft';
            document.getElementById('blogForm').submit();
        });
    }
    
    // Publish button
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', function() {
            document.getElementById('status').value = 'published';
            document.getElementById('blogForm').submit();
        });
    }
});

// Generate preview function
function generatePreview() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const tags = document.getElementById('tags').value;
    
    if (!title && !content) {
        showToast('Please add some content to preview.', 'warning');
        return;
    }
    
    // Simple markdown to HTML conversion
    const htmlContent = content
        .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```[\s\S]*?```/g, (match) => {
            const code = match.replace(/```/g, '');
            return `<pre><code>${code}</code></pre>`;
        })
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Preview: ${title || 'Untitled'}</title>
            <style>
                body {
                    font-family: 'Merriweather', Georgia, serif;
                    line-height: 1.8;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    color: #242424;
                    background-color: #ffffff;
                }
                h1 { font-size: 2.5rem; margin: 2rem 0 1rem; }
                h2 { font-size: 2rem; margin: 1.8rem 0 0.9rem; }
                h3 { font-size: 1.5rem; margin: 1.6rem 0 0.8rem; }
                h4 { font-size: 1.25rem; margin: 1.4rem 0 0.7rem; }
                h5 { font-size: 1.1rem; margin: 1.2rem 0 0.6rem; }
                p { margin: 1.5rem 0; }
                code {
                    background-color: #f8f9fa;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.9em;
                }
                pre {
                    background-color: #f8f9fa;
                    padding: 1rem;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 1.5rem 0;
                    border-left: 4px solid #1a8917;
                }
                pre code {
                    background: none;
                    padding: 0;
                }
                blockquote {
                    border-left: 4px solid #1a8917;
                    padding-left: 1.5rem;
                    margin: 1.5rem 0;
                    color: #666;
                    font-style: italic;
                }
                img { 
                    max-width: 100%; 
                    height: auto;
                    border-radius: 8px;
                    margin: 1.5rem 0;
                }
                a {
                    color: #1a8917;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                ul, ol {
                    padding-left: 2rem;
                    margin: 1.5rem 0;
                }
                li {
                    margin: 0.5rem 0;
                }
                .tags { 
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e6e6e6;
                }
                .tag {
                    display: inline-block;
                    background-color: #f1f3f4;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 0.9rem;
                    margin-right: 8px;
                    margin-bottom: 8px;
                    color: #666;
                }
                .preview-header {
                    text-align: center;
                    margin-bottom: 3rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid #e6e6e6;
                }
                .preview-title {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
            </style>
        </head>
        <body>
            <div class="preview-header">
                <h1 class="preview-title">${title || 'Untitled'}</h1>
            </div>
            
            <article>
                ${htmlContent ? `<div class="preview-content">${htmlContent}</div>` : ''}
                
                ${tags ? `
                <div class="tags">
                    ${tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
                </div>
                ` : ''}
            </article>
        </body>
        </html>
    `);
    previewWindow.document.close();
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();
    
    // Create toast container
    const container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
    `;
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background-color: ${type === 'success' ? '#d4edda' : 
                         type === 'error' ? '#f8d7da' : 
                         type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : 
               type === 'error' ? '#721c24' : 
               type === 'warning' ? '#856404' : '#0c5460'};
        padding: 12px 20px;
        border-radius: 4px;
        margin-bottom: 10px;
        animation: slideIn 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 300px;
        border: 1px solid ${type === 'success' ? '#c3e6cb' : 
                         type === 'error' ? '#f5c6cb' : 
                         type === 'warning' ? '#ffeaa7' : '#bee5eb'};
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:14px;margin-left:10px;">Close</button>
    `;
    
    container.appendChild(toast);
    document.body.appendChild(container);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.remove();
            }
        }, 300);
    }, 3000);
}

// Add CSS for animations
if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .toast {
            transition: opacity 0.3s, transform 0.3s;
        }
        
        .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}