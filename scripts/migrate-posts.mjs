import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const sourceDir = '../_posts';
const destDir = './content/posts';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.md'));

files.forEach(file => {
  const fullPath = path.join(sourceDir, file);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Convert filename to slug (YYYY-MM-DD-slug.md -> slug.mdx)
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');
  const destPath = path.join(destDir, `${slug}.mdx`);

  // Transform data
  const newData = {
    title: data.title,
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
    description: data.description || '',
    tags: data.tags || (data.tag ? [data.tag] : []),
    coverImage: data['cover-image'] ? `/images/posts/cover/${data['cover-image']}` : null,
    author: data.author || 'Anas',
  };

  // Clean up content: replace Jekyll site.baseurl with /
  let newContent = content.replace(/\{\{\s*site\.baseurl\s*\}\}\//g, '/');
  newContent = newContent.replace(/\{\{\s*site\.baseurl\s*\}\}/g, '/');

  // Fix unclosed HTML tags for MDX
  newContent = newContent.replace(/<img([^>]+)(?<!\/)>/g, '<img$1 />');
  newContent = newContent.replace(/<br>/g, '<br />');

  // Convert galleries
  const galleryRegex = /<div class="slide-gallery-marquee-container">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  newContent = newContent.replace(galleryRegex, (match, imagesHtml) => {
    const imgRegex = /src="([^"]+)"/g;
    const images = [];
    let imgMatch;
    while ((imgMatch = imgRegex.exec(imagesHtml)) !== null) {
      images.push(imgMatch[1].replace('/assets/images/', '/images/'));
    }
    const uniqueImages = [...new Set(images)];
    return `<ImageGallery images={[${uniqueImages.map(i => `'${i}'`).join(', ')}]} />`;
  });

  const mdxContent = matter.stringify(newContent, newData);
  fs.writeFileSync(destPath, mdxContent);
  console.log(`Migrated: ${file} -> ${slug}.mdx`);
});
