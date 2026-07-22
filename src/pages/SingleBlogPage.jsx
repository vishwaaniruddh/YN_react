import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './SingleBlogPage.css';

export default function SingleBlogPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs.php?slug=${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setBlog(data.data);
      } else {
        setError(data.message || 'Blog not found');
      }
    } catch (err) {
      setError('An error occurred while fetching the blog.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="single-blog__loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="single-blog__error">
        <h2>Oops!</h2>
        <p>{error || 'Blog not found'}</p>
        <button onClick={() => navigate('/blogs')} className="btn-primary">Back to Blogs</button>
      </div>
    );
  }

  return (
    <div className="single-blog">
      {/* Banner Image */}
      {blog.banner_image && (
        <div 
          className="single-blog__banner"
          style={{ backgroundImage: `url(${getImageUrl(blog.banner_image)})` }}
        >
          <div className="single-blog__banner-overlay"></div>
        </div>
      )}

      <div className="container-fluid single-blog__container">
        <Link to="/blogs" className="single-blog__back">
          <ChevronLeft size={16} /> Back to all articles
        </Link>

        <header className="single-blog__header">
          <div className="single-blog__meta">
            <Calendar size={16} />
            <span>
              {new Date(blog.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <h1 className="single-blog__title">{blog.title}</h1>
        </header>

        <div className="single-blog__body-grid">
          <div 
            className="single-blog__content"
            dangerouslySetInnerHTML={{ __html: blog.description }}
          />

          <aside className="single-blog__sidebar">
            {/* If no banner, maybe show main image at top of sidebar */}
            {!blog.banner_image && blog.main_image && (
              <div className="single-blog__main-image">
                <img src={getImageUrl(blog.main_image)} alt={blog.title} />
              </div>
            )}

            {/* Image Gallery */}
            {blog.gallery && blog.gallery.length > 0 && (
              <section className="single-blog__gallery-section">
                <h3 className="single-blog__gallery-title">Gallery</h3>
                <div className="single-blog__gallery-grid">
                  {blog.gallery.map((img) => (
                    <div key={img.image_path} className="single-blog__gallery-item">
                      <a href={getImageUrl(img.image_path)} target="_blank" rel="noreferrer">
                        <img src={getImageUrl(img.image_path)} alt="Gallery item" />
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
