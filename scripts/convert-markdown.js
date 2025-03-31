/**
 * Script to convert existing markdown files to the new standardized format
 * 
 * This script:
 * 1. Reads all markdown files in content/blog 
 * 2. Converts them to the new frontmatter format
 * 3. Saves them back with the new format
 * 
 * Usage: 
 * node scripts/convert-markdown.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BLOG_DIR = path.join(__dirname, '../content/blog');

// Make sure the directory exists
if (!fs.existsSync(BLOG_DIR)) {
  console.error(`Blog directory not found: ${BLOG_DIR}`);
  process.exit(1);
}

// Get all markdown files
const files = fs.readdirSync(BLOG_DIR).filter(file => file.endsWith('.md'));
console.log(`Found ${files.length} markdown files to process`);

let convertedCount = 0;
let errorCount = 0;

// Process each file
files.forEach(filename => {
  const filePath = path.join(BLOG_DIR, filename);
  
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter
    const { data, content: markdownContent } = matter(content);
    
    // Create new standardized frontmatter
    const newFrontmatter = {
      title: data.title || 'Untitled',
      slug: data.slug || filename.replace('.md', ''),
      image_url: data.thumbnail || data.image_url || '',
      date_published: data.date || new Date().toISOString(),
      date_updated: data.date_updated || new Date().toISOString(),
      tags: data.tags ? (Array.isArray(data.tags) ? data.tags.join(' ') : data.tags) : '',
    };
    
    // Create new content with standardized frontmatter
    const newContent = `---
title: ${newFrontmatter.title}
slug: ${newFrontmatter.slug}
image_url: ${newFrontmatter.image_url}
date_published: ${newFrontmatter.date_published}
date_updated: ${newFrontmatter.date_updated}
tags: ${newFrontmatter.tags}
---

${markdownContent}`;
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Converted: ${filename}`);
    convertedCount++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    errorCount++;
  }
});

console.log('\nConversion Summary:');
console.log(`Total Files: ${files.length}`);
console.log(`Converted: ${convertedCount}`);
console.log(`Errors: ${errorCount}`);

if (errorCount === 0) {
  console.log('\n✨ All files converted successfully!');
} else {
  console.log(`\n⚠️ Some files (${errorCount}) had errors during conversion.`);
} 