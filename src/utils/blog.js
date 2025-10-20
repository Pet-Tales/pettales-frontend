import matter from 'gray-matter';

const blogPosts = import.meta.glob('@/content/blog/*.md', {
  as: 'raw',
  eager: true,
});

export function getAllPosts() {
  const posts = Object.entries(blogPosts).map(([filepath, content]) => {
    const { data, content: body } = matter(content);
    const filename = filepath.split('/').pop();
    const slug = data.slug || filename.replace('.md', '');
    
    return {
      slug,
      title: data.title || 'Untitled',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      body,
      ...data,
    };
  });

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug) || null;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
