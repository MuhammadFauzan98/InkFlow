from flask import Blueprint, request, jsonify, url_for, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
from app import db
from app.models import Blog, Like, Bookmark, Comment
from app.utils import is_allowed_file, avatar_static_path
from datetime import datetime, timezone

bp = Blueprint('api', __name__)

@bp.route('/like/<int:blog_id>', methods=['POST'])
@login_required
def like_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    
    # Check if already liked
    existing_like = Like.query.filter_by(
        blog_id=blog_id,
        user_id=current_user.id
    ).first()
    
    if existing_like:
        db.session.delete(existing_like)
        liked = False
    else:
        like = Like(blog_id=blog_id, user_id=current_user.id)
        db.session.add(like)
        liked = True
    
    db.session.commit()
    
    # Get updated like count
    like_count = Like.query.filter_by(blog_id=blog_id).count()
    
    return jsonify({
        'success': True,
        'liked': liked,
        'like_count': like_count
    })

@bp.route('/bookmark/<int:blog_id>', methods=['POST'])
@login_required
def bookmark_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    
    # Check if already bookmarked
    existing_bookmark = Bookmark.query.filter_by(
        blog_id=blog_id,
        user_id=current_user.id
    ).first()
    
    if existing_bookmark:
        db.session.delete(existing_bookmark)
        bookmarked = False
    else:
        bookmark = Bookmark(blog_id=blog_id, user_id=current_user.id)
        db.session.add(bookmark)
        bookmarked = True
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'bookmarked': bookmarked
    })

@bp.route('/comment/<int:blog_id>', methods=['POST'])
@login_required
def add_comment(blog_id):
    content = request.json.get('content', '').strip()
    
    if not content:
        return jsonify({'success': False, 'error': 'Comment content required'}), 400
    
    comment = Comment(
        content=content,
        blog_id=blog_id,
        user_id=current_user.id
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'comment': {
            'id': comment.id,
            'content': comment.content,
            'created_at': comment.created_at.isoformat(),
            'user': {
                'username': current_user.username,
                'avatar': current_user.avatar,
                'avatar_url': url_for('static', filename=avatar_static_path(current_user))
            }
        }
    })

@bp.route('/comments/<int:blog_id>')
def get_comments(blog_id):
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    comments = Comment.query.filter_by(blog_id=blog_id)\
        .order_by(Comment.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    comments_data = []
    for comment in comments.items:
        comments_data.append({
            'id': comment.id,
            'content': comment.content,
            'created_at': comment.created_at.isoformat(),
            'user': {
                'username': comment.user.username,
                'avatar': comment.user.avatar,
                'avatar_url': url_for('static', filename=avatar_static_path(comment.user))
            }
        })
    
    return jsonify({
        'success': True,
        'comments': comments_data,
        'has_next': comments.has_next,
        'total': comments.total
    })

@bp.route('/upload', methods=['POST'])
@login_required
def upload_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    if file and is_allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{current_user.id}_{int(datetime.now().timestamp())}_{filename}"
        
        # Save file
        file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename))
        
        return jsonify({
            'success': True,
            'filename': unique_filename,
            'url': url_for('static', filename=f'uploads/{unique_filename}')
        })
    
    return jsonify({'success': False, 'error': 'Invalid file type'}), 400

@bp.route('/update-avatar', methods=['POST'])
@login_required
def update_avatar():
    if 'avatar' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['avatar']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No file selected'}), 400
    
    if file and is_allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"avatar_{current_user.id}_{int(datetime.now().timestamp())}_{filename}"
        
        # Save file
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Update user avatar
        current_user.avatar = unique_filename
        db.session.commit()
        
        return jsonify({
            'success': True,
            'avatar_url': url_for('static', filename=f'uploads/{unique_filename}')
        })
    
    return jsonify({'success': False, 'error': 'Invalid file type'}), 400

@bp.route('/update-bio', methods=['POST'])
@login_required
def update_bio():
    data = request.get_json()
    bio = data.get('bio', '').strip()
    
    current_user.bio = bio
    db.session.commit()
    
    return jsonify({'success': True})

@bp.route('/autosave', methods=['POST'])
@login_required
def autosave():
    # All authenticated users can autosave drafts
    
    blog_id = request.json.get('blog_id')
    title = request.json.get('title', '').strip()
    content = request.json.get('content', '').strip()
    
    if blog_id:
        blog = Blog.query.filter_by(
            id=blog_id,
            author_id=current_user.id
        ).first()
        
        if blog:
            blog.title = title or blog.title
            blog.content = content or blog.content
            blog.updated_at = datetime.now(timezone.utc)
            message = 'Draft auto-saved.'
        else:
            return jsonify({'success': False, 'error': 'Blog not found'}), 404
    else:
        if not title and not content:
            return jsonify({'success': True, 'message': 'Nothing to save'})
        
        slug = slugify(title) if title else 'draft-' + str(int(datetime.now().timestamp()))
        blog = Blog(
            title=title or 'Untitled',
            slug=slug,
            content=content,
            author_id=current_user.id,
            status='draft'
        )
        db.session.add(blog)
        message = 'New draft created.'
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': message,
        'blog_id': blog.id
    })
    