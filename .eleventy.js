module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy(".nojekyll");
  
  eleventyConfig.addCollection("blog", function(collection) {
    return collection.getFilteredByGlob("src/blog/*.html").sort((a, b) => {
      return b.date - a.date;
    });
  });
  
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
    dir: {
      input: "src",
      output: "_site",  // 👈 Build to _site folder
      includes: "_includes",
      data: "_data"
    },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid"
  };
};