module.exports = function(eleventyConfig) {
  // Passthrough copies - ensure assets are copied
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Important for GitHub Pages: Copy .nojekyll file
  eleventyConfig.addPassthroughCopy(".nojekyll");
  
  // Blog collection
  eleventyConfig.addCollection("blog", function(collection) {
    return collection.getFilteredByGlob("src/blog/*.html").sort((a, b) => {
      return b.date - a.date;
    });
  });
  
  // Liquid filters
  eleventyConfig.addLiquidFilter("formatDate", function(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  });
  
  eleventyConfig.addLiquidFilter("isoDate", function(date) {
    return new Date(date).toISOString().split('T')[0];
  });
  
  return {
    // Template engines
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
    
    // Directory structure
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      data: "_data"
    },
    
    // Optional: Add path prefix if using project pages
    // pathPrefix: "/resumepro-backup/"
  };
};