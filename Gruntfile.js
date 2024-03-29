module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [ 'public/scripts/lib/jquery/jquery.js',
               'public/scripts/lib/underscore/underscore.js',
               'public/scripts/lib/angular/angular.js',
               'public/scripts/lib/angular-route/angular-route.js',
               'public/scripts/lib/bootstrap-sass/dist/js/bootstrap.js',
               'public/scripts/directives.js',
               'public/scripts/base/kudos.js',
               'public/scripts/factories.js',
               'public/scripts/controllers/app.js',
               'public/scripts/controllers/profile.js',
               'public/scripts/controllers/root.js',
               'public/scripts/controllers/meat.js',
               'public/scripts/controllers.js',
               'public/scripts/app.js'],
        dest: 'public/scripts/dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'public/scripts/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat', 'uglify']);
};