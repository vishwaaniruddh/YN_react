import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './BlogsPage.css';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs.php`);
      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.data);
      } else {
        setError(data.message || 'Failed to fetch blogs');
      }
    } catch (err) {
      setError('An error occurred while fetching blogs. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="blogs-page__loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blogs-page__error">
        <p>{error}</p>
        <button onClick={fetchBlogs} className="btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <div className="blogs-page__header">
        <div className="container">
          <BookOpen size={48} className="blogs-page__icon" />
          <h1>Our Journal</h1>
          <p>Stories, styling tips, and the latest from YosshitaNeha Fashion Studio.</p>
        </div>
      </div>
      
      <div className="container">
        {blogs.length === 0 ? (
          <div className="blogs-page__empty">
            <h2>No stories published yet.</h2>
            <p>Check back later for new articles!</p>
          </div>
        ) : (
          <div className="blogs-grid">
            {blogs.map(blog => (
              <article key={blog.id} className="blog-card">
                <Link to={`/blog/${blog.slug}`} className="blog-card__image-link">
                  {blog.main_image ? (
                    <img 
                      src={getImageUrl(blog.main_image)} 
                      alt={blog.title} 
                      className="blog-card__image"
                    />
                  ) : (
                    <div className="blog-card__no-image">
                      <BookOpen size={48} />
                    </div>
                  )}
                </Link>
                
                <div className="blog-card__content">
                  <div className="blog-card__meta">
                    <Calendar size={14} />
                    <span>
                      {new Date(blog.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <h2 className="blog-card__title">
                    <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h2>
                  
                  <p className="blog-card__excerpt">{blog.excerpt}</p>
                  
                  <Link to={`/blog/${blog.slug}`} className="blog-card__read-more">
                    Read Article <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
