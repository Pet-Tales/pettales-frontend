import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { getAllPosts, formatDate } from '@/utils/blog';

export default function Blog() {
  const posts = getAllPosts();

  return (
    <>
      <Helmet>
        <title>Blog - PetTalesAI</title>
        <meta
          name="description"
          content="Read the latest stories and updates from Pet Tales. Learn how we create personalized children's books featuring your beloved pets."
        />
        <link rel="canonical" href="https://pettalesai.com/blog" />
      </Helmet>

      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Typography variant="h1" color="blue-gray" className="mb-4 text-4xl font-bold">
            Blog
          </Typography>
          <Typography color="gray" className="mb-12 text-lg">
            Stories, updates, and insights from the Pet Tales team
          </Typography>

          <div className="space-y-8">
            {posts.length === 0 ? (
              <Card>
                <CardBody>
                  <Typography color="gray">
                    No blog posts available yet. Check back soon!
                  </Typography>
                </CardBody>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.slug} className="hover:shadow-lg transition-shadow">
                  <CardBody>
                    <Link to={`/blog/${post.slug}`}>
                      <Typography variant="h3" color="blue-gray" className="mb-2 hover:text-blue-500 transition-colors">
                        {post.title}
                      </Typography>
                    </Link>
                    <Typography color="gray" className="mb-3 text-sm">
                      {formatDate(post.date)}
                    </Typography>
                    {post.description && (
                      <Typography color="gray" className="mb-4">
                        {post.description}
                      </Typography>
                    )}
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Read more →
                    </Link>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
