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
        console.log('Found files:', files); // Add this line to see what files are found
        
        // Store post data for the index page
        const posts = [];

        // Process each markdown file
        for (const file of files) {
            if (path.extname(file) === '.md') {
                console.log(`\nProcessing markdown file: ${file}`);
                
                const filePath = path.join(postsDir, file);
                console.log('Full file path:', filePath);
                
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    console.log('Raw file content:', content); // See exactly what we're reading
                    
                    // Explicitly parse frontmatter
                    const parsed = matter(content);
                    console.log('Matter output:', parsed); // See what matter() returns
                    
                    if (!parsed.data.title || !parsed.data.date || !parsed.data.description) {
                        console.error('Missing required frontmatter in:', file);
                        console.error('Parsed data:', parsed.data);
                        continue;
                    }

                    const html = marked(parsed.content);
                    
                    // Store post data for index
                    const slug = file.replace('.md', '');
                    const post = {
                        title: parsed.data.title,
                        date: parsed.data.date,
                        description: parsed.data.description,
                        category: parsed.data.category || 'Development',
                        slug,
                        url: `/blog/${slug}/`
                    };
                    
                    console.log('Created post object:', post);
                    posts.push(post);

                    // Create blog post HTML
                    const postHTML = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>${parsed.data.title} | Ryan Carr</title>
                            <meta name="description" content="${parsed.data.description}">
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
                                        <h1>${parsed.data.title}</h1>
                                        <time datetime="${parsed.data.date}">${new Date(parsed.data.date).toLocaleDateString()}</time>
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

                    // Create directory for the post if it doesn't exist
                    const postDir = path.join('dist/blog', slug);
                    await fs.mkdir(postDir, { recursive: true });

                    // Write the post HTML file
                    await fs.writeFile(path.join(postDir, 'index.html'), postHTML);
                    console.log(`Created post: ${slug}`); // Debug log
                } catch (error) {
                    console.error('Error reading file:', error);
                }
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