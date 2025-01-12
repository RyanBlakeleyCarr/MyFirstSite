const marked = require('marked');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configure marked for better output
marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true
});

// Read the blog template
const template = fs.readFileSync('templates/blog-template.html', 'utf-8');

// Function to parse frontmatter and content
function parseMdFile(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;
    
    const [, frontmatter, markdown] = match;
    const metadata = yaml.load(frontmatter);
    return { metadata, markdown };
}

// Function to format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Convert a single markdown file
function convertPost(filename) {
    const mdContent = fs.readFileSync(
        path.join('content/posts', filename), 
        'utf-8'
    );
    
    const parsed = parseMdFile(mdContent);
    if (!parsed) {
        console.error(`Invalid frontmatter in ${filename}`);
        return;
    }

    const { metadata, markdown } = parsed;
    const html = marked(markdown);
    
    let output = template
        .replace('{{title}}', metadata.title)
        .replace('{{date}}', metadata.date)
        .replace('{{dateFormatted}}', formatDate(metadata.date))
        .replace('{{content}}', html);
    
    const htmlFilename = filename.replace('.md', '.html');
    fs.writeFileSync(
        path.join('blog', htmlFilename),
        output
    );
    
    return {
        title: metadata.title,
        date: metadata.date,
        filename: htmlFilename,
        description: metadata.description || ''
    };
}

// Convert all posts and update index
function convertAll() {
    const posts = [];
    const files = fs.readdirSync('content/posts');
    
    for (const file of files) {
        if (file.endsWith('.md')) {
            const post = convertPost(file);
            if (post) posts.push(post);
        }
    }
    
    // Sort posts by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update blog index
    updateBlogIndex(posts);
}

convertAll(); 