from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc
from app import db
from app.models import User, Blog, Comment
from app.utils import slugify

bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin role."""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin():
            flash('Admin access required.', 'danger')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/')
@login_required
@admin_required
def panel():
    # Get stats
    total_users = User.query.count()
    total_blogs = Blog.query.count()
    total_comments = Comment.query.count()
    
    # Recent activity
    recent_blogs = Blog.query.order_by(desc(Blog.created_at)).limit(10).all()
    recent_users = User.query.order_by(desc(User.created_at)).limit(10).all()
    
    return render_template('admin/panel.html',
                         total_users=total_users,
                         total_blogs=total_blogs,
                         total_comments=total_comments,
                         recent_blogs=recent_blogs,
                         recent_users=recent_users)

@bp.route('/users')
@login_required
@admin_required
def manage_users():
    page = request.args.get('page', 1, type=int)
    users = User.query.order_by(desc(User.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    return render_template('admin/users.html', users=users)

@bp.route('/update-role/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def update_role(user_id):
    user = User.query.get_or_404(user_id)
    new_role = request.form.get('role')
    
    if new_role in ['reader', 'writer', 'admin']:
        user.role = new_role
        db.session.commit()
        flash(f'Role updated to {new_role}.', 'success')
    
    return redirect(url_for('admin.manage_users'))

@bp.route('/delete-user/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def delete_user(user_id):
    if user_id == current_user.id:
        flash('Cannot delete your own account.', 'danger')
        return redirect(url_for('admin.manage_users'))
    
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    flash('User deleted successfully.', 'success')
    return redirect(url_for('admin.manage_users'))

@bp.route('/blogs')
@login_required
@admin_required
def manage_blogs():
    page = request.args.get('page', 1, type=int)
    status = request.args.get('status', 'all')
    
    query = Blog.query
    
    if status != 'all':
        query = query.filter_by(status=status)
    
    blogs = query.order_by(desc(Blog.created_at)).paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('admin/blogs.html', blogs=blogs, status=status)

@bp.route('/feature-blog/<int:blog_id>', methods=['POST'])
@login_required
@admin_required
def feature_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    blog.featured = not blog.featured
    db.session.commit()
    
    status = 'featured' if blog.featured else 'unfeatured'
    flash(f'Blog {status} successfully.', 'success')
    return redirect(url_for('admin.manage_blogs'))

@bp.route('/delete-any-blog/<int:blog_id>', methods=['POST'])
@login_required
@admin_required
def delete_any_blog(blog_id):
    blog = Blog.query.get_or_404(blog_id)
    db.session.delete(blog)
    db.session.commit()
    flash('Blog deleted successfully.', 'success')
    return redirect(url_for('admin.manage_blogs'))