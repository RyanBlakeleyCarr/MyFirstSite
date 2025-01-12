const { marked } = require('marked');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configure marked for better output
marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true
});

// Ensure dist directories exist
function ensureDistDirs() {
    const dirs = ['dist', 'dist/blog', 'dist/css'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// Copy static assets
function copyStaticAssets() {
    // Copy CSS with correct path
    fs.copyFileSync('src/styles.css', 'dist/styles.css');
    // Copy JavaScript
    fs.copyFileSync('src/script.js', 'dist/script.js');
    // Copy all HTML files from src
    copyDir('src', 'dist', ['.html']);
}

// Helper function to copy directory contents
function copyDir(src, dest, extensions) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            if (entry.name !== 'content' && entry.name !== 'templates') {
                copyDir(srcPath, destPath, extensions);
            }
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Read the blog template
const template = fs.readFileSync('src/templates/blog-template.html', 'utf-8');

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
        path.join('src/content/posts', filename), 
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
        path.join('dist/blog', htmlFilename),
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
    // Ensure dist directories exist
    ensureDistDirs();
    
    // Copy static assets
    copyStaticAssets();
    
    const posts = [];
    const files = fs.readdirSync('src/content/posts');
    
    for (const file of files) {
        if (file.endsWith('.md')) {
            const post = convertPost(file);
            if (post) posts.push(post);
        }
    }
    
    // Sort posts by date
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

convertAll(); 