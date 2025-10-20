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
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
