import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Card, CardBody, Typography, Button } from '@material-tailwind/react';
import { getPostBySlug, formatDate } from '@/utils/blog';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const htmlContent = DOMPurify.sanitize(marked.parse(post.body));
  const postUrl = `https://pettalesai.com/blog/${post.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description || post.title,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'PetTalesAI',
    },
    publisher: {
      '@type': 'Organization',
      name: 'PetTalesAI',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  return (
    <>
      <Helmet>
        <title>{post.title} - PetTalesAI Blog</title>
        <meta name="description" content={post.description || post.title} />
        <link rel="canonical" href={postUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog">
            <Button variant="text" className="mb-6">
              ← Back to Blog
            </Button>
          </Link>

          <Card>
            <CardBody className="p-8">
              <Typography variant="h1" color="blue-gray" className="mb-4 text-4xl font-bold">
                {post.title}
              </Typography>

              <Typography color="gray" className="mb-6 text-sm">
                {formatDate(post.date)}
              </Typography>

              {post.description && (
                <Typography color="gray" className="mb-8 text-lg font-medium">
                  {post.description}
                </Typography>
              )}

              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.75',
                  color: '#374151',
                }}
              />

              <style>{`
                .blog-content h1 {
                  font-size: 2rem;
                  font-weight: bold;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  color: #111827;
                }
                .blog-content h2 {
                  font-size: 1.5rem;
                  font-weight: bold;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  color: #1f2937;
                }
                .blog-content h3 {
                  font-size: 1.25rem;
                  font-weight: 600;
                  margin-top: 1.25rem;
                  margin-bottom: 0.5rem;
                  color: #374151;
                }
                .blog-content p {
                  margin-bottom: 1rem;
                }
                .blog-content ul, .blog-content ol {
                  margin-left: 1.5rem;
                  margin-bottom: 1rem;
                }
                .blog-content li {
                  margin-bottom: 0.5rem;
                }
                .blog-content strong {
                  font-weight: 600;
                }
                .blog-content a {
                  color: #2563eb;
                  text-decoration: underline;
                }
              `}</style>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
