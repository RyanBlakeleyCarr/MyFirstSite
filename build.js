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
                
                // Debug logging
                console.log('Processing file:', file);
                console.log('Frontmatter data:', data);
                
                const html = marked(markdown);
                
                // Store post data for index
                const slug = file.replace('.md', '');
                posts.push({
                    title: data.title || 'Untitled Post',
                    date: data.date || new Date(),
                    description: data.description || '',
                    category: data.category || 'Development',
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
                        <title>${data.title || 'Untitled Post'} | Ryan Carr</title>
                        <meta name="description" content="${data.description}">
                        <link rel="stylesheet" href="/styles.css">
                    </head>
                    <body>
                        <header class="site-header">
                            <nav class="nav-container">
                                <ul class="nav-links">
                                    <li><a href="/">Home</a></li>
                                    <li><a href="/blog/" class="active">Blog</a></li>
                                    <li><a href="/about">About</a></li>
                                    <li><a href="/contact">Contact</a></li>
                                </ul>
                            </nav>
                        </header>

                        <main>
                            <article class="blog-post">
                                <div class="post-header">
                                    <h1>${data.title || 'Untitled Post'}</h1>
                                    <time datetime="${data.date}">${new Date(data.date).toLocaleDateString()}</time>
                                </div>
                                <div class="post-content">
                                    ${html}
                                </div>
                            </article>
                        </main>

                        <footer>
                            <div class="footer-content">
                                <div class="footer-grid">
                                    <div class="footer-section">
                                        <h3>Ryan Carr</h3>
                                        <p>Software Engineer & Technical Writer</p>
                                    </div>
                                    <div class="footer-section">
                                        <h3>Navigation</h3>
                                        <div class="footer-links">
                                            <a href="/about">About</a>
                                            <a href="/blog/">Blog</a>
                                            <a href="/contact">Contact</a>
                                        </div>
                                    </div>
                                    <div class="footer-section">
                                        <h3>Connect</h3>
                                        <div class="social-links">
                                            <a href="https://github.com" target="_blank">GitHub</a>
                                            <a href="https://twitter.com" target="_blank">Twitter</a>
                                            <a href="https://linkedin.com" target="_blank">LinkedIn</a>
                                        </div>
                                    </div>
                                </div>
                                <div class="footer-bottom">
                                    <p class="copyright">© 2024 Ryan Carr. All rights reserved.</p>
                                </div>
                            </div>
                        </footer>
                    </body>
                    </html>
                `;

                // Debug logging
                console.log('Creating post at:', `dist/blog/${slug}/index.html`);
                
                await fs.mkdir(`dist/blog/${slug}`, { recursive: true });
                await fs.writeFile(`dist/blog/${slug}/index.html`, postHTML);
            }
        }

        // Sort posts by date
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Debug logging
        console.log('All posts:', posts);

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
                        <ul class="nav-links">
                            <li><a href="/">Home</a></li>
                            <li><a href="/blog/" class="active">Blog</a></li>
                            <li><a href="/about">About</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </nav>
                </header>

                <main>
                    <section class="blog-list">
                        <h1>Blog Posts</h1>
                        <div class="posts-grid">
                            ${posts.map(post => `
                                <article class="post-card">
                                    <div class="post-card-content">
                                        <span class="post-category">${post.category}</span>
                                        <h3><a href="${post.url}">${post.title}</a></h3>
                                        <time datetime="${post.date}">${new Date(post.date).toLocaleDateString()}</time>
                                        <p>${post.description}</p>
                                        <a href="${post.url}" class="read-more">Read More →</a>
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    </section>
                </main>

                <footer>
                    <div class="footer-content">
                        <div class="footer-grid">
                            <div class="footer-section">
                                <h3>Ryan Carr</h3>
                                <p>Software Engineer & Technical Writer</p>
                            </div>
                            <div class="footer-section">
                                <h3>Navigation</h3>
                                <div class="footer-links">
                                    <a href="/about">About</a>
                                    <a href="/blog/">Blog</a>
                                    <a href="/contact">Contact</a>
                                </div>
                            </div>
                            <div class="footer-section">
                                <h3>Connect</h3>
                                <div class="social-links">
                                    <a href="https://github.com" target="_blank">GitHub</a>
                                    <a href="https://twitter.com" target="_blank">Twitter</a>
                                    <a href="https://linkedin.com" target="_blank">LinkedIn</a>
                                </div>
                            </div>
                        </div>
                        <div class="footer-bottom">
                            <p class="copyright">© 2024 Ryan Carr. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </body>
            </html>
        `;

        // Write blog index page
        await fs.writeFile('dist/blog/index.html', blogIndexHTML);

        // Get the latest 3 posts for the homepage
        const latestPosts = posts.slice(0, 3);

        // Read the index.html template
        let indexHTML = await fs.readFile('src/index.html', 'utf-8');

        // Create the latest posts HTML
        const latestPostsHTML = latestPosts.map(post => `
            <article class="post-card">
                <div class="post-card-content">
                    <span class="post-category">${post.category}</span>
                    <h3><a href="${post.url}">${post.title}</a></h3>
                    <p>${post.description}</p>
                    <a href="${post.url}" class="read-more">Read More →</a>
                </div>
            </article>
        `).join('');

        // Replace the placeholder post in index.html
        indexHTML = indexHTML.replace(
            /<div class="posts-grid">([\s\S]*?)<\/div>/,
            `<div class="posts-grid">${latestPostsHTML}</div>`
        );

        // Write the updated index.html to dist
        await fs.writeFile('dist/index.html', indexHTML);

        // Copy static files (but don't overwrite index.html since we just wrote it)
        await fs.mkdir('dist', { recursive: true });
        await fs.copyFile('src/styles.css', 'dist/styles.css');

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        if (error.code === 'ENOENT') {
            console.error('File not found:', error.path);
        }
        throw error;
    }
}

build(); 