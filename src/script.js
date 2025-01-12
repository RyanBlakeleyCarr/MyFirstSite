document.addEventListener('DOMContentLoaded', () => {
    const folders = document.querySelectorAll('.folder-name');
    
    // Initialize all folders as expanded
    folders.forEach(folder => {
        const content = folder.nextElementSibling;
        if (content) {
            content.classList.remove('collapsed');
        }
        
        folder.addEventListener('click', (e) => {
            e.stopPropagation();
            const content = folder.nextElementSibling;
            if (content) {
                content.classList.toggle('collapsed');
                
                // Add visual feedback
                folder.style.backgroundColor = content.classList.contains('collapsed') 
                    ? '#2a2d2e' 
                    : 'transparent';
            }
        });
    });

    // Add hover effect for files
    const files = document.querySelectorAll('.file');
    files.forEach(file => {
        file.addEventListener('click', () => {
            // You could add file opening logic here
            console.log('Clicked:', file.textContent.trim());
        });
    });
}); 