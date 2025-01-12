const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

async function build() {
    try {
        // Create blog directory if it doesn't exist
        await fs.mkdir('dist/blog', { recursive: true });

        // Read all markdown files from content/posts
        const postsDir = path.join(__dirname, 'src/content/posts');
        const files = await fs.readdir(postsDir);
        
        // Store post data for the index page
        const posts = [];

        // Process each markdown file
        for (const file of files) {
            if (path.extname(file) === '.md') {
                const content = await fs.readFile(path.join(postsDir, file), 'utf-8');
                const { data, content: markdown } = matter(content);
                const html = marked(markdown);

                // Store post data for index
                const slug = file.replace('.md', '');
                posts.push({
                    ...data,
                    slug,
                    url: `/blog/${slug}/`
                });

                // Create blog post HTML
                const postHTML = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${data.title} | Ryan Carr</title>
                        <meta name="description" content="${data.description}">
                        <link rel="stylesheet" href="/styles.css">
                    </head>
                    <body>
                        <header class="site-header">
                            <nav class="nav-container">
                                <div class="logo">
                                    <a href="/">Ryan Carr</a>
                                </div>
                                <ul class="nav-links">
                                    <li><a href="/">Home</a></li>
                                    <li><a href="/blog" class="active">Blog</a></li>
                                    <li><a href="/about">About</a></li>
                                    <li><a href="/contact">Contact</a></li>
                                </ul>
                            </nav>
                        </header>
                        <main class="blog-content">
                            <article class="blog-post">
                                <h1>${data.title}</h1>
                                <time datetime="${data.date}">${new Date(data.date).toLocaleDateString()}</time>
                                ${html}
                            </article>
                        </main>
                        <footer>
                            <div class="footer-content">
                                <div class="footer-links">
                                    <a href="/about">About</a>
                                    <a href="/blog">Blog</a>
                                    <a href="/contact">Contact</a>
                                </div>
                                <div class="social-links">
                                    <a href="https://github.com" target="_blank">GitHub</a>
                                    <a href="https://twitter.com" target="_blank">Twitter</a>
                                    <a href="https://linkedin.com" target="_blank">LinkedIn</a>
                                </div>
                                <p class="copyright">© 2024 Ryan Carr. All rights reserved.</p>
                            </div>
                        </footer>
                    </body>
                    </html>
                `;

                await fs.mkdir(`dist/blog/${slug}`, { recursive: true });
                await fs.writeFile(`dist/blog/${slug}/index.html`, postHTML);
            }
        }

        // Sort posts by date
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Create blog index page
        const blogIndexHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Blog | Ryan Carr</title>
                <link rel="stylesheet" href="/styles.css">
            </head>
            <body>
                <header class="site-header">
                    <nav class="nav-container">
                        <div class="logo">
                            <a href="/">Ryan Carr</a>
                        </div>
                        <ul class="nav-links">
                            <li><a href="/">Home</a></li>
                            <li><a href="/blog" class="active">Blog</a></li>
                            <li><a href="/about">About</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </nav>
                </header>
                <main class="blog-list">
                    <h1>Blog Posts</h1>
                    <div class="post-list">
                        ${posts.map(post => `
                            <article class="blog-post">
                                <h2><a href="${post.url}">${post.title}</a></h2>
                                <time datetime="${post.date}">${new Date(post.date).toLocaleDateString()}</time>
                                <p>${post.description}</p>
                            </article>
                        `).join('')}
                    </div>
                </main>
                <footer>
                    <div class="footer-content">
                        <div class="footer-links">
                            <a href="/about">About</a>
                            <a href="/blog">Blog</a>
                            <a href="/contact">Contact</a>
                        </div>
                        <div class="social-links">
                            <a href="https://github.com" target="_blank">GitHub</a>
                            <a href="https://twitter.com" target="_blank">Twitter</a>
                            <a href="https://linkedin.com" target="_blank">LinkedIn</a>
                        </div>
                        <p class="copyright">© 2024 Ryan Carr. All rights reserved.</p>
                    </div>
                </footer>
            </body>
            </html>
        `;

        await fs.writeFile('dist/blog/index.html', blogIndexHTML);

        // Copy static files
        await fs.mkdir('dist', { recursive: true });
        await fs.copyFile('src/index.html', 'dist/index.html');
        await fs.copyFile('src/styles.css', 'dist/styles.css');

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
    }
}

build(); 